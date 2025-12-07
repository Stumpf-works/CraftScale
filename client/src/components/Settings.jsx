/**
 * CraftScale by Stumpf.works
 * Settings Component - Calibration & System Configuration
 */

import React, { useState } from 'react';
import { Settings as SettingsIcon, Scale, Sliders } from 'lucide-react';
import { useWeight } from '../hooks/useWeight';

export default function Settings() {
  const {
    weight,
    rawValue,
    calibration,
    isOnline,
    performCalibration,
    performTare
  } = useWeight();

  const [knownWeight, setKnownWeight] = useState('');
  const [calibrationStatus, setCalibrationStatus] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isTaring, setIsTaring] = useState(false);

  const handleTare = async () => {
    setIsTaring(true);
    setCalibrationStatus({ type: 'info', message: 'Setze Tara (Offset zurücksetzen)...' });

    const result = await performTare();
    setIsTaring(false);

    if (result.success) {
      setCalibrationStatus({ type: 'success', message: 'Tara erfolgreich gesetzt - Offset zurückgesetzt' });
      setTimeout(() => setCalibrationStatus(null), 3000);
    } else {
      setCalibrationStatus({ type: 'error', message: result.error || 'Fehler beim Tara setzen' });
    }
  };

  const handleCalibrate = async () => {
    const weightValue = parseFloat(knownWeight);
    if (!weightValue || weightValue <= 0) {
      setCalibrationStatus({ type: 'error', message: 'Gültiges Gewicht eingeben' });
      return;
    }

    setIsCalibrating(true);
    setCalibrationStatus({ type: 'info', message: 'Kalibriere...' });

    const result = await performCalibration(weightValue);
    setIsCalibrating(false);

    if (result.success) {
      setCalibrationStatus({ type: 'success', message: 'Kalibrierung erfolgreich' });
      setKnownWeight('');
      setTimeout(() => setCalibrationStatus(null), 3000);
    } else {
      setCalibrationStatus({ type: 'error', message: result.error });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="icon-badge bg-gradient-to-br from-[#4a9ff5]/20 to-[#3b8ee6]/20 border border-[#4a9ff5]/30">
          <SettingsIcon size={22} className="text-[#4a9ff5]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Einstellungen</h1>
          <p className="text-sm text-gray-400">Kalibrierung und Systemkonfiguration</p>
        </div>
      </div>

      {/* Status Message */}
      {calibrationStatus && (
        <div className={`p-4 rounded-lg text-sm border ${
          calibrationStatus.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
          calibrationStatus.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
          'bg-blue-500/10 text-blue-400 border-blue-500/30'
        }`}>
          {calibrationStatus.message}
        </div>
      )}

      {/* Calibration Section */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="icon-badge bg-blue-500/20 border border-blue-500/30">
            <Scale size={18} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-100">Waagen-Kalibrierung</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Calibration Values */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Aktuelle Werte</h3>

            <div className="bg-[#1e2139] rounded-lg p-4 border border-[#3d4564]">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Kalibrierungsfaktor</div>
              <div className="font-mono text-3xl font-black text-gray-100">
                {calibration.factor?.toFixed(2) || '0.00'}
              </div>
            </div>

            <div className="bg-[#1e2139] rounded-lg p-4 border border-[#3d4564]">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Offset</div>
              <div className="font-mono text-3xl font-black text-gray-100">
                {calibration.offset || '0'}
              </div>
            </div>

            {/* Tare Button */}
            <button
              onClick={handleTare}
              disabled={isTaring || !isOnline}
              className="w-full btn btn-primary py-3 text-base"
            >
              {isTaring ? 'Setze Tara...' : 'Tara setzen (Offset zurücksetzen)'}
            </button>

            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
              <div className="text-xs font-semibold text-blue-400 uppercase mb-2">Aktuelles Gewicht</div>
              <div className="font-mono text-2xl font-bold text-blue-300">
                {weight.toFixed(2)} g
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-gray-500">RAW:</span>
                <span className="font-mono font-bold text-gray-300">{rawValue}</span>
              </div>
            </div>
          </div>

          {/* Calibration Form */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Neue Kalibrierung</h3>

            <div className="bg-[#1e2139] border border-[#3d4564] rounded-lg p-4">
              <h4 className="font-medium text-gray-100 mb-3 flex items-center gap-2">
                <Sliders size={16} />
                Anleitung
              </h4>
              <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                <li>Waage leer machen und Tara setzen (Button links)</li>
                <li>Bekanntes Gewicht auflegen</li>
                <li>Warten bis Wert stabil ist</li>
                <li>Gewicht eingeben und kalibrieren</li>
              </ol>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bekanntes Gewicht (Gramm)
              </label>
              <input
                type="number"
                value={knownWeight}
                onChange={(e) => setKnownWeight(e.target.value)}
                placeholder="z.B. 100"
                className="input w-full"
                min="1"
                step="0.01"
              />
            </div>

            <button
              onClick={handleCalibrate}
              disabled={isCalibrating || !knownWeight || !isOnline}
              className="w-full btn btn-primary py-3 text-base"
            >
              {isCalibrating ? 'Kalibriere...' : 'Kalibrierung starten'}
            </button>

            {!isOnline && (
              <div className="text-sm text-red-400 text-center">
                Waage offline - bitte Verbindung prüfen
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-4">System-Informationen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between p-3 bg-[#1e2139] rounded-lg border border-[#3d4564]">
            <span className="text-gray-400">Status:</span>
            <span className={`font-semibold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="flex justify-between p-3 bg-[#1e2139] rounded-lg border border-[#3d4564]">
            <span className="text-gray-400">RAW-Wert:</span>
            <span className="font-mono font-semibold text-gray-100">{rawValue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
