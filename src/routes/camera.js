/**
 * CraftScale by Stumpf.works
 * Camera API Routes - Webcam Foto Aufnahme
 */

const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');

const execPromise = util.promisify(exec);

// Uploads Verzeichnis
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Sicherstellen dass uploads Verzeichnis existiert
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * POST /api/camera/capture
 * Foto mit Webcam aufnehmen
 * Body: { filename?: string }
 */
router.post('/capture', async (req, res) => {
  try {
    // Generiere eindeutigen Dateinamen
    const timestamp = Date.now();
    const filename = req.body.filename || `product_${timestamp}.jpg`;
    const filepath = path.join(UPLOADS_DIR, filename);

    // Webcam Befehl: fswebcam (bereits installiert)
    const command = `fswebcam -d /dev/video0 -r 1280x720 --no-banner "${filepath}"`;

    console.log(`[Camera] Nehme Foto auf: ${filename}`);

    // Foto aufnehmen
    await execPromise(command);

    // Prüfen ob Datei existiert
    if (!fs.existsSync(filepath)) {
      throw new Error('Foto konnte nicht aufgenommen werden');
    }

    // Dateigröße prüfen
    const stats = fs.statSync(filepath);

    res.json({
      success: true,
      filename,
      url: `/uploads/${filename}`,
      size: stats.size,
      timestamp: new Date().toISOString()
    });

    console.log(`[Camera] Foto erfolgreich aufgenommen: ${filename} (${Math.round(stats.size / 1024)}KB)`);
  } catch (error) {
    console.error('[Camera] Fehler beim Aufnehmen:', error.message);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Aufnehmen des Fotos',
      details: error.message
    });
  }
});

/**
 * GET /api/camera/test
 * Testet ob Webcam verfügbar ist
 */
router.get('/test', async (req, res) => {
  try {
    // Prüfe ob /dev/video0 existiert
    const { stdout } = await execPromise('ls -l /dev/video0 2>/dev/null || echo "not found"');

    if (stdout.includes('not found')) {
      return res.json({
        available: false,
        message: 'Keine Webcam gefunden'
      });
    }

    // Prüfe fswebcam
    const { stdout: fswebcamCheck } = await execPromise('which fswebcam || echo "not found"');

    if (fswebcamCheck.includes('not found')) {
      return res.json({
        available: false,
        message: 'fswebcam nicht installiert'
      });
    }

    res.json({
      available: true,
      message: 'Webcam verfügbar',
      device: '/dev/video0'
    });
  } catch (error) {
    res.status(500).json({
      available: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/camera/:filename
 * Löscht ein Foto
 */
router.delete('/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        error: 'Datei nicht gefunden'
      });
    }

    fs.unlinkSync(filepath);

    res.json({
      success: true,
      message: 'Foto gelöscht'
    });

    console.log(`[Camera] Foto gelöscht: ${filename}`);
  } catch (error) {
    console.error('[Camera] Fehler beim Löschen:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
