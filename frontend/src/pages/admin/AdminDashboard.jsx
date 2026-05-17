import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiDollarSign, FiUsers, FiPackage, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { getAnalytics, getAllUsers, getProducts } from '../../services/api';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <motion.div whileHover={{ y: -2 }} className="bg-[#1E1E1E] rounded-2xl p-5 border border-[#2E2E2E]">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center`} style={{ background: color + '22' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
    </div>
    <div className="text-white font-black text-2xl mb-0.5">{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
    {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAnalytics(),
      getProducts({ limit: 100 }),
    ]).then(([analyticsRes, productsRes]) => {
      setStats(analyticsRes.data.stats);
      setSalesChart(analyticsRes.data.salesChart);
      const ls = productsRes.data.products.filter(p => p.stock <= 10);
      setLowStock(ls);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#1E1E1E] rounded-2xl p-5 h-28 animate-pulse" />
      ))}
    </div>
  );

  const maxSales = salesChart.length ? Math.max(...salesChart.map(d => d.sales)) : 1;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FiShoppingBag} label="Total Orders" value={stats?.totalOrders || 0} sub={`${stats?.todayOrders || 0} today`} color="#FFD600" />
        <StatCard icon={FiDollarSign} label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} sub={`₹${(stats?.monthRevenue || 0).toLocaleString()} this month`} color="#00C853" />
        <StatCard icon={FiPackage} label="Pending Orders" value={stats?.pendingOrders || 0} sub="Need attention" color="#FF6D00" />
        <StatCard icon={FiAlertCircle} label="Low Stock" value={lowStock.length} sub="Products need restock" color="#E91E63" />
      </div>

      {/* Sales Chart */}
      <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-[#2E2E2E]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-bold text-base">Sales Last 7 Days</h3>
            <p className="text-gray-400 text-xs">Revenue trend</p>
          </div>
          <FiTrendingUp className="text-[#00C853] w-5 h-5" />
        </div>
        {salesChart.length > 0 ? (
          <div className="flex items-end gap-2 h-36">
            {salesChart.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[#FFD600] text-xs font-bold">₹{day.sales}</div>
                <motion.div
                  className="w-full bg-gradient-to-t from-[#FFD600] to-amber-400 rounded-t-lg"
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.sales / maxSales) * 100}px` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
                <div className="text-gray-400 text-xs">{day._id?.slice(5)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-36 flex items-center justify-center text-gray-500 text-sm">No sales data yet. Place some orders!</div>
        )}
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-[#2E2E2E]">
          <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
            <FiAlertCircle className="text-red-400" /> Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {lowStock.slice(0, 8).map(product => (
              <div key={product._id} className="flex items-center justify-between py-2 border-b border-[#2E2E2E] last:border-0">
                <div className="flex items-center gap-3">
                  <img src={product.images?.[0] || 'https://placehold.co/36'} alt={product.name} className="w-9 h-9 rounded-xl object-cover" />
                  <div>
                    <div className="text-white text-sm font-medium">{product.name}</div>
                    <div className="text-gray-400 text-xs">{product.unit}</div>
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-lg ${product.stock === 0 ? 'bg-red-900/30 text-red-400' : 'bg-amber-900/30 text-amber-400'}`}>
                  {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
