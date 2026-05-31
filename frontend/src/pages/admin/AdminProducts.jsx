import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX, FiCheck, FiFilter, FiImage, FiPackage, FiBarChart2 } from 'react-icons/fi';
import * as api from '../../services/api';
import toast from 'react-hot-toast';

const STANDARD_UNITS = [
  '1/4 kg',
  '1/2 kg',
  '1 kg',
  '2 kg',
  '3 kg',
  '4 kg',
  '5 kg',
  '6 kg',
  '7 kg',
  '8 kg',
  '9 kg',
  '10 kg',
  '250g',
  '500g',
  '1 pc',
  '6 pcs',
  '12 pcs',
  '1L',
  '500ml'
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', mrp: '', unit: '1 pc', stock: '', category: '', discount: 0, isFeatured: false, isBestSeller: false, images: [''] });

  const load = () => {
    setLoading(true);
    Promise.all([api.getProducts({ limit: 200, search, category: filterCat }), api.getCategories()])
      .then(([pr, cr]) => { 
        setProducts(pr.data.products); 
        setCategories(cr.data.categories); 
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterCat]);

  const openModal = (product = null) => {
    if (product) {
      setEditing(product);
      setForm({ 
        name: product.name, 
        price: product.price, 
        mrp: product.mrp, 
        unit: product.unit, 
        stock: product.stock, 
        category: product.category?._id || product.category, 
        discount: product.discount, 
        isFeatured: product.isFeatured, 
        isBestSeller: product.isBestSeller, 
        images: product.images?.length ? product.images : [''] 
      });
    } else {
      setEditing(null);
      setForm({ name: '', price: '', mrp: '', unit: '1 pc', stock: '', category: '', discount: 0, isFeatured: false, isBestSeller: false, images: [''] });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...form, 
        price: Number(form.price), 
        mrp: Number(form.mrp), 
        stock: Number(form.stock), 
        discount: Number(form.discount) 
      };
      if (editing) await api.updateProduct(editing._id, payload);
      else await api.createProduct(payload);
      toast.success(editing ? 'Product updated successfully!' : 'New product created!');
      setShowModal(false); 
      load();
    } catch (e) { 
      toast.error(e.response?.data?.message || 'Error saving product'); 
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try { 
      await api.deleteProduct(id); 
      toast.success('Product deleted'); 
      load(); 
    } catch { 
      toast.error('Delete failed'); 
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-[#1E1E1E] to-[#121212] p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD600] rounded-xl flex items-center justify-center shadow-lg shadow-[#FFD600]/20">
              <FiPackage className="text-black w-5 h-5" />
            </div>
            <h2 className="text-white font-black text-2xl tracking-tight">Product Catalog</h2>
          </div>
          <p className="text-gray-500 font-medium ml-1">Manage your store items, pricing, and inventory.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Items</div>
            <div className="text-white font-black text-xl">{products.length}</div>
          </div>
          <button onClick={() => openModal()} className="bg-[#FFD600] text-black px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#F9C100] transition-all flex items-center gap-2 shadow-xl shadow-[#FFD600]/10 hover:-translate-y-1">
            <FiPlus /> ADD PRODUCT
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name, SKU or tags..."
            className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD600] transition-all"
          />
        </div>
        <div className="relative w-full md:w-64">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <select 
            value={filterCat} 
            onChange={e => setFilterCat(e.target.value)}
            className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-[#FFD600] transition-all"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#1E1E1E] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Product Info</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Inventory</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Pricing</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-6 py-6"><div className="h-12 bg-white/5 rounded-2xl" /></td>
                </tr>
              )) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="text-5xl mb-4 grayscale opacity-20">📦</div>
                    <div className="text-gray-500 font-bold">No products found in this selection.</div>
                  </td>
                </tr>
              ) : products.map(product => (
                <tr key={product._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/5 shrink-0">
                        <img src={product.images?.[0] || 'https://placehold.co/48'} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-white font-black text-sm group-hover:text-[#FFD600] transition-colors">{product.name}</div>
                        <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{product.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-white/5 text-gray-400 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-white/5">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.stock <= 5 ? 'bg-red-500 animate-pulse' : product.stock <= 20 ? 'bg-amber-500' : 'bg-[#00C853]'}`} />
                      <div className="text-white font-black text-sm">{product.stock} <span className="text-gray-500 font-medium text-xs">units</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <div className="text-[#FFD600] font-black text-base">₹{product.price}</div>
                      <div className="text-gray-500 text-xs line-through font-medium opacity-50">₹{product.mrp}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {product.isFeatured && <span className="bg-[#FFD600]/10 text-[#FFD600] text-[8px] font-black px-2 py-0.5 rounded border border-[#FFD600]/20 uppercase">Featured</span>}
                      {product.isBestSeller && <span className="bg-[#00C853]/10 text-[#00C853] text-[8px] font-black px-2 py-0.5 rounded border border-[#00C853]/20 uppercase">Bestseller</span>}
                      {!product.isFeatured && !product.isBestSeller && <span className="text-gray-600 text-[8px] font-black uppercase tracking-widest">– Standard –</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(product)} className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-[#FFD600]/10 text-gray-400 hover:text-[#FFD600] rounded-xl transition-all"><FiEdit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(product._id)} className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-all"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Drawer */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#121212] z-[70] shadow-2xl flex flex-col border-l border-white/5"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-black text-2xl uppercase tracking-tight">{editing ? 'Edit Product' : 'Add New Product'}</h3>
                  <p className="text-gray-500 text-sm font-medium mt-1">{editing ? 'Modify existing catalog entry.' : 'Fill in the details to list a new item.'}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl flex items-center justify-center transition-all">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-none">
                {/* Image Section */}
                <div className="bg-[#1E1E1E] rounded-[2rem] p-6 border border-white/5">
                  <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block ml-1">Product Media</label>
                  <div className="flex gap-6 items-start">
                    <div className="w-32 h-32 rounded-[2rem] bg-[#121212] border border-dashed border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {form.images[0] ? (
                        <img src={form.images[0]} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <FiImage className="text-gray-600 w-10 h-10" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-gray-500 text-xs font-medium">Enter a direct image URL for the product. Highly recommended: 400x400 transparent background.</p>
                      <input 
                        type="text" 
                        placeholder="https://example.com/image.png" 
                        required
                        value={form.images[0]} 
                        onChange={e => setForm(f => ({ ...f, images: [e.target.value] }))}
                        className="w-full bg-[#121212] border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#FFD600] transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">Product Name</label>
                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#FFD600] transition-all" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">Category</label>
                    <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#FFD600] transition-all appearance-none">
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">Unit Weight/Qty</label>
                    <select 
                      value={STANDARD_UNITS.includes(form.unit) ? form.unit : 'custom'} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setForm(f => ({ ...f, unit: '' }));
                        } else {
                          setForm(f => ({ ...f, unit: val }));
                        }
                      }}
                      className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#FFD600] transition-all appearance-none mb-3"
                    >
                      <option value="1/4 kg">1/4 kg (250g)</option>
                      <option value="1/2 kg">1/2 kg (500g)</option>
                      <option value="1 kg">1 kg</option>
                      <option value="2 kg">2 kg</option>
                      <option value="3 kg">3 kg</option>
                      <option value="4 kg">4 kg</option>
                      <option value="5 kg">5 kg</option>
                      <option value="6 kg">6 kg</option>
                      <option value="7 kg">7 kg</option>
                      <option value="8 kg">8 kg</option>
                      <option value="9 kg">9 kg</option>
                      <option value="10 kg">10 kg</option>
                      <option value="250g">250g</option>
                      <option value="500g">500g</option>
                      <option value="1 pc">1 pc</option>
                      <option value="6 pcs">6 pcs</option>
                      <option value="12 pcs">12 pcs</option>
                      <option value="1L">1 Liter</option>
                      <option value="500ml">500 ml</option>
                      <option value="custom">Custom...</option>
                    </select>
                    
                    {(!STANDARD_UNITS.includes(form.unit) || form.unit === '') && (
                      <input 
                        type="text" 
                        placeholder="Type custom weight/qty (e.g. 250g)" 
                        required 
                        value={form.unit} 
                        onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                        className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#FFD600] transition-all" 
                      />
                    )}
                  </div>
                </div>

                {/* Inventory & Pricing */}
                <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 grid grid-cols-2 gap-6">
                  <div className="col-span-2 flex items-center gap-3 mb-2">
                    <FiBarChart2 className="text-[#FFD600]" />
                    <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Inventory & Pricing</h4>
                  </div>
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">Stock Level</label>
                    <input type="number" required value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      className="w-full bg-[#121212] border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#FFD600] transition-all" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">Discount (%)</label>
                    <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                      className="w-full bg-[#121212] border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-[#00C853] focus:outline-none focus:border-[#FFD600] transition-all" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">Sale Price (₹)</label>
                    <input type="number" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full bg-[#121212] border border-white/5 rounded-2xl px-5 py-4 text-sm font-black text-[#FFD600] focus:outline-none focus:border-[#FFD600] transition-all" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 block ml-1">Market Price / MRP (₹)</label>
                    <input type="number" required value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))}
                      className="w-full bg-[#121212] border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-gray-500 focus:outline-none focus:border-[#FFD600] transition-all" />
                  </div>
                </div>

                {/* Flags */}
                <div className="flex gap-6 px-4">
                  <label className="flex items-center gap-3 text-gray-400 text-sm font-black uppercase tracking-widest cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.isFeatured ? 'bg-[#FFD600] border-[#FFD600]' : 'border-white/10 group-hover:border-white/20'}`}>
                      {form.isFeatured && <FiCheck className="text-black" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} /> 
                    Featured
                  </label>
                  <label className="flex items-center gap-3 text-gray-400 text-sm font-black uppercase tracking-widest cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.isBestSeller ? 'bg-[#00C853] border-[#00C853]' : 'border-white/10 group-hover:border-white/20'}`}>
                      {form.isBestSeller && <FiCheck className="text-black" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={form.isBestSeller} onChange={e => setForm(f => ({ ...f, isBestSeller: e.target.checked }))} /> 
                    Bestseller
                  </label>
                </div>

                <div className="pt-6">
                  <button type="submit" className="w-full bg-[#FFD600] text-black py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-[#F9C100] transition-all shadow-2xl shadow-[#FFD600]/10 flex items-center justify-center gap-3">
                    {editing ? <><FiEdit /> UPDATE PRODUCT</> : <><FiPlus /> CREATE PRODUCT</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
