/**
 * CraftScale by Stumpf.works
 * Clean Professional Navigation
 */

import React from 'react';
import { Scale, Package, Beaker, Download, Settings } from 'lucide-react';

const tabs = [
  { id: 'weigh', label: 'Wiegen', icon: Scale },
  { id: 'products', label: 'Produkte', icon: Package },
  { id: 'materials', label: 'Material', icon: Beaker },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'settings', label: 'Einstellungen', icon: Settings }
];

export default function Navbar({ activeTab, onTabChange, isOnline }) {
  return (
    <nav className="bg-[#232943] shadow-xl border-b border-[#2e3650]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#4a9ff5] to-[#3b8ee6] rounded-lg flex items-center justify-center shadow-lg">
              <Scale size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                CraftScale
              </h1>
              <p className="text-xs text-gray-400 font-medium">stumpfWORKS</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e2139] rounded-full border border-[#3d4564]">
            <div className={`status-dot ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-300">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 -mb-px">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all rounded-t-lg
                  ${isActive
                    ? 'border-[#4a9ff5] text-[#4a9ff5] bg-[#1e2139]'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#1e2139]/50'
                  }
                `}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
