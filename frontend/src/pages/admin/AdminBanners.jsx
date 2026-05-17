import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiImage, FiArrowRight } from 'react-icons/fi';
import * as api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '/products', badgeText: '', isActive: true });

  const load = () => {
    setLoading(true);
    api.getBanners().then(r => setBanners(r.data.banners || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openModal = (banner = null) => {
    if (banner) {
      setEditing(banner);
      setForm({ title: banner.title, subtitle: banner.subtitle, image: banner.image, link: banner.link, badgeText: banner.badgeText, isActive: banner.isActive });
    } else {
      setEditing(null);
      setForm({ title: '', subtitle: '', image: '', link: '/products', badgeText: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.updateBanner(editing._id, form);
      else await api.createBanner(form);
      toast.success('Banner saved!');
      setShowModal(false); load();
    } catch (e) { toast.error('Error saving banner'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete banner?')) return;
    try { await api.deleteBanner(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6 ml-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E1E1E] to-[#121212] p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <FiImage className="text-white w-5 h-5" />
            </div>
            <h2 className="text-white font-black text-2xl tracking-tight">Banner Management</h2>
          </div>
          <p className="text-gray-500 font-medium ml-1">Customize the hero carousel and promotions.</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#FFD600] text-black px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#F9C100] transition-all flex items-center gap-2 shadow-xl shadow-[#FFD600]/10 hover:-translate-y-1">
          <FiPlus /> ADD BANNER
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-64 bg-[#1E1E1E] rounded-[2rem] animate-pulse" />
        )) : banners.map(banner => (
          <div key={banner._id} className="bg-[#1E1E1E] rounded-[2.5rem] border border-white/5 overflow-hidden group">
            <div className="relative h-48">
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/60 flex items-center px-8">
                <div>
                  {banner.badgeText && <span className="bg-[#FFD600] text-black text-[10px] font-black px-3 py-1 rounded-full mb-2 inline-block uppercase tracking-widest">{banner.badgeText}</span>}
                  <h3 className="text-white font-black text-xl mb-1">{banner.title}</h3>
                  <p className="text-gray-300 text-sm font-medium">{banner.subtitle}</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => openModal(banner)} className="w-10 h-10 bg-white/10 backdrop-blur text-white rounded-xl flex items-center justify-center hover:bg-[#FFD600] hover:text-black transition-all shadow-lg"><FiEdit /></button>
                <button onClick={() => handleDelete(banner._id)} className="w-10 h-10 bg-white/10 backdrop-blur text-white rounded-xl flex items-center justify-center hover:bg-red-500 transition-all shadow-lg"><FiTrash2 /></button>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${banner.isActive ? 'bg-[#00C853]' : 'bg-gray-600'}`} />
                <span className="text-gray-400 text-xs font-black uppercase tracking-widest">{banner.isActive ? 'Displayed on Site' : 'Hidden'}</span>
              </div>
              <div className="text-gray-500 text-xs font-medium italic">{banner.link}</div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#121212] z-[70] shadow-2xl flex flex-col border-l border-white/5">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-black text-2xl uppercase tracking-tight">{editing ? 'Edit Banner' : 'New Banner'}</h3>
                <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-white/5 text-gray-400 rounded-2xl flex items-center justify-center"><FiX className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div>
                  <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Banner Title</label>
                  <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Fresh Fruits Sale" className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-[#FFD600] transition-all" />
                </div>
                <div>
                  <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Subtitle / Description</label>
                  <input required value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="e.g. Up to 40% OFF on all items" className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-[#FFD600] transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Badge Text (Optional)</label>
                    <input value={form.badgeText} onChange={e => setForm(f => ({ ...f, badgeText: e.target.value.toUpperCase() }))} placeholder="e.g. LIMITED" className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Redirect Link</label>
                    <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="/products" className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Background Image URL</label>
                  <div className="space-y-4">
                    <input required value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-[#FFD600] transition-all" />
                    {form.image && (
                      <div className="w-full h-40 rounded-2xl overflow-hidden border border-white/5">
                        <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 px-2">
                  <label className="flex items-center gap-3 text-gray-400 text-sm font-black uppercase tracking-widest cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.isActive ? 'bg-[#00C853] border-[#00C853]' : 'border-white/10'}`}>
                      {form.isActive && <FiCheck className="text-black" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                    Live on Homepage
                  </label>
                </div>
                <button type="submit" className="w-full bg-[#FFD600] text-black py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#FFD600]/10 hover:-translate-y-1 transition-all mt-8">
                  {editing ? 'Update Banner' : 'Publish Banner'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
