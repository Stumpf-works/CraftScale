/**
 * CraftScale by Stumpf.works
 * Dashboard Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { useWeight } from '../hooks/useWeight';
import StatCard from '../components/StatCard';
import {
  Package,
  Beaker,
  Euro,
  Scale,
  Plus,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const { weight, raw } = useWeight();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalMaterials: 0,
    totalValue: 0,
    avgSellingPrice: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [materialUsage, setMaterialUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [productsRes, materialsRes] = await Promise.all([
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/materials`)
      ]);

      const products = productsRes.data;
      const materials = materialsRes.data;

      // Calculate stats
      const totalValue = products.reduce((sum, p) => sum + (p.selling_price || 0), 0);
      const avgSellingPrice = products.length > 0 ? totalValue / products.length : 0;

      setStats({
        totalProducts: products.length,
        totalMaterials: materials.length,
        totalValue: totalValue.toFixed(2),
        avgSellingPrice: avgSellingPrice.toFixed(2)
      });

      // Recent products (last 5)
      const recent = products
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentProducts(recent);

      // Material usage for pie chart
      const materialUsageData = materials
        .map(m => ({
          name: m.name,
          value: m.stock_quantity || 0
        }))
        .filter(m => m.value > 0)
        .slice(0, 5);
      setMaterialUsage(materialUsageData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  }

  // Cost distribution chart data (mock for now)
  const costDistribution = [
    { name: 'Material', value: 35 },
    { name: 'Arbeit', value: 45 },
    { name: 'Fixkosten', value: 20 }
  ];

  const COLORS = ['#4a9ff5', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Lade Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Gesamt Produkte"
          value={stats.totalProducts}
          icon={Package}
          color="blue"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Materialien"
          value={stats.totalMaterials}
          icon={Beaker}
          color="green"
          trend="up"
          trendValue="+5%"
        />
        <StatCard
          title="Gesamtwert"
          value={`€${stats.totalValue}`}
          icon={Euro}
          color="purple"
          subtitle="Verkaufspreis gesamt"
        />
        <StatCard
          title="Ø Verkaufspreis"
          value={`€${stats.avgSellingPrice}`}
          icon={TrendingUp}
          color="orange"
          subtitle="Pro Produkt"
        />
      </div>

      {/* Row 2: Live Weight + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Weight Widget */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#232943] rounded-xl p-6 border border-[#2e3650] shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4a9ff5] to-[#3b8ee6] rounded-lg flex items-center justify-center shadow-lg">
              <Scale size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Live Gewicht</h3>
              <p className="text-xs text-gray-400">Aktuelle Messung</p>
            </div>
          </div>

          <div className="text-center py-6">
            <div className="text-5xl font-bold text-[#4a9ff5] mb-2">
              {weight.toFixed(1)}
              <span className="text-2xl text-gray-400 ml-2">g</span>
            </div>
            <div className="text-sm text-gray-500">
              RAW: <span className="font-mono">{raw}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/weigh')}
            className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-[#4a9ff5] to-[#3b8ee6] text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Zur Waage
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Cost Distribution Pie Chart */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#232943] rounded-xl p-6 border border-[#2e3650] shadow-lg lg:col-span-2"
        >
          <h3 className="text-lg font-bold text-white mb-4">Kostenverteilung</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={costDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {costDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#232943',
                  border: '1px solid #3d4564',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 3: Recent Products + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products */}
        <div className="lg:col-span-2 bg-[#232943] rounded-xl p-6 border border-[#2e3650] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Neueste Produkte</h3>
            <button
              onClick={() => navigate('/products')}
              className="text-sm text-[#4a9ff5] hover:text-[#3b8ee6] font-medium flex items-center gap-1"
            >
              Alle anzeigen
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {recentProducts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Noch keine Produkte vorhanden</p>
            ) : (
              recentProducts.map(product => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-[#1e2139] hover:bg-[#252a47] transition-all cursor-pointer"
                  onClick={() => navigate('/products')}
                >
                  {product.photo ? (
                    <img
                      src={`${API_BASE.replace('/api', '')}/uploads/${product.photo}`}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#2e3650] flex items-center justify-center">
                      <Package size={20} className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-white">{product.name}</p>
                    <p className="text-sm text-gray-400">{product.weight}g</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#4a9ff5]">€{product.selling_price}</p>
                    <p className="text-xs text-gray-500">Kosten: €{product.total_cost}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#232943] rounded-xl p-6 border border-[#2e3650] shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4">Schnellzugriff</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/products')}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#4a9ff5] to-[#3b8ee6] text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Neues Produkt
            </button>
            <button
              onClick={() => navigate('/materials')}
              className="w-full px-4 py-3 bg-[#1e2139] text-white font-medium rounded-lg hover:bg-[#252a47] transition-all flex items-center justify-center gap-2 border border-[#3d4564]"
            >
              <Plus size={18} />
              Material hinzufügen
            </button>
            <button
              onClick={() => navigate('/weigh')}
              className="w-full px-4 py-3 bg-[#1e2139] text-white font-medium rounded-lg hover:bg-[#252a47] transition-all flex items-center justify-center gap-2 border border-[#3d4564]"
            >
              <Scale size={18} />
              Wiegen
            </button>
            <button
              onClick={() => navigate('/export')}
              className="w-full px-4 py-3 bg-[#1e2139] text-white font-medium rounded-lg hover:bg-[#252a47] transition-all flex items-center justify-center gap-2 border border-[#3d4564]"
            >
              Daten exportieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
