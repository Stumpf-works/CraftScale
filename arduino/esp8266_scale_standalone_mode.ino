/*
 * CraftScale by Stumpf.works
 * ESP8266 Waagen-Modul - Standalone Mode
 *
 * WICHTIG: Für die Version MIT Web-Interface und allen Features,
 * nutzen Sie: esp8266_scale_with_webui.ino
 *
 * Diese Version ist NUR für:
 * - Standalone-Betrieb (keine Server-Verbindung)
 * - WiFi MUSS im Code angegeben werden
 * - Einfache Gewichtsanzeige ohne Produktverwaltung
 */

// ============================================
// WIFI KONFIGURATION - HIER EINTRAGEN!
// ============================================
const char* WIFI_SSID = "DEIN_WIFI";           // WiFi-Name
const char* WIFI_PASSWORD = "DEIN_PASSWORD";   // WiFi-Passwort

// ============================================
// SERVER KONFIGURATION (Optional)
// ============================================
const char* SERVER_URL = "http://192.168.1.100:3000/api/weight";  // CraftScale Server
bool BACKEND_ENABLED = false;  // true = an Server senden, false = nur lokal

// ============================================
// INCLUDES
// ============================================
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include "HX711.h"

// ============================================
// HX711 Pins & Konfiguration
// ============================================
const int HX711_DT_PIN = D5;   // GPIO14
const int HX711_SCK_PIN = D6;  // GPIO12
const int LED_PIN = LED_BUILTIN;

float CALIBRATION_FACTOR = -7050.0;  // Kalibrierungsfaktor
const float STABILITY_THRESHOLD = 0.5;     // ±0.5g
const unsigned long STABILITY_DURATION = 2000;  // 2 Sekunden

// ============================================
// GLOBALE VARIABLEN
// ============================================
HX711 scale;
ESP8266WebServer server(80);
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

  Serial.println();
  Serial.println("╔═══════════════════════════════════════════════════════════╗");
  Serial.println("║   ⚖️  CraftScale - Standalone Mode                        ║");
  Serial.println("╚═══════════════════════════════════════════════════════════╝");
  Serial.println();

  // LED
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);

  // HX711 initialisieren
  Serial.println("[Init] HX711 initialisieren...");
  scale.begin(HX711_DT_PIN, HX711_SCK_PIN);

  if (!scale.is_ready()) {
    Serial.println("[FEHLER] HX711 nicht bereit!");
    while(1) { blinkError(); }
  }

  scale.set_scale(CALIBRATION_FACTOR);
  scale.tare(20);
  Serial.println("[Init] HX711 bereit!");

  // WiFi verbinden
  Serial.print("[WiFi] Verbinde mit: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("[WiFi] Verbunden!");
    Serial.print("[WiFi] IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("[FEHLER] WiFi-Verbindung fehlgeschlagen!");
    Serial.println("[FEHLER] Bitte SSID/Passwort im Code prüfen!");
  }

  // Web-Server starten
  setupWebServer();
  server.begin();

  Serial.println();
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.println("System bereit!");
  Serial.print("Web-Interface: http://");
  Serial.println(WiFi.localIP());
  Serial.print("Backend: ");
  Serial.println(BACKEND_ENABLED ? "Aktiviert" : "Deaktiviert");
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.println();
}

// ============================================
// LOOP
// ============================================
void loop() {
  server.handleClient();

  if (scale.is_ready()) {
    currentWeight = scale.get_units(10);
    if (currentWeight < 0) currentWeight = 0.0;

    float weightDiff = abs(currentWeight - lastWeight);

    if (weightDiff <= STABILITY_THRESHOLD) {
      if (!isStable) {
        stableStartTime = millis();
        isStable = true;
        Serial.print("[Messung] Stabil: ");
        Serial.print(currentWeight, 2);
        Serial.println(" g");
      } else {
        unsigned long stableDuration = millis() - stableStartTime;

        if (stableDuration >= STABILITY_DURATION && !hasBeenSent && BACKEND_ENABLED) {
          sendWeightToServer(currentWeight);
          hasBeenSent = true;
        }
      }
    } else {
      if (isStable || hasBeenSent) {
        Serial.println("[Messung] Reset");
      }
      isStable = false;
      hasBeenSent = false;
    }

    lastWeight = currentWeight;
  }

  delay(100);
}

// ============================================
// WEB-SERVER
// ============================================
void setupWebServer() {
  server.on("/", HTTP_GET, handleRoot);
  server.on("/api/weight", HTTP_GET, handleAPIWeight);
  server.on("/api/tare", HTTP_POST, handleAPITare);
  server.onNotFound([]() {
    server.send(404, "text/plain", "404");
  });
}

void handleRoot() {
  String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚖️ CraftScale Waage</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
        }
        h1 {
            color: #667eea;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 40px;
        }
        .weight-display {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 40px;
            margin-bottom: 30px;
        }
        .weight-value {
            font-size: 5rem;
            font-weight: bold;
            color: white;
        }
        .weight-unit {
            font-size: 1.5rem;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 10px;
        }
        .btn {
            background: #6b7280;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn:hover {
            background: #4b5563;
            transform: translateY(-2px);
        }
        .footer {
            margin-top: 30px;
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚖️ CraftScale</h1>
        <p class="subtitle">Standalone Mode</p>

        <div class="weight-display">
            <div class="weight-value" id="weight">0.00</div>
            <div class="weight-unit">Gramm</div>
        </div>

        <button class="btn" onclick="tare()">Tara (Nullstellen)</button>

        <div class="footer">
            © 2025 CraftScale by Stumpf.works
        </div>
    </div>

    <script>
        setInterval(() => {
            fetch('/api/weight')
                .then(res => res.json())
                .then(data => {
                    document.getElementById('weight').textContent = data.weight.toFixed(2);
                })
                .catch(err => console.error(err));
        }, 500);

        function tare() {
            fetch('/api/tare', { method: 'POST' })
                .then(() => alert('✓ Tara durchgeführt'))
                .catch(err => alert('Fehler: ' + err));
        }
    </script>
</body>
</html>
)rawliteral";

  server.send(200, "text/html", html);
}

void handleAPIWeight() {
  StaticJsonDocument<200> doc;
  doc["weight"] = currentWeight;
  doc["stable"] = isStable;

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);
}

void handleAPITare() {
  scale.tare(20);
  server.send(200, "application/json", "{\"success\":true}");
}

// ============================================
// BACKEND SENDEN
// ============================================
void sendWeightToServer(float weight) {
  Serial.println("[Server] Sende Gewicht...");

  HTTPClient http;
  http.begin(wifiClient, SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["weight"] = weight;
  doc["timestamp"] = String(millis());

  String json;
  serializeJson(doc, json);

  int httpCode = http.POST(json);

  if (httpCode == 200) {
    Serial.println("[Server] ✓ Gesendet!");
    digitalWrite(LED_PIN, LOW);
    delay(1000);
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.print("[Server] Fehler: ");
    Serial.println(httpCode);
    blinkError();
  }

  http.end();
}

void blinkError() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, LOW);
    delay(100);
    digitalWrite(LED_PIN, HIGH);
    delay(100);
  }
}
