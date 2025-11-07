/**
 * CraftScale by Stumpf.works
 * Datenbank-Modul - SQLite3
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/craftscale.db';

// Sicherstellen, dass data-Verzeichnis existiert
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

/**
 * Datenbank initialisieren und Schema erstellen
 */
function initialize() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }

      console.log(`Datenbankverbindung hergestellt: ${DB_PATH}`);

      // Foreign Keys aktivieren
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Schema erstellen
        createSchema()
          .then(() => {
            console.log('Datenbank-Schema erfolgreich initialisiert');
            resolve(db);
          })
          .catch(reject);
      });
    });
  });
}

/**
 * Datenbank-Schema erstellen
 */
function createSchema() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabelle: materials
      db.run(`
        CREATE TABLE IF NOT EXISTS materials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('harz', 'härter', 'pigment', 'form', 'sonstiges')),
          unit_price REAL NOT NULL,
          quantity_in_stock REAL DEFAULT 0,
          unit TEXT DEFAULT 'ml' CHECK(unit IN ('ml', 'g', 'stück')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Tabelle: products
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          weight REAL NOT NULL,
          photo_path TEXT,
          barcode TEXT UNIQUE,
          sku TEXT UNIQUE,
          material_cost REAL DEFAULT 0,
          labor_cost REAL DEFAULT 0,
          fixed_cost REAL DEFAULT 0,
          total_cost REAL DEFAULT 0,
          profit_margin REAL DEFAULT 0,
          selling_price REAL DEFAULT 0,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Tabelle: product_materials (Verknüpfung)
      db.run(`
        CREATE TABLE IF NOT EXISTS product_materials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          material_id INTEGER NOT NULL,
          quantity_used REAL NOT NULL,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Tabelle: current_weight (nur 1 Zeile!)
      db.run(`
        CREATE TABLE IF NOT EXISTS current_weight (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          weight REAL NOT NULL,
          timestamp TEXT NOT NULL,
          received_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);

        // Initialen Wert einfügen falls nicht vorhanden
        db.run(`
          INSERT OR IGNORE INTO current_weight (id, weight, timestamp)
          VALUES (1, 0.0, datetime('now'))
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  });
}

/**
 * Prepared Statement ausführen
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Einzelne Zeile abfragen
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Mehrere Zeilen abfragen
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Datenbankverbindung schließen
 */
function close() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Datenbankverbindung geschlossen');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  initialize,
  run,
  get,
  all,
  close
};
