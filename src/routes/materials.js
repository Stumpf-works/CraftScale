/**
 * CraftScale by Stumpf.works
 * Materials API Routes - Material-Verwaltung
 */

const express = require('express');
const router = express.Router();
const db = require('../database');

/**
 * GET /api/materials
 * Alle Materialien abrufen
 */
router.get('/', async (req, res) => {
  try {
    const materials = await db.all('SELECT * FROM materials ORDER BY created_at DESC');
    res.json(materials);
  } catch (error) {
    console.error('Fehler beim Abrufen der Materialien:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Materialien' });
  }
});

/**
 * POST /api/materials
 * Material hinzufügen
 */
router.post('/', async (req, res) => {
  try {
    const { name, type, unit_price, quantity_in_stock, unit } = req.body;

    // Validierung
    if (!name || !type || typeof unit_price !== 'number') {
      return res.status(400).json({ error: 'Ungültige Eingabedaten' });
    }

    const validTypes = ['harz', 'härter', 'pigment', 'form', 'sonstiges'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Ungültiger Material-Typ' });
    }

    const validUnits = ['ml', 'g', 'stück'];
    if (unit && !validUnits.includes(unit)) {
      return res.status(400).json({ error: 'Ungültige Einheit' });
    }

    // Material einfügen
    const result = await db.run(
      `INSERT INTO materials (name, type, unit_price, quantity_in_stock, unit)
       VALUES (?, ?, ?, ?, ?)`,
      [name, type, unit_price, quantity_in_stock || 0, unit || 'ml']
    );

    const material = await db.get('SELECT * FROM materials WHERE id = ?', [result.lastID]);

    res.status(201).json(material);
    console.log(`[Materials] Neues Material erstellt: ${name} (ID: ${result.lastID})`);
  } catch (error) {
    console.error('Fehler beim Erstellen des Materials:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Materials' });
  }
});

/**
 * DELETE /api/materials/:id
 * Material löschen
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prüfen ob Material in Produkten verwendet wird
    const usage = await db.get(
      'SELECT COUNT(*) as count FROM product_materials WHERE material_id = ?',
      [id]
    );

    if (usage.count > 0) {
      return res.status(400).json({
        error: `Material wird in ${usage.count} Produkt(en) verwendet und kann nicht gelöscht werden`
      });
    }

    const result = await db.run('DELETE FROM materials WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Material nicht gefunden' });
    }

    res.json({ success: true, message: 'Material erfolgreich gelöscht' });
    console.log(`[Materials] Material gelöscht: ID ${id}`);
  } catch (error) {
    console.error('Fehler beim Löschen des Materials:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Materials' });
  }
});

module.exports = router;
