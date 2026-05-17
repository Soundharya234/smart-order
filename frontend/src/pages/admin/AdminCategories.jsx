import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiFolder, FiStar } from 'react-icons/fi';
import * as api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '', color: '#FFD600', isActive: true });

  const load = () => {
    setLoading(true);
    api.getCategories().then(r => setCategories(r.data.categories)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openModal = (cat = null) => {
    if (cat) {
      setEditing(cat);
      setForm({ name: cat.name, slug: cat.slug, icon: cat.icon, color: cat.color || '#FFD600', isActive: cat.isActive });
    } else {
      setEditing(null);
      setForm({ name: '', slug: '', icon: '', color: '#FFD600', isActive: true });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.updateCategory(editing._id, form);
      else await api.createCategory(form);
      toast.success(editing ? 'Category updated!' : 'Category created!');
      setShowModal(false); load();
    } catch (e) { toast.error('Error saving category'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Products in this category may become uncategorized.')) return;
    try { await api.deleteCategory(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E1E1E] to-[#121212] p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#00C853] rounded-xl flex items-center justify-center shadow-lg shadow-[#00C853]/20">
              <FiFolder className="text-white w-5 h-5" />
            </div>
            <h2 className="text-white font-black text-2xl tracking-tight">Category Manager</h2>
          </div>
          <p className="text-gray-500 font-medium ml-1">Organize your store structure and navigation.</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#FFD600] text-black px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#F9C100] transition-all flex items-center gap-2 shadow-xl shadow-[#FFD600]/10 hover:-translate-y-1">
          <FiPlus /> ADD CATEGORY
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 bg-[#1E1E1E] rounded-[2rem] animate-pulse" />
        )) : categories.map(cat => (
          <motion.div key={cat._id} layout className="bg-[#1E1E1E] rounded-[2rem] p-6 border border-white/5 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openModal(cat)} className="w-8 h-8 bg-[#FFD600]/10 text-[#FFD600] rounded-lg flex items-center justify-center hover:bg-[#FFD600] hover:text-black transition-all"><FiEdit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(cat._id)} className="w-8 h-8 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><FiTrash2 className="w-4 h-4" /></button>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-5xl mb-4 shadow-inner" style={{ background: (cat.color || '#FFD600') + '15', color: cat.color || '#FFD600' }}>
                {cat.icon || '📦'}
              </div>
              <h3 className="text-white font-black text-lg mb-1">{cat.name}</h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">/{cat.slug}</p>
              
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${cat.isActive ? 'bg-[#00C853]' : 'bg-gray-600'}`} />
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{cat.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-md bg-[#121212] z-[70] shadow-2xl flex flex-col border-l border-white/5">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-black text-2xl uppercase">{editing ? 'Edit Category' : 'New Category'}</h3>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white/5 text-gray-400 rounded-xl flex items-center justify-center"><FiX className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div>
                  <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Display Name</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') }))} className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-[#FFD600] transition-all" />
                </div>
                <div>
                  <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Slug URL</label>
                  <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold opacity-60" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Icon (Emoji)</label>
                    <input required value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🍎" className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-center text-2xl" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Color (Hex)</label>
                    <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-full h-[60px] bg-[#1E1E1E] border border-white/5 rounded-2xl p-2 cursor-pointer" />
                  </div>
                </div>
                <div className="flex items-center gap-4 px-2">
                  <label className="flex items-center gap-3 text-gray-400 text-sm font-black uppercase tracking-widest cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.isActive ? 'bg-[#00C853] border-[#00C853]' : 'border-white/10'}`}>
                      {form.isActive && <FiCheck className="text-black" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} /> 
                    Active Category
                  </label>
                </div>
                <button type="submit" className="w-full bg-[#FFD600] text-black py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#FFD600]/10 hover:-translate-y-1 transition-all mt-8">
                  {editing ? 'Update Category' : 'Create Category'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
