// src/screens/CartScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, Image,
  TouchableOpacity, ActivityIndicator, Modal, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { updateItem, removeItem, fetchCart } from '../store/cartSlice';
import { useResponsive } from '../utils/responsive';
import Toast from 'react-native-toast-message';
import api from '../services/api';

export default function CartScreen({ navigation }) {
  const { items, total, loading } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const r = useResponsive();

  // Checkout State
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Qty Modal State
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [customBulkMode, setCustomBulkMode] = useState(false);
  const [customQtyInput, setCustomQtyInput] = useState('');
  const [city, setCity] = useState('Chennai');
  const [stateName, setStateName] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('600001');
  const [payMethod, setPayMethod] = useState('cod'); // 'cod' or 'upi'
  const [placingOrder, setPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Toast.show({ type: 'error', text1: 'Address Required', text2: 'Please enter your shipping address' });
      return;
    }
    if (!city.trim() || !stateName.trim() || !pincode.trim()) {
      Toast.show({ type: 'error', text1: 'Details Required', text2: 'City, State, and Pincode are required' });
      return;
    }
    try {
      setPlacingOrder(true);
      const res = await api.post('/orders', {
        shippingAddress: {
          fullName: user?.name || 'Demo Customer',
          phone: user?.phone || '9876543210',
          street: address,
          city: city,
          state: stateName,
          pincode: pincode,
        },
        paymentMethod: payMethod,
        notes: notes || undefined
      });
      if (res.data.success) {
        Toast.show({ type: 'success', text1: 'Order Placed! 🎉', text2: 'Thank you for shopping with QuickPick!' });
        dispatch(fetchCart()); // Refresh empty cart
        setCheckoutVisible(false);
        setAddress('');
        setNotes('');
        navigation.navigate('OrdersTab');
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Order Failed', text2: e.response?.data?.message || 'Please try again' });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading && !checkoutVisible && items.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0C831F" />
      </View>
    );
  }

  if (!items || items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 72, marginBottom: 16 }}>🛒</Text>
          <Text style={{ fontSize: r.fontSize['2xl'], fontWeight: '800', color: '#1C1C1C', marginBottom: 8 }}>
            Your cart is empty
          </Text>
          <Text style={{ fontSize: r.fontSize.sm, color: '#878787', textAlign: 'center', marginBottom: 28 }}>
            Add some items to get started
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('HomeTab')}
            style={{
              backgroundColor: '#0C831F',
              paddingHorizontal: 28,
              paddingVertical: 14,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: r.fontSize.base }}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const containerPad = r.isMobile ? 16 : r.isTablet ? 24 : 48;
  const maxWidth = r.isDesktop ? 700 : '100%';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: containerPad,
          paddingVertical: 20,
          alignItems: r.isDesktop ? 'center' : 'stretch',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth }}>
          <Text style={{ fontSize: r.fontSize['2xl'], fontWeight: '800', color: '#1C1C1C', marginBottom: 20 }}>
            Your Cart ({items.length} items)
          </Text>

          {/* Items */}
          <View style={{ gap: 12, marginBottom: 20 }}>
            {items.map(item => (
              <View key={item._id} style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 2,
              }}>
                <Image
                  source={{ uri: item.product?.images?.[0] || 'https://via.placeholder.com/150' }}
                  style={{ width: r.isMobile ? 72 : 90, height: r.isMobile ? 72 : 90, borderRadius: 12, backgroundColor: '#F5F5F5' }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: '#1C1C1C', marginBottom: 2 }} numberOfLines={2}>
                    {item.product?.name}
                  </Text>
                  <Text style={{ fontSize: r.fontSize.xs, color: '#878787' }}>{item.product?.unit}</Text>
                  <Text style={{ fontSize: r.fontSize.base, fontWeight: '800', color: '#0C831F', marginTop: 4 }}>
                    ₹{item.price * item.quantity}
                  </Text>
                </View>
                <View style={{ alignItems: 'center', gap: 8 }}>
                  {/* Qty controls */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: '#E8E8E8',
                    borderRadius: 10,
                    overflow: 'hidden',
                  }}>
                    <TouchableOpacity
                      onPress={() => dispatch(removeItem(item.product?._id))}
                      style={{ padding: 8, backgroundColor: '#FEE2E2', borderRadius: 6, marginRight: 8 }}
                      disabled={loading}
                    >
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedItem(item);
                        setCustomBulkMode(false);
                        setCustomQtyInput(String(item.quantity));
                        setQtyModalVisible(true);
                      }}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: '#F3F4F6',
                        borderRadius: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: '#1C1C1C' }}>
                        Qty: {item.quantity === 0.25 ? '1/4' : item.quantity === 0.5 ? '1/2' : item.quantity}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color="#4B5563" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Summary */}
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: r.isMobile ? 16 : 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{ fontSize: r.fontSize.lg, fontWeight: '800', color: '#1C1C1C', marginBottom: 16 }}>
              Order Summary
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: r.fontSize.sm, color: '#878787' }}>Subtotal</Text>
              <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: '#1C1C1C' }}>₹{total}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: r.fontSize.sm, color: '#878787' }}>Delivery</Text>
              <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: '#0C831F' }}>FREE</Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#F5F5F5', marginVertical: 12 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: r.fontSize.lg, fontWeight: '800', color: '#1C1C1C' }}>Total</Text>
              <Text style={{ fontSize: r.fontSize.lg, fontWeight: '800', color: '#0C831F' }}>₹{total}</Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: '#0C831F',
                height: r.btnHeight,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setCheckoutVisible(true)}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: r.fontSize.base }}>
                Place Order →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Elegant Checkout Drawer Modal */}
      <Modal
        visible={checkoutVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCheckoutVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        >
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            maxHeight: '90%',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: r.fontSize.xl, fontWeight: '800', color: '#1C1C1C' }}>
                Delivery Details
              </Text>
              <TouchableOpacity onPress={() => setCheckoutVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#878787" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Shipping Address */}
              <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: '#1C1C1C', marginBottom: 8 }}>
                Shipping Address *
              </Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Enter building number, street name, landmark"
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={2}
                style={{
                  backgroundColor: '#F5F5F5',
                  borderRadius: 12,
                  padding: 12,
                  fontSize: r.fontSize.sm,
                  color: '#1C1C1C',
                  textAlignVertical: 'top',
                  borderWidth: 1.5,
                  borderColor: '#E8E8E8',
                  marginBottom: 14,
                }}
              />

              {/* City and State Row */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: '#1C1C1C', marginBottom: 6 }}>
                    City *
                  </Text>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor="#A0A0A0"
                    style={{
                      backgroundColor: '#F5F5F5',
                      borderRadius: 12,
                      padding: 12,
                      fontSize: r.fontSize.sm,
                      color: '#1C1C1C',
                      borderWidth: 1.5,
                      borderColor: '#E8E8E8',
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: '#1C1C1C', marginBottom: 6 }}>
                    State *
                  </Text>
                  <TextInput
                    value={stateName}
                    onChangeText={setStateName}
                    placeholder="State"
                    placeholderTextColor="#A0A0A0"
                    style={{
                      backgroundColor: '#F5F5F5',
                      borderRadius: 12,
                      padding: 12,
                      fontSize: r.fontSize.sm,
                      color: '#1C1C1C',
                      borderWidth: 1.5,
                      borderColor: '#E8E8E8',
                    }}
                  />
                </View>
              </View>

              {/* Pincode */}
              <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: '#1C1C1C', marginBottom: 6 }}>
                Pincode *
              </Text>
              <TextInput
                value={pincode}
                onChangeText={setPincode}
                placeholder="Pincode"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                maxLength={6}
                style={{
                  backgroundColor: '#F5F5F5',
                  borderRadius: 12,
                  padding: 12,
                  fontSize: r.fontSize.sm,
                  color: '#1C1C1C',
                  borderWidth: 1.5,
                  borderColor: '#E8E8E8',
                  marginBottom: 14,
                }}
              />

              {/* Delivery Notes */}
              <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: '#1C1C1C', marginBottom: 8 }}>
                Delivery Instructions (Optional)
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Leave at front door"
                placeholderTextColor="#A0A0A0"
                style={{
                  backgroundColor: '#F5F5F5',
                  borderRadius: 12,
                  padding: 12,
                  fontSize: r.fontSize.sm,
                  color: '#1C1C1C',
                  borderWidth: 1.5,
                  borderColor: '#E8E8E8',
                  marginBottom: 20,
                }}
              />

              {/* Payment Method */}
              <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: '#1C1C1C', marginBottom: 10 }}>
                Payment Method
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 28 }}>
                <TouchableOpacity
                  onPress={() => setPayMethod('cod')}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 14,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: payMethod === 'cod' ? '#0C831F' : '#E8E8E8',
                    backgroundColor: payMethod === 'cod' ? '#0C831F10' : '#fff',
                  }}
                >
                  <Ionicons name="cash" size={20} color={payMethod === 'cod' ? '#0C831F' : '#878787'} />
                  <Text style={{ fontWeight: '700', color: payMethod === 'cod' ? '#0C831F' : '#878787', fontSize: r.fontSize.sm }}>
                    Cash on Delivery
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPayMethod('upi')}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 14,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: payMethod === 'upi' ? '#0C831F' : '#E8E8E8',
                    backgroundColor: payMethod === 'upi' ? '#0C831F10' : '#fff',
                  }}
                >
                  <Ionicons name="card" size={20} color={payMethod === 'upi' ? '#0C831F' : '#878787'} />
                  <Text style={{ fontWeight: '700', color: payMethod === 'upi' ? '#0C831F' : '#878787', fontSize: r.fontSize.sm }}>
                    UPI / Card
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Placer Button */}
              <TouchableOpacity
                onPress={handlePlaceOrder}
                disabled={placingOrder}
                style={{
                  backgroundColor: '#0C831F',
                  height: 52,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 10,
                }}
              >
                {placingOrder ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: r.fontSize.base }}>
                      Pay & Confirm Order (₹{total})
                    </Text>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Quantity Selection Modal */}
      <Modal visible={qtyModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: r.fontSize.lg, fontWeight: '800', color: '#1C1C1C' }}>
                Select Quantity
              </Text>
              <TouchableOpacity onPress={() => setQtyModalVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {!customBulkMode ? (
              <View style={{ gap: 10 }}>
                {[
                  { label: '1/4 kg (250g)', val: 0.25 },
                  { label: '1/2 kg (500g)', val: 0.5 },
                  { label: '1 kg', val: 1 },
                  { label: '2 kg', val: 2 },
                  { label: '5 kg', val: 5 }
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.val}
                    onPress={() => {
                      dispatch(updateItem({ productId: selectedItem?.product?._id, qty: opt.val }));
                      setQtyModalVisible(false);
                    }}
                    style={{ padding: 14, backgroundColor: selectedItem?.quantity === opt.val ? '#E8F5E9' : '#F3F4F6', borderRadius: 8, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: r.fontSize.base, fontWeight: '700', color: selectedItem?.quantity === opt.val ? '#0C831F' : '#1C1C1C' }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity
                  onPress={() => setCustomBulkMode(true)}
                  style={{ padding: 14, backgroundColor: '#FEF2F2', borderRadius: 8, alignItems: 'center', marginTop: 10 }}
                >
                  <Text style={{ fontSize: r.fontSize.base, fontWeight: '800', color: '#DC2626' }}>+ Bulk Order (Custom Type)</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 15 }}>
                <Text style={{ color: '#4B5563', fontSize: r.fontSize.sm }}>Enter bulk quantity manually (e.g. 50):</Text>
                <TextInput
                  value={customQtyInput}
                  onChangeText={setCustomQtyInput}
                  keyboardType="numeric"
                  autoFocus
                  style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 16, fontSize: r.fontSize.xl, fontWeight: '800', textAlign: 'center', color: '#1C1C1C' }}
                />
                <TouchableOpacity
                  onPress={() => {
                    const parsed = parseFloat(customQtyInput);
                    if (!isNaN(parsed) && parsed > 0) {
                      dispatch(updateItem({ productId: selectedItem?.product?._id, qty: parsed }));
                      setQtyModalVisible(false);
                    } else {
                      Toast.show({ type: 'error', text1: 'Invalid Quantity', text2: 'Please enter a valid number greater than 0' });
                    }
                  }}
                  style={{ backgroundColor: '#0C831F', padding: 16, borderRadius: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: r.fontSize.base, fontWeight: '800' }}>Confirm Quantity</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
