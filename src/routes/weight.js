/**
 * CraftScale by Stumpf.works
 * Weight API Routes - Gewichtsdaten von Arduino/Raspberry Pi
 */

const express = require('express');
const router = express.Router();
const db = require('../database');

/**
 * Hilfsfunktion: Kalibrierungsdaten laden
 */
async function getCalibration() {
  let calibration = await db.get('SELECT * FROM calibration WHERE id = 1');

  if (!calibration) {
    // Default-Werte erstellen
    await db.run(
      'INSERT INTO calibration (id, factor, offset, last_calibrated) VALUES (?, ?, ?, datetime("now"))',
      [1, -7050.0, 0]
    );
    calibration = { id: 1, factor: -7050.0, offset: 0 };
  }

  return calibration;
}

/**
 * POST /api/weight
 * Gewicht von Arduino empfangen (Legacy - direktes Gewicht)
 */
router.post('/', async (req, res) => {
  try {
    const { weight, timestamp } = req.body;

    if (typeof weight !== 'number') {
      return res.status(400).json({ error: 'Ungültiges Gewicht' });
    }

    // Gewicht in Datenbank aktualisieren (immer nur 1 Zeile)
    await db.run(
      'UPDATE current_weight SET weight = ?, timestamp = ?, received_at = datetime("now") WHERE id = 1',
      [weight, timestamp || Date.now().toString()]
    );

    res.json({
      success: true,
      weight,
      message: 'Gewicht erfolgreich aktualisiert'
    });

    console.log(`[Weight] Neues Gewicht empfangen: ${weight}g`);
  } catch (error) {
    console.error('Fehler beim Speichern des Gewichts:', error);
    res.status(500).json({ error: 'Fehler beim Speichern des Gewichts' });
  }
});

/**
 * POST /api/weight/raw
 * RAW-Wert von Raspberry Pi empfangen und kalibrieren
 */
router.post('/raw', async (req, res) => {
  try {
    const { rawValue, timestamp } = req.body;

    if (typeof rawValue !== 'number') {
      return res.status(400).json({ error: 'Ungültiger RAW-Wert' });
    }

    // Kalibrierungsdaten laden
    const calibration = await getCalibration();

    // Gewicht berechnen: (rawValue - offset) / factor
    const weight = (rawValue - calibration.offset) / calibration.factor;

    // Negatives Gewicht auf 0 setzen
    const finalWeight = weight < 0 ? 0 : weight;

    // Gewicht und RAW-Wert in Datenbank aktualisieren
    await db.run(
      'UPDATE current_weight SET weight = ?, raw_value = ?, timestamp = ?, received_at = datetime("now") WHERE id = 1',
      [finalWeight, rawValue, timestamp || new Date().toISOString()]
    );

    const weightData = {
      weight: parseFloat(finalWeight.toFixed(2)),
      raw_value: rawValue,
      timestamp: timestamp || new Date().toISOString(),
      calibration: {
        factor: calibration.factor,
        offset: calibration.offset
      }
    };

    res.json({
      success: true,
      rawValue,
      ...weightData
    });

    // WebSocket: Realtime Update an alle Clients
    const io = req.app.get('io');
    if (io) {
      io.emit('weight:update', weightData);
    }

    console.log(`[Weight] RAW: ${rawValue} -> ${finalWeight.toFixed(2)}g (Factor: ${calibration.factor}, Offset: ${calibration.offset})`);
  } catch (error) {
    console.error('Fehler beim Verarbeiten des RAW-Werts:', error);
    res.status(500).json({ error: 'Fehler beim Verarbeiten des RAW-Werts' });
  }
});

/**
 * GET /api/weight/latest
 * Aktuelles Gewicht abrufen (für Frontend Polling)
 * Inkludiert auch Kalibrierungsdaten
 */
router.get('/latest', async (req, res) => {
  try {
    const data = await db.get('SELECT * FROM current_weight WHERE id = 1');
    const calibration = await getCalibration();

    if (!data) {
      return res.json({
        weight: 0,
        raw_value: 0,
        timestamp: Date.now().toString(),
        received_at: new Date().toISOString(),
        calibration
      });
    }

    res.json({
      ...data,
      calibration
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Gewichts:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Gewichts' });
  }
});

/**
 * GET /api/calibration
 * Kalibrierungsdaten abrufen
 */
router.get('/calibration', async (req, res) => {
  try {
    const calibration = await getCalibration();
    res.json(calibration);
  } catch (error) {
    console.error('Fehler beim Abrufen der Kalibrierung:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Kalibrierung' });
  }
});

/**
 * POST /api/calibration
 * Kalibrierung durchführen
 * Body: { knownWeight: 100, rawValue: -705000 }
 */
router.post('/calibration', async (req, res) => {
  try {
    const { knownWeight, rawValue } = req.body;

    if (!knownWeight || !rawValue) {
      return res.status(400).json({ error: 'knownWeight und rawValue erforderlich' });
    }

    const calibration = await getCalibration();

    // Neuer Faktor = (rawValue - offset) / knownWeight
    const newFactor = (rawValue - calibration.offset) / knownWeight;

    // In Datenbank speichern
    await db.run(
      'UPDATE calibration SET factor = ?, last_calibrated = datetime("now") WHERE id = 1',
      [newFactor]
    );

    res.json({
      success: true,
      factor: newFactor,
      message: `Kalibrierung erfolgreich! Neuer Faktor: ${newFactor.toFixed(2)}`
    });

    console.log(`[Calibration] Neuer Faktor: ${newFactor.toFixed(2)} (Known: ${knownWeight}g, RAW: ${rawValue})`);
  } catch (error) {
    console.error('Fehler beim Kalibrieren:', error);
    res.status(500).json({ error: 'Fehler beim Kalibrieren' });
  }
});

/**
 * POST /api/calibration/tare
 * Tara durchführen (Offset setzen)
 * Body: { rawValue: -50000 }
 */
router.post('/calibration/tare', async (req, res) => {
  try {
    const { rawValue } = req.body;

    if (typeof rawValue !== 'number') {
      return res.status(400).json({ error: 'rawValue erforderlich' });
    }

    // Offset in Datenbank speichern
    await db.run(
      'UPDATE calibration SET offset = ? WHERE id = 1',
      [rawValue]
    );

    res.json({
      success: true,
      offset: rawValue,
      message: 'Tara erfolgreich gesetzt'
    });

    console.log(`[Tare] Neuer Offset: ${rawValue}`);
  } catch (error) {
    console.error('Fehler beim Setzen des Offsets:', error);
    res.status(500).json({ error: 'Fehler beim Setzen des Offsets' });
  }
});

module.exports = router;
