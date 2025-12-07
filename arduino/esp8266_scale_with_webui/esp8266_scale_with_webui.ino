/*
 * CraftScale by Stumpf.works
 * ESP8266 Waagen-Modul mit Web-Interface
 *
 * Hardware: ESP8266 NodeMCU + HX711 + 1kg Wägezelle
 *
 * FEATURES:
 * - Web-Interface für Konfiguration (http://WAAGE_IP)
 * - Standalone-Modus: Nur Gewicht anzeigen (ohne Backend)
 * - Backend-Modus: Gewicht an CraftScale Server senden
 * - WiFi-Manager: Einfache Erstkonfiguration
 * - EEPROM: Einstellungen bleiben gespeichert
 * - Kalibrierung über Web-Interface
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

// ============================================
// WIFI KONFIGURATION - HIER ANPASSEN! (Optional)
// ============================================

// WiFi kann hier im Sketch vorgegeben werden (wird beim ersten Start verwendet)
const char* WIFI_SSID_DEFAULT = "HZL-NET-IoT";        // Leer = WiFi-Manager beim ersten Start
const char* WIFI_PASSWORD_DEFAULT = "IoT-Stumpf";    // Leer = WiFi-Manager beim ersten Start

// BEISPIEL für direkte WiFi-Angabe:
// const char* WIFI_SSID_DEFAULT = "MeinWiFi";
// const char* WIFI_PASSWORD_DEFAULT = "MeinPasswort123";

// HINWEIS: WiFi kann später jederzeit über das Web-Interface geändert werden!

// ============================================

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiManager.h>
#include <EEPROM.h>
#include <ArduinoJson.h>
#include "HX711.h"

// ============================================
// HX711 Pins - ALTERNATIVE PINS WENN PROBLEME!
// ============================================
const int HX711_DT_PIN = D5;   // GPIO14 (Alternative: D7 = GPIO13)
const int HX711_SCK_PIN = D6;  // GPIO12 (Alternative: D8 = GPIO15)
const int LED_PIN = LED_BUILTIN;

// ============================================
// GLOBALE VARIABLEN
// ============================================

HX711 scale;
ESP8266WebServer server(80);
WiFiClient wifiClient;

// Einstellungen (aus EEPROM geladen)
struct Settings {
  char serverURL[128];          // CraftScale Server URL
  float calibrationFactor;      // Kalibrierungsfaktor
  bool backendEnabled;          // Backend-Modus aktiv?
  float stabilityThreshold;     // Stabilitäts-Schwellwert (g)
  unsigned long stabilityDuration; // Stabilitäts-Dauer (ms)
  char deviceName[32];          // Geräte-Name
  char wifiSSID[64];           // WiFi SSID (gespeichert)
  char wifiPassword[64];       // WiFi Passwort (gespeichert)
} settings;

// Default-Werte
const Settings DEFAULT_SETTINGS = {
  "http://192.168.1.100:3000/api/weight",  // serverURL
  -7050.0,                                  // calibrationFactor
  true,                                     // backendEnabled
  0.5,                                      // stabilityThreshold
  2000,                                     // stabilityDuration
  "CraftScale-Waage",                       // deviceName
  "",                                       // wifiSSID (leer = aus Sketch oder WiFi-Manager)
  ""                                        // wifiPassword (leer = aus Sketch oder WiFi-Manager)
};

// Gewichts-Tracking
float lastWeight = 0.0;
float currentWeight = 0.0;
unsigned long stableStartTime = 0;
bool isStable = false;
bool hasBeenSent = false;

// EEPROM-Adressen
const int EEPROM_SIZE = 512;
const int EEPROM_MAGIC = 0xC5CA;  // CraftScale Magic Number
const int EEPROM_MAGIC_ADDR = 0;
const int EEPROM_SETTINGS_ADDR = 2;

// ============================================
// FUNCTION DECLARATIONS (Forward Declarations)
// ============================================
void setupWebServer();
void handleRoot();
void handleAPIWeight();
void handleAPIGetSettings();
void handleAPISetSettings();
void handleAPICalibrate();
void handleAPITare();
void handleAPIRestart();
void handleNotFound();
void loadSettings();
void saveSettings();
void printBanner();
void printStatus();
void configModeCallback(WiFiManager *myWiFiManager);
void sendWeightToServer(float weight);
void blinkError();

// ============================================
// SETUP
// ============================================

void setup() {
  Serial.begin(115200);
  delay(100);

  printBanner();

  // LED initialisieren
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);

  // EEPROM initialisieren
  EEPROM.begin(EEPROM_SIZE);
  loadSettings();

  // HX711 initialisieren - MIT ERWEITERTEM DEBUG
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.println("[Init] HX711 Hardware-Check");
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.print("[Debug] DT Pin (D5): GPIO");
  Serial.println(HX711_DT_PIN);
  Serial.print("[Debug] SCK Pin (D6): GPIO");
  Serial.println(HX711_SCK_PIN);
  
  // Pins manuell testen
  pinMode(HX711_DT_PIN, INPUT);
  pinMode(HX711_SCK_PIN, OUTPUT);
  Serial.print("[Debug] DT Pin Status: ");
  Serial.println(digitalRead(HX711_DT_PIN) ? "HIGH" : "LOW");
  
  Serial.println();
  Serial.println("[Init] Initialisiere HX711 Wägezelle...");
  scale.begin(HX711_DT_PIN, HX711_SCK_PIN);

  // QUICKFIX: Längere Wartezeit
  Serial.println("[Init] Warte 3 Sekunden auf HX711...");
  for (int i = 3; i > 0; i--) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println();

  // Mehrere Versuche
  int attempts = 0;
  while (!scale.is_ready() && attempts < 5) {
    attempts++;
    Serial.print("[Init] Versuch ");
    Serial.print(attempts);
    Serial.println("/5 - HX711 noch nicht bereit...");
    delay(1000);
  }

  if (!scale.is_ready()) {
    Serial.println();
    Serial.println("╔═══════════════════════════════════════════════════════════╗");
    Serial.println("║  ❌ FEHLER: HX711 nicht bereit!                          ║");
    Serial.println("╚═══════════════════════════════════════════════════════════╝");
    Serial.println();
    Serial.println("📋 Troubleshooting Checklist:");
    Serial.println("   1. ✓ Ist die Wägezelle (Load Cell) angeschlossen?");
    Serial.println("      → HX711 wird erst bereit WENN Wägezelle verbunden!");
    Serial.println();
    Serial.println("   2. ✓ Verkabelung HX711 → ESP8266:");
    Serial.println("      VCC  → 3.3V (NICHT 5V!)");
    Serial.println("      GND  → GND");
    Serial.println("      DT   → D5 (GPIO14)");
    Serial.println("      SCK  → D6 (GPIO12)");
    Serial.println();
    Serial.println("   3. ✓ Verkabelung Wägezelle → HX711:");
    Serial.println("      Rot (E+)    → E+");
    Serial.println("      Schwarz (E-) → E-");
    Serial.println("      Grün (A-)   → A-");
    Serial.println("      Weiß (A+)   → A+");
    Serial.println();
    Serial.println("   4. ✓ Alternative Pins probieren:");
    Serial.println("      Im Code ändern: D7 (GPIO13) und D8 (GPIO15)");
    Serial.println();
    Serial.println("   5. ✓ HX711 VCC-Pin mit Multimeter prüfen:");
    Serial.println("      Sollte 3.3V zeigen");
    Serial.println();
    Serial.println("═══════════════════════════════════════════════════════════");
    Serial.println("System startet trotzdem (Web-Interface verfügbar)...");
    Serial.println("═══════════════════════════════════════════════════════════");
    Serial.println();
    
    // NICHT mehr endlos blinken - System läuft weiter für Web-Config
    for (int i = 0; i < 10; i++) {
      blinkError();
    }
  } else {
    Serial.println();
    Serial.println("╔═══════════════════════════════════════════════════════════╗");
    Serial.println("║  ✓ HX711 erfolgreich initialisiert!                      ║");
    Serial.println("╚═══════════════════════════════════════════════════════════╝");
    Serial.println();
    
    scale.set_scale(settings.calibrationFactor);

    Serial.println("[Init] Tara durchführen (20 Messungen)...");
    scale.tare(20);
    Serial.println("[Init] ✓ Tara abgeschlossen");
  }

  // WiFi Manager
  WiFiManager wifiManager;
  wifiManager.setAPCallback(configModeCallback);

  Serial.println();
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.println("[WiFi] Verbinde mit WiFi...");
  if (!wifiManager.autoConnect(settings.deviceName)) {
    Serial.println("[FEHLER] WiFi-Verbindung fehlgeschlagen!");
    delay(3000);
    ESP.restart();
  }

  Serial.println("[WiFi] ✓ Erfolgreich verbunden!");
  Serial.print("[WiFi] IP-Adresse: ");
  Serial.println(WiFi.localIP());

  // Web-Server starten
  setupWebServer();
  server.begin();
  Serial.println("[Web] ✓ Web-Interface gestartet");
  Serial.print("[Web] Zugriff über: http://");
  Serial.println(WiFi.localIP());

  Serial.println();
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.println("✓ System bereit!");
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.println();

  printStatus();
}

// ============================================
// MAIN LOOP
// ============================================

void loop() {
  // Web-Server Requests bearbeiten
  server.handleClient();

  // Gewicht messen - NUR wenn HX711 bereit
  if (scale.is_ready()) {
    currentWeight = scale.get_units(10);

    if (currentWeight < 0) {
      currentWeight = 0.0;
    }

    // DEBUG: Print jede Messung
    Serial.print("⚖️  Gewicht: ");
    Serial.print(currentWeight, 2);
    Serial.print(" g");
    
    // Zeige Rohdaten
    long rawValue = scale.read();
    Serial.print(" | Raw: ");
    Serial.print(rawValue);
    
    // Zeige ob stabil
    float weightDiff = abs(currentWeight - lastWeight);
    Serial.print(" | Diff: ");
    Serial.print(weightDiff, 2);
    Serial.print(" g");
    
    if (weightDiff <= settings.stabilityThreshold) {
      Serial.print(" ✓ STABIL");
    } else {
      Serial.print(" ~ Schwankung");
    }
    
    Serial.println();

    // Stabilitätsprüfung
    if (weightDiff <= settings.stabilityThreshold) {
      if (!isStable) {
        stableStartTime = millis();
        isStable = true;
        Serial.println();
        Serial.println("═══════════════════════════════════════════════════════════");
        Serial.print("[Messung] 🎯 Stabiles Gewicht erkannt: ");
        Serial.print(currentWeight, 2);
        Serial.println(" g");
        Serial.println("═══════════════════════════════════════════════════════════");
        Serial.println();
      } else {
        unsigned long stableDuration = millis() - stableStartTime;

        if (stableDuration >= settings.stabilityDuration && !hasBeenSent && settings.backendEnabled) {
          sendWeightToServer(currentWeight);
          hasBeenSent = true;
        }
      }
    } else {
      if (isStable || hasBeenSent) {
        Serial.println();
        Serial.println("[Messung] ⚠️  Gewicht verändert - Reset");
        Serial.println();
      }
      isStable = false;
      hasBeenSent = false;

      digitalWrite(LED_PIN, LOW);
      delay(50);
      digitalWrite(LED_PIN, HIGH);
    }

    lastWeight = currentWeight;
  } else {
    // HX711 nicht bereit - weniger Spam im Serial
    static unsigned long lastErrorPrint = 0;
    if (millis() - lastErrorPrint > 5000) {  // Nur alle 5 Sekunden
      Serial.println("[WARNUNG] ❌ HX711 nicht bereit - Wägezelle angeschlossen?");
      lastErrorPrint = millis();
    }
  }

  delay(500);  // Etwas langsamer für bessere Lesbarkeit
}

// ============================================
// WEB-SERVER ROUTES
// ============================================

void setupWebServer() {
  // Haupt-Seite
  server.on("/", HTTP_GET, handleRoot);

  // API Endpoints
  server.on("/api/weight", HTTP_GET, handleAPIWeight);
  server.on("/api/settings", HTTP_GET, handleAPIGetSettings);
  server.on("/api/settings", HTTP_POST, handleAPISetSettings);
  server.on("/api/tare", HTTP_POST, handleAPITare);
  server.on("/api/calibrate", HTTP_POST, handleAPICalibrate);
  server.on("/api/restart", HTTP_POST, handleAPIRestart);

  // 404
  server.onNotFound(handleNotFound);
}

// Haupt-Seite (HTML + CSS + JavaScript)
void handleRoot() {
  String html = R"rawliteral(
<!DOCTYPE html>
<html lang="de">
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
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 2.5rem;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        .weight-display {
            text-align: center;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            margin-bottom: 20px;
        }
        .weight-value {
            font-size: 4rem;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
        }
        .weight-unit {
            font-size: 1.5rem;
            color: rgba(255, 255, 255, 0.8);
        }
        .status {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            margin-top: 10px;
        }
        .status.stable {
            background: #10b981;
            color: white;
        }
        .status.measuring {
            background: #f59e0b;
            color: white;
        }
        .status.error {
            background: #ef4444;
            color: white;
        }
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
        }
        .tab {
            padding: 12px 24px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            color: #666;
            border-bottom: 3px solid transparent;
            transition: all 0.3s;
        }
        .tab.active {
            color: #667eea;
            border-bottom-color: #667eea;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #374151;
            font-weight: 500;
        }
        input, select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 500;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
            background: #6b7280;
            color: white;
        }
        .btn-danger {
            background: #ef4444;
            color: white;
        }
        .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
        }
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 34px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
        }
        input:checked + .slider {
            background-color: #667eea;
        }
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        .info-box {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .error-box {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            color: white;
            margin-top: 30px;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>⚖️ CraftScale</h1>
            <p class="subtitle">by Stumpf.works</p>

            <div class="weight-display">
                <div class="weight-value" id="weight">0.00</div>
                <div class="weight-unit">Gramm</div>
                <div class="status measuring" id="status">Warte auf Messung</div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn btn-secondary" onclick="tare()">Tara (Nullstellen)</button>
            </div>
        </div>

        <div class="card">
            <div class="tabs">
                <button class="tab active" onclick="switchTab('settings')">Einstellungen</button>
                <button class="tab" onclick="switchTab('calibration')">Kalibrierung</button>
                <button class="tab" onclick="switchTab('info')">Info</button>
            </div>

            <!-- Einstellungen Tab -->
            <div class="tab-content active" id="settings-tab">
                <div class="form-group">
                    <label>Backend-Modus</label>
                    <label class="switch">
                        <input type="checkbox" id="backendEnabled">
                        <span class="slider"></span>
                    </label>
                    <small style="color: #666; display: block; margin-top: 5px;">
                        Wenn aktiv: Gewicht wird an CraftScale Server gesendet
                    </small>
                </div>

                <div class="form-group">
                    <label>Server URL</label>
                    <input type="text" id="serverURL" placeholder="http://192.168.1.100:3000/api/weight">
                </div>

                <div class="form-group">
                    <label>Geräte-Name</label>
                    <input type="text" id="deviceName" placeholder="CraftScale-Waage">
                </div>

                <div class="form-group">
                    <label>Stabilitäts-Schwellwert (Gramm)</label>
                    <input type="number" id="stabilityThreshold" step="0.1" value="0.5">
                </div>

                <button class="btn btn-primary" onclick="saveSettings()">Einstellungen speichern</button>
            </div>

            <!-- Kalibrierung Tab -->
            <div class="tab-content" id="calibration-tab">
                <div class="info-box">
                    <strong>Kalibrierungs-Anleitung:</strong><br>
                    1. Waage leer lassen (Tara drücken)<br>
                    2. Bekanntes Gewicht auflegen (z.B. 100g)<br>
                    3. Gewicht und angezeigten Wert notieren<br>
                    4. Kalibrierungsfaktor eingeben und speichern
                </div>

                <div class="form-group">
                    <label>Kalibrierungsfaktor</label>
                    <input type="number" id="calibrationFactor" step="0.1" value="-7050">
                    <small style="color: #666; display: block; margin-top: 5px;">
                        Aktueller Faktor: <span id="currentFactor">-7050</span>
                    </small>
                </div>

                <button class="btn btn-primary" onclick="saveCalibration()">Kalibrierung speichern</button>
            </div>

            <!-- Info Tab -->
            <div class="tab-content" id="info-tab">
                <h3>Geräte-Informationen</h3>
                <p><strong>IP-Adresse:</strong> <span id="ipAddress">-</span></p>
                <p><strong>MAC-Adresse:</strong> <span id="macAddress">-</span></p>
                <p><strong>WiFi SSID:</strong> <span id="wifiSSID">-</span></p>
                <p><strong>Signal-Stärke:</strong> <span id="wifiRSSI">-</span> dBm</p>
                <p><strong>Firmware:</strong> CraftScale v2.0 (Debug)</p>

                <div class="error-box" style="margin-top: 20px;">
                    <strong>⚠️ HX711 Troubleshooting</strong><br>
                    Wenn "HX711 nicht bereit" angezeigt wird:<br>
                    1. Wägezelle (Load Cell) muss angeschlossen sein!<br>
                    2. VCC am HX711 auf 3.3V prüfen (NICHT 5V!)<br>
                    3. Alle Kabelverbindungen checken<br>
                    4. Im Code alternative Pins testen (D7/D8)
                </div>

                <div style="margin-top: 30px;">
                    <button class="btn btn-danger" onclick="restart()">ESP8266 neu starten</button>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        © 2025 CraftScale by Stumpf.works
    </div>

    <script>
        // Gewicht aktualisieren (Polling)
        setInterval(updateWeight, 500);

        function updateWeight() {
            fetch('/api/weight')
                .then(res => res.json())
                .then(data => {
                    document.getElementById('weight').textContent = data.weight.toFixed(2);

                    const status = document.getElementById('status');
                    if (data.error) {
                        status.className = 'status error';
                        status.textContent = '❌ HX711 nicht bereit';
                    } else if (data.weight > 0.5) {
                        status.className = 'status stable';
                        status.textContent = 'Gewicht erkannt ✓';
                    } else {
                        status.className = 'status measuring';
                        status.textContent = 'Warte auf Messung';
                    }
                })
                .catch(err => console.error('Fehler beim Laden des Gewichts:', err));
        }

        // Einstellungen laden
        window.addEventListener('load', () => {
            fetch('/api/settings')
                .then(res => res.json())
                .then(data => {
                    document.getElementById('serverURL').value = data.serverURL;
                    document.getElementById('backendEnabled').checked = data.backendEnabled;
                    document.getElementById('stabilityThreshold').value = data.stabilityThreshold;
                    document.getElementById('deviceName').value = data.deviceName;
                    document.getElementById('calibrationFactor').value = data.calibrationFactor;
                    document.getElementById('currentFactor').textContent = data.calibrationFactor;

                    // Info Tab
                    document.getElementById('ipAddress').textContent = data.ipAddress;
                    document.getElementById('macAddress').textContent = data.macAddress;
                    document.getElementById('wifiSSID').textContent = data.wifiSSID;
                    document.getElementById('wifiRSSI').textContent = data.wifiRSSI;
                });
        });

        function switchTab(tabName) {
            // Tab-Buttons
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');

            // Tab-Content
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(tabName + '-tab').classList.add('active');
        }

        function saveSettings() {
            const settings = {
                serverURL: document.getElementById('serverURL').value,
                backendEnabled: document.getElementById('backendEnabled').checked,
                stabilityThreshold: parseFloat(document.getElementById('stabilityThreshold').value),
                deviceName: document.getElementById('deviceName').value
            };

            fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            .then(res => res.json())
            .then(data => {
                alert('✓ Einstellungen gespeichert!');
            })
            .catch(err => alert('Fehler beim Speichern: ' + err));
        }

        function saveCalibration() {
            const factor = parseFloat(document.getElementById('calibrationFactor').value);

            fetch('/api/calibrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ calibrationFactor: factor })
            })
            .then(res => res.json())
            .then(data => {
                alert('✓ Kalibrierung gespeichert! ESP wird neu gestartet...');
                setTimeout(() => location.reload(), 2000);
            })
            .catch(err => alert('Fehler: ' + err));
        }

        function tare() {
            fetch('/api/tare', { method: 'POST' })
                .then(res => res.json())
                .then(data => alert('✓ Tara durchgeführt'))
                .catch(err => alert('Fehler: ' + err));
        }

        function restart() {
            if (confirm('ESP8266 wirklich neu starten?')) {
                fetch('/api/restart', { method: 'POST' })
                    .then(() => alert('ESP wird neu gestartet...'));
            }
        }
    </script>
</body>
</html>
)rawliteral";

  server.send(200, "text/html", html);
}

// API: Aktuelles Gewicht
void handleAPIWeight() {
  StaticJsonDocument<200> doc;
  
  if (scale.is_ready()) {
    doc["weight"] = currentWeight;
    doc["stable"] = isStable;
    doc["timestamp"] = millis();
    doc["error"] = false;
  } else {
    doc["weight"] = 0.0;
    doc["stable"] = false;
    doc["timestamp"] = millis();
    doc["error"] = true;
    doc["errorMessage"] = "HX711 nicht bereit - Wägezelle angeschlossen?";
  }

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);
}

// API: Einstellungen abrufen
void handleAPIGetSettings() {
  StaticJsonDocument<512> doc;
  doc["serverURL"] = settings.serverURL;
  doc["backendEnabled"] = settings.backendEnabled;
  doc["calibrationFactor"] = settings.calibrationFactor;
  doc["stabilityThreshold"] = settings.stabilityThreshold;
  doc["stabilityDuration"] = settings.stabilityDuration;
  doc["deviceName"] = settings.deviceName;

  // System-Info
  doc["ipAddress"] = WiFi.localIP().toString();
  doc["macAddress"] = WiFi.macAddress();
  doc["wifiSSID"] = WiFi.SSID();
  doc["wifiRSSI"] = WiFi.RSSI();

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);
}

// API: Einstellungen setzen
void handleAPISetSettings() {
  if (server.hasArg("plain")) {
    StaticJsonDocument<512> doc;
    deserializeJson(doc, server.arg("plain"));

    if (doc.containsKey("serverURL")) {
      strlcpy(settings.serverURL, doc["serverURL"], sizeof(settings.serverURL));
    }
    if (doc.containsKey("backendEnabled")) {
      settings.backendEnabled = doc["backendEnabled"];
    }
    if (doc.containsKey("stabilityThreshold")) {
      settings.stabilityThreshold = doc["stabilityThreshold"];
    }
    if (doc.containsKey("deviceName")) {
      strlcpy(settings.deviceName, doc["deviceName"], sizeof(settings.deviceName));
    }

    saveSettings();
    printStatus();

    server.send(200, "application/json", "{\"success\":true}");
  } else {
    server.send(400, "application/json", "{\"error\":\"No data\"}");
  }
}

// API: Kalibrierung
void handleAPICalibrate() {
  if (server.hasArg("plain")) {
    StaticJsonDocument<200> doc;
    deserializeJson(doc, server.arg("plain"));

    if (doc.containsKey("calibrationFactor")) {
      settings.calibrationFactor = doc["calibrationFactor"];
      
      if (scale.is_ready()) {
        scale.set_scale(settings.calibrationFactor);
      }
      
      saveSettings();

      server.send(200, "application/json", "{\"success\":true}");

      delay(500);
      ESP.restart();
    } else {
      server.send(400, "application/json", "{\"error\":\"Missing calibrationFactor\"}");
    }
  } else {
    server.send(400, "application/json", "{\"error\":\"No data\"}");
  }
}

// API: Tara
void handleAPITare() {
  if (scale.is_ready()) {
    Serial.println("[API] Tara durchführen...");
    scale.tare(20);
    Serial.println("[API] ✓ Tara abgeschlossen");
    server.send(200, "application/json", "{\"success\":true}");
  } else {
    Serial.println("[API] ❌ Tara fehlgeschlagen - HX711 nicht bereit");
    server.send(500, "application/json", "{\"error\":\"HX711 nicht bereit\"}");
  }
}

// API: Neustart
void handleAPIRestart() {
  server.send(200, "application/json", "{\"success\":true}");
  delay(500);
  ESP.restart();
}

// 404 Handler
void handleNotFound() {
  server.send(404, "text/plain", "404 - Nicht gefunden");
}

// ============================================
// EEPROM FUNKTIONEN
// ============================================

void loadSettings() {
  uint16_t magic;
  EEPROM.get(EEPROM_MAGIC_ADDR, magic);

  if (magic == EEPROM_MAGIC) {
    EEPROM.get(EEPROM_SETTINGS_ADDR, settings);
    Serial.println("[EEPROM] ✓ Einstellungen geladen");
  } else {
    Serial.println("[EEPROM] Keine gespeicherten Einstellungen - nutze Defaults");
    settings = DEFAULT_SETTINGS;
    saveSettings();
  }
}

void saveSettings() {
  EEPROM.put(EEPROM_MAGIC_ADDR, EEPROM_MAGIC);
  EEPROM.put(EEPROM_SETTINGS_ADDR, settings);
  EEPROM.commit();
  Serial.println("[EEPROM] ✓ Einstellungen gespeichert");
}

// ============================================
// HILFSFUNKTIONEN
// ============================================

void printBanner() {
  Serial.println();
  Serial.println("╔═══════════════════════════════════════════════════════════╗");
  Serial.println("║                                                           ║");
  Serial.println("║     ⚖️  CraftScale by Stumpf.works                        ║");
  Serial.println("║     Waagen-Modul v2.0 (DEBUG) mit Web-Interface          ║");
  Serial.println("║                                                           ║");
  Serial.println("╚═══════════════════════════════════════════════════════════╝");
  Serial.println();
}

void printStatus() {
  Serial.println();
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.println("Aktuelle Einstellungen:");
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.print("Geräte-Name: ");
  Serial.println(settings.deviceName);
  Serial.print("Backend-Modus: ");
  Serial.println(settings.backendEnabled ? "Aktiv" : "Deaktiviert");
  Serial.print("Server URL: ");
  Serial.println(settings.serverURL);
  Serial.print("Kalibrierungsfaktor: ");
  Serial.println(settings.calibrationFactor);
  Serial.print("Stabilitäts-Schwellwert: ");
  Serial.print(settings.stabilityThreshold);
  Serial.println(" g");
  Serial.print("HX711 Status: ");
  Serial.println(scale.is_ready() ? "✓ Bereit" : "❌ Nicht bereit");
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.println();
}

void configModeCallback(WiFiManager *myWiFiManager) {
  Serial.println("[WiFi] Konfigurationsmodus gestartet");
  Serial.println("[WiFi] Verbinde mit WiFi: " + String(settings.deviceName));
  Serial.println("[WiFi] Öffne: http://192.168.4.1");
}

void sendWeightToServer(float weight) {
  Serial.println();
  Serial.println("═══════════════════════════════════════════════════════════");
  Serial.print("[Senden] Sende Gewicht an Server: ");
  Serial.print(weight, 2);
  Serial.println(" g");

  digitalWrite(LED_PIN, LOW);

  HTTPClient http;
  http.begin(wifiClient, settings.serverURL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["weight"] = weight;
  doc["timestamp"] = String(millis());
  doc["device"] = settings.deviceName;

  String jsonString;
  serializeJson(doc, jsonString);

  Serial.print("[Senden] JSON: ");
  Serial.println(jsonString);

  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    Serial.print("[Senden] HTTP Response Code: ");
    Serial.println(httpResponseCode);

    String response = http.getString();
    Serial.print("[Senden] Server-Antwort: ");
    Serial.println(response);

    if (httpResponseCode == 200) {
      Serial.println("[Senden] ✓ Erfolgreich gesendet!");
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

void blinkError() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, LOW);
    delay(100);
    digitalWrite(LED_PIN, HIGH);
    delay(100);
  }
}