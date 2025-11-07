/**
 * CraftScale by Stumpf.works
 * Produkt-Liste Component
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, QrCode, Search, Loader } from 'lucide-react';
import { API_BASE, API_URL } from '../config';

export default function ProductList({ refreshTrigger }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, [refreshTrigger]);

  async function loadProducts() {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Produkte:', error);
      toast.error('Fehler beim Laden der Produkte');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(product) {
    if (!confirm(`Produkt "${product.name}" wirklich löschen?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/products/${product.id}`);
      toast.success('Produkt gelöscht');
      loadProducts();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      toast.error(error.response?.data?.error || 'Fehler beim Löschen');
    }
  }

  function handleShowBarcode(product) {
    window.open(`${API_URL}/api/barcode/${product.id}`, '_blank');
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="glass-card p-12 text-center">
        <Loader size={48} className="mx-auto text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-600">Lade Produkte...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Produkte suchen..."
            className="input-field w-full pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <QrCode size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">
            {searchTerm ? 'Keine Produkte gefunden' : 'Noch keine Produkte vorhanden'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm ? 'Versuchen Sie einen anderen Suchbegriff' : 'Erstellen Sie Ihr erstes Produkt im "Wiegen" Tab'}
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Foto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Gewicht</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Preis</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Barcode</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr
                    key={product.id}
                    className="hover:bg-indigo-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {product.photo_path ? (
                        <img
                          src={`${API_URL}/uploads/${product.photo_path}`}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-xl shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                          <QrCode size={24} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 mt-1">{product.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{product.weight.toFixed(2)} g</td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-green-600">
                        {product.selling_price.toFixed(2)} €
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">{product.sku}</code>
                    </td>
                    <td className="px-6 py-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">{product.barcode}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowBarcode(product)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Barcode anzeigen"
                        >
                          <QrCode size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Löschen"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
