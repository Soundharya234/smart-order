import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiTag, FiX, FiCheck, FiGift, FiClock, FiDollarSign } from 'react-icons/fi';
import * as api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', type: 'percentage', value: '', minOrderValue: '', expiresAt: '' });

  const load = () => {
    setLoading(true);
    api.getAllCoupons().then(r => setCoupons(r.data.coupons)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.createCoupon(form);
      toast.success('Coupon created successfully!');
      setShowModal(false); load();
    } catch (e) { toast.error('Error creating coupon'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try { await api.deleteCoupon(id); toast.success('Coupon removed'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E1E1E] to-[#121212] p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD600] rounded-xl flex items-center justify-center shadow-lg shadow-[#FFD600]/20">
              <FiTag className="text-black w-5 h-5" />
            </div>
            <h2 className="text-white font-black text-2xl tracking-tight">Marketing Coupons</h2>
          </div>
          <p className="text-gray-500 font-medium ml-1">Create and manage discounts for your customers.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#FFD600] text-black px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#F9C100] transition-all flex items-center gap-2 shadow-xl shadow-[#FFD600]/10 hover:-translate-y-1">
          <FiPlus /> NEW COUPON
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-[#1E1E1E] rounded-[2.5rem] animate-pulse" />) :
          coupons.length === 0 ? (
            <div className="col-span-full py-20 bg-[#1E1E1E] rounded-[3rem] border border-dashed border-white/10 text-center">
              <FiGift className="mx-auto w-16 h-16 text-gray-700 mb-4" />
              <p className="text-gray-500 font-bold">No active coupons found. Create one to get started!</p>
            </div>
          ) : coupons.map(coupon => (
            <motion.div layout key={coupon._id} className="bg-[#1E1E1E] rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-white/5 text-9xl rotate-12 group-hover:rotate-6 transition-transform duration-500"><FiTag /></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[#FFD600] font-black text-2xl tracking-[0.15em] mb-1">{coupon.code}</div>
                  <div className={`text-[10px] font-black px-3 py-1 rounded-full inline-block ${coupon.isActive ? 'bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {coupon.isActive ? '● ACTIVE' : '● EXPIRED'}
                  </div>
                </div>
                <button onClick={() => handleDelete(coupon._id)} className="w-10 h-10 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><FiTrash2 /></button>
              </div>

              <div className="text-white font-bold text-base mb-6 leading-relaxed pr-8">{coupon.description}</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Benefit</div>
                  <div className="text-[#00C853] font-black text-lg">{coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT`}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="text-gray-500 text-[8px] font-black uppercase tracking-widest mb-1">Threshold</div>
                  <div className="text-white font-black text-lg">₹{coupon.minOrderValue || 0}+</div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-gray-500">
                <FiClock className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Valid until: {new Date(coupon.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </motion.div>
          ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:w-full md:max-w-md bg-[#121212] z-[70] shadow-2xl flex flex-col border-t md:border-t-0 md:border-l border-white/5">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-black text-2xl uppercase tracking-tight">Create Coupon</h3>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white/5 text-gray-400 rounded-xl flex items-center justify-center"><FiX className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6 flex-1 overflow-y-auto">
                <div>
                  <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">Coupon Code</label>
                  <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. WELCOME10" className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-white font-black tracking-widest text-lg focus:border-[#FFD600] transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">Reward Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold appearance-none">
                      <option value="percentage">Percentage %</option>
                      <option value="flat">Flat Amount ₹</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">Value</label>
                    <input type="number" required value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-[#00C853] font-black text-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">Min Order (₹)</label>
                    <input type="number" value={form.minOrderValue} onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))} className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">Expiry Date</label>
                    <input type="date" required value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">Offer Description</label>
                  <textarea rows="3" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Display text for customers..." className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-white font-medium text-sm" />
                </div>
                <button type="submit" className="w-full bg-[#FFD600] text-black py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#FFD600]/10 hover:-translate-y-1 transition-all mt-6">
                  GENERATE COUPON
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
