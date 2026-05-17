import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiMail, FiPhone, FiCalendar, FiShield, FiSearch, FiMoreHorizontal, FiX, FiCheckCircle, FiSlash, FiClock, FiShoppingBag, FiMapPin } from 'react-icons/fi';
import { getAllUsers, toggleUserStatus } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const load = () => {
    setLoading(true);
    getAllUsers().then(r => setUsers(r.data.users)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggleStatus = async (user) => {
    try {
      await toggleUserStatus(user._id);
      toast.success(`User ${user.isActive ? 'suspended' : 'activated'} successfully!`);
      load();
      if (selectedUser?._id === user._id) {
        setSelectedUser({ ...user, isActive: !user.isActive });
      }
    } catch { toast.error('Status update failed'); }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E1E1E] to-[#121212] p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FiUsers className="text-white w-5 h-5" />
            </div>
            <h2 className="text-white font-black text-2xl tracking-tight">Customer Management</h2>
          </div>
          <p className="text-gray-500 font-medium ml-1">Monitor and manage your customer accounts and access.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-center">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active</div>
            <div className="text-[#00C853] font-black text-xl">{users.filter(u => u.isActive).length}</div>
          </div>
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-center">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Suspended</div>
            <div className="text-red-500 font-black text-xl">{users.filter(u => !u.isActive).length}</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search customers by name, email or phone..."
          className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD600] transition-all"
        />
      </div>

      {/* Table Container */}
      <div className="bg-[#1E1E1E] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Customer</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Contact Details</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Joined Date</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="px-6 py-6"><div className="h-10 bg-white/5 rounded-xl" /></td>
                </tr>
              )) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-gray-500 font-bold">No customers found.</td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                        <span className="text-white font-black text-sm">{user.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="text-white font-black text-sm group-hover:text-[#FFD600] transition-colors">{user.name}</div>
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-300 text-xs font-medium">
                        <FiMail className="text-gray-600" /> {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold">
                        <FiPhone className="text-gray-600" /> {user.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                      <FiCalendar className="text-gray-600" />
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${user.isActive ? 'bg-[#00C853]/10 text-[#00C853] border-[#00C853]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedUser(user); setShowDetail(true); }}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-[#FFD600]/10 text-gray-400 hover:text-[#FFD600] rounded-xl transition-all"
                        title="View Details"
                      >
                        <FiMoreHorizontal />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${user.isActive ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-[#00C853]/10 text-[#00C853] hover:bg-[#00C853] hover:text-white'}`}
                        title={user.isActive ? 'Suspend User' : 'Activate User'}
                      >
                        {user.isActive ? <FiSlash /> : <FiCheckCircle />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Drawer */}
      <AnimatePresence>
        {showDetail && selectedUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetail(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
              className="fixed inset-y-0 right-0 w-full max-w-md bg-[#121212] z-[70] shadow-2xl flex flex-col border-l border-white/5"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-black text-2xl uppercase tracking-tight">Customer Profile</h3>
                <button onClick={() => setShowDetail(false)} className="w-10 h-10 bg-white/5 text-gray-400 rounded-xl flex items-center justify-center"><FiX className="w-6 h-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-none">
                {/* Profile Card */}
                <div className="bg-[#1E1E1E] rounded-[2.5rem] p-8 border border-white/5 text-center relative overflow-hidden">
                  <div className={`absolute top-0 inset-x-0 h-24 ${selectedUser.isActive ? 'bg-gradient-to-b from-[#00C853]/10 to-transparent' : 'bg-gradient-to-b from-red-500/10 to-transparent'}`} />
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-2xl mx-auto mb-4">
                      <span className="text-white font-black text-3xl">{selectedUser.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <h4 className="text-white font-black text-xl mb-1">{selectedUser.name}</h4>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">{selectedUser.email}</p>
                    
                    <div className="flex justify-center gap-4">
                      <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Account Status</div>
                        <div className={`font-black text-xs ${selectedUser.isActive ? 'text-[#00C853]' : 'text-red-500'}`}>{selectedUser.isActive ? 'ACTIVE' : 'SUSPENDED'}</div>
                      </div>
                      <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Role</div>
                        <div className="text-white font-black text-xs uppercase">{selectedUser.role}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h5 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Contact Information</h5>
                  <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-white/5 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 shrink-0"><FiMail /></div>
                      <div>
                        <div className="text-gray-500 text-[10px] font-black uppercase">Email Address</div>
                        <div className="text-white font-bold text-sm">{selectedUser.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 shrink-0"><FiPhone /></div>
                      <div>
                        <div className="text-gray-500 text-[10px] font-black uppercase">Phone Number</div>
                        <div className="text-white font-bold text-sm">{selectedUser.phone || 'No phone number linked'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 shrink-0"><FiCalendar /></div>
                      <div>
                        <div className="text-gray-500 text-[10px] font-black uppercase">Customer Since</div>
                        <div className="text-white font-bold text-sm">{new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-4">
                  <h5 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Administrative Actions</h5>
                  <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-white/5 space-y-3">
                    <button 
                      onClick={() => handleToggleStatus(selectedUser)}
                      className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${selectedUser.isActive ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-[#00C853]/10 text-[#00C853] hover:bg-[#00C853] hover:text-white'}`}
                    >
                      {selectedUser.isActive ? <><FiSlash /> Suspend Customer Access</> : <><FiCheckCircle /> Reactivate Customer Account</>}
                    </button>
                    <p className="text-gray-600 text-[10px] text-center px-4 font-medium italic">Suspended users will not be able to log in or place new orders.</p>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-[#1A1A1A]">
                <button onClick={() => setShowDetail(false)} className="w-full bg-white/5 text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Close Profile</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
