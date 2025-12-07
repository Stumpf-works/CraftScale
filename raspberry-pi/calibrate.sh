#!/bin/bash
#
# CraftScale Kalibrierungs-Helfer
# Verwendung: ./calibrate.sh <bekanntes_gewicht_in_gramm>
#

SERVER_URL="http://192.168.178.17:3000"

echo "╔════════════════════════════════════════════════════════╗"
echo "║  CraftScale - Kalibrierungs-Assistent                 ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

if [ -z "$1" ]; then
    echo "Verwendung: $0 <bekanntes_gewicht_in_gramm>"
    echo "Beispiel:   $0 100"
    echo ""
    exit 1
fi

KNOWN_WEIGHT=$1

echo "Schritt 1: Aktuelle Kalibrierung abrufen..."
echo "---------------------------------------------------"
curl -s $SERVER_URL/api/calibration | jq .
echo ""

echo "Schritt 2: Beobachte RAW-Werte (10 Sekunden)..."
echo "---------------------------------------------------"
echo "Lege jetzt das ${KNOWN_WEIGHT}g Gewicht auf die Waage!"
echo ""

for i in {10..1}; do
    echo -ne "\rWarte ${i} Sekunden... "
    sleep 1
done
echo ""

echo ""
echo "Schritt 3: Letzte RAW-Werte von Server..."
echo "---------------------------------------------------"
ssh root@192.168.178.17 "tail -5 /opt/craftscale/logs/server.log | grep 'RAW:'"
echo ""

read -p "Bitte RAW-Wert eingeben (z.B. -705000): " RAW_VALUE

if [ -z "$RAW_VALUE" ]; then
    echo "Kein RAW-Wert eingegeben. Abbruch."
    exit 1
fi

echo ""
echo "Schritt 4: Kalibrierung durchführen..."
echo "---------------------------------------------------"
echo "Bekanntes Gewicht: ${KNOWN_WEIGHT}g"
echo "RAW-Wert: ${RAW_VALUE}"
echo ""

curl -X POST $SERVER_URL/api/calibration \
  -H "Content-Type: application/json" \
  -d "{\"knownWeight\": ${KNOWN_WEIGHT}, \"rawValue\": ${RAW_VALUE}}" \
  | jq .

echo ""
echo ""
echo "Schritt 5: Neue Kalibrierung abrufen..."
echo "---------------------------------------------------"
curl -s $SERVER_URL/api/calibration | jq .
echo ""

echo ""
echo "✓ Kalibrierung abgeschlossen!"
echo "  Teste jetzt mit verschiedenen Gewichten."
echo ""
