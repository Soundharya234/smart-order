import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import { getBanners } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton, CategorySkeleton } from '../components/Skeleton';
import { FiArrowRight, FiClock, FiShield, FiRefreshCw, FiChevronRight } from 'react-icons/fi';

const CATEGORY_ICONS = { 'fresh-vegetables': '🥦', 'fresh-fruits': '🍎', 'dairy-eggs': '🥛', 'snacks': '🍿', 'beverages': '🧃', 'instant-foods': '🍜', 'bakery': '🍞', 'staples': '🌾' };

const features = [
  { icon: '⚡', title: '15 Min Delivery', desc: 'Ultra-fast to your door', color: '#FFD600' },
  { icon: '🌿', title: 'Farm Fresh', desc: 'Directly from farms', color: '#00C853' },
  { icon: '💯', title: 'Best Prices', desc: 'Guaranteed lowest price', color: '#2979FF' },
  { icon: '🔄', title: 'Easy Returns', desc: '100% hassle-free', color: '#E91E63' },
];

const offerBanners = [
  { title: 'Fresh Vegetables', subtitle: 'Up to 40% OFF', emoji: '🥦', bg: 'from-green-500 to-emerald-700', badge: 'NEW ARRIVALS' },
  { title: 'Premium Fruits', subtitle: 'Starting ₹29', emoji: '🍎', bg: 'from-orange-400 to-red-600', badge: 'BESTSELLERS' },
  { title: 'Dairy & Eggs', subtitle: 'Farm to Table', emoji: '🥛', bg: 'from-blue-500 to-indigo-700', badge: 'DAILY FRESH' },
  { title: 'Snacks & More', subtitle: 'Grab & Go Deals', emoji: '🍿', bg: 'from-yellow-400 to-amber-600', badge: 'HOT DEALS' },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const { items: products, categories, loading } = useSelector(s => s.products);
  const [banners, setBanners] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    dispatch(fetchProducts({ limit: 24 }));
    dispatch(fetchCategories());
    getBanners().then(r => setBanners(r?.data?.banners || [])).catch(() => setBanners([]));
  }, [dispatch]);

  const featured = (products || []).filter(p => p?.isFeatured).slice(0, 8);
  const bestsellers = (products || []).filter(p => p?.isBestSeller).slice(0, 8);
  const filtered = activeCategory === 'all' 
    ? (products || []).slice(0, 16) 
    : (products || []).filter(p => p?.category?.slug === activeCategory || p?.category === activeCategory).slice(0, 16);

  return (
    <main className="pt-24 md:pt-32 min-h-screen bg-white overflow-hidden font-sans">
      {/* Hero Section */}
      <section className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="rounded-[1.5rem] overflow-hidden shadow-sm"
        >
          {banners.length > 0 ? banners.map(b => (
            <SwiperSlide key={b._id}>
              <div className="relative h-48 md:h-[340px] bg-gradient-to-r from-emerald-800 to-emerald-600">
                <img src={b.image} alt={b.title} className="absolute right-0 bottom-0 h-full w-2/3 object-cover object-right mix-blend-overlay opacity-80" />
                <div className="absolute inset-0 flex items-center px-8 md:px-16">
                  <div className="max-w-xl z-10">
                    <h2 className="text-white text-3xl md:text-5xl font-bold mb-3 md:mb-4 leading-tight">{b.title}</h2>
                    <p className="text-white/90 text-sm md:text-xl mb-6 md:mb-8 font-medium">{b.subtitle}</p>
                    <Link to="/products" className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all inline-flex items-center shadow-md">
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          )) : (
            <SwiperSlide>
              <div className="relative h-56 md:h-[340px] bg-[#3B7B44] overflow-hidden flex items-center px-8 md:px-16">
                <div className="absolute right-0 bottom-0 w-1/2 md:w-[60%] h-full opacity-90" style={{ background: 'url(https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80) right/cover no-repeat', maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }} />
                <div className="relative z-10 max-w-lg">
                  <h2 className="text-white text-3xl md:text-[2.75rem] font-bold mb-3 leading-[1.15]">Stock up on daily essentials</h2>
                  <p className="text-white/90 text-sm md:text-xl mb-6 md:mb-8 font-medium">Get farm-fresh goodness & a range of exotic fruits, vegetables, eggs & more</p>
                  <Link to="/products" className="bg-white text-gray-900 px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all inline-flex shadow-sm">
                    Shop Now
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </section>

      {/* Offer Banners Row (3 Columns) */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -4 }} className="bg-[#00A59C] rounded-[1.5rem] p-6 md:p-8 cursor-pointer relative overflow-hidden h-48 md:h-[220px] flex flex-col justify-between group shadow-sm">
            <div className="absolute right-[-10%] bottom-[-20%] w-[60%] h-full opacity-60 text-[100px] leading-none" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}>💊</div>
            <div className="relative z-10 max-w-[65%]">
              <h3 className="text-white font-bold text-2xl md:text-[1.75rem] leading-tight mb-2">Pharmacy at your doorstep!</h3>
              <p className="text-white/90 text-xs md:text-sm mb-4">Cough syrups, pain relief sprays & more</p>
            </div>
            <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-xs w-fit shadow-sm hover:bg-gray-50 z-10 relative">Order Now</button>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="bg-[#F5B53B] rounded-[1.5rem] p-6 md:p-8 cursor-pointer relative overflow-hidden h-48 md:h-[220px] flex flex-col justify-between group shadow-sm">
            <div className="absolute right-[-10%] bottom-[-20%] w-[60%] h-full opacity-60 text-[100px] leading-none" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}>🐶</div>
            <div className="relative z-10 max-w-[65%]">
              <h3 className="text-gray-900 font-bold text-2xl md:text-[1.75rem] leading-tight mb-2">Pet care supplies at your door</h3>
              <p className="text-gray-800 text-xs md:text-sm mb-4">Food, treats, toys & more</p>
            </div>
            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-xs w-fit shadow-sm hover:bg-gray-900 z-10 relative">Order Now</button>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="bg-[#D1DCEF] rounded-[1.5rem] p-6 md:p-8 cursor-pointer relative overflow-hidden h-48 md:h-[220px] flex flex-col justify-between group shadow-sm">
            <div className="absolute right-[-10%] bottom-[-20%] w-[60%] h-full opacity-60 text-[100px] leading-none" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}>🍼</div>
            <div className="relative z-10 max-w-[70%]">
              <h3 className="text-gray-900 font-bold text-2xl md:text-[1.75rem] leading-tight mb-2">No time for a diaper run?</h3>
              <p className="text-gray-800 text-xs md:text-sm mb-4">Get baby care essentials</p>
            </div>
            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-xs w-fit shadow-sm hover:bg-gray-900 z-10 relative">Order Now</button>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900 font-bold text-xl md:text-2xl">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-4 md:gap-6">
          {categories && categories.length > 0 ? categories.slice(0, 10).map(cat => (
            <motion.div key={cat?._id || Math.random()} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-3 cursor-pointer group"
              onClick={() => cat?.slug && setActiveCategory(cat.slug === activeCategory ? 'all' : cat.slug)}>
              <div className="w-16 h-16 md:w-24 md:h-24 bg-[#F4F6F9] rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-sm hover:shadow-md transition-shadow">
                <span>{cat?.icon || CATEGORY_ICONS[cat?.slug] || '🛒'}</span>
              </div>
              <span className="text-[10px] md:text-xs font-semibold text-center leading-tight text-gray-700">
                {cat?.name?.replace('Fresh ', '') || 'Category'}
              </span>
            </motion.div>
          )) : Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-200 rounded-2xl"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900 font-bold text-2xl">Featured Products</h2>
          <Link to="/products?featured=true" className="text-[#0C831F] font-semibold text-sm hover:underline flex items-center gap-1">
            See all <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-stretch">
          {loading ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />) :
            featured.slice(0, 6).map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900 font-bold text-2xl">Bestsellers</h2>
          <Link to="/products?bestseller=true" className="text-[#0C831F] font-semibold text-sm hover:underline flex items-center gap-1">
            See all <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-stretch">
          {loading ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />) :
            bestsellers.slice(0, 6).map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* All Products with Category Filter */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-gray-900 font-bold text-2xl">All Fresh Products</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
            <button onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === 'all' ? 'bg-[#0C831F] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              All
            </button>
            {(categories || []).map(cat => (
              <button key={cat?._id || Math.random()} onClick={() => cat?.slug && setActiveCategory(cat.slug === activeCategory ? 'all' : cat.slug)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat?.slug ? 'bg-[#0C831F] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {cat?.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 items-stretch">
          {loading ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />) :
            filtered.slice(0, 12).map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* App Banner */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 pb-16">
        <div className="bg-[#f8f8f8] border border-gray-200 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-gray-900 text-3xl font-black mb-2 tracking-tight">Get the QuickPick app</h2>
            <p className="text-gray-600 font-medium">Get the best QuickPick experience on your mobile device</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-sm">
              <span className="text-2xl">🍎</span> App Store
            </button>
            <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-sm">
              <span className="text-2xl">▶</span> Google Play
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
