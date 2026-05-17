import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiGrid, FiList, FiChevronDown } from 'react-icons/fi';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, categories, loading, total } = useSelector(s => s.products);
  const [sort, setSort] = useState('newest');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = { sort, page, limit: 20 };
    if (selectedCat) params.category = selectedCat;
    if (search) params.search = search;
    if (searchParams.get('featured')) params.featured = true;
    if (searchParams.get('bestseller')) params.bestseller = true;
    dispatch(fetchProducts(params));
  }, [dispatch, sort, selectedCat, search, page, searchParams]);

  return (
    <main className="pt-24 md:pt-32 min-h-screen bg-[#F8F8F8]">
      <div className="page-container pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between mb-10">
          <div>
            <h1 className="text-gray-900 font-black text-3xl mb-2">Explore Products</h1>
            <p className="text-gray-500 font-medium">{total} items found in our store</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-[#FFD600]/10 appearance-none shadow-sm pr-12 transition-all">
                <option value="newest">Newest First</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 sticky top-32 shadow-sm">
              <h3 className="font-black text-gray-900 mb-6 text-sm uppercase tracking-widest">Categories</h3>
              <div className="space-y-2">
                <button onClick={() => { setSelectedCat(''); setPage(1); }}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${!selectedCat ? 'bg-[#FFD600] text-black shadow-lg shadow-[#FFD600]/20' : 'text-gray-500 hover:bg-gray-50'}`}>
                  All Products
                </button>
                {categories.map(cat => (
                  <button key={cat._id} onClick={() => { setSelectedCat(cat._id); setPage(1); }}
                    className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${selectedCat === cat._id ? 'bg-[#FFD600] text-black shadow-lg shadow-[#FFD600]/20' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <span className="mr-3">{cat.icon}</span> {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile category filter */}
            <div className="md:hidden mb-8">
              <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between font-black text-xs uppercase tracking-widest text-gray-700 shadow-sm">
                <div className="flex items-center gap-2">
                  <FiFilter className="text-[#FFD600]" /> {selectedCat ? categories.find(c => c._id === selectedCat)?.name : 'All Categories'}
                </div>
                <FiChevronDown className={`transition-transform duration-300 ${showMobileFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {showMobileFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-white border-x border-b border-gray-100 rounded-b-2xl overflow-hidden shadow-xl -mt-2 pt-2">
                  <div className="p-4 space-y-1">
                    <button onClick={() => { setSelectedCat(''); setPage(1); setShowMobileFilters(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold ${!selectedCat ? 'bg-[#FFD600]/10 text-[#FFD600]' : 'text-gray-500'}`}>
                      All Products
                    </button>
                    {categories.map(cat => (
                      <button key={cat._id} onClick={() => { setSelectedCat(cat._id); setPage(1); setShowMobileFilters(false); }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold ${selectedCat === cat._id ? 'bg-[#FFD600]/10 text-[#FFD600]' : 'text-gray-500'}`}>
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 items-stretch">
              {loading ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />) :
                items.length === 0 ? (
                  <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border border-gray-100">
                    <div className="text-8xl mb-6 grayscale opacity-20">🔍</div>
                    <h3 className="text-gray-900 font-black text-xl mb-2">No products found</h3>
                    <p className="text-gray-400 font-medium mb-8">Try adjusting your filters or search terms</p>
                    <button onClick={() => { setSelectedCat(''); setSearch(''); }} className="bg-[#121212] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Clear All Filters</button>
                  </div>
                ) : items.map(p => <ProductCard key={p._id} product={p} />)
              }
            </div>

            {/* Pagination */}
            {!loading && items.length > 0 && (
              <div className="flex justify-center items-center gap-6 mt-16">
                <button disabled={page === 1} onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                  className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-[#FFD600] hover:text-[#FFD600] transition-all bg-white shadow-sm">
                  ←
                </button>
                <div className="text-sm font-black text-gray-900 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                  Page {page} <span className="text-gray-300 mx-2">/</span> {Math.ceil(total / 20)}
                </div>
                <button disabled={page >= Math.ceil(total / 20)} onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                  className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-[#FFD600] hover:text-[#FFD600] transition-all bg-white shadow-sm">
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
