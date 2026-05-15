// src/screens/AdminScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, Pressable, TextInput,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../store/authSlice';
import { useResponsive } from '../utils/responsive';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = ['Dashboard', 'Products', 'Orders', 'Users'];

export default function AdminScreen({ navigation }) {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // CRUD Product Form States
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formMrp, setFormMrp] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDiscount, setFormDiscount] = useState('0');

  // CRUD User Form States
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formUserName, setFormUserName] = useState('');
  const [formUserEmail, setFormUserEmail] = useState('');
  const [formUserPassword, setFormUserPassword] = useState('');
  const [formUserPhone, setFormUserPhone] = useState('');
  const [formUserRole, setFormUserRole] = useState('customer');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [pRes, oRes, uRes, cRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders/admin/all'),
        api.get('/users/admin/all'),
        api.get('/categories'),
      ]);
      setProducts(pRes.data.products || []);
      setOrders(oRes.data.orders || []);
      setUsers(uRes.data.users || []);
      setCategories(cRes.data.categories || []);
      setStats({
        products: pRes.data.total || pRes.data.products?.length || 0,
        orders: oRes.data.total || oRes.data.orders?.length || 0,
        users: uRes.data.total || uRes.data.users?.length || 0,
        revenue: oRes.data.orders?.reduce((acc, o) => acc + (o.total || 0), 0) || 0,
      });
    } catch (e) {
      console.log('Admin fetch error:', e?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace('Auth');
  };

  // Product CRUD Handlers
  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormMrp('');
    setFormUnit('1 kg');
    setFormStock('100');
    setFormCategory(categories[0]?._id || '');
    setFormImage('');
    setFormDiscount('0');
    setProductModalVisible(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormName(p.name || '');
    setFormPrice(String(p.price || ''));
    setFormMrp(String(p.mrp || ''));
    setFormUnit(p.unit || '1 kg');
    setFormStock(String(p.stock || '0'));
    setFormCategory(p.category?._id || p.category || categories[0]?._id || '');
    setFormImage(p.images?.[0] || '');
    setFormDiscount(String(p.discount || '0'));
    setProductModalVisible(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        Toast.show({ type: 'success', text1: 'Product Deleted 🗑️' });
        fetchAll();
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to delete product' });
    }
  };

  const handleSaveProduct = async () => {
    if (!formName.trim() || !formPrice.trim() || !formStock.trim()) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Name, Price and Stock are required' });
      return;
    }

    const payload = {
      name: formName,
      price: Number(formPrice),
      mrp: Number(formMrp || formPrice),
      unit: formUnit,
      stock: Number(formStock),
      category: formCategory,
      images: formImage.trim() ? [formImage] : ['https://via.placeholder.com/300'],
      discount: Number(formDiscount || 0),
    };

    try {
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, payload);
        if (res.data.success) {
          Toast.show({ type: 'success', text1: 'Product Updated 🎉' });
          setProductModalVisible(false);
          fetchAll();
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.data.success) {
          Toast.show({ type: 'success', text1: 'Product Created 📦' });
          setProductModalVisible(false);
          fetchAll();
        }
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Save Failed', text2: e.response?.data?.message || 'Error occurred' });
    }
  };

  const updateStatus = async (orderId, nextStatus) => {
    try {
      const res = await api.put(`/orders/admin/${orderId}/status`, { status: nextStatus });
      if (res.data.success) {
        Toast.show({ type: 'success', text1: 'Status Updated 🎉', text2: `Order is now ${nextStatus}` });
        fetchAll();
      }
    } catch (e) {
      console.log('Update status error:', e.message);
      Toast.show({ type: 'error', text1: 'Failed to update status' });
    }
  };

  // User CRUD Handlers
  const openAddUserModal = () => {
    setEditingUser(null);
    setFormUserName('');
    setFormUserEmail('');
    setFormUserPassword('');
    setFormUserPhone('');
    setFormUserRole('customer');
    setUserModalVisible(true);
  };

  const openEditUserModal = (u) => {
    setEditingUser(u);
    setFormUserName(u.name || '');
    setFormUserEmail(u.email || '');
    setFormUserPassword('');
    setFormUserPhone(u.phone || '');
    setFormUserRole(u.role || 'customer');
    setUserModalVisible(true);
  };

  const handleDeleteUser = async (id) => {
    try {
      const res = await api.delete(`/users/admin/${id}`);
      if (res.data.success) {
        Toast.show({ type: 'success', text1: 'User Deleted 🗑️' });
        fetchAll();
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to delete user' });
    }
  };

  const handleSaveUser = async () => {
    if (!formUserName.trim() || !formUserEmail.trim() || (!editingUser && !formUserPassword.trim())) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Name, Email and Password are required' });
      return;
    }

    const payload = {
      name: formUserName,
      email: formUserEmail,
      phone: formUserPhone,
      role: formUserRole,
    };
    if (formUserPassword.trim()) {
      payload.password = formUserPassword;
    }

    try {
      if (editingUser) {
        const res = await api.put(`/users/admin/${editingUser._id}`, payload);
        if (res.data.success) {
          Toast.show({ type: 'success', text1: 'User Updated 🎉' });
          setUserModalVisible(false);
          fetchAll();
        }
      } else {
        const res = await api.post('/users/admin/create', payload);
        if (res.data.success) {
          Toast.show({ type: 'success', text1: 'User Created 🎉' });
          setUserModalVisible(false);
          fetchAll();
        }
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Save Failed', text2: e.response?.data?.message || 'Error occurred' });
    }
  };

  const Sidebar = ({ modal = false }) => (
    <View style={{
      width: modal ? '100%' : r.isDesktop ? 240 : 200,
      backgroundColor: '#121212',
      flex: modal ? undefined : 1,
      paddingTop: modal ? insets.top + 16 : 0,
    }}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#2E2E2E' }}>
        <Text style={{ fontSize: r.fontSize.xl, fontWeight: '900' }}>
          <Text style={{ color: '#F8CB46' }}>Quick</Text>
          <Text style={{ color: '#00C853' }}>Pick</Text>
        </Text>
        <Text style={{ color: '#878787', fontSize: r.fontSize.xs, marginTop: 2 }}>Admin Panel</Text>
      </View>
      <View style={{ paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2E2E2E' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 36, height: 36, backgroundColor: '#F8CB46', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontWeight: '800', color: '#000', fontSize: r.fontSize.sm }}>{user?.name?.charAt(0)}</Text>
          </View>
          <View>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: r.fontSize.sm }}>{user?.name?.split(' ')[0]}</Text>
            <Text style={{ color: '#00C853', fontSize: r.fontSize.xs }}>● Admin</Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 1, padding: 12, gap: 4 }}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => { setActiveTab(tab); if (modal) setSidebarOpen(false); }}
            style={{
              paddingHorizontal: 16, paddingVertical: 12,
              borderRadius: 10,
              backgroundColor: activeTab === tab ? '#F8CB46' : 'transparent',
              flexDirection: 'row', alignItems: 'center', gap: 10,
            }}
          >
            <Ionicons
              name={tab === 'Dashboard' ? 'grid' : tab === 'Products' ? 'cube' : tab === 'Orders' ? 'bag' : 'people'}
              size={18}
              color={activeTab === tab ? '#000' : '#878787'}
            />
            <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: activeTab === tab ? '#000' : '#878787' }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          margin: 12, padding: 14, borderRadius: 10,
          backgroundColor: 'rgba(220,38,38,0.1)',
        }}
      >
        <Ionicons name="log-out-outline" size={18} color="#DC2626" />
        <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: r.fontSize.sm }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  const StatCard = ({ label, value, icon, color }) => (
    <View style={{
      flex: 1,
      backgroundColor: '#1E1E1E',
      borderRadius: 14,
      padding: r.isMobile ? 16 : 20,
      margin: 4,
      minWidth: r.isMobile ? '45%' : 140,
    }}>
      <Text style={{ fontSize: r.isMobile ? 24 : 28, marginBottom: 8 }}>{icon}</Text>
      <Text style={{ fontSize: r.fontSize['2xl'], fontWeight: '900', color: color || '#fff', marginBottom: 2 }}>
        {value}
      </Text>
      <Text style={{ fontSize: r.fontSize.xs, color: '#878787', fontWeight: '600' }}>{label}</Text>
    </View>
  );

  const renderContent = () => {
    if (loading) return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#F8CB46" />
      </View>
    );

    switch (activeTab) {
      case 'Dashboard':
        return (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: r.isMobile ? 16 : 24 }}>
            <Text style={{ fontSize: r.fontSize['2xl'], fontWeight: '800', color: '#fff', marginBottom: 20 }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -4, marginBottom: 24 }}>
              <StatCard label="Total Products" value={stats?.products || 0} icon="📦" color="#F8CB46" />
              <StatCard label="Total Orders" value={stats?.orders || 0} icon="🛒" color="#00C853" />
              <StatCard label="Total Users" value={stats?.users || 0} icon="👥" color="#2979FF" />
              <StatCard label="Revenue" value={`₹${stats?.revenue?.toLocaleString()}`} icon="💰" color="#E91E63" />
            </View>
            <Text style={{ fontSize: r.fontSize.lg, fontWeight: '800', color: '#fff', marginBottom: 14 }}>
              Recent Orders
            </Text>
            {orders.slice(0, 5).map(o => (
              <View key={o._id} style={{
                backgroundColor: '#1E1E1E', borderRadius: 12, padding: 14,
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 10,
              }}>
                <View>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: r.fontSize.sm }}>
                    #{o.orderId || o._id?.slice(-8).toUpperCase()}
                  </Text>
                  <Text style={{ color: '#878787', fontSize: r.fontSize.xs }}>{o.shippingAddress?.fullName || o.user?.name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#F8CB46', fontWeight: '800', fontSize: r.fontSize.base }}>₹{o.total}</Text>
                  <Text style={{ color: '#878787', fontSize: r.fontSize.xs, textTransform: 'capitalize' }}>{o.orderStatus}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case 'Products':
        return (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: r.isMobile ? 16 : 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: r.fontSize.xl, fontWeight: '800', color: '#fff' }}>
                Products ({products.length})
              </Text>
              <TouchableOpacity
                onPress={openAddModal}
                style={{
                  backgroundColor: '#F8CB46',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="add" size={18} color="#000" />
                <Text style={{ color: '#000', fontWeight: '700', fontSize: r.fontSize.sm }}>Add Product</Text>
              </TouchableOpacity>
            </View>

            {products.map(p => (
              <View key={p._id} style={{
                backgroundColor: '#1E1E1E', borderRadius: 12, padding: 14,
                flexDirection: 'row', alignItems: 'center', gap: 12,
                marginBottom: 10,
              }}>
                <Image
                  source={{ uri: p.images?.[0] || 'https://via.placeholder.com/150' }}
                  style={{ width: 50, height: 50, borderRadius: 8, backgroundColor: '#2E2E2E' }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: r.fontSize.sm }} numberOfLines={1}>{p.name}</Text>
                  <Text style={{ color: '#878787', fontSize: r.fontSize.xs }}>{p.unit} • Stock: {p.stock}</Text>
                  <Text style={{ color: '#F8CB46', fontWeight: '800', fontSize: r.fontSize.base, marginTop: 2 }}>₹{p.price}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <TouchableOpacity
                    onPress={() => openEditModal(p)}
                    style={{
                      backgroundColor: '#2E2E2E',
                      width: 34, height: 34, borderRadius: 8,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="pencil" size={16} color="#F8CB46" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteProduct(p._id)}
                    style={{
                      backgroundColor: 'rgba(220,38,38,0.1)',
                      width: 34, height: 34, borderRadius: 8,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="trash" size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        );

      case 'Orders':
        return (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: r.isMobile ? 16 : 24 }}>
            <Text style={{ fontSize: r.fontSize.xl, fontWeight: '800', color: '#fff', marginBottom: 20 }}>
              All Orders ({orders.length})
            </Text>
            {orders.map(o => (
              <View key={o._id} style={{
                backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#2E2E2E',
              }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: r.fontSize.base }}>
                      #{o.orderId || o._id?.slice(-8).toUpperCase()}
                    </Text>
                    <Text style={{ color: '#878787', fontSize: r.fontSize.xs }}>
                      {new Date(o.createdAt).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: o.orderStatus === 'delivered' ? '#0C831F22' : '#F8CB4622',
                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                  }}>
                    <Text style={{ color: o.orderStatus === 'delivered' ? '#0C831F' : '#F8CB46', fontSize: r.fontSize.xs, fontWeight: '700', textTransform: 'uppercase' }}>
                      {o.orderStatus}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: '#2E2E2E', marginBottom: 12 }} />

                {/* Customer Details */}
                <View style={{ gap: 6, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="person-outline" size={14} color="#F8CB46" />
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: r.fontSize.sm }}>
                      {o.shippingAddress?.fullName || o.user?.name || 'Walk-in Customer'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="call-outline" size={14} color="#878787" />
                    <Text style={{ color: '#878787', fontSize: r.fontSize.xs }}>
                      {o.shippingAddress?.phone || o.user?.phone || 'No phone number'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <Ionicons name="location-outline" size={14} color="#878787" style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#BDBDBD', fontSize: r.fontSize.xs, lineHeight: 16 }}>
                        {o.shippingAddress?.street || 'No address provided'}
                      </Text>
                      {o.shippingAddress?.city && (
                        <Text style={{ color: '#878787', fontSize: r.fontSize.xs }}>
                          {o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.pincode}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: '#2E2E2E', marginBottom: 12 }} />

                {/* Items Ordered */}
                <View style={{ gap: 8, backgroundColor: '#141414', padding: 12, borderRadius: 10, marginBottom: 12 }}>
                  <Text style={{ color: '#878787', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>📦 Items Ordered</Text>
                  {o.items?.map((item, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: r.fontSize.xs }}>
                        • {item.name} <Text style={{ color: '#878787' }}>x{item.quantity}</Text>
                      </Text>
                      <Text style={{ color: '#F8CB46', fontSize: r.fontSize.xs, fontWeight: '700' }}>₹{item.price * item.quantity}</Text>
                    </View>
                  ))}
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: '#2E2E2E', marginBottom: 12 }} />

                {/* Items & Payment Info */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="card-outline" size={14} color="#00C853" />
                    <Text style={{ color: '#00C853', fontSize: r.fontSize.xs, fontWeight: '700', textTransform: 'uppercase' }}>
                      {o.paymentMethod} ({o.paymentStatus || 'pending'})
                    </Text>
                  </View>
                  <Text style={{ color: '#F8CB46', fontWeight: '900', fontSize: r.fontSize.lg }}>
                    ₹{o.total}
                  </Text>
                </View>

                {/* Status Transition Actions */}
                {['delivered', 'cancelled'].indexOf(o.orderStatus) === -1 && (
                  <View style={{ marginTop: 12, backgroundColor: '#1A1A1A', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#2E2E2E' }}>
                    <Text style={{ color: '#878787', fontSize: 10, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase' }}>🚚 Update Order Status</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {o.orderStatus === 'placed' && (
                        <TouchableOpacity
                          onPress={() => updateStatus(o._id, 'confirmed')}
                          style={{ backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 11 }}>Confirm Order</Text>
                        </TouchableOpacity>
                      )}
                      {o.orderStatus === 'confirmed' && (
                        <TouchableOpacity
                          onPress={() => updateStatus(o._id, 'packed')}
                          style={{ backgroundColor: '#9C27B0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 11 }}>Pack Order</Text>
                        </TouchableOpacity>
                      )}
                      {o.orderStatus === 'packed' && (
                        <TouchableOpacity
                          onPress={() => updateStatus(o._id, 'dispatched')}
                          style={{ backgroundColor: '#00ACC1', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 11 }}>Dispatch Order</Text>
                        </TouchableOpacity>
                      )}
                      {o.orderStatus === 'dispatched' && (
                        <TouchableOpacity
                          onPress={() => updateStatus(o._id, 'delivered')}
                          style={{ backgroundColor: '#0C831F', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 11 }}>Deliver Order</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => updateStatus(o._id, 'cancelled')}
                        style={{ backgroundColor: 'rgba(220,38,38,0.1)', borderWidth: 1, borderColor: '#DC2626', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                      >
                        <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 11 }}>Cancel Order</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        );

      case 'Users':
        return (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: r.isMobile ? 16 : 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: r.fontSize.xl, fontWeight: '800', color: '#fff' }}>
                Users ({users.length})
              </Text>
              <TouchableOpacity
                onPress={openAddUserModal}
                style={{
                  backgroundColor: '#F8CB46',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="add" size={18} color="#000" />
                <Text style={{ color: '#000', fontWeight: '700', fontSize: r.fontSize.sm }}>Add User</Text>
              </TouchableOpacity>
            </View>

            {users.map(u => (
              <View key={u._id} style={{
                backgroundColor: '#1E1E1E', borderRadius: 12, padding: 14,
                flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10,
              }}>
                <View style={{
                  width: 40, height: 40,
                  backgroundColor: u.role === 'admin' ? '#F8CB46' : '#0C831F',
                  borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: u.role === 'admin' ? '#000' : '#fff', fontWeight: '800' }}>
                    {u.name?.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: r.fontSize.sm }}>{u.name}</Text>
                  <Text style={{ color: '#878787', fontSize: r.fontSize.xs }} numberOfLines={1}>{u.email}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{
                    backgroundColor: u.role === 'admin' ? '#F8CB4622' : '#0C831F22',
                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                  }}>
                    <Text style={{ color: u.role === 'admin' ? '#F8CB46' : '#0C831F', fontSize: r.fontSize.xs, fontWeight: '700' }}>
                      {u.role}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => openEditUserModal(u)}
                    style={{
                      backgroundColor: '#2E2E2E',
                      width: 32, height: 32, borderRadius: 8,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="pencil" size={14} color="#F8CB46" />
                  </TouchableOpacity>
                  {u._id !== user?._id && (
                    <TouchableOpacity
                      onPress={() => handleDeleteUser(u._id)}
                      style={{
                        backgroundColor: 'rgba(220,38,38,0.1)',
                        width: 32, height: 32, borderRadius: 8,
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="trash" size={14} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0E0E0E', flexDirection: 'row' }}>
      {/* Sidebar - visible on tablet/desktop */}
      {!r.isMobile && <Sidebar />}

      {/* Mobile Sidebar Modal */}
      {r.isMobile && (
        <Modal visible={sidebarOpen} transparent animationType="slide" onRequestClose={() => setSidebarOpen(false)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row' }} onPress={() => setSidebarOpen(false)}>
            <View style={{ width: '75%', backgroundColor: '#121212' }}>
              <Sidebar modal />
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Main */}
      <View style={{ flex: 1, flexDirection: 'column' }}>
        {/* Top Bar */}
        <View style={{
          backgroundColor: '#121212',
          paddingTop: insets.top + 10,
          paddingBottom: 14,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#2E2E2E',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {r.isMobile && (
              <TouchableOpacity onPress={() => setSidebarOpen(true)}>
                <Ionicons name="menu" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: r.fontSize.lg }}>
              {activeTab}
            </Text>
          </View>
          {/* Mobile: Tab pills */}
          {r.isMobile && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {TABS.map(tab => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: activeTab === tab ? '#F8CB46' : '#2E2E2E',
                    }}
                  >
                    <Text style={{ fontSize: r.fontSize.xs, fontWeight: '700', color: activeTab === tab ? '#000' : '#878787' }}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Content */}
        {renderContent()}
      </View>

      {/* CRUD Product Modal Sheet */}
      <Modal
        visible={productModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProductModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}
        >
          <View style={{
            backgroundColor: '#121212',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            maxHeight: '90%',
            borderWidth: 1,
            borderColor: '#2E2E2E',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: r.fontSize.xl, fontWeight: '800', color: '#fff' }}>
                {editingProduct ? 'Edit Product ✏️' : 'Add Product 📦'}
              </Text>
              <TouchableOpacity onPress={() => setProductModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#878787" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
              {/* Product Name */}
              <View>
                <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '700', marginBottom: 6 }}>Product Name *</Text>
                <TextInput
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="e.g. Organic Tomatoes"
                  placeholderTextColor="#878787"
                  style={{
                    backgroundColor: '#1E1E1E', borderRadius: 10, padding: 12, color: '#fff', fontSize: r.fontSize.sm,
                    borderWidth: 1.5, borderColor: '#2E2E2E',
                  }}
                />
              </View>

              {/* Price & MRP Row */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '700', marginBottom: 6 }}>Price (₹) *</Text>
                  <TextInput
                    value={formPrice}
                    onChangeText={setFormPrice}
                    placeholder="e.g. 50"
                    placeholderTextColor="#878787"
                    keyboardType="numeric"
                    style={{
                      backgroundColor: '#1E1E1E', borderRadius: 10, padding: 12, color: '#fff', fontSize: r.fontSize.sm,
                      borderWidth: 1.5, borderColor: '#2E2E2E',
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '700', marginBottom: 6 }}>MRP (₹)</Text>
                  <TextInput
                    value={formMrp}
                    onChangeText={setFormMrp}
                    placeholder="e.g. 60"
                    placeholderTextColor="#878787"
                    keyboardType="numeric"
                    style={{
                      backgroundColor: '#1E1E1E', borderRadius: 10, padding: 12, color: '#fff', fontSize: r.fontSize.sm,
                      borderWidth: 1.5, borderColor: '#2E2E2E',
                    }}
                  />
                </View>
              </View>

              {/* Unit & Stock Row */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '700', marginBottom: 6 }}>Unit</Text>
                  <TextInput
                    value={formUnit}
                    onChangeText={setFormUnit}
                    placeholder="e.g. 1 kg / 500g"
                    placeholderTextColor="#878787"
                    style={{
                      backgroundColor: '#1E1E1E', borderRadius: 10, padding: 12, color: '#fff', fontSize: r.fontSize.sm,
                      borderWidth: 1.5, borderColor: '#2E2E2E',
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '700', marginBottom: 6 }}>Stock *</Text>
                  <TextInput
                    value={formStock}
                    onChangeText={setFormStock}
                    placeholder="e.g. 100"
                    placeholderTextColor="#878787"
                    keyboardType="numeric"
                    style={{
                      backgroundColor: '#1E1E1E', borderRadius: 10, padding: 12, color: '#fff', fontSize: r.fontSize.sm,
                      borderWidth: 1.5, borderColor: '#2E2E2E',
                    }}
                  />
                </View>
              </View>

              {/* Category Dropdown/Selector */}
              <View>
                <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '700', marginBottom: 6 }}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {categories.map(c => {
                      const isSelected = formCategory === c._id;
                      return (
                        <TouchableOpacity
                          key={c._id}
                          onPress={() => setFormCategory(c._id)}
                          style={{
                            paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
                            backgroundColor: isSelected ? '#F8CB46' : '#1E1E1E',
                            borderWidth: 1.5, borderColor: isSelected ? '#F8CB46' : '#2E2E2E',
                          }}
                        >
                          <Text style={{ color: isSelected ? '#000' : '#878787', fontWeight: '700', fontSize: r.fontSize.xs }}>
                            {c.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              {/* Image URL */}
              <View>
                <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '700', marginBottom: 6 }}>Image URL</Text>
                <TextInput
                  value={formImage}
                  onChangeText={setFormImage}
                  placeholder="https://example.com/image.png"
                  placeholderTextColor="#878787"
                  style={{
                    backgroundColor: '#1E1E1E', borderRadius: 10, padding: 12, color: '#fff', fontSize: r.fontSize.sm,
                    borderWidth: 1.5, borderColor: '#2E2E2E',
                  }}
                />
              </View>

              {/* Discount & Mrp */}
              <View>
                <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '700', marginBottom: 6 }}>Discount (%)</Text>
                <TextInput
                  value={formDiscount}
                  onChangeText={setFormDiscount}
                  placeholder="e.g. 10"
                  placeholderTextColor="#878787"
                  keyboardType="numeric"
                  style={{
                    backgroundColor: '#1E1E1E', borderRadius: 10, padding: 12, color: '#fff', fontSize: r.fontSize.sm,
                    borderWidth: 1.5, borderColor: '#2E2E2E',
                  }}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSaveProduct}
                style={{
                  backgroundColor: '#F8CB46',
                  height: 48,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 10,
                }}
              >
                <Text style={{ color: '#000', fontWeight: '800', fontSize: r.fontSize.base }}>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* CRUD User Modal Sheet */}
      <Modal
        visible={userModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUserModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}
        >
          <View style={{
            backgroundColor: '#121212',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            maxHeight: '90%',
            borderWidth: 1,
            borderColor: '#2E2E2E',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: r.fontSize.xl, fontWeight: '800', color: '#fff' }}>
                {editingUser ? 'Edit User ✏️' : 'Add User/Admin 👥'}
              </Text>
              <TouchableOpacity onPress={() => setUserModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#878787" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
              {/* User Name */}
              <View>
                <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '700', marginBottom: 6 }}>Full Name *</Text>
                <TextInput
                  value={formUserName}
                  onChangeText={setFormUserName}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#878787"
                  style={{
                    backgroundColor: '#1E1E1E', borderRadius: 10, padding: 12, color: '#fff', fontSize: r.fontSize.sm,
                    borderWidth: 1.5, borderColor: '#2E2E2E',
                  }}
                />
              </View>

              {/* Email Address */}
              <View>
                <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '700', marginBottom: 6 }}>Email Address *</Text>
                <TextInput
                  value={formUserEmail}
                  onChangeText={setFormUserEmail}
                  placeholder="e.g. john@example.com"
                  placeholderTextColor="#878787"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    backgroundColor: '#1E1E1E', borderRadius: 10, padding: 12, color: '#fff', fontSize: r.fontSize.sm,
                    borderWidth: 1.5, borderColor: '#2E2E2E',
                  }}
                />
              </View>

              {/* Password */}
              <View>
                <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '700', marginBottom: 6 }}>
                  {editingUser ? 'Password (Leave blank to keep current)' : 'Password *'}
                </Text>
                <TextInput
                  value={formUserPassword}
                  onChangeText={setFormUserPassword}
                  placeholder="Password"
                  placeholderTextColor="#878787"
                  secureTextEntry
                  autoCapitalize="none"
                  style={{
                    backgroundColor: '#1E1E1E', borderRadius: 10, padding: 12, color: '#fff', fontSize: r.fontSize.sm,
                    borderWidth: 1.5, borderColor: '#2E2E2E',
                  }}
                />
              </View>

              {/* Phone Number */}
              <View>
                <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '700', marginBottom: 6 }}>Phone Number</Text>
                <TextInput
                  value={formUserPhone}
                  onChangeText={setFormUserPhone}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor="#878787"
                  keyboardType="phone-pad"
                  style={{
                    backgroundColor: '#1E1E1E', borderRadius: 10, padding: 12, color: '#fff', fontSize: r.fontSize.sm,
                    borderWidth: 1.5, borderColor: '#2E2E2E',
                  }}
                />
              </View>

              {/* Role Selector */}
              <View>
                <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '700', marginBottom: 6 }}>Role *</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setFormUserRole('customer')}
                    style={{
                      flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
                      backgroundColor: formUserRole === 'customer' ? '#0C831F' : '#1E1E1E',
                      borderWidth: 1.5, borderColor: formUserRole === 'customer' ? '#0C831F' : '#2E2E2E',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: r.fontSize.xs }}>Customer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFormUserRole('admin')}
                    style={{
                      flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
                      backgroundColor: formUserRole === 'admin' ? '#F8CB46' : '#1E1E1E',
                      borderWidth: 1.5, borderColor: formUserRole === 'admin' ? '#F8CB46' : '#2E2E2E',
                    }}
                  >
                    <Text style={{ color: formUserRole === 'admin' ? '#000' : '#fff', fontWeight: '700', fontSize: r.fontSize.xs }}>Admin</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSaveUser}
                style={{
                  backgroundColor: '#F8CB46',
                  height: 48,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 10,
                }}
              >
                <Text style={{ color: '#000', fontWeight: '800', fontSize: r.fontSize.base }}>
                  {editingUser ? 'Update User' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
