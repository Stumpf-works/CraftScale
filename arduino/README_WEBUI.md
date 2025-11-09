# CraftScale Waage - Web-Interface

## 🌐 Features

Das ESP8266-Modul hat jetzt ein **vollständiges Web-Interface**:

- ✅ **Standalone-Modus**: Waage ohne Backend nutzen
- ✅ **Live Gewichtsanzeige**: Direkt im Browser
- ✅ **Web-Konfiguration**: Alle Einstellungen über Browser
- ✅ **WiFi-Manager**: Einfache Erstkonfiguration
- ✅ **EEPROM-Speicherung**: Einstellungen bleiben gespeichert
- ✅ **Kalibrierung über Web**: Keine Code-Änderung nötig
- ✅ **Backend-Toggle**: Ein-/Ausschalten per Klick

## 🚀 Verwendung

### Datei auswählen

**Zwei Versionen verfügbar:**

1. **`esp8266_scale.ino`** - Original (ohne Web-Interface)
2. **`esp8266_scale_with_webui.ino`** - NEU mit Web-Interface ⭐

### Installation

#### 1. Bibliotheken installieren

In Arduino IDE → Sketch → Bibliothek einbinden → Bibliotheken verwalten:

- ✅ `HX711`
- ✅ `ArduinoJson`
- ✅ `WiFiManager` by tzapu

#### 2. Code hochladen

1. Datei öffnen: `esp8266_scale_with_webui.ino`
2. Board auswählen: **NodeMCU 1.0 (ESP-12E Module)**
3. Port auswählen (z.B. COM3)
4. **Hochladen** (Upload-Button)

**Wichtig**: Bei der ersten Verwendung **keine** WiFi-Daten im Code ändern!

### ⚙️ Erstkonfiguration

#### Schritt 1: WiFi-Manager aktivieren

1. Code hochladen (erstes Mal)
2. ESP8266 startet im **Konfigurations-Modus**
3. LED blinkt schnell

#### Schritt 2: Mit ESP8266 verbinden

1. Smartphone oder Laptop
2. WiFi-Einstellungen öffnen
3. Netzwerk suchen: **`CraftScale-Waage`**
4. Verbinden (kein Passwort)

#### Schritt 3: WiFi einrichten

1. Browser öffnet automatisch (oder manuell zu `http://192.168.4.1`)
2. "Configure WiFi" klicken
3. Ihr WiFi-Netzwerk auswählen
4. Passwort eingeben
5. "Save" klicken

#### Schritt 4: IP-Adresse notieren

1. Serial Monitor öffnen (115200 Baud)
2. ESP8266 verbindet sich mit WiFi
3. IP-Adresse wird angezeigt (z.B. `192.168.1.50`)
4. IP-Adresse notieren!

## 🖥️ Web-Interface nutzen

### Zugriff

Browser öffnen und zur IP-Adresse navigieren:

```
http://192.168.1.50
```

*(Ihre IP-Adresse aus dem Serial Monitor)*

### Hauptseite

![Web-Interface Screenshot]

**Live Gewichtsanzeige:**
- 🔵 Große Gewichtsanzeige (aktualisiert alle 500ms)
- ✅ Status-Badge (Warte/Erkannt/Stabil)
- 🔘 Tara-Button (Nullstellen)

### Tab: Einstellungen

**Backend-Modus:**
- 🔄 Toggle Switch: An/Aus
- ✅ **AN**: Gewicht wird an CraftScale Server gesendet
- ❌ **AUS**: Nur lokale Anzeige (Standalone)

**Server URL:**
```
http://192.168.1.100:3000/api/weight
```
*(Ihre CraftScale Server-IP)*

**Geräte-Name:**
```
CraftScale-Waage
```
*(Name für WiFi-Manager)*

**Stabilitäts-Schwellwert:**
```
0.5 Gramm
```
*(Gewicht gilt als stabil bei ±0.5g)*

**Speichern:**
- Button "Einstellungen speichern" klicken
- Einstellungen werden in EEPROM gespeichert
- Bleiben nach Neustart erhalten

### Tab: Kalibrierung

**Kalibrierungs-Anleitung:**

1. **Waage leeren** → Tara drücken
2. **Bekanntes Gewicht auflegen** (z.B. 100g)
3. **Wert ablesen** im Serial Monitor oder Web-Interface
4. **Faktor berechnen**:
   ```
   Faktor = abgelesener_Wert / bekanntes_Gewicht
   Beispiel: -705000 / 100 = -7050
   ```
5. **Faktor eingeben** im Feld "Kalibrierungsfaktor"
6. **"Kalibrierung speichern"** klicken
7. ESP8266 startet automatisch neu

**Feintuning:**
- Mehrere Testgewichte verwenden (50g, 100g, 200g)
- Durchschnitt bilden
- Bei Bedarf nachkorrigieren

### Tab: Info

**Geräte-Informationen:**
- 📡 IP-Adresse
- 🔑 MAC-Adresse
- 📶 WiFi SSID
- 📊 Signal-Stärke (RSSI)
- 💾 Firmware-Version

**Aktionen:**
- 🔄 "ESP8266 neu starten" Button

## 🎯 Verwendungs-Szenarien

### Szenario 1: Mit CraftScale Backend

**Setup:**
1. Backend-Modus: **AN** ✅
2. Server URL: `http://192.168.1.100:3000/api/weight`
3. Speichern

**Verhalten:**
- Gewicht wird gemessen
- Bei Stabilität → automatisch an Server gesendet
- Frontend zeigt Gewicht an
- Produkterstellung möglich

### Szenario 2: Standalone (ohne Backend)

**Setup:**
1. Backend-Modus: **AUS** ❌
2. Speichern

**Verhalten:**
- Gewicht wird nur lokal gemessen
- Anzeige im Web-Interface
- **Kein** Senden an Server
- Ideal für: Einfaches Wiegen ohne Produktverwaltung

### Szenario 3: Mobile Nutzung

**Setup:**
1. Smartphone ins gleiche WiFi
2. Browser öffnen: `http://WAAGE_IP`
3. Bookmark anlegen

**Verhalten:**
- Gewicht von Smartphone ablesen
- Konfiguration von überall
- Keine zusätzliche App nötig

## 🔧 Erweiterte Konfiguration

### WiFi zurücksetzen

Falls Sie das WiFi ändern möchten:

**Methode 1: Über Code**
```cpp
// In setup() vor WiFiManager hinzufügen:
// wifiManager.resetSettings();
```

**Methode 2: Hardware**
1. GPIO 0 mit GND verbinden (beim Start)
2. ESP8266 startet im Config-Modus
3. Neues WiFi einrichten

### EEPROM zurücksetzen

Alle Einstellungen auf Werkseinstellungen:

**Arduino Code:**
```cpp
void setup() {
  EEPROM.begin(512);
  for (int i = 0; i < 512; i++) {
    EEPROM.write(i, 0);
  }
  EEPROM.commit();
  // ... Rest des Setup
}
```

### Custom-Einstellungen

Im Code anpassen (vor dem ersten Upload):

```cpp
const Settings DEFAULT_SETTINGS = {
  "http://192.168.1.100:3000/api/weight",  // serverURL
  -7050.0,                                  // calibrationFactor
  true,                                     // backendEnabled
  0.5,                                      // stabilityThreshold
  2000,                                     // stabilityDuration
  "CraftScale-Waage"                        // deviceName
};
```

## 🌐 API-Referenz

Das ESP8266-Modul bietet folgende API-Endpoints:

### `GET /`
**Haupt-Webseite** (HTML)
- Responsive Design
- Live Updates
- Konfiguration

### `GET /api/weight`
**Aktuelles Gewicht** (JSON)

Response:
```json
{
  "weight": 123.45,
  "stable": true,
  "timestamp": 1234567890
}
```

### `GET /api/settings`
**Einstellungen abrufen** (JSON)

Response:
```json
{
  "serverURL": "http://192.168.1.100:3000/api/weight",
  "backendEnabled": true,
  "calibrationFactor": -7050.0,
  "stabilityThreshold": 0.5,
  "stabilityDuration": 2000,
  "deviceName": "CraftScale-Waage",
  "ipAddress": "192.168.1.50",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "wifiSSID": "MeinWiFi",
  "wifiRSSI": -45
}
```

### `POST /api/settings`
**Einstellungen setzen** (JSON)

Request:
```json
{
  "serverURL": "http://192.168.1.200:3000/api/weight",
  "backendEnabled": false,
  "stabilityThreshold": 1.0,
  "deviceName": "Meine-Waage"
}
```

Response:
```json
{
  "success": true
}
```

### `POST /api/calibrate`
**Kalibrierung setzen** (JSON)

Request:
```json
{
  "calibrationFactor": -7050.0
}
```

Response:
```json
{
  "success": true
}
```

*ESP8266 startet automatisch neu*

### `POST /api/tare`
**Tara durchführen**

Response:
```json
{
  "success": true
}
```

### `POST /api/restart`
**ESP8266 neu starten**

Response:
```json
{
  "success": true
}
```

## 📱 Mobile App Integration

Das Web-Interface ist **Progressive Web App (PWA)-Ready**:

### iOS (iPhone/iPad)

1. Safari öffnen: `http://WAAGE_IP`
2. Share-Button → "Zum Home-Bildschirm"
3. Icon wird wie App angezeigt

### Android

1. Chrome öffnen: `http://WAAGE_IP`
2. Menü → "Zum Startbildschirm hinzufügen"
3. App-Icon erstellt

## 🛠️ Troubleshooting

### Web-Interface lädt nicht

**Problem**: Browser zeigt "Seite nicht gefunden"

**Lösung:**
1. IP-Adresse korrekt? (Serial Monitor prüfen)
2. Im gleichen WiFi wie ESP8266?
3. Firewall blockiert nicht?
4. Ping-Test: `ping 192.168.1.50`

### Einstellungen werden nicht gespeichert

**Problem**: Nach Neustart sind alte Werte wieder da

**Lösung:**
1. EEPROM zu klein? (sollte 512 Bytes sein)
2. `EEPROM.commit()` fehlt?
3. Serial Monitor: "[EEPROM] Einstellungen gespeichert" erscheint?

### Backend sendet nicht

**Problem**: Gewicht wird nicht an Server gesendet

**Lösung:**
1. Backend-Modus aktiviert? (Toggle-Switch AN)
2. Server-URL korrekt?
3. Server läuft? (`npm start`)
4. Serial Monitor: Fehlerausgabe prüfen

### WiFi-Verbindung bricht ab

**Problem**: ESP8266 verbindet sich immer wieder neu

**Lösung:**
1. Signal-Stärke prüfen (RSSI im Info-Tab)
2. 2.4 GHz WiFi (ESP8266 kann kein 5 GHz)
3. Router-Einstellung: DHCP-Lease verlängern
4. Statische IP vergeben (im Router)

### Gewicht springt stark

**Problem**: Anzeige wechselt zwischen verschiedenen Werten

**Lösung:**
1. Stabilitäts-Schwellwert erhöhen (z.B. 1.0g statt 0.5g)
2. Stabile Unterlage (keine Vibrationen)
3. Verkabelung prüfen (Wackelkontakt?)
4. Neu kalibrieren

## 💡 Pro-Tipps

### Statische IP vergeben

Im Router dem ESP8266 eine feste IP zuweisen:

1. MAC-Adresse notieren (Info-Tab)
2. Router-Interface öffnen
3. DHCP-Reservation einrichten
4. IP fest zuweisen (z.B. 192.168.1.50)

### DNS-Name verwenden

In `/etc/hosts` (Linux/Mac) oder `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
192.168.1.50  craftscale-waage.local
```

Dann zugreifen über: `http://craftscale-waage.local`

### Mehrere Waagen

Mehrere ESP8266 im Netzwerk:

1. Verschiedene Geräte-Namen vergeben (z.B. "Waage-1", "Waage-2")
2. Verschiedene IPs zuweisen
3. Beide im gleichen CraftScale Backend nutzbar

### Auto-Tara beim Start

Code anpassen in `setup()`:

```cpp
// Nach scale.tare(20);
// Auto-Tara alle 5 Minuten
// Implementierung mit Timer
```

## 🔐 Sicherheit

### Lokales Netzwerk

**Empfohlen:**
- Nur im lokalen Netzwerk betreiben
- Keine Port-Weiterleitung im Router
- Keine Exposition ins Internet

### HTTPS (optional)

Für verschlüsselte Verbindung:

```cpp
// ESP8266 unterstützt HTTPS
// Zertifikat erforderlich
// Für lokales Netzwerk nicht zwingend nötig
```

### Passwort-Schutz (optional)

Web-Interface mit Login schützen:

```cpp
// HTTP Basic Auth in ESP8266WebServer
server.on("/", []() {
  if (!server.authenticate("admin", "password")) {
    return server.requestAuthentication();
  }
  handleRoot();
});
```

## 📊 Performance

**Refresh-Rate:**
- Gewichts-Update: 500ms (2 Hz)
- Server-Senden: Bei Stabilität (2s)

**Speicher:**
- EEPROM: 512 Bytes
- RAM: ~40 KB verfügbar
- Flash: ~1 MB Code

**Latenz:**
- Web-Interface: <100ms
- API-Response: <50ms
- Gewichts-Messung: ~1s (10 Samples)

---

## 🎯 Zusammenfassung

**Vorteile des Web-Interface:**

✅ Keine Code-Änderungen für Konfiguration
✅ Einfache WiFi-Einrichtung
✅ Standalone-Nutzung möglich
✅ Mobile Zugriff von überall
✅ Kalibrierung ohne Upload
✅ Einstellungen bleiben gespeichert

**Wann verwenden?**

- 🟢 **Mit Backend**: Volle CraftScale-Funktionen
- 🟢 **Standalone**: Nur wiegen, keine Produktverwaltung
- 🟢 **Mobil**: Zugriff von Smartphone/Tablet
- 🟢 **Mehrere Nutzer**: Verschiedene Geräte im Netzwerk

---

**⚖️ Viel Erfolg mit der CraftScale Waage!**

*Created by Stumpf.works*
