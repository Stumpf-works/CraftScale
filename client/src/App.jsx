/**
 * CraftScale by Stumpf.works
 * Main Application Component
 */

import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import Navbar from './components/Navbar';
import WeighScale from './components/WeighScale';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import MaterialManager from './components/MaterialManager';
import ExportPanel from './components/ExportPanel';
import { API_BASE, API_URL } from './config';

function App() {
  const [activeTab, setActiveTab] = useState('weigh');
  const [isOnline, setIsOnline] = useState(true);
  const [productRefreshTrigger, setProductRefreshTrigger] = useState(0);

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

  // Server-IP aus URL extrahieren
  const serverURL = API_URL.replace(/^https?:\/\//, '');

  function handleProductCreated() {
    setProductRefreshTrigger(prev => prev + 1);
    setActiveTab('products');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }
        }}
      />

      {/* Container */}
      <div className="container mx-auto px-4 py-6">
        {/* Navigation */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOnline={isOnline}
        />

        {/* Main Content */}
        <main className="mb-12">
          {activeTab === 'weigh' && (
            <div className="space-y-6">
              <WeighScale />
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Neues Produkt erstellen</h2>
                <ProductForm onProductCreated={handleProductCreated} />
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <ProductList refreshTrigger={productRefreshTrigger} />
          )}

          {activeTab === 'materials' && (
            <MaterialManager />
          )}

          {activeTab === 'export' && (
            <ExportPanel />
          )}
        </main>

        {/* Footer */}
        <footer className="glass-card p-6 text-center">
          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-semibold text-gray-800">
              © 2025 CraftScale by Stumpf.works - DIY Craft Management
            </p>
            <p className="text-xs">
              Connected to: <code className="bg-gray-100 px-2 py-1 rounded">{serverURL}</code>
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className={`status-dot ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs">
                Server {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
