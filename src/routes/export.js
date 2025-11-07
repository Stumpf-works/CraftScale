/**
 * CraftScale by Stumpf.works
 * Export API Routes - SumUp CSV Export
 */

const express = require('express');
const router = express.Router();
const db = require('../database');
const os = require('os');

/**
 * POST /api/export/sumup
 * SumUp CSV Export generieren
 * Body: { productIds: [1, 2, 3] }
 */
router.post('/sumup', async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Keine Produkte ausgewählt' });
    }

    // Produkte abrufen
    const placeholders = productIds.map(() => '?').join(',');
    const products = await db.all(
      `SELECT * FROM products WHERE id IN (${placeholders})`,
      productIds
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Keine Produkte gefunden' });
    }

    // Server-IP ermitteln (für Image URLs)
    const serverIP = getServerIP();
    const serverURL = `http://${serverIP}:${process.env.PORT || 3000}`;

    // CSV generieren
    const csv = generateSumUpCSV(products, serverURL);

    // CSV als Download senden
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="craftscale-export-${Date.now()}.csv"`);
    res.send(csv);

    console.log(`[Export] SumUp CSV exportiert: ${products.length} Produkt(e)`);
  } catch (error) {
    console.error('Fehler beim Export:', error);
    res.status(500).json({ error: 'Fehler beim Export' });
  }
});

/**
 * SumUp CSV generieren
 */
function generateSumUpCSV(products, serverURL) {
  // CSV Header (exakt wie SumUp Template)
  const header = [
    'Item name',
    'Price',
    'SKU',
    'Barcode',
    'Tax rate',
    'Track inventory',
    'Quantity',
    'Category',
    'Image 1',
    'Shipping weight',
    'Description'
  ];

  // CSV Rows
  const rows = products.map(product => {
    // Beschreibung aus Materialien generieren
    const description = product.description || `Handgefertigt - ${product.name}`;

    // Gewicht in kg (3 Dezimalstellen)
    const weightKg = (product.weight / 1000).toFixed(3);

    // Bild-URL
    const imageURL = product.photo_path
      ? `${serverURL}/uploads/${product.photo_path}`
      : '';

    return [
      escapeCSV(product.name),
      product.selling_price.toFixed(2),
      product.sku,
      product.barcode,
      '19.00',
      'Yes',
      '1',
      'Handgemachte Produkte - CraftScale',
      imageURL,
      weightKg,
      escapeCSV(description)
    ];
  });

  // CSV zusammenbauen
  const csvLines = [
    header.join(','),
    ...rows.map(row => row.join(','))
  ];

  return csvLines.join('\n');
}

/**
 * CSV-Wert escapen (Anführungszeichen bei Kommas/Quotes)
 */
function escapeCSV(value) {
  if (typeof value !== 'string') {
    return value;
  }

  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Server IP ermitteln (erste nicht-interne IPv4)
 */
function getServerIP() {
  const interfaces = os.networkInterfaces();

  for (let ifname in interfaces) {
    for (let iface of interfaces[ifname]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  return 'localhost';
}

module.exports = router;
