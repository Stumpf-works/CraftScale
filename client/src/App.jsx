/**
 * CraftScale by Stumpf.works
 * Main Application Component
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { API_BASE } from './config';

// Layout
import MainLayout from './components/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import WeighPage from './pages/WeighPage';
import ProductsPage from './pages/ProductsPage';
import MaterialsPage from './pages/MaterialsPage';
import ExportPage from './pages/ExportPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [isOnline, setIsOnline] = useState(true);

  // Health Check (alle 10 Sekunden)
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axios.get(`${API_BASE}/health`, { timeout: 3000 });
        if (!isOnline) setIsOnline(true);
      } catch (error) {
        if (isOnline) setIsOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);

    return () => clearInterval(interval);
  }, [isOnline]);

  return (
    <BrowserRouter>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#232943',
            color: '#f3f4f6',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            border: '1px solid #2e3650'
          }
        }}
      />

      {/* Main Layout with Routes */}
      <MainLayout isOnline={isOnline}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/weigh" element={<WeighPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
