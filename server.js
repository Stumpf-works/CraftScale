/**
 * CraftScale by Stumpf.works
 * Backend Server - Express + SQLite
 *
 * Ein vollständiges DIY Epoxidharz Management System
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const winston = require('winston');
const os = require('os');

// Database und API Routes
const db = require('./src/database');
const weightRoutes = require('./src/routes/weight');
const materialsRoutes = require('./src/routes/materials');
const productsRoutes = require('./src/routes/products');
const exportRoutes = require('./src/routes/export');
const barcodeRoutes = require('./src/routes/barcode');
const cameraRoutes = require('./src/routes/camera');

// Konfiguration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const LOG_DIR = process.env.LOG_DIR || './logs';

// Verzeichnisse erstellen
[UPLOAD_DIR, LOG_DIR, './data'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Logger konfigurieren
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'craftscale.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 7
    })
  ]
});

// Express App initialisieren
const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Lokale IPs und localhost erlauben
    if (!origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.match(/192\.168\.\d+\.\d+/) ||
        origin.match(/10\.\d+\.\d+\.\d+/)) {
      callback(null, true);
    } else {
      callback(null, true); // Im lokalen Netzwerk alle erlauben
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Static Files
app.use('/uploads', express.static(UPLOAD_DIR));

// API Routes
app.use('/api/weight', weightRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/barcode', barcodeRoutes);
app.use('/api/camera', cameraRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0',
    name: 'CraftScale by Stumpf.works',
    timestamp: new Date().toISOString()
  });
});

// Production: Serve React Build
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, 'client', 'dist');

  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    logger.warn('Client build nicht gefunden. Bitte zuerst "npm run build" ausführen.');
  }
}

// Error Handler
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}\nStack: ${err.stack}`);
  res.status(err.status || 500).json({
    error: err.message || 'Interner Serverfehler',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server IP-Adressen ermitteln
function getServerIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];

  Object.keys(interfaces).forEach(ifname => {
    interfaces[ifname].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    });
  });

  return ips;
}

// ASCII Art Banner
function printBanner() {
  const banner = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     ⚖️  CraftScale by Stumpf.works                        ║
║                                                           ║
║     DIY Epoxidharz Management System                      ║
║     Version 1.0                                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;
  console.log(banner);
}

// Server starten
db.initialize()
  .then(() => {
    const server = app.listen(PORT, HOST, () => {
      printBanner();

      const ips = getServerIPs();

      logger.info('═══════════════════════════════════════════════════════');
      logger.info('Server erfolgreich gestartet!');
      logger.info('═══════════════════════════════════════════════════════');
      logger.info(`Modus: ${process.env.NODE_ENV || 'production'}`);
      logger.info(`Port: ${PORT}`);
      logger.info('');
      logger.info('Server erreichbar unter:');
      logger.info(`  → http://localhost:${PORT}`);

      ips.forEach(ip => {
        logger.info(`  → http://${ip}:${PORT}`);
      });

      logger.info('');
      logger.info('API Endpoints:');
      logger.info(`  → Health Check: http://localhost:${PORT}/api/health`);
      logger.info(`  → Weight: http://localhost:${PORT}/api/weight`);
      logger.info(`  → Materials: http://localhost:${PORT}/api/materials`);
      logger.info(`  → Products: http://localhost:${PORT}/api/products`);
      logger.info('');
      logger.info('Drücke CTRL+C zum Beenden');
      logger.info('═══════════════════════════════════════════════════════');
    });

    // Socket.IO für Realtime Weight Updates
    const io = require('socket.io')(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    let connectedClients = 0;

    io.on('connection', (socket) => {
      connectedClients++;
      logger.info(`WebSocket Client verbunden (${connectedClients} aktiv)`);

      socket.on('disconnect', () => {
        connectedClients--;
        logger.info(`WebSocket Client getrennt (${connectedClients} aktiv)`);
      });
    });

    // Socket.IO Instance global verfügbar machen
    app.set('io', io);

    // Graceful Shutdown
    const shutdown = (signal) => {
      logger.info(`\n${signal} empfangen. Server wird heruntergefahren...`);

      server.close(() => {
        logger.info('HTTP Server geschlossen');

        db.close()
          .then(() => {
            logger.info('Datenbankverbindung geschlossen');
            logger.info('CraftScale beendet. Auf Wiedersehen! 👋');
            process.exit(0);
          })
          .catch(err => {
            logger.error(`Fehler beim Schließen der Datenbank: ${err.message}`);
            process.exit(1);
          });
      });

      // Force shutdown nach 10 Sekunden
      setTimeout(() => {
        logger.error('Shutdown erzwungen nach Timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch(err => {
    logger.error(`Fehler beim Initialisieren der Datenbank: ${err.message}`);
    process.exit(1);
  });
