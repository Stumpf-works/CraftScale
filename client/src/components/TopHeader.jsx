/**
 * CraftScale by Stumpf.works
 * Top Header Component
 */

import React, { useState } from 'react';
import { Search, Bell, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopHeader({ isOnline }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-[#232943] border-b border-[#2e3650] sticky top-0 z-40 shadow-lg">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Produkte, Materialien suchen..."
              className="w-full pl-10 pr-4 py-2 bg-[#1e2139] border border-[#3d4564] rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#4a9ff5] focus:ring-2 focus:ring-[#4a9ff5]/20 transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Server Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e2139] rounded-full border border-[#3d4564]">
            <div className={`status-dot ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-300">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-2 rounded-lg text-gray-400 hover:bg-[#1e2139] hover:text-white transition-all"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-[#232943] border border-[#3d4564] rounded-lg shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-[#3d4564]">
                    <h3 className="font-semibold text-white">Benachrichtigungen</h3>
                  </div>
                  <div className="p-4 text-center text-gray-400 text-sm">
                    Keine neuen Benachrichtigungen
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1e2139] transition-all"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#4a9ff5] to-[#3b8ee6] rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-xs text-gray-400">Stumpf.works</p>
              </div>
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-[#232943] border border-[#3d4564] rounded-lg shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-[#3d4564]">
                    <p className="font-semibold text-white">Admin</p>
                    <p className="text-xs text-gray-400">admin@craftscale.local</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-[#1e2139] hover:text-white transition-all">
                      <SettingsIcon size={16} />
                      <span className="text-sm">Einstellungen</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-[#1e2139] hover:text-red-400 transition-all">
                      <LogOut size={16} />
                      <span className="text-sm">Abmelden</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
