/**
 * CraftScale by Stumpf.works
 * Custom Hook für Gewichtsabfrage (WebSocket + Fallback Polling)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { API_BASE, API_URL } from '../config';

const POLLING_INTERVAL = 2000; // 2s Fallback Polling
const MAX_FAILED_REQUESTS = 3;

export function useWeight() {
  const [weight, setWeight] = useState(0);
  const [rawValue, setRawValue] = useState(0);
  const [calibration, setCalibration] = useState({ factor: 0, offset: 0, last_calibrated: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [failedRequests, setFailedRequests] = useState(0);
  const socketRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const updateWeightData = useCallback((data) => {
    setWeight(data.weight || 0);
    setRawValue(data.raw_value || 0);
    setCalibration(data.calibration || { factor: 0, offset: 0, last_calibrated: null });
    setError(null);
    setIsLoading(false);
    setFailedRequests(0);

    if (!isOnline) {
      setIsOnline(true);
      console.log('[Weight Hook] Verbindung wiederhergestellt');
    }
  }, [isOnline]);

  const fetchWeight = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/weight/latest`, {
        timeout: 2000
      });

      updateWeightData(response.data);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);

      const newFailedCount = failedRequests + 1;
      setFailedRequests(newFailedCount);

      // Nach 3 fehlgeschlagenen Versuchen → offline
      if (newFailedCount >= MAX_FAILED_REQUESTS && isOnline) {
        setIsOnline(false);
        console.error('[Weight Hook] Server nicht erreichbar (offline)');
      }
    }
  }, [failedRequests, isOnline, updateWeightData]);

  const refetch = useCallback(() => {
    fetchWeight();
  }, [fetchWeight]);

  const performTare = useCallback(async () => {
    try {
      await axios.post(`${API_BASE}/weight/calibration/tare`, {
        rawValue: rawValue
      });
      await fetchWeight();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [rawValue, fetchWeight]);

  const performCalibration = useCallback(async (knownWeight) => {
    try {
      const response = await axios.post(`${API_BASE}/weight/calibration`, {
        knownWeight,
        rawValue: rawValue
      });
      await fetchWeight();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [rawValue, fetchWeight]);

  useEffect(() => {
    // Initial fetch
    fetchWeight();

    // WebSocket Verbindung aufbauen
    console.log('[Weight Hook] Verbinde mit WebSocket:', API_URL);
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Weight Hook] WebSocket verbunden');
      setIsOnline(true);
      setFailedRequests(0);

      // Nach Verbindung aktuelle Daten abrufen
      fetchWeight();

      // Polling stoppen wenn WebSocket funktioniert
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    });

    socket.on('disconnect', () => {
      console.log('[Weight Hook] WebSocket getrennt, aktiviere Fallback-Polling');

      // Fallback auf Polling wenn WebSocket ausfällt
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = setInterval(fetchWeight, POLLING_INTERVAL);
      }
    });

    socket.on('weight:update', (data) => {
      console.log('[Weight Hook] Realtime Update empfangen:', data);
      updateWeightData(data);
    });

    socket.on('connect_error', (err) => {
      console.error('[Weight Hook] WebSocket Verbindungsfehler:', err.message);

      // Fallback auf Polling
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = setInterval(fetchWeight, POLLING_INTERVAL);
      }
    });

    // Cleanup
    return () => {
      console.log('[Weight Hook] Cleanup: Schließe WebSocket');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchWeight, updateWeightData]);

  return {
    weight,
    rawValue,
    calibration,
    isLoading,
    error,
    isOnline,
    refetch,
    performTare,
    performCalibration
  };
}
