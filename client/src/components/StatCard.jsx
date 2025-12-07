/**
 * CraftScale by Stumpf.works
 * Statistics Card Component
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
  subtitle
}) {
  const colorClasses = {
    blue: 'from-[#4a9ff5] to-[#3b8ee6]',
    green: 'from-[#10b981] to-[#059669]',
    purple: 'from-[#8b5cf6] to-[#7c3aed]',
    orange: 'from-[#f59e0b] to-[#d97706]',
    red: 'from-[#ef4444] to-[#dc2626]'
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-[#232943] rounded-xl p-6 border border-[#2e3650] shadow-lg hover:shadow-2xl transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>

      {trend && trendValue && (
        <div className="flex items-center gap-2">
          {trend === 'up' ? (
            <TrendingUp size={16} className="text-green-500" />
          ) : (
            <TrendingDown size={16} className="text-red-500" />
          )}
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trendValue}
          </span>
          <span className="text-sm text-gray-400">vs. letzter Monat</span>
        </div>
      )}
    </motion.div>
  );
}
