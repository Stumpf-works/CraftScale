/**
 * CraftScale by Stumpf.works
 * Weight API Routes - Gewichtsdaten von Arduino
 */

const express = require('express');
const router = express.Router();
const db = require('../database');

/**
 * POST /api/weight
 * Gewicht von Arduino empfangen
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
 * GET /api/weight/latest
 * Aktuelles Gewicht abrufen (für Frontend Polling)
 */
router.get('/latest', async (req, res) => {
  try {
    const data = await db.get('SELECT * FROM current_weight WHERE id = 1');

    if (!data) {
      return res.json({
        weight: 0,
        timestamp: Date.now().toString(),
        received_at: new Date().toISOString()
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Fehler beim Abrufen des Gewichts:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Gewichts' });
  }
});

module.exports = router;
