/**
 * CraftScale by Stumpf.works
 * Navigation Component
 */

import React from 'react';
import { Scale, Package, Flask, Download } from 'lucide-react';

const tabs = [
  { id: 'weigh', label: 'Wiegen', icon: Scale },
  { id: 'products', label: 'Produkte', icon: Package },
  { id: 'materials', label: 'Materialien', icon: Flask },
  { id: 'export', label: 'Export', icon: Download }
];

export default function Navbar({ activeTab, onTabChange, isOnline }) {
  return (
    <nav className="glass-card sticky top-0 z-50 mb-6">
      <div className="px-6 py-4">
        {/* Logo & Status */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
              ⚖️ CraftScale
            </h1>
            <p className="text-sm text-gray-500 mt-1">by Stumpf.works</p>
          </div>

          {/* Server Status */}
          <div className="flex items-center gap-2">
            <div className={`status-dot ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
                  ${isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
