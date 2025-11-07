# CraftScale Projektstruktur

## Übersicht

```
craftscale/
├── server.js                    # Express Backend Server
├── package.json                 # Backend Dependencies
├── .env.example                 # Environment Konfiguration (Template)
├── .gitignore                   # Git Ignore Regeln
├── README.md                    # Haupt-Dokumentation
├── LICENSE                      # MIT Lizenz
├── STRUCTURE.md                 # Diese Datei
├── install.sh                   # Installations-Script (Linux)
├── install.bat                  # Installations-Script (Windows)
├── item_template.csv            # SumUp CSV Template
│
├── src/                         # Backend Source Code
│   ├── database.js              # SQLite Datenbank-Modul
│   └── routes/                  # API Route Handler
│       ├── weight.js            # Gewichts-Endpoints
│       ├── materials.js         # Material-Verwaltung
│       ├── products.js          # Produkt-Verwaltung
│       ├── barcode.js           # Barcode-Generierung
│       └── export.js            # SumUp CSV Export
│
├── client/                      # React Frontend
│   ├── package.json             # Frontend Dependencies
│   ├── vite.config.js           # Vite Build Konfiguration
│   ├── tailwind.config.js       # Tailwind CSS Konfiguration
│   ├── postcss.config.js        # PostCSS Konfiguration
│   ├── index.html               # HTML Entry Point
│   ├── src/
│   │   ├── main.jsx             # React Entry Point
│   │   ├── App.jsx              # Haupt-Komponente
│   │   ├── config.js            # API URL Konfiguration
│   │   ├── components/          # React Komponenten
│   │   │   ├── Navbar.jsx       # Navigation
│   │   │   ├── WeighScale.jsx   # Live Gewichtsanzeige
│   │   │   ├── ProductForm.jsx  # Produkt-Formular
│   │   │   ├── ProductList.jsx  # Produkt-Tabelle
│   │   │   ├── MaterialManager.jsx  # Material-Verwaltung
│   │   │   └── ExportPanel.jsx  # Export & Barcode
│   │   ├── hooks/
│   │   │   └── useWeight.js     # Custom Hook für Gewichts-Polling
│   │   └── styles/
│   │       └── globals.css      # Globale Styles (Tailwind)
│   └── dist/                    # Build Output (generiert)
│
├── arduino/
│   └── esp8266_scale.ino        # Arduino/ESP8266 Code
│
├── uploads/                     # Produktfotos (generiert)
├── data/                        # SQLite Datenbank (generiert)
│   └── craftscale.db
├── logs/                        # Server Logs (generiert)
│   └── craftscale.log
└── backup/                      # Backup Verzeichnis (generiert)
```

## Detaillierte Beschreibung

### Backend (Node.js + Express)

#### `server.js`
- Haupt-Server-Datei
- Express App Konfiguration
- CORS für lokales Netzwerk
- Static File Serving (React Build + Uploads)
- API Route Mounting
- Error Handling
- Graceful Shutdown
- Startup Banner mit IP-Adressen

#### `src/database.js`
- SQLite3 Datenbankverbindung
- Schema-Initialisierung
- Prepared Statement Wrapper (run, get, all)
- Foreign Keys aktiviert
- Connection Pooling

#### `src/routes/weight.js`
- `POST /api/weight` - Gewicht von Arduino empfangen
- `GET /api/weight/latest` - Aktuelles Gewicht für Frontend Polling

#### `src/routes/materials.js`
- `GET /api/materials` - Alle Materialien abrufen
- `POST /api/materials` - Material hinzufügen
- `DELETE /api/materials/:id` - Material löschen (mit Verwendungsprüfung)

#### `src/routes/products.js`
- `GET /api/products` - Alle Produkte mit Materialien
- `POST /api/products` - Produkt erstellen (Multipart mit Foto)
- `DELETE /api/products/:id` - Produkt löschen (inkl. Foto)
- SKU-Generierung: `CS-XXX-TIMESTAMP`
- EAN-13 Barcode-Generierung mit Prüfziffer
- Automatische Kostenberechnung

#### `src/routes/barcode.js`
- `GET /api/barcode/:productId` - EAN-13 Barcode als PNG
- Canvas-Rendering mit jsbarcode
- Direkter Image Stream

#### `src/routes/export.js`
- `POST /api/export/sumup` - CSV Export für SumUp
- SumUp-Format konform
- Automatische Server-IP für Image URLs
- CSV Escaping für Sonderzeichen

### Frontend (React + Vite)

#### `src/App.jsx`
- Haupt-Layout
- Tab-Navigation (Wiegen, Produkte, Materialien, Export)
- Health Check (alle 10s)
- Server Status Indicator
- Toast Notifications (react-hot-toast)

#### `src/components/Navbar.jsx`
- Logo & Branding
- Tab-Navigation mit Icons
- Server Online/Offline Status
- Responsive (Burger Menu auf Mobile)

#### `src/components/WeighScale.jsx`
- Live Gewichtsanzeige (Polling 500ms)
- Animierte Anzeige bei aktivem Gewicht
- Status-Badge (Warte/Erkannt/Stabil)
- Offline-Warnung

#### `src/components/ProductForm.jsx`
- Foto-Upload mit Drag & Drop
- Material-Auswahl (Dynamic Rows)
- Live-Kostenberechnung
- Kosten-Summary Card
- Validation & Error Handling

#### `src/components/ProductList.jsx`
- Tabelle aller Produkte
- Foto-Thumbnails
- Search/Filter
- Barcode anzeigen (neues Fenster)
- Löschen mit Confirm

#### `src/components/MaterialManager.jsx`
- Material hinzufügen (Formular)
- Material-Liste (Grid)
- Typ-Badges mit Icons (Harz, Härter, etc.)
- Löschen mit Verwendungsprüfung

#### `src/components/ExportPanel.jsx`
- SumUp CSV Export
  * Produkt-Auswahl (Checkboxen)
  * CSV Download
- Barcode-Druck
  * Barcode anzeigen für jedes Produkt
  * Brother P-Touch Workflow Info

#### `src/hooks/useWeight.js`
- Custom Hook für Gewichts-Polling
- State: weight, isLoading, error, isOnline
- Offline Detection (3 fehlgeschlagene Requests)
- Automatic Cleanup

#### `src/config.js`
- API_URL aus Environment Variable (VITE_API_URL)
- Fallback auf window.location.origin
- API_BASE für alle Requests

### Arduino (ESP8266)

#### `arduino/esp8266_scale.ino`
- WiFi Verbindung
- HX711 Wägezellen-Auslesen
- Stabilitätserkennung (±0.5g für 2s)
- HTTP POST JSON an Server
- LED-Feedback (Blinken/Dauerlicht)
- Kalibrierung & Tara
- Serial Monitor Debug (Deutsch)
- Retry-Mechanismus

## Datenbank-Schema

### `materials`
- id (PK)
- name
- type (harz/härter/pigment/form/sonstiges)
- unit_price
- quantity_in_stock
- unit (ml/g/stück)
- created_at

### `products`
- id (PK)
- name
- weight
- photo_path
- barcode (UNIQUE, EAN-13)
- sku (UNIQUE, CS-XXX-XXXXXX)
- material_cost
- labor_cost
- fixed_cost
- total_cost
- profit_margin
- selling_price
- description
- created_at

### `product_materials`
- id (PK)
- product_id (FK → products)
- material_id (FK → materials)
- quantity_used

### `current_weight`
- id (PK, CHECK id=1) - Nur 1 Zeile!
- weight
- timestamp
- received_at

## Deployment Flow

### Development
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend (mit HMR)
cd client && npm run dev
```

Frontend läuft auf `http://localhost:5173` mit Proxy zu Backend.

### Production
```bash
# Build
npm run build

# Start
npm start
```

Frontend wird vom Backend serviert auf `http://SERVER_IP:3000`.

## Environment Variables

```bash
# Server
PORT=3000                        # Server Port
NODE_ENV=production              # production/development
HOST=0.0.0.0                     # Listen auf allen Interfaces

# Client Build
VITE_API_URL=http://192.168.1.100:3000  # Server URL für Frontend

# Upload
MAX_FILE_SIZE=5242880            # 5 MB
UPLOAD_DIR=./uploads

# Database
DB_PATH=./data/craftscale.db

# Logging
LOG_LEVEL=info
LOG_DIR=./logs
```

## Ports

- **3000**: Backend + Frontend (Production)
- **5173**: Frontend Dev Server (Development)

## Dependencies

### Backend
- express: Web Framework
- sqlite3: Datenbank
- multer: File Upload
- cors: Cross-Origin
- jsbarcode: Barcode-Generierung
- canvas: Image Rendering
- dotenv: Environment Variables
- winston: Logging

### Frontend
- react: UI Framework
- vite: Build Tool
- tailwindcss: CSS Framework
- axios: HTTP Client
- lucide-react: Icons
- react-router-dom: Routing
- react-hot-toast: Notifications
- qrcode.react: QR-Code Generierung

### Arduino
- ESP8266WiFi: WiFi
- ESP8266HTTPClient: HTTP
- HX711: Wägezelle
- ArduinoJson: JSON Parsing

## Build-Output

### Frontend Build (`client/dist/`)
```
dist/
├── index.html              # Entry HTML
├── assets/
│   ├── index-[hash].js     # Gebündeltes JS
│   └── index-[hash].css    # Gebündeltes CSS
└── vite.svg                # Favicon
```

### Bundle-Größe (ca.)
- JS: ~250 KB (gzipped ~80 KB)
- CSS: ~50 KB (gzipped ~10 KB)
- Total: ~300 KB

## API Request Flow

```
1. Arduino misst Gewicht
   ↓
2. ESP8266 sendet HTTP POST /api/weight
   ↓
3. Server speichert in current_weight Tabelle
   ↓
4. Frontend pollt GET /api/weight/latest (500ms)
   ↓
5. React Component zeigt Gewicht an
```

## File Upload Flow

```
1. User wählt Foto aus
   ↓
2. React sendet FormData (multipart/form-data)
   ↓
3. Multer speichert in uploads/
   ↓
4. Server speichert Dateiname in products.photo_path
   ↓
5. Frontend lädt Bild: /uploads/[filename]
```

## Sicherheitskonzepte

### SQL Injection Prevention
- Prepared Statements für alle Queries
- Parameter-Bindung via `?` Placeholder

### File Upload Security
- MIME-Type Validierung
- Dateigrößen-Limit (5 MB)
- Sichere Dateinamen (timestamp + random)
- Nur Bilder erlaubt (jpeg, jpg, png, webp)

### XSS Prevention
- React escaped automatisch alle String-Outputs
- innerHTML wird nicht verwendet
- User-Input wird nie direkt in DOM geschrieben

### CORS Policy
- Nur lokale IPs erlaubt
- Credentials Support für Cookies (falls benötigt)

## Performance-Optimierungen

### Frontend
- Code Splitting (React.lazy)
- Tree Shaking (Vite)
- Asset Optimization
- Gzip Compression
- Image Lazy Loading

### Backend
- SQLite Connection Pooling
- Static File Caching
- Gzip Middleware
- Request Logging mit Winston

### Arduino
- Averaging (10 Messungen)
- Stabilitäts-Schwellwert
- Timeout für HTTP Requests

## Monitoring

### Server Logs
- Location: `logs/craftscale.log`
- Format: `[TIMESTAMP] LEVEL: MESSAGE`
- Rotation: Täglich, max 7 Tage
- Levels: error, warn, info, debug

### Health Check
- Endpoint: `GET /api/health`
- Response: `{ status: "ok", version: "1.0" }`
- Frontend prüft alle 10s

### Arduino Debug
- Serial Monitor: 115200 Baud
- Deutsche Debug-Ausgaben
- Status-Messages für alle Operationen

## Backup-Strategie

### Was wird gesichert?
- SQLite Datenbank (`data/craftscale.db`)
- Produktfotos (`uploads/`)
- (Optional) Logs (`logs/`)

### Backup-Scripts
- Linux: `backup.sh`
- Windows: `backup.bat`

### Empfohlener Zeitplan
- Täglich via Cron/Task Scheduler
- Vor Updates/Wartung manuell
- Retention: 30 Tage

## Troubleshooting

### Logs prüfen
```bash
# Server Logs
tail -f logs/craftscale.log

# Arduino Serial Monitor
# Arduino IDE: Tools → Serial Monitor (115200 Baud)
```

### Datenbank prüfen
```bash
sqlite3 data/craftscale.db

# Tabellen anzeigen
.tables

# Produkte anzeigen
SELECT * FROM products;

# Gewicht anzeigen
SELECT * FROM current_weight;
```

### Port prüfen
```bash
# Linux
netstat -tulpn | grep 3000

# Windows
netstat -ano | findstr 3000
```

## Weitere Entwicklung

### Feature-Ideen
- Multi-User Support mit Login
- Lagerbestand-Tracking
- Bestellverwaltung
- Statistiken & Dashboards
- Mobile App (React Native)
- Shopify Integration

### Code-Erweiterungen
- TypeScript Migration
- GraphQL API
- WebSocket für Live-Updates
- Progressive Web App (PWA)
- Docker Container
- CI/CD Pipeline

---

**⚖️ CraftScale by Stumpf.works**
