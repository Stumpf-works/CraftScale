/**
 * CraftScale by Stumpf.works
 * Custom Hook für Gewichtsabfrage (Polling)
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

const POLLING_INTERVAL = 500; // 500ms
const MAX_FAILED_REQUESTS = 3;

export function useWeight() {
  const [weight, setWeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [failedRequests, setFailedRequests] = useState(0);

  const fetchWeight = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/weight/latest`, {
        timeout: 2000
      });

      setWeight(response.data.weight || 0);
      setError(null);
      setIsLoading(false);
      setFailedRequests(0);

      // Online-Status aktualisieren
      if (!isOnline) {
        setIsOnline(true);
        console.log('[Weight Hook] Verbindung wiederhergestellt');
      }
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
  }, [failedRequests, isOnline]);

  const refetch = useCallback(() => {
    fetchWeight();
  }, [fetchWeight]);

  useEffect(() => {
    // Initial fetch
    fetchWeight();

    // Polling starten
    const interval = setInterval(fetchWeight, POLLING_INTERVAL);

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, [fetchWeight]);

  return {
    weight,
    isLoading,
    error,
    isOnline,
    refetch
  };
}
