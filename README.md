# ⚖️ CraftScale

**Professionelles Produktverwaltungs-System mit intelligenter Waage**

> Entwickelt von **stumpfworks** für Handwerker, Künstler und Kleinunternehmer

---

## 📖 Was ist CraftScale?

CraftScale ist ein **komplettes Management-System** für die Verwaltung handgefertigter Produkte. Es kombiniert eine präzise digitale Waage mit einer modernen Web-Anwendung, um dir bei folgenden Aufgaben zu helfen:

- 📦 **Produktverwaltung** - Produkte erfassen mit Gewicht, Foto und Beschreibung
- 💰 **Kostenkalkulation** - Automatische Berechnung von Material-, Arbeits- und Verkaufspreisen
- 🧪 **Materialverwaltung** - Lagerbestand und Kosten im Überblick
- 🏷️ **Barcode-Generierung** - EAN-13 Barcodes für professionelle Etiketten
- 📊 **Export-Funktionen** - PDF und Excel für Berichte
- 📸 **Webcam-Integration** - Produktfotos direkt aufnehmen
- ⚖️ **Live-Gewichtsmessung** - Echtzeit-Anzeige der Waage im Browser

---

## ✨ Hauptmerkmale

### 🎯 Einfach zu bedienen
- Modernes, intuitives Web-Interface
- Kein App-Download nötig - läuft im Browser
- Zugriff von jedem Gerät im Netzwerk (PC, Tablet, Smartphone)

### 🔒 Datenschutz
- Läuft **komplett lokal** in deinem Netzwerk
- Keine Cloud, keine externen Server
- Deine Daten bleiben bei dir

### 💪 Professionell
- Automatische Kostenberechnung
- Gewinnmarge-Kalkulation
- Export für Buchhaltung
- Barcode-Generierung

---

## 🏗️ System-Übersicht

```
┌──────────────────────────────────────────────────────────┐
│                    Raspberry Pi                          │
│                                                          │
│  ┌────────────────┐           ┌──────────────────┐     │
│  │  HX711 Waage   │  GPIO     │   Node.js        │     │
│  │  (Python)      │◄─────────►│   Server         │     │
│  └────────────────┘           │   + SQLite       │     │
│         ▲                      │   + React App    │     │
│         │                      └──────────────────┘     │
│    Wägezelle                          │                 │
└───────────────────────────────────────┼─────────────────┘
                                        │
                                   Netzwerk
                                        │
                            ┌───────────┴───────────┐
                            ▼                       ▼
                    ┌──────────────┐        ┌──────────────┐
                    │   Browser    │        │   Browser    │
                    │   (Desktop)  │        │   (Tablet)   │
                    └──────────────┘        └──────────────┘
```

**So funktioniert's:**
1. **HX711** am Raspberry Pi misst das Gewicht über die Wägezelle
2. **Python Script** liest den Sensor aus und sendet Daten an den Server
3. **Node.js Server** verarbeitet die Daten und speichert sie in SQLite
4. **React Web-App** zeigt alles schön aufbereitet im Browser an
5. Du greifst von jedem Gerät im Netzwerk darauf zu

---

## 📋 Was du brauchst

### Hardware

| Komponente | Beschreibung | Geschätzte Kosten |
|------------|--------------|-------------------|
| **Raspberry Pi** | Modell 3B+ oder neuer (läuft auch auf Pi Zero 2 W) | ~40€ |
| **HX711 Modul** | Load Cell Amplifier (24-Bit ADC) | ~3€ |
| **Wägezelle** | Load Cell (z.B. 5kg) | ~5€ |
| **Jumper Kabel** | Female-Female, 4 Stück für HX711 | ~2€ |
| *Optional:* **USB Webcam** | Für Produktfotos | ~15€ |
| **Gesamt** | | **~50-65€** |

### Software (wird installiert)

- **Raspberry Pi OS** (Lite oder Desktop)
- **Node.js** (v16 oder neuer)
- **Python 3** (für HX711 Sensor)
- **Git**

---

## 🚀 Installation

### Schritt 1: Raspberry Pi vorbereiten

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Benötigte Software installieren
sudo apt install -y git nodejs npm python3 python3-pip

# Python Bibliotheken für HX711
sudo pip3 install RPi.GPIO hx711
```

### Schritt 2: CraftScale herunterladen

```bash
# Ins Home-Verzeichnis wechseln
cd ~

# Repository klonen
git clone https://github.com/DEIN-USERNAME/CraftScale.git

# Ins Projekt-Verzeichnis
cd CraftScale
```

### Schritt 3: Server installieren

```bash
# Server-Dependencies installieren
npm install

# Client-Dependencies installieren
cd client
npm install
cd ..
```

### Schritt 4: Client bauen

```bash
cd client
npm run build
cd ..
```

### Schritt 5: Waage anschließen

**Jetzt wird's hardwaremäßig!**

Folge der detaillierten Anleitung in [WIRING.md](WIRING.md) um:
- HX711 an den Raspberry Pi anzuschließen
- Wägezelle richtig zu verkabeln
- Alles zu testen

### Schritt 6: Server starten

```bash
# Server starten
node server.js
```

Du siehst eine Meldung wie:
```
✓ Server läuft auf http://192.168.178.40:3000
✓ Datenbank verbunden
✓ Socket.IO bereit
```

### Schritt 7: Im Browser öffnen

Öffne deinen Browser und gehe zu:
```
http://IP-DEINES-PI:3000
```

Zum Beispiel: `http://192.168.178.40:3000`

**🎉 Fertig! CraftScale läuft jetzt!**

---

## 🔧 Autostart einrichten (Optional)

Damit CraftScale automatisch beim Booten des Raspberry Pi startet:

### Node.js Server als Service

```bash
# Service-Datei erstellen
sudo nano /etc/systemd/system/craftscale-server.service
```

Füge ein:
```ini
[Unit]
Description=CraftScale Node.js Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/CraftScale
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Service aktivieren
sudo systemctl enable craftscale-server
sudo systemctl start craftscale-server

# Status prüfen
sudo systemctl status craftscale-server
```

### Python Scale Reader als Service

```bash
# Service-Datei erstellen
sudo nano /etc/systemd/system/craftscale-scale.service
```

Füge ein:
```ini
[Unit]
Description=CraftScale HX711 Scale Reader
After=network.target craftscale-server.service

[Service]
Type=simple
User=root
WorkingDirectory=/home/pi/CraftScale
ExecStart=/usr/bin/python3 scale_reader.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Service aktivieren
sudo systemctl enable craftscale-scale
sudo systemctl start craftscale-scale

# Status prüfen
sudo systemctl status craftscale-scale
```

---

## 💻 Verwendung

### 1. Waage kalibrieren

**Wichtig!** Bevor du die Waage nutzen kannst, muss sie kalibriert werden:

1. Gehe zu **Einstellungen** Tab
2. Stelle sicher, dass die Waage **leer** ist
3. Klicke **Tara setzen**
4. Lege ein **bekanntes Gewicht** auf (z.B. 100g)
5. Gib das Gewicht ein und klicke **Kalibrieren**
6. Die Waage ist jetzt kalibriert!

**Tipp:** Nutze mehrere Testgewichte (50g, 100g, 200g) für beste Genauigkeit.

### 2. Material anlegen

Bevor du Produkte erstellen kannst, lege deine Materialien an:

1. Gehe zu **Materialien** Tab
2. Klicke **Neues Material**
3. Fülle aus:
   - Name (z.B. "Epoxidharz 1kg")
   - Einheit (ml, g, Stück)
   - Preis pro Einheit (z.B. 25€ pro 1000g = 0.025€/g)
   - Lagerbestand (optional)
4. Klicke **Speichern**

### 3. Produkt erstellen

Jetzt wird's spannend!

1. Gehe zu **Wiegen** Tab
2. Lege dein fertiges Produkt auf die Waage
3. Das Gewicht wird **automatisch** angezeigt
4. Fülle das Formular aus:
   - **Produktname**
   - **Foto** (hochladen oder mit Webcam aufnehmen)
   - **Materialien auswählen** und Mengen angeben
   - **Arbeitszeit** in Minuten
   - **Stundenlohn** (deine Zeit ist wertvoll!)
   - **Fixkosten** (Verpackung, Versand, etc.)
   - **Gewinnmarge** in %
5. Das System berechnet **automatisch**:
   - Materialkosten
   - Arbeitskosten
   - Selbstkosten
   - Verkaufspreis
6. Klicke **Produkt erstellen**
7. Ein **Barcode** wird automatisch generiert!

### 4. Produkte exportieren

**PDF-Export:**
1. Gehe zu **Export** Tab
2. Klicke **PDF erstellen**
3. Eine schöne Produktliste wird generiert

**Excel-Export:**
1. Gehe zu **Export** Tab
2. Klicke **Excel exportieren**
3. Perfekt für Buchhaltung!

---

## 📊 Beispiel-Kalkulation

**Produkt:** Epoxidharz Untersetzer (120g)

| Kostenart | Berechnung | Betrag |
|-----------|------------|--------|
| **Materialkosten** |
| Epoxidharz | 100g × 0.025€/g | 2.50€ |
| Härter | 50g × 0.020€/g | 1.00€ |
| Pigment | 5g × 0.50€/g | 2.50€ |
| Form (Abschreibung) | 1/20 × 12€ | 0.60€ |
| **Summe Material** | | **6.60€** |
| **Arbeitskosten** |
| Arbeitszeit | 45 Min × 20€/h | 15.00€ |
| **Fixkosten** |
| Verpackung | | 1.50€ |
| **Selbstkosten** | | **23.10€** |
| **Gewinnmarge** | 30% | 6.93€ |
| **Verkaufspreis** | | **30.03€** |

➜ **Empfohlener VK: 29.99€** (gerundet)

---

## 🛠️ Problemlösungen

### Server startet nicht

**Problem:** `node server.js` gibt Fehler aus

**Lösung:**
```bash
# Prüfe ob Port 3000 schon belegt ist
sudo lsof -i :3000

# Falls ja, Prozess beenden
sudo kill -9 PID_DES_PROZESSES

# Oder anderen Port nutzen
PORT=8080 node server.js
```

### Waage zeigt keine Werte

**Problem:** Gewicht bleibt bei 0.00g

**Lösung:**
1. Prüfe ob Python Script läuft:
   ```bash
   ps aux | grep scale_reader.py
   ```
2. Falls nicht, starte es:
   ```bash
   sudo python3 scale_reader.py
   ```
3. Prüfe Verkabelung (siehe [WIRING.md](WIRING.md))
4. Prüfe Serial Output:
   ```bash
   sudo python3 scale_reader.py
   # Siehst du Gewichtswerte in der Konsole?
   ```

### Gewicht ist ungenau

**Problem:** Waage zeigt falsches Gewicht

**Lösung:**
1. Führe **erneute Kalibrierung** durch
2. Stelle sicher, dass die Waage auf **stabiler Unterlage** steht
3. Prüfe ob die **Wägezelle** richtig montiert ist
4. Vermeide **Vibrationen** und Luftzug

### Webcam funktioniert nicht

**Problem:** Kann keine Fotos aufnehmen

**Lösung:**
1. Prüfe ob Webcam erkannt wird:
   ```bash
   lsusb
   # Siehst du deine Webcam?
   ```
2. Prüfe Video-Devices:
   ```bash
   ls -la /dev/video*
   ```
3. Rechte setzen:
   ```bash
   sudo usermod -a -G video pi
   # Danach neu anmelden!
   ```

### Browser zeigt "Verbindung fehlgeschlagen"

**Problem:** Kann nicht auf Web-Interface zugreifen

**Lösung:**
1. Prüfe ob Server läuft:
   ```bash
   systemctl status craftscale-server
   ```
2. Finde IP-Adresse des Pi:
   ```bash
   hostname -I
   ```
3. Prüfe Firewall:
   ```bash
   sudo ufw allow 3000
   ```
4. Teste von Pi selbst:
   ```bash
   curl http://localhost:3000/api/health
   ```

---

## 💾 Backup & Wiederherstellung

### Backup erstellen

```bash
# Backup-Verzeichnis erstellen
mkdir -p ~/backups

# Datenbank sichern
cp ~/CraftScale/craftscale.db ~/backups/craftscale-$(date +%Y%m%d).db

# Fotos sichern
tar -czf ~/backups/uploads-$(date +%Y%m%d).tar.gz ~/CraftScale/uploads/

# Alles zusammen sichern
tar -czf ~/backups/craftscale-full-$(date +%Y%m%d).tar.gz \
  ~/CraftScale/craftscale.db \
  ~/CraftScale/uploads/
```

### Automatisches Backup (täglich)

```bash
# Backup-Script erstellen
nano ~/backup-craftscale.sh
```

Inhalt:
```bash
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR

# Datenbank
cp ~/CraftScale/craftscale.db $BACKUP_DIR/craftscale-$DATE.db

# Fotos
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz ~/CraftScale/uploads/

# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup erstellt: $DATE"
```

```bash
# Ausführbar machen
chmod +x ~/backup-craftscale.sh

# Cronjob einrichten (täglich um 3 Uhr nachts)
crontab -e
```

Füge hinzu:
```
0 3 * * * /home/pi/backup-craftscale.sh >> /home/pi/backup.log 2>&1
```

### Wiederherstellung

```bash
# Datenbank wiederherstellen
cp ~/backups/craftscale-20250107.db ~/CraftScale/craftscale.db

# Fotos wiederherstellen
tar -xzf ~/backups/uploads-20250107.tar.gz -C ~/

# Server neu starten
sudo systemctl restart craftscale-server
```

---

## 🔐 Sicherheit

### Netzwerk-Sicherheit

- ✅ **Nur lokales Netzwerk:** CraftScale ist für lokale Nutzung konzipiert
- ⚠️ **Keine Authentifizierung:** Jeder im Netzwerk kann zugreifen
- ❌ **Nicht ins Internet:** Setze CraftScale NICHT öffentlich ins Internet

### Empfehlungen

1. **Separates WLAN:** Nutze ein eigenes WLAN nur für deine Geräte
2. **Firewall:** Aktiviere die UFW Firewall und erlaube nur Port 3000
3. **Regelmäßige Updates:**
   ```bash
   sudo apt update && sudo apt upgrade
   ```
4. **Starke Passwörter:** Ändere das Standard-Passwort des Raspberry Pi

---

## 📈 Technische Details

### Verwendete Technologien

**Backend:**
- Node.js + Express (Web-Server)
- SQLite3 (Datenbank)
- Socket.IO (Echtzeit-Kommunikation)
- Multer (Datei-Upload)
- PDFKit (PDF-Generierung)
- ExcelJS (Excel-Export)

**Frontend:**
- React 18 (UI Framework)
- Vite (Build Tool)
- Tailwind CSS (Styling)
- Axios (HTTP Client)
- Lucide Icons (Icons)

**Hardware:**
- Python 3 + RPi.GPIO (GPIO-Steuerung)
- HX711 Library (Wägezellen-Auslesen)

### API-Endpunkte

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | `/api/health` | Server-Status prüfen |
| GET | `/api/weight` | Aktuelles Gewicht abrufen |
| POST | `/api/weight/update` | Gewicht aktualisieren (intern) |
| POST | `/api/weight/tare` | Tara setzen |
| POST | `/api/weight/calibrate` | Kalibrierung |
| GET | `/api/materials` | Alle Materialien |
| POST | `/api/materials` | Material erstellen |
| PUT | `/api/materials/:id` | Material bearbeiten |
| DELETE | `/api/materials/:id` | Material löschen |
| GET | `/api/products` | Alle Produkte |
| POST | `/api/products` | Produkt erstellen |
| PUT | `/api/products/:id` | Produkt bearbeiten |
| DELETE | `/api/products/:id` | Produkt löschen |
| GET | `/api/export/products/pdf` | PDF exportieren |
| GET | `/api/export/products/excel` | Excel exportieren |
| POST | `/api/camera/capture` | Foto aufnehmen |
| POST | `/api/barcode/generate` | Barcode generieren |

---

## 🤝 Mitwirken

Beiträge sind herzlich willkommen!

1. **Fork** das Repository
2. Erstelle einen **Feature Branch** (`git checkout -b feature/NeuesFeature`)
3. **Commit** deine Änderungen (`git commit -m 'Neues Feature XY'`)
4. **Push** zum Branch (`git push origin feature/NeuesFeature`)
5. Öffne einen **Pull Request**

---

## 📄 Lizenz

**MIT License**

Copyright © 2025 Stumpf.works

Kostenlose Nutzung erlaubt - siehe [LICENSE](LICENSE) für Details.

---

## 👨‍💻 Entwickler

**Erstellt von:** [Stumpf.works](https://stumpf.works)

- 🌐 Website: https://stumpf.works
- 📧 Email: info@stumpf.works
- 💼 GitHub: https://github.com/stumpfworks

---

## 🙏 Danke

Ein großes Dankeschön an:
- Die **Raspberry Pi Foundation** für die tolle Hardware
- Die **Open Source Community** für die verwendeten Bibliotheken
- Alle **Tester und Contributor**

---

<div align="center">

**⚖️ CraftScale - Dein Craft Management System**

*Made with ❤️ for Makers, Artists and Small Businesses*

**[⭐ Star this repo](https://github.com/DEIN-USERNAME/CraftScale)** wenn dir das Projekt gefällt!

</div>
