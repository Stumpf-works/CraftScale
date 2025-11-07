#!/bin/bash

###############################################################################
# CraftScale by Stumpf.works
# Installations-Script für Linux/Raspberry Pi
###############################################################################

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     ⚖️  CraftScale by Stumpf.works                        ║"
echo "║     Installations-Script                                  ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funktionen
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "ℹ $1"
}

# Node.js Version prüfen
echo "═══════════════════════════════════════════════════════════"
echo "1. Systemprüfung"
echo "═══════════════════════════════════════════════════════════"

if ! command -v node &> /dev/null; then
    print_error "Node.js ist nicht installiert!"
    print_info "Bitte installieren Sie Node.js 16+ von https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js Version $NODE_VERSION ist zu alt (benötigt: 16+)"
    exit 1
fi

print_success "Node.js $(node -v) gefunden"

if ! command -v npm &> /dev/null; then
    print_error "npm ist nicht installiert!"
    exit 1
fi

print_success "npm $(npm -v) gefunden"

# Dependencies installieren
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "2. Dependencies installieren"
echo "═══════════════════════════════════════════════════════════"

print_info "Installiere Backend Dependencies..."
npm install

print_info "Installiere Frontend Dependencies..."
cd client && npm install && cd ..

print_success "Alle Dependencies installiert"

# .env erstellen
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "3. Konfiguration"
echo "═══════════════════════════════════════════════════════════"

if [ ! -f .env ]; then
    print_info "Erstelle .env Datei..."
    cp .env.example .env

    # Server-IP automatisch ermitteln
    SERVER_IP=$(hostname -I | awk '{print $1}')

    if [ -n "$SERVER_IP" ]; then
        print_info "Server-IP erkannt: $SERVER_IP"
        sed -i "s/192.168.1.XXX/$SERVER_IP/g" .env
        print_success ".env Datei erstellt mit IP: $SERVER_IP"
    else
        print_warning ".env Datei erstellt. Bitte SERVER_IP manuell eintragen!"
    fi
else
    print_warning ".env existiert bereits (wird nicht überschrieben)"
fi

# Verzeichnisse erstellen
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "4. Verzeichnisse erstellen"
echo "═══════════════════════════════════════════════════════════"

mkdir -p uploads
mkdir -p data
mkdir -p logs
mkdir -p backup

print_success "Verzeichnisse erstellt: uploads/, data/, logs/, backup/"

# Frontend bauen
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "5. Frontend Build"
echo "═══════════════════════════════════════════════════════════"

print_info "Baue React Frontend..."
npm run build

print_success "Frontend erfolgreich gebaut"

# Backup-Script erstellen
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "6. Backup-Script erstellen"
echo "═══════════════════════════════════════════════════════════"

cat > backup.sh << 'EOF'
#!/bin/bash
# CraftScale Backup Script

BACKUP_DIR="./backup"
DATE=$(date +%Y%m%d_%H%M%S)

echo "CraftScale Backup - $DATE"

# Datenbank
cp data/craftscale.db "$BACKUP_DIR/craftscale-$DATE.db"
echo "✓ Datenbank gesichert"

# Fotos
tar -czf "$BACKUP_DIR/uploads-$DATE.tar.gz" uploads/
echo "✓ Fotos gesichert"

# Alte Backups löschen (älter als 30 Tage)
find "$BACKUP_DIR" -type f -mtime +30 -delete
echo "✓ Alte Backups gelöscht"

echo "Backup abgeschlossen: $BACKUP_DIR"
EOF

chmod +x backup.sh
print_success "Backup-Script erstellt: ./backup.sh"

# Systemd Service
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "7. Systemd Service (optional)"
echo "═══════════════════════════════════════════════════════════"

echo ""
read -p "Möchten Sie einen systemd Service erstellen (Auto-Start)? (j/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[JjYy]$ ]]; then
    CURRENT_USER=$(whoami)
    CURRENT_DIR=$(pwd)

    SERVICE_FILE="/etc/systemd/system/craftscale.service"

    cat > /tmp/craftscale.service << EOF
[Unit]
Description=CraftScale Server
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    sudo mv /tmp/craftscale.service "$SERVICE_FILE"
    sudo systemctl daemon-reload
    sudo systemctl enable craftscale

    print_success "Systemd Service erstellt: $SERVICE_FILE"
    print_info "Service starten mit: sudo systemctl start craftscale"
fi

# Fertig!
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✓ Installation abgeschlossen!"
echo "═══════════════════════════════════════════════════════════"
echo ""

SERVER_IP=$(hostname -I | awk '{print $1}')

print_success "CraftScale ist bereit!"
echo ""
print_info "Nächste Schritte:"
echo ""
echo "  1. .env prüfen und ggf. anpassen:"
echo "     nano .env"
echo ""
echo "  2. Server starten:"
echo "     npm start"
echo ""
echo "     ODER mit systemd:"
echo "     sudo systemctl start craftscale"
echo ""
echo "  3. Browser öffnen:"
echo "     http://$SERVER_IP:3000"
echo ""
echo "  4. Arduino konfigurieren:"
echo "     - arduino/esp8266_scale.ino öffnen"
echo "     - WiFi SSID + Passwort eintragen"
echo "     - SERVER_URL = http://$SERVER_IP:3000/api/weight"
echo "     - Code hochladen"
echo ""
print_info "Dokumentation: README.md"
print_info "Backup erstellen: ./backup.sh"
echo ""
echo "Viel Erfolg mit CraftScale! 🎉"
echo ""
