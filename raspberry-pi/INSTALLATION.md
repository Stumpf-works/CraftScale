# CraftScale Raspberry Pi Installation
## Komplette Anleitung für Anfänger

Diese Anleitung erklärt Schritt-für-Schritt, wie du deinen Raspberry Pi 2 als Waage einrichtest - auch wenn du noch nie einen Pi benutzt hast!

## 📦 Was du brauchst

### Hardware:
- ✅ **Raspberry Pi 2** (hast du bereits)
- ✅ **HX711 Wägezellen-Verstärker** (Modul mit Chip)
- ✅ **1kg Wägezelle** (Load Cell - silberner Balken)
- **MicroSD-Karte** (min. 8GB)
- **5V Netzteil** (Micro-USB, mind. 2A)
- **Netzwerkkabel** (Ethernet) ODER WiFi-Dongle
- **4 Jumper-Kabel** (Dupont, Female-Female)

### Wo kaufen? (ca. 15-20€ komplett):
- **Amazon:** "HX711 + 1kg Load Cell Kit"
- **AliExpress:** "HX711 Wägezelle Set"
- **eBay:** "HX711 Waage Modul"

## 🔌 Hardware-Verkabelung (GANZ EINFACH!)

### Schritt 1: Raspberry Pi kennenlernen

Der Raspberry Pi hat **40 Pins** (kleine Metallstifte). Die zählen wir so:
```
Pin 1 ist OBEN LINKS (bei USB-Ports unten)
Pin 2 ist OBEN RECHTS

 Pin 1  [●]  Pin 2
 Pin 3  [●]  Pin 4
 Pin 5  [●]  Pin 6
   ...  ...  ...
```

**WICHTIG:** Pins werden nach **Nummer** gezählt, nicht nach GPIO!

### Schritt 2: HX711 an Raspberry Pi anschließen

Das HX711-Modul hat 4 Pins auf der EINEN Seite:
- **VCC** oder **+** (Stromversorgung)
- **DT** oder **DAT** (Daten)
- **SCK** oder **CLK** (Takt)
- **GND** oder **-** (Masse)

**Verkabelung mit Jumper-Kabeln:**

| HX711 Pin | Raspberry Pi Pin | Pin-Nummer | Farbe (Tipp) |
|-----------|------------------|------------|--------------|
| VCC/+     | 5V               | Pin 2      | Rot          |
| GND/-     | GND              | Pin 6      | Schwarz      |
| DT/DAT    | GPIO5            | Pin 29     | Grün         |
| SCK/CLK   | GPIO6            | Pin 31     | Gelb         |

**Bild-Hilfe (von oben auf Pi geschaut, USB-Ports unten):**
```
   3.3V [1] [2] 5V  ← Pin 2: HX711 VCC (ROT)
        [3] [4] 5V
        [5] [6] GND ← Pin 6: HX711 GND (SCHWARZ)
        ...
        [27] [28]
 GPIO5  [29] [30] GND ← Pin 29: HX711 DT (GRÜN)
 GPIO6  [31] [32]     ← Pin 31: HX711 SCK (GELB)
```

### Schritt 3: Wägezelle an HX711 anschließen

Die Wägezelle hat 4 oder 5 Kabel (Farben können variieren!):
- **Rot** = E+ (Excitation +)
- **Schwarz** = E- (Excitation -)
- **Weiß** = A+ (Amplifier +)
- **Grün** = A- (Amplifier -)
- (Gelb) = Schirm (nicht anschließen)

**WICHTIG:** Dein HX711-Modul sollte Schraubklemmen haben!

| Wägezelle | HX711 Klemme |
|-----------|--------------|
| Rot       | E+           |
| Schwarz   | E-           |
| Weiß      | A+           |
| Grün      | A-           |

**Falls andere Farben:**
```
Testen:
1. Ohm-Meter nehmen
2. Zwei Kabel mit GLEICHEM Widerstand = E+ und E-
3. Zwei andere Kabel mit HÖHEREM Widerstand = A+ und A-
```

### Schritt 4: Wägezelle montieren

Die Wägezelle ist ein Metallbalken mit einem **Pfeil** drauf.

**Montage:**
1. **Feste Seite** (ohne Pfeil): Fest verschrauben
2. **Bewegliche Seite** (mit Pfeil): Gewicht wird HIER draufgelegt
3. **Plattform:** Kleine Platte auf bewegliche Seite schrauben

```
FESTGESCHRAUBT              GEWICHT HIER DRAUF
      ↓                           ↓
[====== Wägezelle ======→]
```

## 💿 Raspberry Pi einrichten (ERSTEINRICHTUNG)

### Option 1: Pi ist NEU (kein System installiert)

1. **Raspberry Pi OS installieren:**
   - Download: https://www.raspberrypi.com/software/
   - **Raspberry Pi Imager** herunterladen
   - MicroSD-Karte in PC stecken
   - **OS wählen:** Raspberry Pi OS Lite (64-bit) - OHNE Desktop!
   - **Zahnrad-Symbol** klicken (Einstellungen):
     - Hostname: `craftscale-pi`
     - **SSH aktivieren!**
     - Benutzername: `pi`
     - Passwort: (dein Passwort)
     - WiFi konfigurieren (falls kein Ethernet)
   - **Schreiben** klicken
   - Warten bis fertig

2. **Pi starten:**
   - MicroSD in Pi stecken
   - Netzwerkkabel anschließen (oder WiFi)
   - Stromkabel anschließen
   - **Grüne LED blinkt** = Pi bootet

3. **IP-Adresse herausfinden:**
   - Router-Webinterface öffnen (meist 192.168.178.1 oder 192.168.1.1)
   - Geräteliste suchen
   - "craftscale-pi" oder "raspberrypi" suchen
   - IP notieren (z.B. `192.168.178.50`)

### Option 2: Pi läuft bereits

Falls dein Pi schon ein System hat:
1. Per SSH verbinden
2. Weitermachen bei "Software installieren"

## 🔧 Software installieren

### Schritt 1: SSH-Verbindung

**Windows:**
```bash
ssh pi@192.168.178.50
```
(Passwort eingeben)

**Falls "Host key verification failed":**
```bash
ssh-keygen -R 192.168.178.50
ssh pi@192.168.178.50
```

### Schritt 2: System aktualisieren

```bash
sudo apt-get update
sudo apt-get upgrade -y
```
(Dauert 5-10 Minuten)

### Schritt 3: Python-Bibliotheken installieren

```bash
# RPi.GPIO (für GPIO-Zugriff)
sudo apt-get install -y python3-rpi.gpio

# Requests (für HTTP)
sudo apt-get install -y python3-requests

# pip installieren (falls nicht vorhanden)
sudo apt-get install -y python3-pip
```

### Schritt 4: CraftScale Script kopieren

```bash
# Verzeichnis erstellen
mkdir -p /home/pi/craftscale
cd /home/pi/craftscale

# Script herunterladen (wir kopieren es per SCP)
```

**Von deinem PC aus:**
```bash
scp raspberry-pi/scale_reader.py pi@192.168.178.50:/home/pi/craftscale/
```

**ODER manuell erstellen:**
```bash
nano /home/pi/craftscale/scale_reader.py
```
(Inhalt von `scale_reader.py` einfügen, STRG+X, Y, Enter)

### Schritt 5: Script ausführbar machen

```bash
chmod +x /home/pi/craftscale/scale_reader.py
```

### Schritt 6: SERVER_URL anpassen

```bash
nano /home/pi/craftscale/scale_reader.py
```

**Zeile 29 ändern:**
```python
# VORHER:
SERVER_URL = "http://localhost:3000/api/weight/raw"

# NACHHER (wenn Server im LXC Container läuft):
SERVER_URL = "http://192.168.178.17:3000/api/weight/raw"
```

Speichern: **STRG+X, Y, Enter**

## 🧪 ERSTEN TEST

### Schritt 1: Script manuell starten

```bash
cd /home/pi/craftscale
sudo python3 scale_reader.py
```

**Was du sehen solltest:**
```
╔═══════════════════════════════════════════════════════════╗
║     ⚖️  CraftScale - Raspberry Pi Scale Reader           ║
║     Sendet RAW-Daten an Server                           ║
╚═══════════════════════════════════════════════════════════╝

[Init] Initialisiere HX711...
[OK] HX711 bereit
[Init] Tara durchführen (Waage sollte leer sein)...
[Tare] Offset gesetzt: -52341
[OK] Tara abgeschlossen

═══════════════════════════════════════════════════════════
✓ System bereit! Kontinuierliche Messung gestartet.
═══════════════════════════════════════════════════════════

[Messung] RAW: 152 | Stabil: Nein
[Messung] RAW: 148 | Stabil: Nein
```

**Wenn Fehler "HX711 nicht bereit":**
- Verkabelung prüfen (siehe oben)
- VCC an 5V? (Pin 2)
- GND an GND? (Pin 6)

### Schritt 2: Gewicht auflegen

1. **Etwas auf Waage legen** (z.B. Handy, 100g Münze)
2. **Warten 2 Sekunden**
3. **Sollte sehen:**
```
[Stabil] RAW: 123456
[Send] RAW: 123456 -> Server... ✓ (Gewicht: 17.52g)
```

**Falls "Verbindungsfehler":**
- Server läuft? → `ssh root@192.168.178.17 "ps aux | grep node"`
- SERVER_URL korrekt? → `http://192.168.178.17:3000/api/weight/raw`

### Schritt 3: Script beenden

**STRG+C** drücken

## 🎯 KALIBRIERUNG (WICHTIG!)

### Kalibrierung über Web-Interface (EMPFOHLEN)

1. **Server-Logs beobachten** (in neuem Terminal):
```bash
ssh root@192.168.178.17 "tail -f /opt/craftscale/logs/server.log"
```

2. **Script auf Pi starten:**
```bash
sudo python3 /home/pi/craftscale/scale_reader.py
```

3. **Waage leeren**

4. **Bekanntes Gewicht auflegen** (z.B. 100g Münze)

5. **Warten bis RAW-Wert stabil**

6. **RAW-Wert notieren** (z.B. `-705123`)

7. **Im Browser** (http://192.168.178.17:3000):
   - Zu **"Wiegen"** Tab
   - (später: Kalibrierungs-Button im Interface)

8. **Per API kalibrieren:**
```bash
curl -X POST http://192.168.178.17:3000/api/calibration \
  -H "Content-Type: application/json" \
  -d '{"knownWeight": 100, "rawValue": -705123}'
```

**Antwort:**
```json
{
  "success": true,
  "factor": -7051.23,
  "message": "Kalibrierung erfolgreich! Neuer Faktor: -7051.23"
}
```

9. **Test:** Gewicht wieder auflegen, sollte jetzt ~100g anzeigen!

## ⚙️ AUTOMATISCHER START (Systemd Service)

Damit das Script bei jedem Neustart automatisch läuft:

### Schritt 1: Service-Datei erstellen

```bash
sudo nano /etc/systemd/system/craftscale-scale.service
```

**Inhalt:**
```ini
[Unit]
Description=CraftScale Scale Reader
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/pi/craftscale
ExecStart=/usr/bin/python3 /home/pi/craftscale/scale_reader.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Speichern: **STRG+X, Y, Enter**

### Schritt 2: Service aktivieren

```bash
sudo systemctl daemon-reload
sudo systemctl enable craftscale-scale.service
sudo systemctl start craftscale-scale.service
```

### Schritt 3: Status prüfen

```bash
sudo systemctl status craftscale-scale
```

**Sollte sehen:**
```
● craftscale-scale.service - CraftScale Scale Reader
   Loaded: loaded (/etc/systemd/system/craftscale-scale.service; enabled)
   Active: active (running) since ...
```

### Schritt 4: Logs ansehen

```bash
sudo journalctl -u craftscale-scale.service -f
```

(Beenden mit **STRG+C**)

## 🔧 Problemlösung

### Problem: "HX711 nicht bereit"

**Lösung:**
1. Stromversorgung prüfen:
   ```bash
   gpio readall
   ```
   (Zeigt Pin-Status)

2. Verkabelung prüfen (siehe Verkabelungs-Tabelle oben)

3. HX711-Modul defekt? Anderes testen

### Problem: "Permission denied" beim GPIO-Zugriff

**Lösung:**
```bash
# Als root ausführen:
sudo python3 scale_reader.py

# ODER Benutzer zu gpio-Gruppe hinzufügen:
sudo usermod -a -G gpio pi
# Danach neu anmelden!
```

### Problem: Gewicht zeigt falsche Werte

**Lösung:**
1. Neu kalibrieren (siehe Kalibrierungs-Anleitung)
2. Mehrere bekannte Gewichte testen (50g, 100g, 500g)
3. Wägezelle fest montiert? (Darf nicht wackeln!)

### Problem: Gewicht schwankt stark (+/- 10g)

**Lösung:**
1. Wägezelle fest verschrauben
2. Vibrationen vermeiden (nicht auf Tisch mit Waschmaschine)
3. Kürzere Kabel zur Wägezelle
4. STABILITY_THRESHOLD erhöhen:
   ```python
   # In scale_reader.py Zeile 26:
   STABILITY_THRESHOLD = 1000  # statt 500
   ```

### Problem: "Verbindungsfehler" beim Senden

**Lösung:**
1. Server läuft?
   ```bash
   ssh root@192.168.178.17 "ps aux | grep node"
   ```

2. Server-URL korrekt?
   ```bash
   curl http://192.168.178.17:3000/api/health
   ```
   Sollte `{"status":"ok"}` zurückgeben

3. Firewall blockiert Port 3000?

### Problem: Service startet nicht automatisch

**Lösung:**
```bash
# Service-Status prüfen:
sudo systemctl status craftscale-scale

# Logs ansehen:
sudo journalctl -u craftscale-scale -n 50

# Service neu starten:
sudo systemctl restart craftscale-scale
```

## 📊 Nützliche Befehle

### Script manuell starten (Debug):
```bash
sudo python3 /home/pi/craftscale/scale_reader.py
```

### Service starten/stoppen:
```bash
sudo systemctl start craftscale-scale    # Starten
sudo systemctl stop craftscale-scale     # Stoppen
sudo systemctl restart craftscale-scale  # Neustart
sudo systemctl status craftscale-scale   # Status
```

### Logs ansehen:
```bash
# Service-Logs:
sudo journalctl -u craftscale-scale -f

# Server-Logs (auf Container):
ssh root@192.168.178.17 "tail -f /opt/craftscale/logs/server.log"
```

### Kalibrierung abrufen:
```bash
curl http://192.168.178.17:3000/api/calibration
```

### Manuell kalibrieren:
```bash
curl -X POST http://192.168.178.17:3000/api/calibration \
  -H "Content-Type: application/json" \
  -d '{"knownWeight": 100, "rawValue": -705000}'
```

## 🎯 Zusammenfassung

**Was du jetzt hast:**
✅ Raspberry Pi liest HX711 Wägezelle aus
✅ Sendet RAW-Daten an CraftScale Server
✅ Server macht Kalibrierung (keine Code-Änderung nötig!)
✅ Automatischer Start bei Neustart
✅ Kalibrierung über Web-Interface (bald)

**Typischer Workflow:**
1. Raspberry Pi einschalten → Script startet automatisch
2. Waage ist betriebsbereit
3. Kalibrierung über Web-Interface (nur bei Bedarf)
4. Gewicht auflegen → Automatisch an Server gesendet

## 📞 Noch Fragen?

Bei Problemen:
1. **Service-Logs prüfen:** `sudo journalctl -u craftscale-scale -f`
2. **Server-Logs prüfen:** `ssh root@192.168.178.17 "tail -f /opt/craftscale/logs/server.log"`
3. **Verkabelung prüfen** (siehe Tabelle oben)
4. **Script manuell starten** für Debug: `sudo python3 scale_reader.py`

---

**© 2025 CraftScale by Stumpf.works**
