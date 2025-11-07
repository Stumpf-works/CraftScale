/**
 * CraftScale by Stumpf.works
 * Frontend Konfiguration
 */

// API URL wird zur Build-Zeit aus Environment Variable gesetzt
export const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
export const API_BASE = `${API_URL}/api`;

console.log('CraftScale Frontend Config:', {
  API_URL,
  API_BASE
});
