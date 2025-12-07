/**
 * CraftScale by Stumpf.works
 * Frontend Konfiguration
 */

// API URL - verwendet immer window.location.origin zur Laufzeit
// Dies stellt sicher, dass die App von überall aus funktioniert
export const API_URL = window.location.origin;
export const API_BASE = `${window.location.origin}/api`;

console.log('CraftScale Frontend Config:', {
  API_URL,
  API_BASE
});
