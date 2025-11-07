# CraftScale - Quick Start Guide

## 🚀 In 5 Minuten zum laufenden System

### 1. Installation (2 Minuten)

#### Linux/Mac/Raspberry Pi:
```bash
./install.sh
```

#### Windows:
```bash
install.bat
```

Das Script installiert automatisch alle Dependencies und erstellt die Konfiguration.

### 2. Konfiguration (1 Minute)

Bearbeiten Sie die `.env` Datei:

```bash
nano .env
```

**Wichtig**: Tragen Sie Ihre Server-IP ein:

```env
VITE_API_URL=http://192.168.1.100:3000
```

Ihre IP finden Sie mit:
- Linux: `hostname -I`
- Windows: `ipconfig`
- Mac: `ifconfig`

### 3. Server starten (30 Sekunden)

```bash
npm start
```

**Fertig!** Der Server läuft jetzt auf:
- `http://localhost:3000` (lokal)
- `http://IHRE_IP:3000` (im Netzwerk)

### 4. Arduino konfigurieren (1 Minute)

1. Öffnen Sie `arduino/esp8266_scale.ino`
2. Ändern Sie diese Zeilen:

```cpp
const char* WIFI_SSID = "DEIN_WIFI";           // ← Ihr WiFi-Name
const char* WIFI_PASSWORD = "DEIN_PASSWORD";   // ← Ihr WiFi-Passwort
const char* SERVER_URL = "http://192.168.1.100:3000/api/weight";  // ← Ihre Server-IP
```

3. Code hochladen (Arduino IDE → Upload)

### 5. Testen (30 Sekunden)

1. Browser öffnen: `http://IHRE_IP:3000`
2. Objekt auf Waage legen
3. Gewicht sollte automatisch angezeigt werden

---

## ✅ Checkliste

- [ ] Node.js installiert (Version 16+)
- [ ] Repository geklont
- [ ] `./install.sh` oder `install.bat` ausgeführt
- [ ] `.env` bearbeitet (SERVER_IP eingetragen)
- [ ] Server gestartet (`npm start`)
- [ ] Browser öffnet `http://SERVER_IP:3000`
- [ ] Arduino Code angepasst (WiFi + SERVER_URL)
- [ ] Arduino Code hochgeladen
- [ ] Waage kalibriert (siehe README.md)
- [ ] Testgewicht funktioniert

---

## 🎯 Erste Schritte nach Installation

### Material hinzufügen

1. Tab "Materialien" öffnen
2. Beispiel-Material erstellen:
   - Name: **Epoxidharz 1kg**
   - Typ: **Harz**
   - Preis: **25.00 €**
   - Einheit: **ml**
3. "Hinzufügen" klicken

Wiederholen für:
- Härter (Typ: Härter)
- Pigmente (Typ: Pigment)
- Formen (Typ: Form)

### Erstes Produkt erstellen

1. Tab "Wiegen" öffnen
2. Objekt auf Waage legen
3. Warten bis Gewicht stabil ist (2 Sekunden)
4. Formular ausfüllen:
   - **Name**: Untersetzer Blau
   - **Foto**: hochladen (optional)
   - **Material 1**: Epoxidharz → 50 ml
   - **Material 2**: Härter → 25 ml
   - **Material 3**: Pigment Blau → 2 ml
   - **Arbeitszeit**: 30 Minuten
   - **Stundenlohn**: 20 €/h
   - **Fixkosten**: 2 € (Verpackung)
   - **Gewinnmarge**: 30 %
5. Kalkulation wird automatisch berechnet
6. "Produkt erstellen" klicken

### Barcode anzeigen

1. Tab "Produkte" öffnen
2. Bei gewünschtem Produkt auf QR-Icon klicken
3. Barcode wird in neuem Fenster geöffnet
4. Rechtsklick → "Bild speichern" für Brother P-Touch

### SumUp Export

1. Tab "Export" öffnen
2. Produkte auswählen (Checkboxen)
3. "CSV Download" klicken
4. CSV in SumUp importieren

---

## 🔧 Häufige Probleme

### "Server nicht erreichbar"

**Lösung**:
```bash
# Server läuft?
npm start

# Port 3000 offen?
sudo ufw allow 3000  # Linux
```

### Arduino verbindet nicht

**Lösung**:
1. Serial Monitor öffnen (115200 Baud)
2. WiFi SSID + Passwort korrekt?
3. 2.4 GHz WiFi (ESP8266 kann kein 5 GHz)
4. Server-URL korrekt?

### Gewicht wird nicht angezeigt

**Lösung**:
1. Arduino läuft? (Serial Monitor prüfen)
2. Server-URL im Arduino Code korrekt?
3. Firewall blockt nicht?
4. Browser-Konsole öffnen (F12) für Fehler

### Kalibrierung falsch

**Lösung**:
1. Bekanntes Gewicht auflegen (z.B. 100g)
2. Wert im Serial Monitor ablesen
3. Faktor berechnen: `Wert / Gewicht`
4. `CALIBRATION_FACTOR` im Arduino Code anpassen
5. Erneut hochladen

---

## 📚 Nächste Schritte

1. **Alle Materialien anlegen**: Harz, Härter, Pigmente, Formen
2. **Mehrere Produkte erstellen**: Verschiedene Varianten testen
3. **Preise optimieren**: Kalkulation mit echten Kosten
4. **Barcode drucken**: Brother P-Touch Workflow einrichten
5. **SumUp einrichten**: CSV Export testen

---

## 💡 Pro-Tipps

### Auto-Start einrichten (Linux)

```bash
sudo systemctl enable craftscale
sudo systemctl start craftscale
```

### Backup einrichten (täglich)

```bash
crontab -e
```

Fügen Sie hinzu:
```cron
0 3 * * * /home/pi/craftscale/backup.sh
```

### Netzwerk-Name statt IP

Fügen Sie in `/etc/hosts` (oder Windows: `C:\Windows\System32\drivers\etc\hosts`) hinzu:

```
192.168.1.100  craftscale.local
```

Dann können Sie zugreifen über: `http://craftscale.local:3000`

### Mobile Zugriff

Gleicher Weg wie vom Laptop:
1. Smartphone ins gleiche WiFi
2. Browser öffnen
3. `http://SERVER_IP:3000` eingeben
4. Bookmark anlegen

---

## 📞 Support

Bei Problemen:

1. **README.md** lesen (ausführliche Dokumentation)
2. **STRUCTURE.md** anschauen (Projekt-Übersicht)
3. **Logs prüfen**: `tail -f logs/craftscale.log`
4. **Serial Monitor** öffnen (Arduino Debug)
5. **Issue erstellen** auf GitHub

---

**⚖️ Viel Erfolg mit CraftScale!**

*Created by Stumpf.works*
