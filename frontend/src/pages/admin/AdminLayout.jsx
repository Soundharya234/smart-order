import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag, FiImage, FiLogOut, FiMenu, FiX, FiAlertCircle, FiFolder, FiLock } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { updateProfile } from '../../services/api';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminCoupons from './AdminCoupons';
import AdminCategories from './AdminCategories';
import AdminBanners from './AdminBanners';const navItems = [
  { path: '/admin', label: 'Dashboard', icon: FiGrid, exact: true },
  { path: '/admin/products', label: 'Products', icon: FiPackage },
  { path: '/admin/categories', label: 'Categories', icon: FiFolder },
  { path: '/admin/banners', label: 'Banners', icon: FiImage },
  { path: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { path: '/admin/users', label: 'Users', icon: FiUsers },
  { path: '/admin/coupons', label: 'Coupons', icon: FiTag },
];
export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      alert('Password cannot be empty');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      setUpdating(true);
      const res = await updateProfile({ password: newPassword });
      if (res.data.success) {
        alert('Password updated successfully! 🎉');
        setPasswordModalOpen(false);
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-64 hidden lg:flex'} flex-col bg-[#121212] border-r border-[#2E2E2E] h-full`}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#2E2E2E]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 bg-[#FFD600] rounded-xl flex items-center justify-center">
            <span className="text-black font-black text-sm">Q</span>
          </div>
          <div>
            <span className="text-[#FFD600] font-black text-base">Quick</span>
            <span className="text-[#00C853] font-black text-base">Pick</span>
          </div>
        </div>
        <p className="text-gray-400 text-xs pl-11">Admin Panel</p>
      </div>
      {/* Admin Info */}
      <div className="px-5 py-4 border-b border-[#2E2E2E]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFD600] to-amber-500 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-black font-black text-sm">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div className="truncate">
              <div className="text-white font-semibold text-sm truncate max-w-[110px]">{user?.name?.split(' ')[0] || 'Admin'}</div>
              <div className="text-[#00C853] text-[10px] font-medium">● Admin</div>
            </div>
          </div>
          <button
            onClick={() => setPasswordModalOpen(true)}
            className="p-2 bg-white/5 border border-white/10 hover:bg-[#FFD600] hover:text-black text-[#FFD600] rounded-xl transition-all shrink-0"
            title="Change Password"
          >
            <FiLock className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-[#FFD600] text-black' : 'text-gray-400 hover:bg-[#1E1E1E] hover:text-white'}`}>
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-5">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-all">
          <FiLogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex">
      <Sidebar />
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 h-full">
            <Sidebar mobile />
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-[#121212] border-b border-[#2E2E2E] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white shrink-0">
                <FiMenu className="w-6 h-6" />
              </button>
              <div className="truncate">
                <h1 className="text-white font-bold text-sm md:text-lg truncate">Admin Dashboard</h1>
                <p className="text-gray-500 text-[10px] md:text-xs">{new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-gray-400 hover:text-white text-xs border border-[#2E2E2E] px-3 py-1.5 rounded-xl transition-all">View Store</Link>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/categories" element={<AdminCategories />} />
            <Route path="/banners" element={<AdminBanners />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/coupons" element={<AdminCoupons />} />
          </Routes>
        </main>
      </div>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative">
            <button
              onClick={() => setPasswordModalOpen(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="w-12 h-12 bg-[#FFD600]/10 border border-[#FFD600]/20 rounded-2xl flex items-center justify-center mb-4">
                <FiLock className="text-[#FFD600] w-5 h-5" />
              </div>
              <h3 className="text-white font-black text-xl">Change Admin Password</h3>
              <p className="text-white/40 text-xs mt-1">Protect your account with a secure password</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-white/60 text-xs font-semibold mb-2">New Password *</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#FFD600] transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-xs font-semibold mb-2">Confirm New Password *</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#FFD600] transition-colors text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black font-black py-3.5 rounded-xl transition-all shadow-lg shadow-[#FFD600]/10 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 text-sm"
              >
                {updating ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
