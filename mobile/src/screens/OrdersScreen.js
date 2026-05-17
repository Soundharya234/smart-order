// src/screens/OrdersScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import api, { getOrders } from '../services/api';
import { useResponsive } from '../utils/responsive';
import { Ionicons } from '@expo/vector-icons';

const STATUS_COLOR = {
  placed: { bg: '#E3F2FD', text: '#2196F3', label: '📦 Placed' },
  confirmed: { bg: '#E8F5E9', text: '#4CAF50', label: '✓ Confirmed' },
  processing: { bg: '#FFF8E1', text: '#FFB300', label: '⚙ Processing' },
  packed: { bg: '#F3E5F5', text: '#9C27B0', label: '📦 Packed' },
  dispatched: { bg: '#E0F7FA', text: '#00ACC1', label: '🚚 Dispatched' },
  delivered: { bg: '#E8F5E9', text: '#0C831F', label: '🎉 Delivered' },
  cancelled: { bg: '#FEF2F2', text: '#DC2626', label: '❌ Cancelled' },
};

const STAGES = ['placed', 'confirmed', 'packed', 'dispatched', 'delivered'];
const STAGES_LABELS = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
};

export default function OrdersScreen({ navigation }) {
  const { token } = useSelector(s => s.auth);
  const r = useResponsive();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    if (token) {
      setLoading(true);
      getOrders()
        .then(res => setOrders(res.data.orders || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  const handleCancelOrder = (orderId) => {
    if (Platform.OS === 'web') {
      const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
      if (confirmCancel) {
        api.put(`/orders/${orderId}/cancel`).then(res => {
          if (res.data.success) fetchOrders();
        }).catch(() => alert("Could not cancel order"));
      }
    } else {
      Alert.alert(
        "Cancel Order",
        "Are you sure you want to cancel this order?",
        [
          { text: "No", style: "cancel" },
          { 
            text: "Yes, Cancel", 
            style: "destructive",
            onPress: async () => {
              try {
                const res = await api.put(`/orders/${orderId}/cancel`);
                if (res.data.success) {
                  fetchOrders();
                }
              } catch (error) {
                Alert.alert("Error", "Could not cancel order");
              }
            }
          }
        ]
      );
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  if (!token) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🔐</Text>
          <Text style={{ fontSize: r.fontSize.xl, fontWeight: '800', color: '#1C1C1C', marginBottom: 8 }}>
            Login Required
          </Text>
          <Text style={{ fontSize: r.fontSize.sm, color: '#878787', textAlign: 'center', marginBottom: 24 }}>
            Please login to view your orders
          </Text>
          <TouchableOpacity
            onPress={() => navigation.replace('Auth')}
            style={{ backgroundColor: '#0C831F', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: r.fontSize.base }}>Login Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0C831F" />
      </View>
    );
  }

  const hPad = r.isMobile ? 16 : r.isTablet ? 24 : 48;
  const maxWidth = r.isDesktop ? 800 : '100%';

  const renderStatusTracker = (currentStatus) => {
    if (currentStatus === 'cancelled') {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: '#FEF2F2', padding: 10, borderRadius: 10 }}>
          <Ionicons name="close-circle" size={18} color="#DC2626" />
          <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: r.fontSize.xs }}>
            This order has been cancelled.
          </Text>
        </View>
      );
    }

    const currentIndex = STAGES.indexOf(currentStatus);
    // fallback for 'processing' mapping to 'confirmed'
    const activeIndex = currentIndex === -1 && currentStatus === 'processing' ? 1 : currentIndex;

    return (
      <View style={{ marginTop: 16, backgroundColor: '#FAFAFA', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' }}>
        <Text style={{ fontSize: r.fontSize.xs, fontWeight: '700', color: '#1C1C1C', marginBottom: 12 }}>
          Order Progress
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {/* Connector Line behind steps */}
          <View style={{
            position: 'absolute',
            top: 10,
            left: 12,
            right: 12,
            height: 3,
            backgroundColor: '#E0E0E0',
            zIndex: 1,
          }} />

          {STAGES.map((stage, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            return (
              <View key={stage} style={{ alignItems: 'center', zIndex: 2, flex: 1 }}>
                <View style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: isCompleted ? '#0C831F' : '#E0E0E0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: isCurrent ? 3 : 0,
                  borderColor: '#A5D6A7',
                }}>
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : (
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#878787' }} />
                  )}
                </View>
                <Text style={{
                  fontSize: 10,
                  fontWeight: isCompleted ? '700' : '500',
                  color: isCompleted ? '#0C831F' : '#878787',
                  marginTop: 6,
                  textAlign: 'center',
                }}>
                  {STAGES_LABELS[stage]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: hPad, paddingVertical: 20,
          alignItems: r.isDesktop ? 'center' : 'stretch',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: r.fontSize['2xl'], fontWeight: '800', color: '#1C1C1C' }}>
              My Orders
            </Text>
            <TouchableOpacity onPress={fetchOrders} style={{ padding: 8 }}>
              <Ionicons name="refresh" size={20} color="#0C831F" />
            </TouchableOpacity>
          </View>

          {orders.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Text style={{ fontSize: 64, marginBottom: 12 }}>📦</Text>
              <Text style={{ fontSize: r.fontSize.xl, fontWeight: '800', color: '#1C1C1C', marginBottom: 4 }}>
                No orders yet
              </Text>
              <Text style={{ fontSize: r.fontSize.sm, color: '#878787', marginBottom: 20 }}>
                Start shopping to place your first order!
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('HomeTab')}
                style={{ backgroundColor: '#0C831F', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Shop Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {orders.map(order => {
                const s = STATUS_COLOR[order.orderStatus] || STATUS_COLOR.placed;
                return (
                  <View key={order._id} style={{
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 2,
                    borderWidth: 1,
                    borderColor: '#E8E8E8',
                  }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <View>
                        <Text style={{ fontSize: r.fontSize.xs, color: '#878787', fontWeight: '700' }}>
                          #{order.orderId || order._id?.slice(-8).toUpperCase()}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#BDBDBD', marginTop: 2 }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </Text>
                      </View>
                      <View style={{
                        backgroundColor: s.bg,
                        paddingHorizontal: 10, paddingVertical: 4,
                        borderRadius: 8,
                      }}>
                        <Text style={{ fontSize: r.fontSize.xs, fontWeight: '800', color: s.text, textTransform: 'uppercase' }}>
                          {s.label}
                        </Text>
                      </View>
                    </View>

                    {/* Order Items Summary */}
                    <View style={{ gap: 8, backgroundColor: '#FAFAFA', padding: 12, borderRadius: 10 }}>
                      {order.items?.map((item, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: r.fontSize.sm, color: '#1C1C1C', flex: 1 }} numberOfLines={1}>
                            {item.name} <Text style={{ color: '#878787', fontSize: r.fontSize.xs }}>x{item.quantity}</Text>
                          </Text>
                          <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: '#1C1C1C' }}>
                            ₹{item.price * item.quantity}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Totals & Delivery Address */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingHorizontal: 2 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, color: '#878787' }} numberOfLines={1}>
                          📍 {order.shippingAddress?.street}, {order.shippingAddress?.city}
                        </Text>
                      </View>
                      <Text style={{ fontSize: r.fontSize.base, fontWeight: '800', color: '#0C831F' }}>
                        ₹{order.total}
                      </Text>
                    </View>

                    {/* Order Progress Step Tracker */}
                    {renderStatusTracker(order.orderStatus)}

                    {/* Customer Cancel Button */}
                    {(order.orderStatus === 'placed' || order.orderStatus === 'confirmed') && (
                      <TouchableOpacity
                        onPress={() => handleCancelOrder(order._id)}
                        style={{
                          marginTop: 16,
                          padding: 12,
                          borderRadius: 10,
                          backgroundColor: '#FEF2F2',
                          borderWidth: 1,
                          borderColor: '#DC2626',
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ color: '#DC2626', fontWeight: '800', fontSize: r.fontSize.sm }}>
                          Cancel Order
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
