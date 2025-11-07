/**
 * CraftScale by Stumpf.works
 * Material-Manager Component
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Tag, Layers, Euro, Package, Plus, Trash2,
  Droplet, Zap, Palette, Box, MoreHorizontal
} from 'lucide-react';
import { API_BASE } from '../config';

const materialTypes = [
  { value: 'harz', label: 'Harz', icon: Droplet, color: 'bg-blue-100 text-blue-700' },
  { value: 'härter', label: 'Härter', icon: Zap, color: 'bg-green-100 text-green-700' },
  { value: 'pigment', label: 'Pigment', icon: Palette, color: 'bg-purple-100 text-purple-700' },
  { value: 'form', label: 'Form', icon: Box, color: 'bg-orange-100 text-orange-700' },
  { value: 'sonstiges', label: 'Sonstiges', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' }
];

const units = ['ml', 'g', 'stück'];

export default function MaterialManager() {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('harz');
  const [unitPrice, setUnitPrice] = useState(0);
  const [unit, setUnit] = useState('ml');

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    try {
      const response = await axios.get(`${API_BASE}/materials`);
      setMaterials(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Fehler beim Laden der Materialien:', error);
      toast.error('Fehler beim Laden der Materialien');
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || unitPrice <= 0) {
      toast.error('Name und Preis sind erforderlich');
      return;
    }

    try {
      await axios.post(`${API_BASE}/materials`, {
        name,
        type,
        unit_price: parseFloat(unitPrice),
        unit
      });

      toast.success('Material hinzugefügt');
      setName('');
      setUnitPrice(0);
      loadMaterials();
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
      toast.error(error.response?.data?.error || 'Fehler beim Erstellen');
    }
  }

  async function handleDelete(material) {
    if (!confirm(`Material "${material.name}" wirklich löschen?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/materials/${material.id}`);
      toast.success('Material gelöscht');
      loadMaterials();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      toast.error(error.response?.data?.error || 'Fehler beim Löschen');
    }
  }

  function getMaterialTypeInfo(typeValue) {
    return materialTypes.find(t => t.value === typeValue) || materialTypes[4];
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Add Material Form */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Plus size={24} />
          Material hinzufügen
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Tag size={14} />
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full"
              placeholder="z.B. Epoxidharz 1kg"
              required
            />
          </div>

          {/* Typ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Layers size={14} />
              Typ
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-field w-full"
            >
              {materialTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Preis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Euro size={14} />
              Preis pro Einheit
            </label>
            <input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="input-field w-full"
              step="0.01"
              required
            />
          </div>

          {/* Einheit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Package size={14} />
              Einheit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="input-field w-full"
            >
              {units.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button type="submit" className="btn-gradient w-full">
              <Plus size={16} className="inline mr-1" />
              Hinzufügen
            </button>
          </div>
        </form>
      </div>

      {/* Materials List */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Materialien ({materials.length})</h2>

        {materials.length === 0 ? (
          <div className="text-center py-12">
            <Layers size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Noch keine Materialien vorhanden</p>
            <p className="text-gray-500 text-sm mt-2">Fügen Sie oben ein neues Material hinzu</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map(material => {
              const typeInfo = getMaterialTypeInfo(material.type);
              const TypeIcon = typeInfo.icon;

              return (
                <div
                  key={material.id}
                  className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{material.name}</h3>
                      <div className={`badge ${typeInfo.color} mt-2 text-xs`}>
                        <TypeIcon size={14} />
                        {typeInfo.label}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(material)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Preis:</span>
                      <span className="font-semibold text-gray-800">
                        {material.unit_price.toFixed(2)} € / {material.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
