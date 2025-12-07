/**
 * CraftScale by Stumpf.works
 * Products Page Wrapper
 */

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import ProductGallery from '../components/ProductGallery';

export default function ProductsPage() {
  const location = useLocation();
  const [productRefreshTrigger, setProductRefreshTrigger] = useState(0);

  // Get initial weight from navigation state (if coming from Weigh page)
  const initialWeight = location.state?.initialWeight;

  function handleProductCreated() {
    setProductRefreshTrigger(prev => prev + 1);
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#232943] rounded-xl p-6 border border-[#2e3650] shadow-lg">
        <h2 className="text-xl font-bold text-white mb-6">Neues Produkt erstellen</h2>
        {initialWeight && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-400">
            Gewicht von Waage übernommen: <span className="font-bold">{initialWeight.toFixed(2)}g</span>
          </div>
        )}
        <ProductForm
          onProductCreated={handleProductCreated}
          initialWeight={initialWeight}
        />
      </div>
      <ProductGallery refreshTrigger={productRefreshTrigger} />
    </div>
  );
}
