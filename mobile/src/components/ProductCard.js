// src/components/ProductCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/cartSlice';
import { useResponsive } from '../utils/responsive';
import Toast from 'react-native-toast-message';

export default function ProductCard({ product, cardWidth }) {
  const dispatch = useDispatch();
  const r = useResponsive();

  const handleAddToCart = async () => {
    try {
      await dispatch(addItem({ productId: product._id, quantity: 1 })).unwrap();
      Toast.show({ type: 'success', text1: 'Added to cart! 🛒', visibilityTime: 1500 });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to add' });
    }
  };

  const discountBadge = product.discount > 0;
  const imgSize = cardWidth ? cardWidth - 32 : r.isMobile ? 130 : 160;

  return (
    <View style={{
      width: cardWidth,
      backgroundColor: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
      margin: 6,
    }}>
      {/* Image */}
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: product.images?.[0] || 'https://via.placeholder.com/300' }}
          style={{
            width: '100%',
            height: imgSize,
            backgroundColor: '#F5F5F5',
          }}
          resizeMode="cover"
        />
        {discountBadge && (
          <View style={{
            position: 'absolute', top: 8, left: 8,
            backgroundColor: '#0C831F',
            paddingHorizontal: 8, paddingVertical: 3,
            borderRadius: 8,
          }}>
            <Text style={{ color: '#fff', fontSize: r.fontSize.xs, fontWeight: '800' }}>
              {product.discount}% OFF
            </Text>
          </View>
        )}
        {product.isBestSeller && (
          <View style={{
            position: 'absolute', top: 8, right: 8,
            backgroundColor: '#F8CB46',
            paddingHorizontal: 7, paddingVertical: 3,
            borderRadius: 8,
          }}>
            <Text style={{ color: '#000', fontSize: r.fontSize.xs, fontWeight: '800' }}>⭐ Best</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ padding: r.isMobile ? 10 : 14 }}>
        <Text style={{ fontSize: r.fontSize.xs, color: '#878787', marginBottom: 2 }} numberOfLines={1}>
          {product.unit}
        </Text>
        <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: '#1C1C1C', marginBottom: 8 }} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <Ionicons name="star" size={12} color="#F8CB46" />
          <Text style={{ fontSize: r.fontSize.xs, color: '#878787', fontWeight: '600' }}>
            {product.rating} ({product.reviewCount})
          </Text>
        </View>

        {/* Price + Add */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: r.fontSize.base, fontWeight: '800', color: '#1C1C1C' }}>
              ₹{product.price}
            </Text>
            {product.mrp > product.price && (
              <Text style={{ fontSize: r.fontSize.xs, color: '#BDBDBD', textDecorationLine: 'line-through' }}>
                ₹{product.mrp}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            style={{
              backgroundColor: '#0C831F',
              width: r.isMobile ? 32 : 38,
              height: r.isMobile ? 32 : 38,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={r.isMobile ? 18 : 22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
