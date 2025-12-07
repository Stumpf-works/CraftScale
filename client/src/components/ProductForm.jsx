/**
 * CraftScale by Stumpf.works
 * Produkt-Erstellungs-Formular Component
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Save, Image as ImageIcon, Weight, Beaker, Clock, Euro,
  Package, TrendingUp, DollarSign, Plus, X, Hash, Camera
} from 'lucide-react';
import { API_BASE, API_URL } from '../config';
import { useWeight } from '../hooks/useWeight';

export default function ProductForm({ onProductCreated, initialWeight }) {
  const { weight: liveWeight = 0 } = useWeight();

  // Form State
  const [name, setName] = useState('');
  const [productWeight, setProductWeight] = useState(initialWeight || 0);
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
  const [isCapturing, setIsCapturing] = useState(false);

  // Update weight from initialWeight if provided
  useEffect(() => {
    if (initialWeight) {
      setProductWeight(initialWeight);
    }
  }, [initialWeight]);

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

  async function capturePhoto() {
    setIsCapturing(true);
    try {
      const response = await axios.post(`${API_BASE}/camera/capture`);

      if (response.data.success) {
        // Foto-URL von Server
        const photoUrl = `${API_URL}${response.data.url}`;
        setPhotoPreview(photoUrl);

        // Speichere den Dateinamen für den Upload
        setPhoto({ filename: response.data.filename, isFromCamera: true });

        toast.success('Foto erfolgreich aufgenommen!');
      }
    } catch (error) {
      console.error('Fehler beim Aufnehmen des Fotos:', error);
      toast.error('Fehler beim Aufnehmen des Fotos');
    } finally {
      setIsCapturing(false);
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

    if (!name || productWeight <= 0) {
      toast.error('Name und Gewicht sind erforderlich');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('weight', productWeight);
      formData.append('materials', JSON.stringify(materials.filter(m => m.material_id)));
      formData.append('labor_minutes', laborMinutes);
      formData.append('hourly_rate', hourlyRate);
      formData.append('fixed_cost', fixedCost);
      formData.append('profit_margin', profitMargin);
      formData.append('description', description);

      if (photo) {
        if (photo.isFromCamera) {
          // Foto wurde mit Webcam aufgenommen - bereits auf Server
          formData.append('photo_filename', photo.filename);
        } else {
          // Foto wurde hochgeladen
          formData.append('photo', photo);
        }
      }

      await axios.post(`${API_BASE}/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Produkt erfolgreich erstellt!');

      // Reset form
      setName('');
      setProductWeight(0);
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Foto Upload */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="icon-badge bg-gradient-to-br from-violet-100 to-violet-50">
              <ImageIcon size={18} className="text-violet-600" />
            </div>
            <label className="text-base font-bold text-white">Produktfoto</label>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-violet-400 transition-all duration-200 bg-gradient-to-br from-gray-50 to-white">
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
                <div className="flex gap-3 justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="btn btn-outline cursor-pointer inline-flex items-center gap-2"
                  >
                    <ImageIcon size={18} />
                    Datei wählen
                  </label>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={isCapturing}
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    {isCapturing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Aufnahme...
                      </>
                    ) : (
                      <>
                        <Camera size={18} />
                        Mit Webcam aufnehmen
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Produkt-Informationen */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="icon-badge bg-gradient-to-br from-blue-100 to-blue-50">
              <Package size={18} className="text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-white">Produkt-Informationen</h3>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Produktname *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                placeholder="z.B. Epoxidharz Untersetzer"
                required
              />
            </div>

            {/* Gewicht */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2 flex items-center gap-2">
                <Weight size={16} />
                Gewicht
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={productWeight}
                  onChange={(e) => setProductWeight(parseFloat(e.target.value) || 0)}
                  className="input flex-1"
                  placeholder="Gewicht in Gramm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setProductWeight(liveWeight || 0)}
                  className="px-4 py-2 bg-[#4a9ff5] hover:bg-[#3b8ee6] text-white rounded-lg transition-all text-sm whitespace-nowrap"
                  title="Aktuelles Gewicht von Waage übernehmen"
                >
                  Live: {(liveWeight || 0).toFixed(1)}g
                </button>
              </div>
            </div>

            {/* Beschreibung */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Beschreibung (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input w-full"
                rows="3"
                placeholder="Kurze Beschreibung des Produkts..."
              />
            </div>
          </div>
        </div>

        {/* Materialien */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="icon-badge bg-gradient-to-br from-green-100 to-green-50">
                <Beaker size={18} className="text-green-600" />
              </div>
              <h3 className="text-base font-bold text-white">Materialien</h3>
            </div>
            <button
              type="button"
              onClick={addMaterialRow}
              className="btn btn-primary text-sm flex items-center gap-1"
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
                  className="input flex-1"
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
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="icon-badge bg-gradient-to-br from-orange-100 to-orange-50">
              <Euro size={18} className="text-orange-600" />
            </div>
            <h3 className="text-base font-bold text-white">Kosten & Preise</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arbeitszeit */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2 flex items-center gap-2">
                <Clock size={16} />
                Arbeitszeit (Minuten)
              </label>
              <input
                type="number"
                value={laborMinutes}
                onChange={(e) => setLaborMinutes(parseFloat(e.target.value) || 0)}
                className="input w-full"
                step="1"
              />
            </div>

            {/* Stundenlohn */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2 flex items-center gap-2">
                <Euro size={16} />
                Stundenlohn (€)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                className="input w-full"
                step="0.50"
              />
            </div>

            {/* Fixkosten */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2 flex items-center gap-2">
                <Package size={16} />
                Fixkosten (€)
              </label>
              <input
                type="number"
                value={fixedCost}
                onChange={(e) => setFixedCost(parseFloat(e.target.value) || 0)}
                className="input w-full"
                step="0.10"
              />
            </div>

            {/* Gewinnmarge */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2 flex items-center gap-2">
                <TrendingUp size={16} />
                Gewinnmarge (%)
              </label>
              <input
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                className="input w-full"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* Kosten-Summary */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="icon-badge bg-gradient-to-br from-violet-100 to-violet-50">
              <DollarSign size={18} className="text-violet-600" />
            </div>
            <h3 className="text-base font-bold text-white">Kalkulation</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-600">Materialkosten</span>
              <span className="text-base font-bold text-white">{materialCost.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-600">Arbeitskosten</span>
              <span className="text-base font-bold text-white">{laborCost.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-600">Fixkosten</span>
              <span className="text-base font-bold text-white">{parseFloat(fixedCost || 0).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-2 border-blue-200">
              <span className="text-sm font-semibold text-blue-900">Selbstkosten</span>
              <span className="text-lg font-black text-blue-900">{totalCost.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-violet-100 via-purple-50 to-blue-100 rounded-lg border-2 border-violet-300">
              <span className="text-base font-bold flex items-center gap-2 text-violet-900">
                <DollarSign size={20} />
                Verkaufspreis
              </span>
              <span className="text-3xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                {sellingPrice.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || productWeight <= 0}
          className="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
