import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiMail, FiPhone, FiCalendar, FiShield, FiSearch, FiMoreHorizontal, FiX, FiCheckCircle, FiSlash, FiClock, FiShoppingBag, FiMapPin, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { getAllUsers, toggleUserStatus, createAdminUser, updateAdminUser, deleteAdminUser } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Drawer & Edit State
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: 'customer' });

  // Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' });
  const [creating, setCreating] = useState(false);

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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createAdminUser(createForm);
      toast.success(`User ${createForm.name} created successfully! 🎉`);
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', phone: '', role: 'customer' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleStartEdit = (user) => {
    setEditForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', role: user.role || 'customer' });
    setIsEditing(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await updateAdminUser(selectedUser._id, editForm);
      toast.success('User profile updated successfully!');
      setIsEditing(false);
      setSelectedUser(res.data.user);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? This action CANNOT be undone.')) return;
    try {
      await deleteAdminUser(id);
      toast.success('User deleted successfully!');
      setShowDetail(false);
      setSelectedUser(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
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
            <h2 className="text-white font-black text-2xl tracking-tight">User Management</h2>
          </div>
          <p className="text-gray-500 font-medium ml-1">Monitor, create, and manage your admins and customer accounts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-center">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active</div>
            <div className="text-[#00C853] font-black text-xl">{users.filter(u => u.isActive).length}</div>
          </div>
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-center">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Suspended</div>
            <div className="text-red-500 font-black text-xl">{users.filter(u => !u.isActive).length}</div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#FFD600] text-black px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E5C000] transition-all flex items-center gap-2 shadow-lg shadow-[#FFD600]/10"
          >
            <FiPlus className="w-4 h-4" /> Add User / Admin
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search users by name, email or phone..."
          className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD600] transition-all"
        />
      </div>

      {/* Table Container */}
      <div className="bg-[#1E1E1E] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">User</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Contact Details</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Role</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Joined Date</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-6 py-6"><div className="h-10 bg-white/5 rounded-xl" /></td>
                </tr>
              )) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-500 font-bold">No users found.</td>
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
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{user.email}</div>
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
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {user.role}
                    </span>
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
                        onClick={() => { setSelectedUser(user); setIsEditing(false); setShowDetail(true); }}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-[#FFD600]/10 text-gray-400 hover:text-[#FFD600] rounded-xl transition-all"
                        title="View Details / Edit"
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
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all"
                        title="Delete User"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail & Edit Drawer */}
      <AnimatePresence>
        {showDetail && selectedUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowDetail(false); setIsEditing(false); }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
              className="fixed inset-y-0 right-0 w-full max-w-md bg-[#121212] z-[70] shadow-2xl flex flex-col border-l border-white/5"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-black text-2xl uppercase tracking-tight">{isEditing ? 'Edit Profile' : 'User Profile'}</h3>
                <button onClick={() => { setShowDetail(false); setIsEditing(false); }} className="w-10 h-10 bg-white/5 text-gray-400 rounded-xl flex items-center justify-center"><FiX className="w-6 h-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-none">
                {/* Profile Card / Form */}
                <div className="bg-[#1E1E1E] rounded-[2.5rem] p-8 border border-white/5 text-center relative overflow-hidden">
                  <div className={`absolute top-0 inset-x-0 h-24 ${selectedUser.isActive ? 'bg-gradient-to-b from-[#00C853]/10 to-transparent' : 'bg-gradient-to-b from-red-500/10 to-transparent'}`} />
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-2xl mx-auto mb-4">
                      <span className="text-white font-black text-3xl">{selectedUser.name?.[0]?.toUpperCase()}</span>
                    </div>
                    
                    {!isEditing ? (
                      <>
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
                      </>
                    ) : (
                      <form onSubmit={handleUpdateUser} className="space-y-4 text-left mt-6">
                        <div>
                          <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Full Name</label>
                          <input 
                            value={editForm.name} 
                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                            required
                            className="w-full bg-[#121212] border border-white/5 rounded-2xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[#FFD600]"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Email Address</label>
                          <input 
                            type="email"
                            value={editForm.email} 
                            onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                            required
                            className="w-full bg-[#121212] border border-white/5 rounded-2xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[#FFD600]"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Phone Number</label>
                          <input 
                            value={editForm.phone} 
                            onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                            className="w-full bg-[#121212] border border-white/5 rounded-2xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[#FFD600]"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Role</label>
                          <select 
                            value={editForm.role} 
                            onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                            className="w-full bg-[#121212] border border-white/5 rounded-2xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[#FFD600]"
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button type="submit" className="flex-1 bg-[#FFD600] text-black py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E5C000]">Save Profile</button>
                          <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-white/5 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10">Cancel</button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <>
                    {/* Contact Info */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between ml-2 pr-2">
                        <h5 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Contact Information</h5>
                        <button 
                          onClick={() => handleStartEdit(selectedUser)}
                          className="flex items-center gap-1 text-[10px] font-black text-[#FFD600] uppercase tracking-widest"
                        >
                          <FiEdit2 /> Edit Profile
                        </button>
                      </div>
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
                        <button 
                          onClick={() => handleDeleteUser(selectedUser._id)}
                          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black text-xs uppercase tracking-widest transition-all"
                        >
                          <FiTrash2 /> Delete Customer Account
                        </button>
                        <p className="text-gray-600 text-[10px] text-center px-4 font-medium italic">Suspended users will not be able to log in. Deleting will permanently remove them from the store.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-8 border-t border-white/5 bg-[#1A1A1A]">
                <button onClick={() => { setShowDetail(false); setIsEditing(false); }} className="w-full bg-white/5 text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Close Profile</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add User / Admin Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121212] rounded-[3rem] border border-white/5 p-8 max-w-md w-full relative z-[110] shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-white font-black text-xl uppercase tracking-tight">Create User / Admin</h3>
                <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 bg-white/5 text-gray-400 rounded-lg flex items-center justify-center hover:bg-white/10"><FiX /></button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Full Name *</label>
                  <input 
                    placeholder="Enter Name"
                    value={createForm.name} 
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[#FFD600]"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Email Address *</label>
                  <input 
                    type="email"
                    placeholder="name@example.com"
                    value={createForm.email} 
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                    required
                    className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[#FFD600]"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Password *</label>
                  <input 
                    type="password"
                    placeholder="Password"
                    value={createForm.password} 
                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    required
                    className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[#FFD600]"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Phone Number (Optional)</label>
                  <input 
                    placeholder="Phone number"
                    value={createForm.phone} 
                    onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[#FFD600]"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 block">Assign Role *</label>
                  <select 
                    value={createForm.role} 
                    onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full bg-[#1E1E1E] border border-white/5 rounded-2xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-[#FFD600]"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={creating}
                  className="w-full bg-[#FFD600] text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E5C000] mt-6 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Account'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
