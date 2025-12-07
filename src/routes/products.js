/**
 * CraftScale by Stumpf.works
 * Products API Routes - Produkt-Verwaltung
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB

// Multer Konfiguration für Foto-Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Nur Bilder (JPEG, PNG, WebP) sind erlaubt'));
    }
  }
});

/**
 * SKU generieren: CS-XXX-TIMESTAMP
 */
function generateSKU(productName) {
  const prefix = productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const timestamp = Date.now().toString().slice(-6);
  return `CS-${prefix}-${timestamp}`;
}

/**
 * EAN-13 Prüfziffer berechnen
 */
function calculateEAN13Checksum(digits) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * EAN-13 Barcode generieren
 */
function generateEAN13() {
  // Prefix 200-299 für interne Nutzung
  const prefix = '200';
  // 9 zufällige Ziffern
  const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  const digits = prefix + random;
  // Prüfziffer berechnen
  const checksum = calculateEAN13Checksum(digits);
  return digits + checksum;
}

/**
 * GET /api/products
 * Alle Produkte mit Material-Verbrauch
 */
router.get('/', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products ORDER BY created_at DESC');

    // Material-Verbrauch für jedes Produkt laden
    for (let product of products) {
      const materials = await db.all(
        `SELECT pm.quantity_used, m.*
         FROM product_materials pm
         JOIN materials m ON pm.material_id = m.id
         WHERE pm.product_id = ?`,
        [product.id]
      );
      product.materials = materials;
    }

    res.json(products);
  } catch (error) {
    console.error('Fehler beim Abrufen der Produkte:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Produkte' });
  }
});

/**
 * POST /api/products
 * Produkt erstellen (mit Foto-Upload)
 */
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const {
      name,
      weight,
      materials, // JSON String: [{ material_id, quantity_used }]
      labor_minutes,
      hourly_rate,
      fixed_cost,
      profit_margin,
      description,
      photo_filename // Foto von Webcam bereits auf Server
    } = req.body;

    // Validierung
    if (!name || !weight) {
      return res.status(400).json({ error: 'Name und Gewicht sind erforderlich' });
    }

    // Materialien parsen
    let materialsData = [];
    if (materials) {
      try {
        materialsData = JSON.parse(materials);
      } catch (e) {
        return res.status(400).json({ error: 'Ungültige Material-Daten' });
      }
    }

    // Materialkosten berechnen
    let material_cost = 0;
    for (let mat of materialsData) {
      const material = await db.get('SELECT unit_price FROM materials WHERE id = ?', [mat.material_id]);
      if (material) {
        material_cost += material.unit_price * mat.quantity_used;
      }
    }

    // Arbeitskosten berechnen
    const labor_cost = labor_minutes && hourly_rate
      ? (parseFloat(labor_minutes) / 60) * parseFloat(hourly_rate)
      : 0;

    // Selbstkosten
    const total_cost = material_cost + labor_cost + parseFloat(fixed_cost || 0);

    // Verkaufspreis mit Marge
    const margin = parseFloat(profit_margin || 0);
    const selling_price = total_cost * (1 + margin / 100);

    // SKU und Barcode generieren
    const sku = generateSKU(name);
    const barcode = generateEAN13();

    // Foto-Pfad (entweder hochgeladen oder von Webcam)
    const photo_path = req.file ? req.file.filename : (photo_filename || null);

    // Produkt einfügen
    const result = await db.run(
      `INSERT INTO products
       (name, weight, photo_path, barcode, sku, material_cost, labor_cost, fixed_cost, total_cost, profit_margin, selling_price, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        parseFloat(weight),
        photo_path,
        barcode,
        sku,
        material_cost.toFixed(2),
        labor_cost.toFixed(2),
        parseFloat(fixed_cost || 0).toFixed(2),
        total_cost.toFixed(2),
        margin,
        selling_price.toFixed(2),
        description || null
      ]
    );

    const productId = result.lastID;

    // Material-Verbrauch einfügen
    for (let mat of materialsData) {
      await db.run(
        'INSERT INTO product_materials (product_id, material_id, quantity_used) VALUES (?, ?, ?)',
        [productId, mat.material_id, mat.quantity_used]
      );
    }

    // Produkt mit Materialien abrufen
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    product.materials = await db.all(
      `SELECT pm.quantity_used, m.*
       FROM product_materials pm
       JOIN materials m ON pm.material_id = m.id
       WHERE pm.product_id = ?`,
      [productId]
    );

    res.status(201).json(product);
    console.log(`[Products] Neues Produkt erstellt: ${name} (ID: ${productId}, SKU: ${sku})`);
  } catch (error) {
    // Bei Fehler hochgeladenes Foto löschen
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Fehler beim Erstellen des Produkts:', error);
    res.status(500).json({ error: error.message || 'Fehler beim Erstellen des Produkts' });
  }
});

/**
 * DELETE /api/products/:id
 * Produkt löschen (inkl. Foto)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Produkt abrufen für Foto-Pfad
    const product = await db.get('SELECT photo_path FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({ error: 'Produkt nicht gefunden' });
    }

    // Foto löschen
    if (product.photo_path) {
      const photoPath = path.join(UPLOAD_DIR, product.photo_path);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Material-Verknüpfungen löschen (durch CASCADE automatisch)
    // Produkt löschen
    await db.run('DELETE FROM products WHERE id = ?', [id]);

    res.json({ success: true, message: 'Produkt erfolgreich gelöscht' });
    console.log(`[Products] Produkt gelöscht: ID ${id}`);
  } catch (error) {
    console.error('Fehler beim Löschen des Produkts:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Produkts' });
  }
});

module.exports = router;
