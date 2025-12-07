#!/usr/bin/env python3
"""
CraftScale by Stumpf.works
Raspberry Pi HX711 Scale Reader

Liest HX711 Wägezelle direkt am Raspberry Pi aus
und sendet Gewichtsdaten an den lokalen CraftScale Server.

Hardware-Anschluss (Raspberry Pi 2):
- HX711 VCC  -> Pin 2 (5V) oder Pin 1 (3.3V)
- HX711 GND  -> Pin 6 (GND)
- HX711 DT   -> Pin 29 (GPIO5)
- HX711 SCK  -> Pin 31 (GPIO6)

Installation:
    sudo pip3 install RPi.GPIO
    sudo pip3 install requests
"""

import sys
import time
import json
import requests
import RPi.GPIO as GPIO
from datetime import datetime

# ============================================
# KONFIGURATION
# ============================================

# HX711 GPIO Pins (BCM-Nummerierung)
HX711_DT_PIN = 5    # GPIO5 = Pin 29
HX711_SCK_PIN = 6   # GPIO6 = Pin 31

# Server-Konfiguration (localhost da Server auf gleichem Gerät läuft)
SERVER_URL = "http://localhost:3000/api/weight/raw"
SERVER_TIMEOUT = 5  # Sekunden

# Messung-Einstellungen
MEASUREMENT_SAMPLES = 10        # Anzahl Messungen pro Durchgang
STABILITY_THRESHOLD = 500       # RAW-Wert Stabilität (±500 Counts)
STABILITY_DURATION = 2.0        # Sekunden
LOOP_DELAY = 0.1               # Sekunden zwischen Messungen

# Debug-Ausgaben
DEBUG = True

# ============================================
# HX711 KLASSE (vereinfacht)
# ============================================

class HX711:
    """
    Einfache HX711 Klasse für Raspberry Pi
    Basiert auf: https://github.com/tatobari/hx711py
    """

    def __init__(self, dout_pin, pd_sck_pin, gain=128):
        self.PD_SCK = pd_sck_pin
        self.DOUT = dout_pin

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.PD_SCK, GPIO.OUT)
        GPIO.setup(self.DOUT, GPIO.IN)

        self.GAIN = 0
        self.OFFSET = 0
        self.set_gain(gain)

        # Warten bis bereit
        time.sleep(1)

    def is_ready(self):
        """Prüft ob HX711 bereit ist"""
        return GPIO.input(self.DOUT) == 0

    def set_gain(self, gain):
        """Setzt den Verstärkungsfaktor"""
        if gain == 128:
            self.GAIN = 1
        elif gain == 64:
            self.GAIN = 3
        elif gain == 32:
            self.GAIN = 2

        GPIO.output(self.PD_SCK, False)
        self.read()

    def read(self):
        """Liest einen RAW-Wert vom HX711"""
        # Warten bis bereit
        while not self.is_ready():
            time.sleep(0.01)

        # 24 Bit auslesen
        data = 0
        for _ in range(24):
            GPIO.output(self.PD_SCK, True)
            data = (data << 1) | GPIO.input(self.DOUT)
            GPIO.output(self.PD_SCK, False)

        # Gain setzen
        for _ in range(self.GAIN):
            GPIO.output(self.PD_SCK, True)
            GPIO.output(self.PD_SCK, False)

        # 24-bit zu signed integer
        if data & 0x800000:
            data = data - 0x1000000

        return data

    def read_average(self, times=10):
        """Liest Durchschnitt von mehreren Messungen"""
        sum_val = 0
        for _ in range(times):
            sum_val += self.read()
        return sum_val / times

    def get_value(self, times=10):
        """Liest Wert mit Offset-Korrektur"""
        return self.read_average(times) - self.OFFSET

    def tare(self, times=20):
        """Setzt Nullpunkt (Tara)"""
        self.OFFSET = self.read_average(times)
        if DEBUG:
            print(f"[Tare] Offset gesetzt: {self.OFFSET:.0f}")

    def cleanup(self):
        """GPIO aufräumen"""
        GPIO.cleanup()

# ============================================
# SCALE MANAGER
# ============================================

class ScaleManager:
    """Verwaltet die Wägezelle und sendet Daten an Server"""

    def __init__(self):
        self.hx = None
        self.last_raw_value = 0
        self.current_raw_value = 0
        self.stable_start_time = 0
        self.is_stable = False
        self.has_been_sent = False

        print("╔═══════════════════════════════════════════════════════════╗")
        print("║     ⚖️  CraftScale - Raspberry Pi Scale Reader           ║")
        print("║     Sendet RAW-Daten an Server                           ║")
        print("╚═══════════════════════════════════════════════════════════╝")
        print()

    def initialize(self):
        """Initialisiert HX711"""
        try:
            print("[Init] Initialisiere HX711...")
            self.hx = HX711(HX711_DT_PIN, HX711_SCK_PIN)

            if not self.hx.is_ready():
                print("[FEHLER] HX711 nicht bereit! Verkabelung prüfen.")
                return False

            print("[OK] HX711 bereit")

            # Tara durchführen
            print("[Init] Tara durchführen (Waage sollte leer sein)...")
            self.hx.tare(20)
            print("[OK] Tara abgeschlossen")

            return True

        except Exception as e:
            print(f"[FEHLER] Initialisierung fehlgeschlagen: {e}")
            return False

    def send_to_server(self, raw_value):
        """Sendet RAW-Wert an Server"""
        try:
            data = {
                "rawValue": int(raw_value),
                "timestamp": datetime.now().isoformat()
            }

            if DEBUG:
                print(f"[Send] RAW: {raw_value:.0f} -> Server...", end=" ")

            response = requests.post(
                SERVER_URL,
                json=data,
                timeout=SERVER_TIMEOUT
            )

            if response.status_code == 200:
                result = response.json()
                if DEBUG:
                    print(f"✓ (Gewicht: {result.get('weight', 0):.2f}g)")
                return True
            else:
                if DEBUG:
                    print(f"✗ HTTP {response.status_code}")
                return False

        except requests.exceptions.RequestException as e:
            if DEBUG:
                print(f"✗ Fehler: {e}")
            return False

    def run(self):
        """Hauptschleife"""
        print()
        print("═══════════════════════════════════════════════════════════")
        print("✓ System bereit! Kontinuierliche Messung gestartet.")
        print("═══════════════════════════════════════════════════════════")
        print()

        try:
            while True:
                # RAW-Wert auslesen
                if self.hx.is_ready():
                    self.current_raw_value = self.hx.get_value(MEASUREMENT_SAMPLES)

                    # Stabilitätsprüfung
                    diff = abs(self.current_raw_value - self.last_raw_value)

                    if diff <= STABILITY_THRESHOLD:
                        # Stabil
                        if not self.is_stable:
                            self.stable_start_time = time.time()
                            self.is_stable = True
                            if DEBUG:
                                print(f"[Stabil] RAW: {self.current_raw_value:.0f}")
                        else:
                            # Prüfen ob lange genug stabil
                            stable_duration = time.time() - self.stable_start_time

                            if stable_duration >= STABILITY_DURATION and not self.has_been_sent:
                                # An Server senden
                                self.send_to_server(self.current_raw_value)
                                self.has_been_sent = True
                    else:
                        # Nicht stabil
                        if self.has_been_sent and DEBUG:
                            print("[Reset] Neue Messung")

                        self.is_stable = False
                        self.has_been_sent = False

                    self.last_raw_value = self.current_raw_value

                    # Debug-Ausgabe
                    if DEBUG:
                        current_time = time.time()
                        if not hasattr(self, '_last_debug_time') or (current_time - self._last_debug_time) > 1.0:
                            print(f"[Messung] RAW: {self.current_raw_value:.0f} | Stabil: {'Ja' if self.is_stable else 'Nein'}")
                            self._last_debug_time = current_time

                time.sleep(LOOP_DELAY)

        except KeyboardInterrupt:
            print("\n[Exit] Beende Programm...")
        finally:
            self.cleanup()

    def cleanup(self):
        """Aufräumen"""
        if self.hx:
            self.hx.cleanup()
        print("[Exit] GPIO aufgeräumt")

# ============================================
# MAIN
# ============================================

def main():
    """Hauptfunktion"""
    manager = ScaleManager()

    if not manager.initialize():
        print("[FEHLER] Initialisierung fehlgeschlagen")
        sys.exit(1)

    manager.run()

if __name__ == "__main__":
    main()
