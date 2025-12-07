/**
 * CraftScale by Stumpf.works
 * Main Layout Wrapper
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { ChevronRight } from 'lucide-react';

const pageNames = {
  '/': 'Dashboard',
  '/weigh': 'Wiegen',
  '/products': 'Produkte',
  '/materials': 'Materialien',
  '/export': 'Export',
  '/settings': 'Einstellungen'
};

export default function MainLayout({ children, isOnline }) {
  const location = useLocation();
  const currentPage = pageNames[location.pathname] || 'Dashboard';

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'App', path: '/' },
    { label: currentPage, path: location.pathname }
  ];

  return (
    <div className="flex h-screen bg-[#151929] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <TopHeader isOnline={isOnline} />

        {/* Breadcrumbs & Page Title */}
        <div className="px-6 py-4 border-b border-[#2e3650] bg-[#1a1e3a]">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm mb-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && <ChevronRight size={14} className="text-gray-500" />}
                <span
                  className={
                    index === breadcrumbs.length - 1
                      ? 'text-[#4a9ff5] font-medium'
                      : 'text-gray-500 hover:text-gray-300 cursor-pointer'
                  }
                >
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Page Title */}
          <h1 className="text-2xl font-bold text-white">{currentPage}</h1>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
