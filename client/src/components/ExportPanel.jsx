/**
 * CraftScale by Stumpf.works
 * Export Panel Component - SumUp CSV & Barcode Druck
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Download, FileDown, Printer, QrCode, Info, CheckSquare, Square } from 'lucide-react';
import { API_BASE, API_URL } from '../config';

export default function ExportPanel() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const response = await axios.get(`${API_BASE}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Produkte:', error);
      toast.error('Fehler beim Laden der Produkte');
    }
  }

  function toggleProduct(productId) {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }

  function toggleAll() {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  }

  async function handleExportSumUp() {
    if (selectedProducts.length === 0) {
      toast.error('Bitte wählen Sie mindestens ein Produkt aus');
      return;
    }

    setIsExporting(true);

    try {
      const response = await axios.post(
        `${API_BASE}/export/sumup`,
        { productIds: selectedProducts },
        { responseType: 'blob' }
      );

      // CSV Download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `craftscale-sumup-export-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${selectedProducts.length} Produkt(e) exportiert`);
    } catch (error) {
      console.error('Fehler beim Export:', error);
      toast.error('Fehler beim Export');
    } finally {
      setIsExporting(false);
    }
  }

  function handleShowBarcode(product) {
    window.open(`${API_URL}/api/barcode/${product.id}`, '_blank');
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* SumUp Export */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Download size={24} />
            SumUp CSV Export
          </h2>

          <button
            onClick={toggleAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            {selectedProducts.length === products.length ? (
              <>
                <Square size={16} />
                Alle abwählen
              </>
            ) : (
              <>
                <CheckSquare size={16} />
                Alle auswählen
              </>
            )}
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <FileDown size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Keine Produkte zum Exportieren vorhanden</p>
          </div>
        ) : (
          <>
            {/* Product Selection */}
            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {products.map(product => (
                <label
                  key={product.id}
                  className={`
                    flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border-2
                    ${selectedProducts.includes(product.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  {product.photo_path && (
                    <img
                      src={`${API_URL}/uploads/${product.photo_path}`}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.sku} · {product.selling_price.toFixed(2)} €
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportSumUp}
              disabled={selectedProducts.length === 0 || isExporting}
              className="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Exportiere...
                </>
              ) : (
                <>
                  <FileDown size={20} />
                  CSV Download ({selectedProducts.length} ausgewählt)
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Barcode Druck */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Printer size={24} />
          Barcode-Druck
        </h2>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Brother P-Touch Workflow:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Barcode anzeigen (neues Fenster öffnet sich)</li>
              <li>Rechtsklick auf Barcode → "Bild speichern unter"</li>
              <li>Brother P-Touch Editor öffnen</li>
              <li>Gespeichertes Barcode-Bild einfügen</li>
              <li>Etikettengröße anpassen und drucken</li>
            </ol>
          </div>
        </div>

        {/* Product Barcodes */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <QrCode size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Keine Produkte vorhanden</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  {product.photo_path && (
                    <img
                      src={`${API_URL}/uploads/${product.photo_path}`}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{product.barcode}</code>
                  </div>
                </div>

                <button
                  onClick={() => handleShowBarcode(product)}
                  className="btn btn-primary w-full text-sm py-2 flex items-center justify-center gap-1"
                >
                  <QrCode size={16} />
                  Barcode anzeigen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
