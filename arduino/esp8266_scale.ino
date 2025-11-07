/*
 * CraftScale by Stumpf.works
 * ESP8266 Waagen-Modul
 *
 * Hardware: ESP8266 NodeMCU + HX711 + 1kg Wägezelle
 *
 * WICHTIG: SERVER_URL muss auf die Server-IP zeigen!
 * Format: "http://192.168.1.XXX:3000/api/weight"
 *
 * Verkabelung:
 * HX711 VCC  -> ESP8266 3.3V (NICHT 5V!)
 * HX711 GND  -> ESP8266 GND
 * HX711 DT   -> ESP8266 D5 (GPIO14)
 * HX711 SCK  -> ESP8266 D6 (GPIO12)
 *
 * Wägezelle (1kg Load Cell):
 * Rot (E+)   -> HX711 E+
 * Schwarz (E-) -> HX711 E-
 * Grün (A-)  -> HX711 A-
 * Weiß (A+)  -> HX711 A+
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include "HX711.h"

// ============================================
// KONFIGURATION - HIER ANPASSEN!
// ============================================

// WiFi Zugangsdaten
const char* WIFI_SSID = "DEIN_WIFI";           // HIER EINTRAGEN!
const char* WIFI_PASSWORD = "DEIN_PASSWORD";   // HIER EINTRAGEN!

// Server URL (IP-Adresse des CraftScale Servers)
const char* SERVER_URL = "http://192.168.1.XXX:3000/api/weight";  // SERVER IP EINTRAGEN!

// HX711 Pins
const int HX711_DT_PIN = D5;   // GPIO14
const int HX711_SCK_PIN = D6;  // GPIO12

// Kalibrierungsfaktor (muss kalibriert werden!)
// NEGATIV für manche Wägezellen-Orientierungen
float CALIBRATION_FACTOR = -7050.0;

// Eingebaute LED (D4)
const int LED_PIN = LED_BUILTIN;

// Stabilitäts-Schwellwert (±0.5g für 2 Sekunden = stabil)
const float STABILITY_THRESHOLD = 0.5;
const unsigned long STABILITY_DURATION = 2000;

// ============================================
// GLOBALE VARIABLEN
// ============================================

HX711 scale;
WiFiClient wifiClient;

float lastWeight = 0.0;
float currentWeight = 0.0;
unsigned long stableStartTime = 0;
bool isStable = false;
bool hasBeenSent = false;

// ============================================
// SETUP
// ============================================

void setup() {
  Serial.begin(115200);
  delay(100);

  // Startup Banner
  Serial.println();
  Serial.println("╔═══════════════════════════════════════════════════════════╗");
  Serial.println("║                                                           ║");
  Serial.println("║     ⚖️  CraftScale by Stumpf.works                        ║");
  Serial.println("║     Waagen-Modul v1.0                                     ║");
  Serial.println("║                                                           ║");
  Serial.println("╚═══════════════════════════════════════════════════════════╝");
  Serial.println();

  // LED initialisieren
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH); // LED aus (LOW = an bei ESP8266)

  // HX711 initialisieren
  Serial.println("[Init] Initialisiere HX711 Wägezelle...");
  scale.begin(HX711_DT_PIN, HX711_SCK_PIN);

  if (!scale.is_ready()) {
    Serial.println("[FEHLER] HX711 nicht bereit! Bitte Verkabelung prüfen.");
    while (1) {
      blinkError();
    }
  }

  Serial.println("[Init] HX711 erfolgreich initialisiert");

  // Kalibrierungsfaktor setzen
  scale.set_scale(CALIBRATION_FACTOR);
  Serial.print("[Init] Kalibrierungsfaktor: ");
  Serial.println(CALIBRATION_FACTOR);

  // Tara (Nullpunkt setzen)
  Serial.println("[Init] Tara durchführen (20 Messungen)...");
  scale.tare(20);
  Serial.println("[Init] Tara abgeschlossen");

  // WiFi verbinden
  connectWiFi();

  Serial.println();
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.println("System bereit! Kontinuierliche Messung gestartet.");
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.println();
}

// ============================================
// MAIN LOOP
// ============================================

void loop() {
  // WiFi Verbindung prüfen
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Verbindung verloren. Versuche erneut...");
    connectWiFi();
  }

  // Gewicht messen
  if (scale.is_ready()) {
    currentWeight = scale.get_units(10); // 10 Messungen Durchschnitt

    // Negatives Gewicht auf 0 setzen
    if (currentWeight < 0) {
      currentWeight = 0.0;
    }

    // Stabilitätsprüfung
    float weightDiff = abs(currentWeight - lastWeight);

    if (weightDiff <= STABILITY_THRESHOLD) {
      // Gewicht ist stabil
      if (!isStable) {
        // Gerade erst stabil geworden
        stableStartTime = millis();
        isStable = true;
        Serial.print("[Messung] Stabiles Gewicht erkannt: ");
        Serial.print(currentWeight, 2);
        Serial.println(" g");
      } else {
        // Bereits stabil - prüfen ob lange genug
        unsigned long stableDuration = millis() - stableStartTime;

        if (stableDuration >= STABILITY_DURATION && !hasBeenSent) {
          // Stabil für mindestens STABILITY_DURATION -> Senden
          sendWeightToServer(currentWeight);
          hasBeenSent = true;
        }
      }
    } else {
      // Gewicht verändert sich
      if (isStable || hasBeenSent) {
        Serial.println("[Messung] Gewicht verändert - Reset");
      }
      isStable = false;
      hasBeenSent = false;

      // LED blinken während Messung
      digitalWrite(LED_PIN, LOW); // An
      delay(50);
      digitalWrite(LED_PIN, HIGH); // Aus
    }

    lastWeight = currentWeight;

    // Debug-Ausgabe (alle 500ms)
    static unsigned long lastDebugPrint = 0;
    if (millis() - lastDebugPrint > 500) {
      Serial.print("[Debug] Aktuelles Gewicht: ");
      Serial.print(currentWeight, 2);
      Serial.print(" g | Stabil: ");
      Serial.println(isStable ? "Ja" : "Nein");
      lastDebugPrint = millis();
    }
  } else {
    Serial.println("[FEHLER] HX711 nicht bereit!");
    delay(1000);
  }

  delay(100);
}

// ============================================
// FUNKTIONEN
// ============================================

/**
 * WiFi verbinden
 */
void connectWiFi() {
  Serial.println();
  Serial.println("[WiFi] Verbinde mit WiFi...");
  Serial.print("[WiFi] SSID: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 30) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("[WiFi] Erfolgreich verbunden!");
    Serial.print("[WiFi] IP-Adresse: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] Server URL: ");
    Serial.println(SERVER_URL);
  } else {
    Serial.println();
    Serial.println("[FEHLER] WiFi-Verbindung fehlgeschlagen!");
    Serial.println("[FEHLER] Bitte SSID und Passwort prüfen.");
  }
}

/**
 * Gewicht an Server senden (HTTP POST)
 */
void sendWeightToServer(float weight) {
  Serial.println();
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.print("[Senden] Sende Gewicht an Server: ");
  Serial.print(weight, 2);
  Serial.println(" g");

  // LED dauerhaft an während Übertragung
  digitalWrite(LED_PIN, LOW);

  HTTPClient http;
  http.begin(wifiClient, SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  // JSON erstellen
  StaticJsonDocument<200> doc;
  doc["weight"] = weight;
  doc["timestamp"] = String(millis());

  String jsonString;
  serializeJson(doc, jsonString);

  Serial.print("[Senden] JSON: ");
  Serial.println(jsonString);

  // HTTP POST Request
  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    Serial.print("[Senden] HTTP Response Code: ");
    Serial.println(httpResponseCode);

    String response = http.getString();
    Serial.print("[Senden] Server-Antwort: ");
    Serial.println(response);

    if (httpResponseCode == 200) {
      Serial.println("[Senden] ✓ Erfolgreich gesendet!");
      // LED dauerhaft an bei Erfolg
      digitalWrite(LED_PIN, LOW);
      delay(2000);
      digitalWrite(LED_PIN, HIGH);
    } else {
      Serial.println("[FEHLER] Server hat Fehler zurückgegeben");
      blinkError();
    }
  } else {
    Serial.print("[FEHLER] HTTP Request fehlgeschlagen: ");
    Serial.println(http.errorToString(httpResponseCode));
    blinkError();
  }

  http.end();
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.println();
}

/**
 * LED Fehler-Blinken (3x schnell)
 */
void blinkError() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, LOW);
    delay(100);
    digitalWrite(LED_PIN, HIGH);
    delay(100);
  }
}

// ============================================
// KALIBRIERUNGS-ANLEITUNG
// ============================================

/*
 * KALIBRIERUNG DER WÄGEZELLE:
 *
 * 1. Diesen Code auf ESP8266 hochladen
 * 2. Serial Monitor öffnen (115200 Baud)
 * 3. Waage sollte "0.00 g" anzeigen (leer)
 * 4. Bekanntes Gewicht auflegen (z.B. 100g)
 * 5. Aktuellen Wert im Serial Monitor ablesen
 * 6. Kalibrierungsfaktor berechnen:
 *    CALIBRATION_FACTOR = aktueller_Wert / bekanntes_Gewicht
 *
 *    Beispiel:
 *    - Bekanntes Gewicht: 100g
 *    - Angezeigter Wert: -705000
 *    - Faktor: -705000 / 100 = -7050
 *
 * 7. CALIBRATION_FACTOR oben im Code anpassen
 * 8. Code erneut hochladen
 * 9. Testen mit verschiedenen Gewichten
 * 10. Bei Bedarf Faktor feintunen
 *
 * HINWEISE:
 * - Faktor kann negativ sein (abhängig von Wägezellen-Orientierung)
 * - Bei falscher Orientierung: Faktor mit -1 multiplizieren
 * - Für präzise Messungen: mehrere Testgewichte verwenden
 * - Tara regelmäßig durchführen bei Drift
 */
