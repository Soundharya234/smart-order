import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTruck } from 'react-icons/fi';
import { getMyOrders, cancelOrder } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  placed: { label: 'Order Placed', color: 'text-blue-500', bg: 'bg-blue-50', icon: FiPackage },
  confirmed: { label: 'Confirmed', color: 'text-indigo-500', bg: 'bg-indigo-50', icon: FiCheckCircle },
  processing: { label: 'Processing', color: 'text-amber-500', bg: 'bg-amber-50', icon: FiClock },
  packed: { label: 'Packed', color: 'text-orange-500', bg: 'bg-orange-50', icon: FiPackage },
  dispatched: { label: 'On the Way', color: 'text-[#00C853]', bg: 'bg-green-50', icon: FiTruck },
  delivered: { label: 'Delivered', color: 'text-[#00C853]', bg: 'bg-green-50', icon: FiCheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50', icon: FiXCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then(r => setOrders(r.data.orders)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    try {
      await cancelOrder(id);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: 'cancelled' } : o));
      toast.success('Order cancelled');
    } catch { toast.error('Cannot cancel at this stage'); }
  };

  if (loading) return (
    <div className="pt-24 min-h-screen flex items-center justify-center bg-[#F8F8F8]">
      <div className="text-center"><div className="text-4xl mb-4 animate-bounce">📦</div><p className="text-gray-500">Loading orders...</p></div>
    </div>
  );

  return (
    <main className="pt-24 min-h-screen bg-[#F8F8F8]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-gray-900 font-black text-2xl mb-6">My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 font-medium text-lg">No orders yet</p>
            <p className="text-gray-400 text-sm">Start shopping to see your orders here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.placed;
              const Icon = cfg.icon;
              return (
                <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-bold text-gray-900 text-sm">#{order.orderId}</div>
                      <div className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" /> {cfg.label}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.slice(0, 3).map(item => (
                      <div key={item._id} className="flex items-center gap-3">
                        <img src={item.image || 'https://placehold.co/40'} alt={item.name} className="w-10 h-10 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
                          <div className="text-gray-400 text-xs">x{item.quantity} · ₹{item.price}</div>
                        </div>
                        <div className="font-semibold text-sm text-gray-900">₹{item.price * item.quantity}</div>
                      </div>
                    ))}
                    {order.items.length > 3 && <p className="text-gray-400 text-xs">+{order.items.length - 3} more items</p>}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                    <div className="text-gray-900 font-black text-base">Total: ₹{order.total}</div>
                    <div className="flex gap-2">
                      <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl capitalize">
                        {order.paymentMethod === 'cod' ? '💵 COD' : '💳 Online'}
                      </div>
                      {['placed', 'confirmed'].includes(order.orderStatus) && (
                        <button onClick={() => handleCancel(order._id)}
                          className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-xl font-semibold hover:bg-red-100 transition-all">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {order.orderStatus !== 'cancelled' && (
                    <div className="mt-4">
                      <div className="flex gap-1">
                        {['placed', 'confirmed', 'packed', 'dispatched', 'delivered'].map((step, i) => {
                          const steps = ['placed', 'confirmed', 'processing', 'packed', 'dispatched', 'delivered'];
                          const current = steps.indexOf(order.orderStatus);
                          const thisStep = steps.indexOf(step);
                          return (
                            <div key={step} className={`flex-1 h-1.5 rounded-full transition-all ${thisStep <= current ? 'bg-[#00C853]' : 'bg-gray-100'}`} />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
