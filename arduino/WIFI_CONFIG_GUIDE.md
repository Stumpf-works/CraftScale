# WiFi-Konfiguration für CraftScale ESP8266

## 📁 Zwei Versionen verfügbar

### 1. **esp8266_scale_with_webui.ino** (Empfohlen! ⭐)
**Vollständige Version mit Web-Interface**

**Features:**
- ✅ Web-Interface für Konfiguration
- ✅ WiFi im Sketch ODER über Web-Interface
- ✅ WiFi-Manager als Fallback
- ✅ EEPROM-Speicherung (WiFi bleibt gespeichert)
- ✅ Alle Einstellungen über Browser änderbar

**WiFi-Konfiguration - 3 Optionen:**

#### Option A: Im Sketch (beim Upload)
```cpp
const char* WIFI_SSID_DEFAULT = "MeinWiFi";
const char* WIFI_PASSWORD_DEFAULT = "MeinPasswort123";
```

#### Option B: Über Web-Interface (später ändern)
1. ESP8266 hochladen & starten
2. Browser öffnen: `http://WAAGE_IP`
3. Tab "WiFi"
4. SSID & Passwort eingeben
5. Speichern → ESP verbindet sich neu

#### Option C: WiFi-Manager (Fallback)
1. Wenn kein WiFi angegeben ODER Verbindung fehlschlägt
2. ESP8266 startet Access Point "CraftScale-Waage"
3. Mit AP verbinden
4. Browser öffnet automatisch → WiFi konfigurieren

---

### 2. **esp8266_scale_standalone_mode.ino** (Einfach)
**Vereinfachte Version - WiFi NUR im Sketch**

**Features:**
- ✅ Einfaches Setup
- ✅ WiFi MUSS im Code angegeben werden
- ✅ Kein Web-Interface für Einstellungen
- ✅ Nur Gewichtsanzeige

**WiFi-Konfiguration:**
```cpp
const char* WIFI_SSID = "MeinWiFi";           // HIER EINTRAGEN
const char* WIFI_PASSWORD = "MeinPasswort";   // HIER EINTRAGEN
```

**Verwendung:**
- Für einfache Standalone-Nutzung
- Wenn keine Konfigurationsänderungen nötig
- WiFi wird NICHT gespeichert (nur im Code)

---

## 🎯 Welche Version verwenden?

### Verwenden Sie **esp8266_scale_with_webui.ino** wenn:
- ✅ Sie volle Kontrolle über Web-Interface wollen
- ✅ Sie WiFi später ändern möchten (ohne Code-Upload)
- ✅ Sie Backend An/Aus schalten wollen
- ✅ Sie Kalibrierung über Web machen wollen

### Verwenden Sie **esp8266_scale_standalone_mode.ino** wenn:
- ✅ Sie nur einfaches Wiegen brauchen
- ✅ WiFi nie geändert werden muss
- ✅ Sie minimalen Code bevorzugen
- ✅ Sie kein Web-Interface brauchen

---

## 📖 Verwendung: esp8266_scale_with_webui.ino

### Szenario 1: WiFi im Sketch angeben

**Schritt 1:** Code öffnen, WiFi eintragen
```cpp
const char* WIFI_SSID_DEFAULT = "MeinWiFi";
const char* WIFI_PASSWORD_DEFAULT = "12345678";
```

**Schritt 2:** Code hochladen

**Schritt 3:** Serial Monitor öffnen (115200 Baud)
```
[WiFi] Verwende WiFi aus Sketch...
[WiFi] Verbinde mit: MeinWiFi
[WiFi] Erfolgreich verbunden!
[WiFi] IP-Adresse: 192.168.1.50
```

**Schritt 4:** Browser öffnen
```
http://192.168.1.50
```

**Schritt 5:** Fertig! WiFi ist jetzt gespeichert und kann über Web-Interface geändert werden.

---

### Szenario 2: WiFi über WiFi-Manager (leer lassen)

**Schritt 1:** WiFi im Sketch LEER lassen
```cpp
const char* WIFI_SSID_DEFAULT = "";        // Leer!
const char* WIFI_PASSWORD_DEFAULT = "";    // Leer!
```

**Schritt 2:** Code hochladen

**Schritt 3:** ESP8266 startet im Config-Modus
```
[WiFi] Keine WiFi-Daten gefunden. Starte WiFi-Manager...
[WiFi] Konfigurationsmodus gestartet
[WiFi] Verbinde mit WiFi: CraftScale-Waage
[WiFi] Öffne: http://192.168.4.1
```

**Schritt 4:** Smartphone/Laptop
1. WiFi-Einstellungen öffnen
2. Netzwerk "CraftScale-Waage" suchen
3. Verbinden (kein Passwort)
4. Browser öffnet automatisch (oder manuell: `http://192.168.4.1`)

**Schritt 5:** WiFi konfigurieren
1. "Configure WiFi" klicken
2. Ihr WiFi-Netzwerk auswählen
3. Passwort eingeben
4. "Save" klicken

**Schritt 6:** ESP verbindet sich
```
[WiFi] Erfolgreich verbunden!
[WiFi] IP-Adresse: 192.168.1.50
```

**Schritt 7:** WiFi ist gespeichert! Beim nächsten Start verbindet sich ESP8266 automatisch.

---

### Szenario 3: WiFi über Web-Interface ändern

**Voraussetzung:** ESP8266 ist bereits mit WiFi verbunden

**Schritt 1:** Browser öffnen
```
http://192.168.1.50
```

**Schritt 2:** Tab "WiFi" öffnen

**Schritt 3:** Neues WiFi eingeben
- SSID: "NeuesWiFi"
- Passwort: "NeuesPasswort"

**Schritt 4:** "WiFi-Einstellungen speichern & Neu starten" klicken

**Schritt 5:** ESP verbindet sich mit neuem WiFi
```
[WiFi] Versuche Verbindung mit neuem WiFi...
[WiFi] Erfolgreich verbunden!
[WiFi] Neue IP: 192.168.1.75
```

**Schritt 6:** Neue IP im Serial Monitor ablesen

**Schritt 7:** Browser mit neuer IP öffnen
```
http://192.168.1.75
```

---

## 🔧 WiFi zurücksetzen

### Über Web-Interface:
1. Browser öffnen: `http://WAAGE_IP`
2. Tab "WiFi"
3. Button "WiFi zurücksetzen & Config-Modus starten"
4. ESP startet im WiFi-Manager Modus

### Über Code:
```cpp
// In setup() GANZ am Anfang hinzufügen:
WiFiManager wifiManager;
wifiManager.resetSettings();
```

Upload → ESP startet im Config-Modus

---

## 🛠️ Troubleshooting

### Problem: ESP verbindet sich nicht

**Lösung:**
1. Serial Monitor öffnen (115200 Baud)
2. Fehlermeldung lesen
3. Häufige Ursachen:
   - Falsches Passwort
   - 5 GHz WiFi (ESP8266 kann nur 2.4 GHz)
   - WiFi-Signal zu schwach
   - Sonderzeichen im Passwort

### Problem: Kann Web-Interface nicht öffnen

**Lösung:**
1. IP-Adresse im Serial Monitor prüfen
2. Im gleichen WiFi wie ESP8266?
3. Firewall blockiert nicht?
4. Ping-Test: `ping 192.168.1.50`

### Problem: WiFi-Manager startet nicht

**Lösung:**
1. ESP8266 EEPROM löschen:
   ```cpp
   EEPROM.begin(512);
   for (int i = 0; i < 512; i++) EEPROM.write(i, 0);
   EEPROM.commit();
   ```
2. Code hochladen
3. ESP startet im Config-Modus

### Problem: Nach WiFi-Änderung keine Verbindung

**Lösung:**
1. ESP8266 hat Fallback → WiFi-Manager startet automatisch
2. Verbinden mit "CraftScale-Waage"
3. WiFi erneut konfigurieren

---

## 💡 Best Practices

### Für Entwicklung:
- ✅ WiFi im Sketch angeben (schneller)
- ✅ `const char* WIFI_SSID_DEFAULT = "DevWiFi";`

### Für Produktion:
- ✅ WiFi-Manager verwenden (flexibler)
- ✅ Code leer lassen, User konfiguriert selbst

### Für mehrere ESP8266:
- ✅ Verschiedene Geräte-Namen vergeben
- ✅ Statische IPs im Router zuweisen
- ✅ Dokumentieren welche IP für welche Waage

---

## 📊 Zusammenfassung

| Feature | webui Version | standalone Version |
|---------|---------------|-------------------|
| WiFi im Sketch | ✅ Optional | ✅ Erforderlich |
| WiFi über Web | ✅ Ja | ❌ Nein |
| WiFi-Manager | ✅ Fallback | ❌ Nein |
| EEPROM Speicherung | ✅ Ja | ❌ Nein |
| Backend An/Aus | ✅ Web-Interface | ✅ Code |
| Kalibrierung | ✅ Web-Interface | ❌ Code |
| Komplexität | Mittel | Einfach |
| Empfohlen für | Normale Nutzung | Minimalistisch |

---

**⚖️ Viel Erfolg mit CraftScale!**

*Created by Stumpf.works*
