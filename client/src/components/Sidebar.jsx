/**
 * CraftScale by Stumpf.works
 * Sidebar Navigation Component
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Scale,
  Package,
  Beaker,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'weigh', label: 'Wiegen', icon: Scale, path: '/weigh' },
  { id: 'products', label: 'Produkte', icon: Package, path: '/products' },
  { id: 'materials', label: 'Materialien', icon: Beaker, path: '/materials' },
  { id: 'export', label: 'Export', icon: Download, path: '/export' },
  { id: 'settings', label: 'Einstellungen', icon: Settings, path: '/settings' }
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      className="bg-[#1a1e3a] h-screen sticky top-0 border-r border-[#2e3650] flex flex-col shadow-2xl"
    >
      {/* Logo & Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#2e3650]">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#4a9ff5] to-[#3b8ee6] rounded-lg flex items-center justify-center shadow-lg">
                <Scale size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">CraftScale</h1>
                <p className="text-xs text-gray-400">stumpfWORKS</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-[#4a9ff5] to-[#3b8ee6] rounded-lg flex items-center justify-center shadow-lg mx-auto">
            <Scale size={20} className="text-white" />
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-[#4a9ff5] to-[#3b8ee6] text-white shadow-lg shadow-[#4a9ff5]/30'
                      : 'text-gray-400 hover:bg-[#232943] hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} className={isCollapsed ? '' : 'flex-shrink-0'} />

                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium text-sm whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-[#2e3650]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-[#232943] hover:text-white transition-all"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <>
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Minimieren</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Info */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-[#2e3650]"
          >
            <p className="text-xs text-gray-500 text-center">
              © 2025 Stumpf.works
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
