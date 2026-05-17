import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiSearch, FiUser, FiMapPin, FiLogOut, FiPackage, FiHeart, FiMenu, FiX, FiChevronRight } from 'react-icons/fi';
import { toggleCart } from '../store/slices/cartSlice';
import { logout } from '../store/slices/authSlice';
import { searchSuggestions } from '../services/api';
import toast from 'react-hot-toast';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length >= 2) {
        try {
          const { data } = await searchSuggestions(search);
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        } catch { setSuggestions([]); }
      } else {
        setSuggestions([]); setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${search}`);
      setShowSuggestions(false);
      setMobileMenuOpen(false);
    }
  };

  const categories = [
    { name: 'Vegetables', slug: 'fresh-vegetables', icon: '🥦' },
    { name: 'Fruits', slug: 'fresh-fruits', icon: '🍎' },
    { name: 'Dairy', slug: 'dairy-eggs', icon: '🥛' },
    { name: 'Snacks', slug: 'snacks', icon: '🍿' },
    { name: 'Beverages', slug: 'beverages', icon: '🧃' },
    { name: 'Instant', slug: 'instant-foods', icon: '🍜' },
    { name: 'Bakery', slug: 'bakery', icon: '🍞' },
    { name: 'Staples', slug: 'staples', icon: '🌾' },
  ];

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-gray-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20 gap-4 md:gap-8">
            {/* Mobile Menu Trigger */}
            <button
              className="md:hidden text-gray-800 p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <FiMenu className="w-6 h-6" />
            </button>

            {/* Logo & Location */}
            <div className="flex items-center h-full shrink-0">
              <Link to="/" className="flex items-center pr-8 border-r border-gray-100 h-full py-5 hidden md:flex">
                <span className="text-[#0C831F] font-black text-4xl tracking-tighter">Quick<span className="text-[#F8CB46]">Pick</span></span>
              </Link>
              {/* Mobile Logo */}
              <Link to="/" className="md:hidden flex items-center">
                <span className="text-[#0C831F] font-black text-3xl tracking-tighter">Quick<span className="text-[#F8CB46]">Pick</span></span>
              </Link>

              <div className="hidden lg:flex flex-col justify-center pl-8 h-full cursor-pointer hover:bg-gray-50/50">
                <span className="text-gray-900 font-extrabold text-[15px]">Delivery in 8 minutes</span>
                <span className="text-gray-500 text-xs flex items-center gap-1 font-medium mt-0.5">
                  Chennai, Tamil Nadu <FiChevronRight className="w-3 h-3"/>
                </span>
              </div>
            </div>

            {/* Search - center */}
            <div className="hidden sm:block flex-1 max-w-3xl relative mx-2" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => suggestions.length && setShowSuggestions(true)}
                    placeholder="Search 'milk'"
                    className="w-full bg-[#f8f8f8] border border-transparent rounded-xl py-3.5 pl-12 pr-6 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-gray-200 focus:shadow-sm text-sm transition-all"
                  />
                </div>
              </form>
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    {suggestions.map((s) => (
                      <div
                        key={s._id}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                        onClick={() => { navigate(`/products/${s._id}`); setShowSuggestions(false); setSearch(''); }}
                      >
                        <img src={s.images?.[0]} alt={s.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                        <div>
                          <div className="text-gray-900 text-sm font-semibold mb-0.5">{s.name}</div>
                          <div className="text-gray-500 text-xs font-medium">₹{s.price} · {s.unit}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-4 md:gap-8">
              <button className="sm:hidden text-gray-800 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <FiSearch className="w-6 h-6" />
              </button>

              {/* User Desktop */}
              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="text-gray-700 hover:text-gray-900 font-medium text-sm flex items-center gap-2 transition-colors"
                  >
                    {user.name} <FiChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        className="absolute right-0 top-full mt-4 w-56 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50"
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      >
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                          <div className="text-gray-900 font-bold text-sm">{user.name}</div>
                          <div className="text-gray-500 text-xs truncate">{user.email}</div>
                        </div>
                        <div className="p-2">
                          {user.role === 'admin' && (
                            <Link to="/admin" onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-sm font-medium transition-colors">
                              <FiUser className="w-4 h-4" /> Admin Dashboard
                            </Link>
                          )}
                          <Link to="/orders" onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-sm font-medium transition-colors">
                            <FiPackage className="w-4 h-4" /> My Orders
                          </Link>
                          <Link to="/wishlist" onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-sm font-medium transition-colors">
                            <FiHeart className="w-4 h-4" /> Wishlist
                          </Link>
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors mt-1 border-t border-gray-100 pt-3">
                            <FiLogOut className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login"
                  className="hidden md:block text-gray-700 hover:text-gray-900 font-medium text-[15px] transition-colors">
                  Login
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => dispatch(toggleCart())}
                className="flex items-center gap-2 bg-[#0C831F] hover:bg-[#0A6D19] text-white rounded-[10px] px-3 md:px-4 py-2.5 font-bold transition-all"
              >
                <FiShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                {cartCount > 0 ? (
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[11px] opacity-95 tracking-wide">{cartCount} Items</span>
                    <span className="text-sm">₹{items.reduce((s,i) => s+(i.price*i.quantity),0)}</span>
                  </div>
                ) : (
                  <span className="hidden md:inline text-sm tracking-wide">My Cart</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[#0C831F] font-black text-3xl tracking-tighter">Quick<span className="text-[#F8CB46]">Pick</span></span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 p-2 hover:bg-gray-100 rounded-full">
                  <FiX className="w-6 h-6" />
            </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Search in mobile menu */}
                <form onSubmit={handleSearch} className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search 'milk'"
                    className="w-full bg-[#f8f8f8] border border-transparent rounded-xl py-3.5 pl-12 pr-6 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-gray-200 focus:shadow-sm text-sm transition-all"
                  />
                </form>

                {/* User Info */}
                {user ? (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 bg-[#0C831F] text-white rounded-full flex items-center justify-center font-bold text-xl shadow-sm">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-gray-900 font-bold text-lg">{user.name}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="bg-white border border-gray-100 hover:border-[#0C831F] p-4 rounded-xl text-center transition-colors">
                        <FiPackage className="w-5 h-5 mx-auto mb-2 text-[#0C831F]" />
                        <div className="text-xs text-gray-700 font-semibold">Orders</div>
                      </Link>
                      <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="bg-white border border-gray-100 hover:border-red-500 p-4 rounded-xl text-center transition-colors">
                        <FiHeart className="w-5 h-5 mx-auto mb-2 text-red-500" />
                        <div className="text-xs text-gray-700 font-semibold">Wishlist</div>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block bg-[#0C831F] text-white text-center py-4 rounded-xl font-bold text-sm shadow-sm hover:bg-[#0A6D19] transition-colors">
                    Login / Sign Up
                  </Link>
                )}

                {/* Categories */}
                <div className="space-y-3">
                  <h3 className="text-gray-900 font-bold text-sm ml-1">Categories</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {categories.map(cat => (
                      <Link
                        key={cat.slug}
                        to={`/products?category=${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="bg-white border border-gray-100 rounded-xl py-3 flex flex-col items-center gap-2 hover:border-[#0C831F] transition-all shadow-sm"
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-gray-600 text-[9px] font-semibold tracking-wide text-center leading-tight px-1">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50">
                {user ? (
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-500 font-bold text-sm hover:underline">
                    <FiLogOut /> Logout
                  </button>
                ) : (
                  <div className="text-center text-gray-500 text-xs font-medium">Welcome to QuickPick!</div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
