/**
 * CraftScale by Stumpf.works
 * Barcode API Routes - Barcode-Generierung
 */

const express = require('express');
const router = express.Router();
const { createCanvas } = require('canvas');
const JsBarcode = require('jsbarcode');
const db = require('../database');

/**
 * GET /api/barcode/:productId
 * Barcode als PNG generieren
 */
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // Produkt abrufen
    const product = await db.get('SELECT barcode, name FROM products WHERE id = ?', [productId]);

    if (!product || !product.barcode) {
      return res.status(404).json({ error: 'Produkt oder Barcode nicht gefunden' });
    }

    // Canvas erstellen
    const canvas = createCanvas(300, 150);

    // Barcode generieren
    JsBarcode(canvas, product.barcode, {
      format: 'EAN13',
      width: 2,
      height: 80,
      displayValue: true,
      fontSize: 20,
      text: `CraftScale - ${product.name}`,
      margin: 10
    });

    // Als PNG zurückgeben
    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);

    console.log(`[Barcode] Barcode generiert für Produkt: ${product.name} (${product.barcode})`);
  } catch (error) {
    console.error('Fehler beim Generieren des Barcodes:', error);
    res.status(500).json({ error: 'Fehler beim Generieren des Barcodes' });
  }
});

module.exports = router;
