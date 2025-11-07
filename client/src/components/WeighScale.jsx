/**
 * CraftScale by Stumpf.works
 * Live Gewichtsanzeige Component
 */

import React from 'react';
import { Scale, Loader, AlertCircle } from 'lucide-react';
import { useWeight } from '../hooks/useWeight';

export default function WeighScale() {
  const { weight, isLoading, error, isOnline } = useWeight();

  // Status ermitteln
  const getStatus = () => {
    if (!isOnline) return { text: 'Server nicht erreichbar', color: 'text-red-500', icon: AlertCircle };
    if (isLoading) return { text: 'Verbinde...', color: 'text-gray-500', icon: Loader };
    if (weight > 0.5) return { text: 'Gewicht erkannt ✓', color: 'text-green-500', icon: Scale };
    return { text: 'Warte auf Messung', color: 'text-gray-500', icon: Scale };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card p-8 text-center">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Scale size={32} className="text-indigo-500" />
          <h2 className="text-3xl font-bold text-gray-800">Live Waage</h2>
        </div>

        {/* Gewichtsanzeige */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-12 mb-6">
          <div className={`${weight > 0.5 ? 'weight-display' : ''}`}>
            <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
              {weight.toFixed(2)}
            </div>
            <div className="text-2xl text-gray-600 mt-2">Gramm</div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`badge ${!isOnline ? 'bg-red-100 text-red-700' : weight > 0.5 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          <StatusIcon size={16} className={isLoading ? 'animate-spin' : ''} />
          {status.text}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle size={16} className="inline mr-2" />
            {error}
          </div>
        )}

        {/* Offline Warning */}
        {!isOnline && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
            <AlertCircle size={16} className="inline mr-2" />
            Server nicht erreichbar. Bitte prüfen Sie die Verbindung.
          </div>
        )}

        {/* Info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Legen Sie ein Objekt auf die Waage.</p>
          <p className="mt-1">Das Gewicht wird automatisch erkannt und aktualisiert.</p>
        </div>
      </div>
    </div>
  );
}
