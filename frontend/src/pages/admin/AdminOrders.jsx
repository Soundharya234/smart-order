import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiSearch, FiFilter, FiUser, FiMapPin, FiChevronRight, FiPackage } from 'react-icons/fi';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['placed', 'confirmed', 'processing', 'packed', 'dispatched', 'delivered', 'cancelled'];

const STATUS_CONFIG = {
  placed: { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: FiClock },
  confirmed: { color: 'text-indigo-400', bg: 'bg-indigo-400/10', icon: FiCheckCircle },
  processing: { color: 'text-amber-400', bg: 'bg-amber-400/10', icon: FiRefreshCw },
  packed: { color: 'text-orange-400', bg: 'bg-orange-400/10', icon: FiPackage },
  dispatched: { color: 'text-[#00C853]', bg: 'bg-[#00C853]/10', icon: FiTruck },
  delivered: { color: 'text-[#00C853]', bg: 'bg-[#00C853]/10', icon: FiCheckCircle },
  cancelled: { color: 'text-red-400', bg: 'bg-red-400/10', icon: FiXCircle },
};

import { FiRefreshCw } from 'react-icons/fi';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = () => {
    setLoading(true);
    const params = {};
    if (filter) params.status = filter;
    getAllOrders(params).then(r => setOrders(r.data.orders)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, { status });
      toast.success(`Order status updated to ${status}`);
      load();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const filteredOrders = orders.filter(o => 
    o.orderId.toLowerCase().includes(search.toLowerCase()) || 
    o.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E1E1E] to-[#121212] p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD600] rounded-xl flex items-center justify-center shadow-lg shadow-[#FFD600]/20">
              <FiShoppingBag className="text-black w-5 h-5" />
            </div>
            <h2 className="text-white font-black text-2xl tracking-tight">Order Fulfillment</h2>
          </div>
          <p className="text-gray-500 font-medium ml-1">Track and manage customer orders in real-time.</p>
        </div>
        <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-8">
          <div>
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Orders</div>
            <div className="text-white font-black text-xl">{orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length}</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div>
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Revenue</div>
            <div className="text-[#00C853] font-black text-xl">₹{orders.filter(o => o.orderStatus === 'delivered').reduce((s,o) => s + o.total, 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by Order ID or Customer Name..."
            className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD600] transition-all"
          />
        </div>
        <div className="relative w-full md:w-64">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-[#FFD600] transition-all"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 bg-[#1E1E1E] rounded-[2.5rem] animate-pulse" />) :
          filteredOrders.length === 0 ? (
            <div className="bg-[#1E1E1E] rounded-[3rem] p-20 text-center border border-dashed border-white/10">
              <div className="text-6xl mb-4 grayscale opacity-20">🛒</div>
              <p className="text-gray-500 font-bold">No orders found matching your criteria.</p>
            </div>
          ) : filteredOrders.map(order => {
            const Config = STATUS_CONFIG[order.orderStatus];
            const Icon = Config.icon;
            return (
              <motion.div layout key={order._id} className="bg-[#1E1E1E] rounded-[2.5rem] p-8 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 ${Config.bg} blur-3xl opacity-20`} />
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#121212] px-4 py-2 rounded-xl border border-white/5">
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Order ID</div>
                        <div className="text-white font-black text-sm tracking-widest">#{order.orderId}</div>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${Config.bg} border ${Config.color} border-opacity-20`}>
                        <Icon className={`w-4 h-4 ${Config.color}`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${Config.color}`}>{order.orderStatus}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400"><FiUser /></div>
                        <div>
                          <div className="text-white font-black text-sm">{order.user?.name}</div>
                          <div className="text-gray-500 text-xs font-medium">{order.user?.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400"><FiMapPin /></div>
                        <div>
                          <div className="text-white font-black text-sm">{order.shippingAddress?.city}</div>
                          <div className="text-gray-500 text-xs font-medium truncate max-w-[120px]">{order.shippingAddress?.street}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] lg:h-12 lg:w-[1px] bg-white/5" />

                  <div className="flex-1">
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Order Content</div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                          <img src={item.image} alt="" className="w-6 h-6 rounded-lg object-cover" />
                          <span className="text-white font-bold text-[10px]">x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5 text-gray-500 text-[10px] font-black">
                          +{order.items.length - 3} MORE
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Total Paid</div>
                    <div className="text-white font-black text-2xl">₹{order.total}</div>
                    <div className="text-[#00C853] text-[10px] font-black uppercase tracking-widest bg-[#00C853]/10 px-2 py-0.5 rounded">{order.paymentMethod}</div>
                  </div>
                </div>

                {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                  <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap items-center gap-3">
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mr-2">Quick Update:</div>
                    {STATUSES.filter(s => !['cancelled', 'delivered', order.orderStatus].includes(s)).map(s => (
                      <button 
                        key={s} 
                        onClick={() => handleStatus(order._id, s)} 
                        disabled={updating === order._id}
                        className="bg-white/5 hover:bg-[#FFD600] text-gray-400 hover:text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
                      >
                        {s}
                      </button>
                    ))}
                    <div className="flex-1" />
                    <button 
                      onClick={() => handleStatus(order._id, 'delivered')}
                      className="bg-[#00C853]/10 hover:bg-[#00C853] text-[#00C853] hover:text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Mark Delivered
                    </button>
                    <button 
                      onClick={() => handleStatus(order._id, 'cancelled')}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-gray-500 text-[10px] font-medium italic">Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</div>
                  <button className="flex items-center gap-2 text-[#FFD600] text-[10px] font-black uppercase tracking-[0.2em] group/btn">
                    View Full Details <FiChevronRight className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })
        }
      </div>
    </div>
  );
}
