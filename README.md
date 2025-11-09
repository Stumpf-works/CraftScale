# ⚖️ CraftScale by Stumpf.works

Ein vollständiges DIY Epoxidharz Management System mit intelligenter Waage, Produktverwaltung und SumUp-Export.

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     ⚖️  CraftScale by Stumpf.works                        ║
║                                                           ║
║     DIY Epoxidharz Management System                      ║
║     Version 1.0                                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## 📋 Features

- **🔄 Live Waage**: ESP8266 + HX711 + 1kg Wägezelle für automatische Gewichtserkennung
- **🌐 ESP8266 Web-Interface**: Konfiguration, Kalibrierung und Standalone-Modus direkt am Gerät
- **📦 Produktverwaltung**: Fotos, Gewicht, Materialverbrauch, automatische Preiskalkulation
- **🧪 Material-Manager**: Harz, Härter, Pigmente, Formen verwalten
- **💰 Kosten-Kalkulation**: Material + Arbeit + Fixkosten + Gewinnmarge = Verkaufspreis
- **📊 SumUp Export**: CSV-Export für direkten Import in SumUp Kassensystem
- **🏷️ Barcode-Generation**: EAN-13 Barcodes für Brother P-Touch Etikettendrucker
- **🎨 React Web-Interface**: Modernes Frontend mit Tailwind CSS
- **🔌 Local Network**: Läuft im lokalen Netzwerk ohne Cloud
- **📱 Mobile Ready**: Zugriff von Smartphone, Tablet oder Desktop

## 🏗️ System-Architektur

```
┌─────────────────┐         WiFi          ┌──────────────────┐
│   ESP8266       │ ◄─────────────────► │   Server         │
│   + HX711       │   HTTP POST /weight   │   Node.js        │
│   + Wägezelle   │                       │   + Express      │
└─────────────────┘                       │   + SQLite       │
                                          └──────────────────┘
                                                 │
                                                 │ Serves
                                                 │
                                          ┌──────────────────┐
                                          │   Web Interface  │
                                          │   React + Vite   │
                                          └──────────────────┘
                                                 ▲
                                                 │
                                          Browser (Laptop/Tablet/Smartphone)
```

## 🚀 Schnellstart

### Voraussetzungen

- **Server**: Raspberry Pi 3+, Mini-PC oder VPS mit Node.js 16+
- **Hardware**: ESP8266 NodeMCU, HX711, 1kg Wägezelle
- **Netzwerk**: Lokales WiFi (2.4 GHz für ESP8266)

### Installation

#### 1️⃣ Server-Installation

```bash
# Repository klonen
git clone https://github.com/yourusername/craftscale.git
cd craftscale

# Dependencies installieren
npm run install:all

# .env konfigurieren
cp .env.example .env
# Bearbeiten Sie .env und tragen Sie Ihre Server-IP ein!

# Frontend bauen
npm run build

# Server starten
npm start
```

**Server läuft nun auf**: `http://IHRE_SERVER_IP:3000`

#### 2️⃣ Arduino-Setup

**Hardware-Verkabelung:**

```
ESP8266 NodeMCU          HX711
─────────────────        ─────────
3.3V        ────────►    VCC
GND         ────────►    GND
D5 (GPIO14) ────────►    DT
D6 (GPIO12) ────────►    SCK


HX711                    Wägezelle (1kg Load Cell)
─────────                ──────────────────────────
E+          ────────►    Rot (E+)
E-          ────────►    Schwarz (E-)
A-          ────────►    Grün (A-)
A+          ────────►    Weiß (A+)
```

**Software:**

**WICHTIG: Zwei Versionen verfügbar!**

1. **`esp8266_scale.ino`** - Original (WiFi/Server im Code konfigurieren)
2. **`esp8266_scale_with_webui.ino`** - ⭐ **NEU mit Web-Interface** (Empfohlen!)

**Installation (Web-Interface Version):**

1. Arduino IDE installieren (https://www.arduino.cc/en/software)
2. ESP8266 Board Support installieren:
   - Arduino IDE → Datei → Voreinstellungen
   - Zusätzliche Boardverwalter-URLs: `http://arduino.esp8266.com/stable/package_esp8266com_index.json`
   - Werkzeuge → Board → Boardverwalter → "esp8266" suchen und installieren
3. Bibliotheken installieren:
   - Sketch → Bibliothek einbinden → Bibliotheken verwalten
   - Installieren: `HX711`, `ArduinoJson`, `WiFiManager` (by tzapu)
4. Code öffnen: `arduino/esp8266_scale_with_webui.ino`
5. **Keine Code-Änderung nötig!** WiFi wird beim ersten Start konfiguriert
6. Board auswählen: Werkzeuge → Board → ESP8266 Boards → NodeMCU 1.0
7. Upload (Sketch → Hochladen)

**Erstkonfiguration (WiFi-Manager):**

1. ESP8266 startet im Konfigurations-Modus
2. Mit WiFi verbinden: **"CraftScale-Waage"**
3. Browser öffnet automatisch (oder `http://192.168.4.1`)
4. Ihr WiFi-Netzwerk auswählen und Passwort eingeben
5. IP-Adresse im Serial Monitor notieren

**Web-Interface der Waage:**

Nach erfolgreicher WiFi-Verbindung:
- Browser öffnen: `http://WAAGE_IP` (z.B. `http://192.168.1.50`)
- **Live Gewichtsanzeige** im Browser
- **Einstellungen**: Server-URL, Backend An/Aus, Geräte-Name
- **Kalibrierung**: Über Web-Interface (keine Code-Änderung nötig)
- **Standalone-Modus**: Waage ohne Backend nutzen

Siehe ausführliche Anleitung: [arduino/README_WEBUI.md](arduino/README_WEBUI.md)

#### 3️⃣ Kalibrierung der Waage

1. Serial Monitor öffnen (115200 Baud)
2. Waage sollte "0.00 g" anzeigen (ohne Gewicht)
3. Bekanntes Gewicht auflegen (z.B. 100g)
4. Wert im Serial Monitor ablesen (z.B. -705000)
5. Kalibrierungsfaktor berechnen:
   ```
   CALIBRATION_FACTOR = abgelesener_Wert / bekanntes_Gewicht
   Beispiel: -705000 / 100 = -7050
   ```
6. `CALIBRATION_FACTOR` im Arduino Code anpassen
7. Code erneut hochladen
8. Testen mit verschiedenen Gewichten

## 💻 Verwendung

### 1. Web-Interface öffnen

Browser öffnen und zu `http://IHRE_SERVER_IP:3000` navigieren.

**Tipp**: Bookmark anlegen für schnellen Zugriff!

### 2. Material hinzufügen

1. Tab "Materialien" öffnen
2. Material-Daten eingeben:
   - Name (z.B. "Epoxidharz 1kg")
   - Typ (Harz, Härter, Pigment, Form, Sonstiges)
   - Preis pro Einheit (z.B. 25.00 €)
   - Einheit (ml, g, Stück)
3. "Hinzufügen" klicken

### 3. Produkt erstellen

1. Tab "Wiegen" öffnen
2. Objekt auf Waage legen (Gewicht wird automatisch erkannt)
3. Formular ausfüllen:
   - Produktname
   - Foto hochladen (optional)
   - Materialien auswählen + Mengen eingeben
   - Arbeitszeit + Stundenlohn
   - Fixkosten (Verpackung, Versand, etc.)
   - Gewinnmarge (%)
4. Kalkulation wird automatisch berechnet
5. "Produkt erstellen" klicken
6. SKU und Barcode werden automatisch generiert

### 4. SumUp Export

1. Tab "Export" öffnen
2. Produkte für Export auswählen (Checkboxen)
3. "CSV Download" klicken
4. CSV in SumUp importieren

### 5. Barcode drucken (Brother P-Touch)

1. Tab "Export" öffnen
2. Bei gewünschtem Produkt "Barcode anzeigen" klicken
3. Rechtsklick auf Barcode → "Bild speichern unter"
4. Brother P-Touch Editor öffnen
5. Gespeichertes Barcode-Bild einfügen
6. Etikettengröße anpassen
7. Drucken

## 🔧 Konfiguration

### Environment Variables (.env)

```bash
# Server
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# Server IP (für Client Build)
VITE_API_URL=http://192.168.1.100:3000

# Upload
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_DIR=./uploads

# Database
DB_PATH=./data/craftscale.db

# Logging
LOG_LEVEL=info
LOG_DIR=./logs
```

### Systemd Service (Auto-Start)

Für automatischen Start beim Booten:

```bash
sudo nano /etc/systemd/system/craftscale.service
```

```ini
[Unit]
Description=CraftScale Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/craftscale
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable craftscale
sudo systemctl start craftscale
sudo systemctl status craftscale
```

## 📡 API Dokumentation

### Endpoints

#### Health Check
```
GET /api/health
Response: { status: "ok", version: "1.0" }
```

#### Weight
```
POST /api/weight
Body: { weight: 123.45, timestamp: "1234567890" }

GET /api/weight/latest
Response: { weight: 123.45, timestamp: "...", received_at: "..." }
```

#### Materials
```
GET /api/materials
Response: [{ id, name, type, unit_price, unit, ... }]

POST /api/materials
Body: { name, type, unit_price, unit }

DELETE /api/materials/:id
```

#### Products
```
GET /api/products
Response: [{ id, name, weight, photo_path, barcode, sku, ... }]

POST /api/products
Content-Type: multipart/form-data
Fields: name, weight, photo, materials (JSON), labor_minutes, hourly_rate, etc.

DELETE /api/products/:id
```

#### Barcode
```
GET /api/barcode/:productId
Response: PNG Image (EAN-13 Barcode)
```

#### Export
```
POST /api/export/sumup
Body: { productIds: [1, 2, 3] }
Response: CSV File (SumUp Format)
```

## 🛠️ Troubleshooting

### Server nicht erreichbar

**Problem**: Browser zeigt "Server Offline"

**Lösung**:
1. Server läuft? → `npm start` im Server-Verzeichnis
2. Firewall: Port 3000 offen?
   ```bash
   sudo ufw allow 3000
   ```
3. IP-Adresse korrekt in `.env`?
4. Gleiche Netzwerk wie Client?

### Arduino verbindet nicht

**Problem**: ESP8266 verbindet nicht mit WiFi

**Lösung**:
1. SSID und Passwort korrekt?
2. 2.4 GHz WiFi (ESP8266 kann kein 5 GHz)
3. Serial Monitor öffnen (115200 Baud) für Fehlerausgabe
4. WiFi-Signal stark genug?

**Problem**: Arduino sendet nicht an Server

**Lösung**:
1. Server-URL korrekt im Arduino Code?
2. Server erreichbar im Netzwerk?
3. Port 3000 offen?
4. Serial Monitor: HTTP Response Code prüfen

### Gewicht wird nicht übertragen

**Problem**: Waage misst, sendet aber nicht

**Lösung**:
1. Gewicht stabil für 2 Sekunden?
2. Kalibrierung korrekt?
3. Serial Monitor für Debug-Ausgabe
4. Server-URL im Arduino Code prüfen

### Fotos werden nicht angezeigt

**Problem**: Produktfotos laden nicht

**Lösung**:
1. `uploads/` Verzeichnis existiert?
2. Schreibrechte für Server-User?
3. Foto-URL korrekt: `http://SERVER_IP:3000/uploads/filename`
4. Browser-Konsole für Fehler prüfen (F12)

### Kalibrierung ungenau

**Problem**: Waage zeigt falsches Gewicht

**Lösung**:
1. Mehrere Testgewichte verwenden (50g, 100g, 200g)
2. Tara durchführen (Arduino Reset)
3. Kalibrierungsfaktor feintunen
4. Wägezelle korrekt verkabelt?
5. Stabile Unterlage (Vibrationen vermeiden)

## 💾 Backup & Restore

### Backup erstellen

```bash
# Datenbank sichern
cp data/craftscale.db backup/craftscale-$(date +%Y%m%d).db

# Fotos sichern
tar -czf backup/uploads-$(date +%Y%m%d).tar.gz uploads/
```

### Restore

```bash
# Datenbank wiederherstellen
cp backup/craftscale-20250107.db data/craftscale.db

# Fotos wiederherstellen
tar -xzf backup/uploads-20250107.tar.gz
```

**Automatisches Backup (Cron)**:

```bash
crontab -e
```

```cron
# Täglich um 3 Uhr morgens
0 3 * * * /home/pi/craftscale/backup.sh
```

## 🔒 Sicherheit

- **Nur lokales Netzwerk**: Keine Internet-Exposition empfohlen
- **Keine Authentifizierung**: Vertrauen im lokalen Netzwerk
- **File-Upload Validierung**: Typ + Größe geprüft
- **SQL Injection Prevention**: Prepared Statements
- **XSS Prevention**: React escaped automatisch

**Optional: HTTPS mit self-signed Certificate**:

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

Server.js anpassen für HTTPS (siehe Node.js HTTPS Dokumentation).

## 📊 Beispiel-Kalkulation

**Produkt**: Epoxidharz Untersetzer

| Position | Berechnung | Betrag |
|----------|------------|--------|
| **Materialien** | | |
| Epoxidharz | 50ml × 0.03 €/ml | 1.50 € |
| Härter | 25ml × 0.02 €/ml | 0.50 € |
| Pigment | 2ml × 0.50 €/ml | 1.00 € |
| **Materialkosten Summe** | | **3.00 €** |
| **Arbeitskosten** | | |
| Arbeitszeit | 30 Min × 20 €/h | 10.00 € |
| **Fixkosten** | | |
| Verpackung + Versand | | 2.00 € |
| **Selbstkosten** | 3.00 + 10.00 + 2.00 | **15.00 €** |
| **Gewinnmarge** | 30% | 4.50 € |
| **Verkaufspreis** | | **19.50 €** |

## 📈 Roadmap

- [ ] Multi-User Support mit Login
- [ ] Lagerbestand-Tracking für Materialien
- [ ] Bestellverwaltung
- [ ] Statistiken & Dashboards
- [ ] Mobile App (React Native)
- [ ] Shopify Integration
- [ ] Mehrsprachigkeit
- [ ] Etiketten-Druck Vorlagen

## 🤝 Mitwirken

Contributions sind willkommen! Bitte öffnen Sie ein Issue oder Pull Request.

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE)

## 👨‍💻 Credits

**Created by Stumpf.works**

- Website: https://stumpf.works
- Email: info@stumpf.works
- GitHub: https://github.com/stumpfworks

---

**⚖️ CraftScale - Ihr DIY Craft Management System**

Made with ❤️ for the DIY Community
