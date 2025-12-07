/**
 * CraftScale by Stumpf.works
 * Product Gallery - Grid view with edit functionality
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Trash2,
  QrCode,
  Search,
  Loader,
  Edit2,
  X,
  Save,
  Package,
  DollarSign,
  Weight,
  Tag,
  FileText
} from 'lucide-react';
import { API_BASE, API_URL } from '../config';

export default function ProductGallery({ refreshTrigger }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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

  function handleEdit(product) {
    setEditProduct({ ...product });
  }

  async function handleSaveEdit() {
    if (!editProduct.name || !editProduct.weight || editProduct.weight <= 0) {
      toast.error('Name und Gewicht sind erforderlich');
      return;
    }

    setIsSaving(true);
    try {
      await axios.put(`${API_BASE}/products/${editProduct.id}`, {
        name: editProduct.name,
        weight: parseFloat(editProduct.weight),
        description: editProduct.description || '',
        selling_price: parseFloat(editProduct.selling_price) || 0,
        total_cost: parseFloat(editProduct.total_cost) || 0
      });

      toast.success('Produkt aktualisiert');
      setEditProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast.error(error.response?.data?.error || 'Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="card p-12 text-center">
        <Loader size={48} className="mx-auto text-blue-400 animate-spin mb-4" />
        <p className="text-gray-400">Lade Produkte...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="card p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Produkte suchen..."
              className="input w-full pl-10"
            />
          </div>
          <div className="text-sm text-gray-400">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Produkt' : 'Produkte'}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="card p-12 text-center">
          <Package size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 text-lg">
            {searchTerm ? 'Keine Produkte gefunden' : 'Noch keine Produkte vorhanden'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm ? 'Versuchen Sie einen anderen Suchbegriff' : 'Erstellen Sie Ihr erstes Produkt im "Wiegen" Tab'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="card overflow-hidden group hover:shadow-2xl transition-all duration-300">
              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-br from-[#232943] to-[#1e2139] overflow-hidden">
                {product.photo_path ? (
                  <img
                    src={`${API_URL}/uploads/${product.photo_path}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={64} className="text-gray-600" />
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleShowBarcode(product)}
                    className="p-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                    title="Barcode anzeigen"
                  >
                    <QrCode size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="Löschen"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* Name */}
                <div>
                  <h3 className="text-lg font-bold text-gray-100 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Weight size={14} className="text-gray-500" />
                    <span className="text-gray-300">{product.weight.toFixed(2)} g</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-green-400" />
                    <span className="text-green-400 font-bold">{product.selling_price.toFixed(2)} €</span>
                  </div>
                </div>

                {/* SKU & Barcode */}
                <div className="pt-2 border-t border-[#3d4564] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">SKU:</span>
                    <code className="bg-[#1e2139] px-2 py-0.5 rounded text-gray-300">
                      {product.sku}
                    </code>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Barcode:</span>
                    <code className="bg-[#1e2139] px-2 py-0.5 rounded text-gray-300">
                      {product.barcode}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#3d4564]">
              <div className="flex items-center gap-3">
                <div className="icon-badge bg-blue-500/20 border border-blue-500/30">
                  <Edit2 size={20} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-100">Produkt bearbeiten</h2>
              </div>
              <button
                onClick={() => setEditProduct(null)}
                className="p-2 hover:bg-[#3d4564] rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Product Image Preview */}
              {editProduct.photo_path && (
                <div className="flex justify-center">
                  <img
                    src={`${API_URL}/uploads/${editProduct.photo_path}`}
                    alt={editProduct.name}
                    className="max-h-48 rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag size={14} className="inline mr-1" />
                  Produktname
                </label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="input w-full"
                  placeholder="z.B. Epoxidharz Untersetzer"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FileText size={14} className="inline mr-1" />
                  Beschreibung
                </label>
                <textarea
                  value={editProduct.description || ''}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  className="input w-full min-h-[100px]"
                  placeholder="Produktbeschreibung..."
                />
              </div>

              {/* Weight & Price Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Weight size={14} className="inline mr-1" />
                    Gewicht (g)
                  </label>
                  <input
                    type="number"
                    value={editProduct.weight}
                    onChange={(e) => setEditProduct({ ...editProduct, weight: e.target.value })}
                    className="input w-full"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Selbstkosten (€)
                  </label>
                  <input
                    type="number"
                    value={editProduct.total_cost}
                    onChange={(e) => setEditProduct({ ...editProduct, total_cost: e.target.value })}
                    className="input w-full"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <DollarSign size={14} className="inline mr-1" />
                    Verkaufspreis (€)
                  </label>
                  <input
                    type="number"
                    value={editProduct.selling_price}
                    onChange={(e) => setEditProduct({ ...editProduct, selling_price: e.target.value })}
                    className="input w-full"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Read-only Info */}
              <div className="bg-[#1e2139] rounded-lg p-4 border border-[#3d4564]">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Produkt-Informationen</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">SKU:</span>
                    <code className="ml-2 text-gray-300">{editProduct.sku}</code>
                  </div>
                  <div>
                    <span className="text-gray-500">Barcode:</span>
                    <code className="ml-2 text-gray-300">{editProduct.barcode}</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#3d4564]">
              <button
                onClick={() => setEditProduct(null)}
                className="px-4 py-2 text-gray-400 hover:bg-[#3d4564] rounded-lg transition-colors"
                disabled={isSaving}
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="btn btn-primary px-6 py-2 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Speichert...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Speichern
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
