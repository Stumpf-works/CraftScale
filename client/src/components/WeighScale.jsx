/**
 * CraftScale by Stumpf.works
 * Clean Professional Weight Scale Interface
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Settings, Plus } from 'lucide-react';
import { useWeight } from '../hooks/useWeight';

export default function WeighScale() {
  const navigate = useNavigate();
  const {
    weight,
    rawValue,
    isLoading,
    isOnline,
    performTare
  } = useWeight();

  const [calibrationStatus, setCalibrationStatus] = useState(null);

  const handleTare = async () => {
    setCalibrationStatus({ type: 'info', message: 'Setze Tara...' });
    const result = await performTare();
    if (result.success) {
      setCalibrationStatus({ type: 'success', message: 'Tara erfolgreich gesetzt' });
      setTimeout(() => setCalibrationStatus(null), 2000);
    } else {
      setCalibrationStatus({ type: 'error', message: result.error });
    }
  };

  const handleCreateProduct = () => {
    // Navigate to products page with current weight
    navigate('/products', { state: { initialWeight: weight } });
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Status Message */}
      {calibrationStatus && (
        <div className={`p-3 rounded-lg text-sm mb-4 border ${
          calibrationStatus.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
          calibrationStatus.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
          'bg-blue-500/10 text-blue-400 border-blue-500/30'
        }`}>
          {calibrationStatus.message}
        </div>
      )}

      {/* Main Grid: Live Weight (left) + Product Form (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Left Column: Live Weight Display + Tare Button */}
        <div className="space-y-4">
          {/* Weight Display - Compact */}
          <div className="card p-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full mb-4 text-xs font-semibold border border-blue-500/30">
                <Scale size={14} />
                Live-Anzeige
              </div>

              <div className="text-7xl font-black bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent mb-3 tabular-nums leading-none">
                {weight.toFixed(2)}
              </div>
              <div className="text-xl font-semibold text-gray-400 mb-4">Gramm</div>

              {/* Status & RAW Value */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <span className={`status-dot ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm font-medium text-gray-300">{isOnline ? 'Online' : 'Offline'}</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 bg-gray-700 rounded border border-gray-600">
                  <div className="text-xs font-semibold text-gray-400">RAW</div>
                  <div className="font-mono text-xs font-bold text-gray-200">{rawValue}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tare Button - Below Weight Display */}
          <button
            onClick={handleTare}
            disabled={!isOnline}
            className="w-full btn btn-primary py-3 text-base"
          >
            Tara setzen
          </button>
        </div>

        {/* Right Column: Quick Product Creation */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="icon-badge bg-blue-500/20 border border-blue-500/30">
              <Plus size={18} className="text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-gray-100">Produkt erstellen</h3>
          </div>

          <div className="text-sm text-gray-400 mb-4">
            Aktuelles Gewicht: <span className="font-bold text-blue-400">{weight.toFixed(2)}g</span>
          </div>

          <button
            onClick={handleCreateProduct}
            className="w-full btn btn-primary py-3"
          >
            Neues Produkt mit {weight.toFixed(2)}g erstellen
          </button>

          <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500 text-center">
            Vollständiges Formular im "Produkte"-Tab
          </div>
        </div>
      </div>
    </div>
  );
}
