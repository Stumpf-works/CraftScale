# 🔌 Verkabelungsanleitung - HX711 am Raspberry Pi

**Schritt-für-Schritt Anleitung zum Anschluss der Waage**

> ⚠️ **Wichtig:** Arbeite vorsichtig und berühre keine elektronischen Bauteile während der Pi läuft!

---

## 📦 Was du brauchst

### Hardware-Komponenten

| Komponente | Menge | Beschreibung | Bezugsquelle |
|------------|-------|--------------|--------------|
| **Raspberry Pi** | 1× | Modell 3B+ oder neuer | Amazon, Reichelt, BerryBase |
| **HX711 Modul** | 1× | 24-Bit ADC für Load Cells | Amazon, AliExpress, eBay |
| **Wägezelle (Load Cell)** | 1× | 1kg, 5kg oder 10kg | Amazon, AliExpress |
| **Jumper Kabel (Female-Female)** | 4× | Für HX711 ↔ Raspberry Pi | Amazon, Reichelt |
| **Lötkolben & Lötzinn** | - | Zum Löten der Wägezelle an HX711 | Baumarkt, Conrad |
| **Schrumpfschlauch** | - | Zum Isolieren der Lötstellen | Baumarkt, Conrad |

### Zusätzliche Werkzeuge

- Abisolierzange oder Seitenschneider
- Feuerzeug oder Heißluftfön (für Schrumpfschlauch)
- Multimeter (optional, zum Durchgangsprüfen)
- Dritte Hand oder Lötstation (hilfreich)

---

## 🔍 Komponenten verstehen

### HX711 Modul

Das HX711 ist ein **Präzisions-ADC** (Analog-Digital-Wandler) speziell für Wägezellen.

**Anschlüsse auf dem HX711:**

```
┌─────────────────────────┐
│        HX711            │
│                         │
│  [E+] [E-] [A-] [A+]   │  ← Wägezelle (Load Cell)
│                         │
│  [GND] [DT] [SCK] [VCC] │  ← Raspberry Pi
└─────────────────────────┘
```

**Bedeutung:**
- **E+, E-** = Excitation (Spannungsversorgung für Wägezelle)
- **A+, A-** = Signal (Amplified Signal von der Wägezelle)
- **VCC, GND** = Stromversorgung vom Raspberry Pi
- **DT** = Data (Datenleitung)
- **SCK** = Serial Clock (Taktleitung)

### Wägezelle (Load Cell)

Die Wägezelle ist ein **Dehnungsmessstreifen-Sensor**. Wenn Gewicht aufgelegt wird, verformt sich die Metallfeder minimal und ändert den elektrischen Widerstand.

**Typische Wägezelle mit 4 Kabeln:**

| Kabelfarbe | Bedeutung | Anschluss am HX711 |
|------------|-----------|-------------------|
| **Rot** | Excitation+ (E+) | **E+** |
| **Schwarz** | Excitation- (E-) | **E-** |
| **Weiß** | Signal+ (A+) | **A+** |
| **Grün** | Signal- (A-) | **A-** |

> ⚠️ **Achtung:** Manche Hersteller verwenden andere Farben! Prüfe das Datenblatt deiner Wägezelle.

**Alternative Farben (je nach Hersteller):**
- Rot = E+
- Schwarz oder Blau = E-
- Weiß oder Gelb = A+
- Grün = A-

---

## 🔌 Verkabelungsplan

### 1. Wägezelle → HX711

**Löten erforderlich!** (siehe nächster Abschnitt)

```
Wägezelle                 HX711 Modul
──────────                ─────────────
Rot (E+)     ────────►    E+
Schwarz (E-) ────────►    E-
Weiß (A+)    ────────►    A+
Grün (A-)    ────────►    A-
```

### 2. HX711 → Raspberry Pi

**Mit Jumper-Kabeln (Female-Female):**

```
HX711                     Raspberry Pi GPIO
──────                    ──────────────────
VCC       ────────►       Pin 2  (5V)
GND       ────────►       Pin 6  (GND)
DT        ────────►       Pin 29 (GPIO 5)
SCK       ────────►       Pin 31 (GPIO 6)
```

**Visualisierung:**

```
Raspberry Pi (Top View)
┌─────────────────────────────────┐
│  ○ ○                         ○ ○│
│  1 2  ← Pin 2 (5V zu HX711)   │
│  ○ ○                         ○ ○│
│  3 4                           │
│  ○ ○                         ○ ○│
│  5 6  ← Pin 6 (GND zu HX711)  │
│  ○ ○                         ○ ○│
│  ... (weitere Pins)            │
│  ○ ○                         ○ ○│
│ 29 30 ← Pin 29 (GPIO 5 zu DT) │
│  ○ ○                         ○ ○│
│ 31 32 ← Pin 31 (GPIO 6 zu SCK)│
│  ○ ○                         ○ ○│
└─────────────────────────────────┘
```

**Pin-Übersicht:**

| HX711 Pin | Jumper-Kabel | Raspberry Pi Pin | GPIO Name |
|-----------|--------------|------------------|-----------|
| VCC (rot) | Rot | Pin 2 | 5V Power |
| GND (schwarz) | Schwarz | Pin 6 | Ground |
| DT (gelb/grün) | Gelb | Pin 29 | GPIO 5 |
| SCK (blau/weiß) | Blau | Pin 31 | GPIO 6 |

> 💡 **Tipp:** Du kannst auch andere GPIO-Pins verwenden, musst dann aber das Python-Script anpassen!

---

## 🛠️ Schritt-für-Schritt Anleitung

### Schritt 1: Wägezelle vorbereiten

1. **Kabel der Wägezelle identifizieren:**
   - Rot, Schwarz, Weiß, Grün (typisch)
   - Falls unsicher: Datenblatt checken oder mit Multimeter messen

2. **Kabel abisolieren:**
   - Ca. 5-7mm Isolierung entfernen
   - Drähte verdrillen (damit sie nicht ausfransen)

3. **Optional: Kabel verzinnen**
   - Lötkolben aufheizen (ca. 350°C)
   - Etwas Lötzinn auf die abisolierten Enden auftragen
   - Dadurch lassen sich die Kabel leichter löten

### Schritt 2: Wägezelle an HX711 löten

> ⚠️ **Wichtig:** Raspberry Pi muss AUSGESCHALTET sein während du lötest!

**Vorbereitung:**
1. Schrumpfschlauch auf die Kabel schieben (BEVOR du lötest!)
2. HX711 in eine "Dritte Hand" oder auf ein Brett fixieren

**Löten:**

**Rotes Kabel → E+:**
1. Rotes Kabel durch das Loch "E+" auf dem HX711 stecken
2. Lötkolben erhitzen
3. Lötkolben an Lötpad und Kabel halten
4. Lötzinn zuführen bis es schön fließt
5. Lötkolben entfernen, abkühlen lassen
6. Verbindung prüfen (sollte fest sein)

**Schwarzes Kabel → E-:**
- Gleiche Prozedur für "E-"

**Weißes Kabel → A+:**
- Gleiche Prozedur für "A+"

**Grünes Kabel → A-:**
- Gleiche Prozedur für "A-"

**Nach dem Löten:**
1. Schrumpfschlauch über Lötstelle schieben
2. Mit Feuerzeug oder Heißluftfön erhitzen
3. Schrumpfschlauch schrumpft und isoliert die Lötstelle

**Qualitätskontrolle:**
- Alle 4 Verbindungen fest?
- Keine Kurzschlüsse zwischen benachbarten Pins?
- Optional: Mit Multimeter Durchgang prüfen

### Schritt 3: HX711 an Raspberry Pi anschließen

**Raspberry Pi MUSS AUSGESCHALTET SEIN!**

1. **Jumper-Kabel vorbereiten:**
   - 4× Female-Female Kabel (rot, schwarz, gelb, blau)

2. **VCC verbinden:**
   - Rotes Kabel von HX711 VCC zu Raspberry Pi Pin 2 (5V)

3. **GND verbinden:**
   - Schwarzes Kabel von HX711 GND zu Raspberry Pi Pin 6 (GND)

4. **DT verbinden:**
   - Gelbes Kabel von HX711 DT zu Raspberry Pi Pin 29 (GPIO 5)

5. **SCK verbinden:**
   - Blaues Kabel von HX711 SCK zu Raspberry Pi Pin 31 (GPIO 6)

**Doppelt prüfen:**
- Alle Kabel richtig gesteckt?
- Keine vertauschten Pins?
- Nichts wackelt?

### Schritt 4: Wägezelle mechanisch montieren

**Wichtig für genaue Messungen!**

1. **Feste Unterlage:**
   - Wägezelle auf einer festen Unterlage montieren
   - Z.B. Holzplatte, Aluminiumprofil

2. **Befestigung:**
   - Die **feste Seite** der Wägezelle verschrauben
   - Die **freie Seite** darf sich verbiegen (dort wirkt das Gewicht)

3. **Wiegeplattform:**
   - Kleine Platte auf die freie Seite legen
   - Dort werden die Produkte draufgelegt

**Beispiel-Aufbau:**

```
         [Wiegeplattform]
                ↓
         ╔═════════════╗
         ║  Wägezelle  ║  ← Freie Seite (verbiegt sich)
         ╚═════════════╝
                ↓
         [Feste Unterlage] ← Hier festschrauben
```

---

## ✅ Test & Kalibrierung

### 1. Erster Test (ohne Software)

**Hardware-Test:**

1. Raspberry Pi einschalten
2. Prüfe ob HX711 eine LED hat (leuchtet sie?)
3. Keine Rauchentwicklung oder komische Gerüche? ✓

### 2. Software-Test

**Python Script erstellen:**

```bash
# Ins Projekt-Verzeichnis
cd ~/CraftScale

# Test-Script erstellen
nano test_hx711.py
```

Inhalt:
```python
#!/usr/bin/env python3
import RPi.GPIO as GPIO
from hx711 import HX711
import time

# GPIO Setup
GPIO.setmode(GPIO.BCM)

# HX711 initialisieren
hx = HX711(dout_pin=5, pd_sck_pin=6)

# Setze Referenzeinheit (vorerst 1)
hx.set_reference_unit(1)

# Tara
hx.reset()
hx.tare()

print("Lege jetzt ein Gewicht auf die Waage...")
print("Drücke Strg+C zum Beenden")

try:
    while True:
        val = hx.get_weight(5)  # 5 Messungen mitteln
        print(f"Gewicht: {val:.2f} g")
        time.sleep(1)

except KeyboardInterrupt:
    print("\nProgramm beendet")

finally:
    GPIO.cleanup()
```

**Ausführen:**
```bash
sudo python3 test_hx711.py
```

**Was du sehen solltest:**
```
Lege jetzt ein Gewicht auf die Waage...
Drücke Strg+C zum Beenden
Gewicht: 0.00 g
Gewicht: 0.00 g
Gewicht: 152345.67 g  ← Nicht kalibriert! (RAW-Wert)
Gewicht: 152340.12 g
```

**Wenn es funktioniert:**
- ✅ Die Zahl ändert sich, wenn du etwas drauflegst
- ✅ Die Zahl geht runter, wenn du es wegnimmst

**Wenn es NICHT funktioniert:**
- ❌ Fehler "ModuleNotFoundError: No module named 'hx711'"
  → `sudo pip3 install hx711` ausführen
- ❌ Nur Nullen → Verkabelung prüfen
- ❌ Keine Änderung beim Auflegen → Wägezelle defekt oder falsch angeschlossen

### 3. Kalibrierung

**Kalibrierungsfaktor ermitteln:**

1. **Bekanntes Gewicht vorbereiten** (z.B. 100g)
2. **Waage leer machen** und Script starten
3. **RAW-Wert bei leerem Gewicht** notieren (z.B. 50000)
4. **Gewicht auflegen**
5. **RAW-Wert mit Gewicht** notieren (z.B. 755000)
6. **Kalibrierungsfaktor berechnen:**

```
Differenz = 755000 - 50000 = 705000
Kalibrierungsfaktor = 705000 / 100g = 7050
```

**In CraftScale eintragen:**
- Über Web-Interface: **Einstellungen** → **Kalibrieren**
- Oder im Python-Script: `hx.set_reference_unit(7050)`

---

## 🔧 Pinbelegung ändern (Optional)

Wenn du andere GPIO-Pins verwenden möchtest:

**1. Python Script anpassen** (`scale_reader.py`):

```python
# Alte Pins:
hx = HX711(dout_pin=5, pd_sck_pin=6)

# Neue Pins (z.B. GPIO 23 und GPIO 24):
hx = HX711(dout_pin=23, pd_sck_pin=24)
```

**2. Neue Pin-Tabelle:**

| HX711 Pin | Neuer GPIO | Raspberry Pi Pin |
|-----------|------------|------------------|
| DT | GPIO 23 | Pin 16 |
| SCK | GPIO 24 | Pin 18 |

**3. Jumper-Kabel umstecken** entsprechend der neuen Pins

---

## 🐛 Troubleshooting

### Problem: "Permission denied" beim Python Script

**Fehler:**
```
PermissionError: [Errno 13] Permission denied: '/dev/gpiomem'
```

**Lösung:**
```bash
# Script mit sudo ausführen
sudo python3 scale_reader.py

# ODER: User zu gpio Gruppe hinzufügen
sudo usermod -a -G gpio pi
# Danach neu anmelden!
```

### Problem: Waage zeigt immer 0.00g

**Mögliche Ursachen:**

1. **Verkabelung falsch:**
   - Prüfe alle 6 Verbindungen (4× Wägezelle, 2× Raspberry Pi)
   - Sind die Pins richtig? (Pin 29 = GPIO 5, Pin 31 = GPIO 6)

2. **HX711 defekt:**
   - LED leuchtet?
   - Mit Multimeter Spannung messen (VCC sollte 5V haben)

3. **Wägezelle defekt:**
   - Mit Multimeter Widerstand zwischen Kabeln messen
   - Sollte ca. 1000 Ohm sein (je nach Wägezelle)

4. **Falsche GPIO-Pins im Script:**
   - Prüfe `scale_reader.py`:
     ```python
     hx = HX711(dout_pin=5, pd_sck_pin=6)
     ```

### Problem: Gewicht springt wild

**Ursachen:**

1. **Instabile Montage:**
   - Wägezelle muss fest verschraubt sein
   - Wiegeplattform darf nur auf der Wägezelle aufliegen

2. **Elektromagnetische Störungen:**
   - Kabel der Wägezelle nicht parallel zu Stromkabeln legen
   - Abstand zu Motoren, Transformern

3. **Vibrations:**
   - Waage auf stabiler Unterlage
   - Keine Lüfter oder Motoren in der Nähe

4. **Kalibrierung falsch:**
   - Erneut kalibrieren mit mehreren Testgewichten

### Problem: Python Library "hx711" nicht gefunden

**Fehler:**
```
ModuleNotFoundError: No module named 'hx711'
```

**Lösung:**
```bash
# HX711 Library installieren
sudo pip3 install hx711

# Falls das nicht geht, manuell:
cd ~
git clone https://github.com/tatobari/hx711py
cd hx711py
sudo python3 setup.py install
```

---

## 📸 Bilder & Referenzen

### Empfohlene Wägezellen

- **1kg Load Cell** - Für kleine Produkte (0-1000g)
- **5kg Load Cell** - Universal (0-5000g) ← **Empfohlen**
- **10kg Load Cell** - Für schwere Produkte (0-10000g)

### HX711 Modul Varianten

- **Grünes HX711 PCB** - Am häufigsten
- **Rotes HX711 PCB** - Gleiche Funktionalität
- **HX711 mit Schraubklemmen** - Kein Löten nötig! (etwas teurer)

> 💡 **Tipp:** Kaufe ein **HX711 Set mit Wägezelle** - oft günstiger und alles passt zusammen!

---

## ✅ Checkliste

### Vor dem Löten
- [ ] Alle Komponenten vorhanden?
- [ ] Kabelfarben der Wägezelle identifiziert?
- [ ] Schrumpfschlauch aufgeschoben?
- [ ] Lötkolben funktioniert?

### Nach dem Löten
- [ ] Alle 4 Verbindungen fest?
- [ ] Keine Kurzschlüsse?
- [ ] Schrumpfschlauch drüber?
- [ ] Mit Multimeter geprüft?

### Raspberry Pi Verkabelung
- [ ] Pi ist AUSGESCHALTET?
- [ ] VCC (5V) richtig? → Pin 2
- [ ] GND richtig? → Pin 6
- [ ] DT richtig? → Pin 29 (GPIO 5)
- [ ] SCK richtig? → Pin 31 (GPIO 6)

### Mechanische Montage
- [ ] Wägezelle fest montiert?
- [ ] Nur eine Seite fest, andere Seite frei?
- [ ] Wiegeplattform drauf?
- [ ] Stabil und wackelfrei?

### Software-Test
- [ ] Python Script läuft?
- [ ] RAW-Werte werden angezeigt?
- [ ] Wert ändert sich beim Auflegen?
- [ ] Kalibrierung durchgeführt?

---

## 🎉 Fertig!

Wenn alle Tests funktionieren, ist deine Waage einsatzbereit!

Weiter geht's mit:
1. CraftScale Server starten
2. Im Browser öffnen
3. Kalibrierung im Web-Interface durchführen
4. Erste Produkte erfassen!

Viel Erfolg! 🚀

---

**Bei Fragen oder Problemen:**
- Erstelle ein Issue auf GitHub
- Schreib an info@stumpf.works

**Entwickelt von:** [Stumpf.works](https://stumpf.works)
