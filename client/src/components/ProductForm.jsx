/**
 * CraftScale by Stumpf.works
 * Produkt-Erstellungs-Formular Component
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Save, Image as ImageIcon, Weight, Flask, Clock, Euro,
  Package, TrendingUp, DollarSign, Plus, X, Hash
} from 'lucide-react';
import { API_BASE, API_URL } from '../config';
import { useWeight } from '../hooks/useWeight';

export default function ProductForm({ onProductCreated }) {
  const { weight } = useWeight();

  // Form State
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [materials, setMaterials] = useState([{ material_id: '', quantity_used: 0 }]);
  const [laborMinutes, setLaborMinutes] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(20);
  const [fixedCost, setFixedCost] = useState(0);
  const [profitMargin, setProfitMargin] = useState(30);
  const [description, setDescription] = useState('');

  // Available Materials
  const [availableMaterials, setAvailableMaterials] = useState([]);

  // Calculated Costs
  const [materialCost, setMaterialCost] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load materials
  useEffect(() => {
    loadMaterials();
  }, []);

  // Calculate costs
  useEffect(() => {
    calculateCosts();
  }, [materials, laborMinutes, hourlyRate, fixedCost, profitMargin]);

  async function loadMaterials() {
    try {
      const response = await axios.get(`${API_BASE}/materials`);
      setAvailableMaterials(response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Materialien:', error);
      toast.error('Fehler beim Laden der Materialien');
    }
  }

  function calculateCosts() {
    // Material-Kosten
    let matCost = 0;
    materials.forEach(mat => {
      const material = availableMaterials.find(m => m.id === parseInt(mat.material_id));
      if (material) {
        matCost += material.unit_price * mat.quantity_used;
      }
    });

    // Arbeitskosten
    const labCost = (laborMinutes / 60) * hourlyRate;

    // Selbstkosten
    const totCost = matCost + labCost + parseFloat(fixedCost || 0);

    // Verkaufspreis
    const sellPrice = totCost * (1 + profitMargin / 100);

    setMaterialCost(matCost);
    setLaborCost(labCost);
    setTotalCost(totCost);
    setSellingPrice(sellPrice);
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  function addMaterialRow() {
    setMaterials([...materials, { material_id: '', quantity_used: 0 }]);
  }

  function removeMaterialRow(index) {
    setMaterials(materials.filter((_, i) => i !== index));
  }

  function updateMaterial(index, field, value) {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || weight <= 0) {
      toast.error('Name und Gewicht sind erforderlich');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('weight', weight);
      formData.append('materials', JSON.stringify(materials.filter(m => m.material_id)));
      formData.append('labor_minutes', laborMinutes);
      formData.append('hourly_rate', hourlyRate);
      formData.append('fixed_cost', fixedCost);
      formData.append('profit_margin', profitMargin);
      formData.append('description', description);

      if (photo) {
        formData.append('photo', photo);
      }

      await axios.post(`${API_BASE}/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Produkt erfolgreich erstellt!');

      // Reset form
      setName('');
      setPhoto(null);
      setPhotoPreview(null);
      setMaterials([{ material_id: '', quantity_used: 0 }]);
      setLaborMinutes(0);
      setFixedCost(0);
      setDescription('');

      if (onProductCreated) {
        onProductCreated();
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Produkts:', error);
      toast.error(error.response?.data?.error || 'Fehler beim Erstellen des Produkts');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto Upload */}
        <div className="glass-card p-6">
          <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ImageIcon size={20} />
            Produktfoto
          </label>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
            {photoPreview ? (
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="max-h-64 rounded-xl shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="btn-gradient cursor-pointer inline-block"
                >
                  Foto auswählen
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Produkt-Informationen */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Produkt-Informationen</h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produktname *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full"
                placeholder="z.B. Epoxidharz Untersetzer"
                required
              />
            </div>

            {/* Gewicht (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Weight size={16} />
                Gewicht (automatisch von Waage)
              </label>
              <input
                type="text"
                value={`${weight.toFixed(2)} g`}
                readOnly
                className="input-field w-full bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Beschreibung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field w-full"
                rows="3"
                placeholder="Kurze Beschreibung des Produkts..."
              />
            </div>
          </div>
        </div>

        {/* Materialien */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Flask size={20} />
              Materialien
            </h3>
            <button
              type="button"
              onClick={addMaterialRow}
              className="btn-gradient text-sm flex items-center gap-1"
            >
              <Plus size={16} />
              Material hinzufügen
            </button>
          </div>

          <div className="space-y-3">
            {materials.map((mat, index) => (
              <div key={index} className="flex gap-3 items-center">
                <select
                  value={mat.material_id}
                  onChange={(e) => updateMaterial(index, 'material_id', e.target.value)}
                  className="input-field flex-1"
                >
                  <option value="">Material wählen...</option>
                  {availableMaterials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.unit_price.toFixed(2)}€/{m.unit})
                    </option>
                  ))}
                </select>

                <div className="relative flex-1">
                  <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={mat.quantity_used}
                    onChange={(e) => updateMaterial(index, 'quantity_used', parseFloat(e.target.value) || 0)}
                    className="input-field w-full pl-10"
                    placeholder="Menge"
                    step="0.1"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeMaterialRow(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={materials.length === 1}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Kosten */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Kosten & Preise</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arbeitszeit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={16} />
                Arbeitszeit (Minuten)
              </label>
              <input
                type="number"
                value={laborMinutes}
                onChange={(e) => setLaborMinutes(parseFloat(e.target.value) || 0)}
                className="input-field w-full"
                step="1"
              />
            </div>

            {/* Stundenlohn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Euro size={16} />
                Stundenlohn (€)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                className="input-field w-full"
                step="0.50"
              />
            </div>

            {/* Fixkosten */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Package size={16} />
                Fixkosten (€)
              </label>
              <input
                type="number"
                value={fixedCost}
                onChange={(e) => setFixedCost(parseFloat(e.target.value) || 0)}
                className="input-field w-full"
                step="0.10"
              />
            </div>

            {/* Gewinnmarge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <TrendingUp size={16} />
                Gewinnmarge (%)
              </label>
              <input
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                className="input-field w-full"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* Kosten-Summary */}
        <div className="glass-card p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Kalkulation</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-gray-700">
              <span>Materialkosten:</span>
              <span className="font-semibold">{materialCost.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Arbeitskosten:</span>
              <span className="font-semibold">{laborCost.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Fixkosten:</span>
              <span className="font-semibold">{parseFloat(fixedCost || 0).toFixed(2)} €</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center text-gray-800">
              <span className="font-medium">Selbstkosten:</span>
              <span className="font-bold">{totalCost.toFixed(2)} €</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-medium flex items-center gap-2">
                <DollarSign size={20} className="text-green-500" />
                Verkaufspreis:
              </span>
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                {sellingPrice.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || weight <= 0}
          className="btn-gradient w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Wird erstellt...
            </>
          ) : (
            <>
              <Save size={20} />
              Produkt erstellen
            </>
          )}
        </button>
      </form>
    </div>
  );
}
