import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone } from 'react-icons/fi';
import { login, register } from '../store/slices/authSlice';
import { fetchCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await dispatch(login({ email: form.email, password: form.password })).unwrap();
        await dispatch(fetchCart());
        toast.success(`Welcome back, ${res.user.name}! 🎉`);
        navigate(res.user.role === 'admin' ? '/admin' : '/');
      } else {
        const res = await dispatch(register(form)).unwrap();
        toast.success(`Welcome to QuickPick, ${res.user.name}! 🚀`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err || 'Something went wrong');
    }
  };

  const demoLogin = async (role) => {
    const creds = role === 'admin'
      ? { email: 'admin@quickpick.com', password: 'LeoAdmin@2024' }
      : { email: 'customer@demo.com', password: 'customer123' };
    setForm(f => ({ ...f, ...creds }));
    try {
      const res = await dispatch(login(creds)).unwrap();
      await dispatch(fetchCart());
      toast.success(`Logged in as ${role}! 🎉`);
      navigate(res.user.role === 'admin' ? '/admin' : '/');
    } catch { toast.error('Demo login failed. Please seed the database first.'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20 mt-10">
      <div className="w-full max-w-lg">
        <motion.div
          className="bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Main Card Content */}
          <div className="px-6 py-10 md:p-14 pb-8 flex flex-col items-center">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <span className="text-[#0C831F] font-black text-5xl tracking-tighter">Quick<span className="text-[#F8CB46]">Pick</span></span>
            </div>

            {/* Titles */}
            <h1 className="text-gray-900 font-bold text-2xl md:text-3xl text-center mb-2">India's last minute app</h1>
            <p className="text-gray-500 text-sm md:text-base mb-10 text-center font-medium">Log in or Sign up</p>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-8 w-full max-w-sm">
              {['Log in', 'Sign up'].map((tab, i) => (
                <button key={tab} onClick={() => setIsLogin(i === 0)}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${(isLogin ? i === 0 : i === 1) ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
              {!isLogin && (
                <>
                  <div className="relative">
                    <input type="text" placeholder="Full Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0C831F] shadow-sm transition-all" />
                  </div>
                  <div className="relative">
                    <input type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0C831F] shadow-sm transition-all" />
                  </div>
                </>
              )}
              <div className="relative">
                <input type="email" placeholder="Email Address" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0C831F] shadow-sm transition-all" />
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="Password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-4 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0C831F] shadow-sm transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors focus:outline-none">
                  {showPass ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3 border border-red-100 text-center">{error}</p>}

              <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                className="w-full bg-[#0C831F] hover:bg-[#0A6D19] text-white rounded-xl py-4 text-sm font-bold transition-all shadow-sm mt-6">
                {loading ? 'Processing...' : 'Continue'}
              </motion.button>
            </form>

            {/* Demo Logins */}
            <div className="w-full max-w-sm mt-8 pt-8 border-t border-gray-100">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest text-center mb-4">Quick Demo Access</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => demoLogin('customer')}
                  className="py-2.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-bold hover:border-[#0C831F] hover:text-[#0C831F] transition-all bg-white">
                  👤 Customer
                </button>
                <button onClick={() => demoLogin('admin')}
                  className="py-2.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-bold hover:border-[#0C831F] hover:text-[#0C831F] transition-all bg-white">
                  ⚙️ Admin
                </button>
              </div>
            </div>
          </div>

          {/* Footer of the card */}
          <div className="bg-gray-50 py-6 px-8 text-center border-t border-gray-100 mt-auto">
            <p className="text-gray-500 text-xs font-medium">
              By continuing, you agree to our <a href="#" className="text-gray-900 underline hover:text-[#0C831F] transition-colors">Terms of service</a> & <a href="#" className="text-gray-900 underline hover:text-[#0C831F] transition-colors">Privacy policy</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
