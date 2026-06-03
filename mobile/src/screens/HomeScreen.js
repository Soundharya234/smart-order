// src/screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, FlatList,
  TouchableOpacity, Image, ActivityIndicator,
  RefreshControl, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../utils/responsive';
import ProductCard from '../components/ProductCard';
import api, { getProducts, getCategories, getBanners } from '../services/api';

export default function HomeScreen({ searchQuery }) {
  const r = useResponsive();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [pRes, cRes, bRes, sRes] = await Promise.all([
        getProducts({ limit: 40 }),
        getCategories(),
        getBanners(),
        api.get('/store-settings'),
      ]);
      setProducts(pRes.data.products || []);
      setCategories(cRes.data.categories || []);
      setBanners(bRes.data.banners || []);
      setIsStoreOpen(sRes.data?.isStoreOpen ?? true);
    } catch (e) {
      console.log('fetch error', e?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !selectedCat || p.category === selectedCat || p.category?._id === selectedCat;
    return matchesSearch && matchesCat;
  });

  // Calculate card width for grid
  const { width } = useWindowDimensions();
  const cols = r.productColumns;
  const horizontalPad = r.isMobile ? 12 : r.isTablet ? 20 : 40;
  const gap = 12;
  const cardWidth = (width - horizontalPad * 2 - gap * (cols - 1)) / cols - 12;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#0C831F" />
        <Text style={{ marginTop: 12, color: '#878787', fontSize: r.fontSize.sm }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F5F5F5' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={['#0C831F']} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Banner */}
      {banners.length > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          {banners.map((b, i) => (
            <View key={i} style={{
              width: r.width,
              height: r.isMobile ? 160 : r.isTablet ? 220 : 280,
              backgroundColor: b.bgColor || '#0C831F',
              overflow: 'hidden',
            }}>
              <Image
                source={{ uri: b.image }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              <View style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: r.isMobile ? 16 : 24,
                backgroundColor: 'rgba(0,0,0,0.35)',
              }}>
                {b.badgeText && (
                  <View style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#F8CB46',
                    paddingHorizontal: 10, paddingVertical: 4,
                    borderRadius: 8, marginBottom: 6,
                  }}>
                    <Text style={{ fontSize: r.fontSize.xs, fontWeight: '800', color: '#000' }}>{b.badgeText}</Text>
                  </View>
                )}
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: r.fontSize.xl }}>{b.title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: r.fontSize.sm, marginTop: 2 }}>{b.subtitle}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Store Closed Banner */}
      {!isStoreOpen && (
        <View style={{
          backgroundColor: '#FEF2F2',
          borderColor: '#F87171',
          borderWidth: 1,
          padding: 14,
          marginHorizontal: horizontalPad,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
        }}>
          <Text style={{ fontSize: 24 }}>🏪</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: r.fontSize.base, fontWeight: '800', color: '#B91C1C' }}>
              Currently Not Taking Orders
            </Text>
            <Text style={{ fontSize: r.fontSize.sm, color: '#DC2626', marginTop: 2, lineHeight: 18 }}>
              Store is currently closed. You can browse our products, but cannot place an order right now.
            </Text>
          </View>
        </View>
      )}

      <View style={{ paddingHorizontal: horizontalPad }}>
        {/* Delivery Badge */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#E8F5E9',
          paddingHorizontal: 14, paddingVertical: 8,
          borderRadius: 12, marginBottom: 20,
          alignSelf: 'flex-start',
        }}>
          <Text style={{ fontSize: r.fontSize.base }}>⚡</Text>
          <Text style={{ fontSize: r.fontSize.sm, fontWeight: '700', color: '#0C831F' }}>
            Delivery in 15 minutes
          </Text>
        </View>

        {/* Categories */}
        {categories.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: r.fontSize.lg, fontWeight: '800', color: '#1C1C1C', marginBottom: 14 }}>
              Shop by Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -horizontalPad, paddingHorizontal: horizontalPad }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setSelectedCat(null)}
                  style={{
                    paddingHorizontal: 18, paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: !selectedCat ? '#0C831F' : '#fff',
                    borderWidth: 1.5,
                    borderColor: !selectedCat ? '#0C831F' : '#E8E8E8',
                  }}
                >
                  <Text style={{
                    fontSize: r.fontSize.sm, fontWeight: '700',
                    color: !selectedCat ? '#fff' : '#1C1C1C',
                  }}>All</Text>
                </TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat._id}
                    onPress={() => setSelectedCat(selectedCat === cat._id ? null : cat._id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 14, paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: selectedCat === cat._id ? '#0C831F' : '#fff',
                      borderWidth: 1.5,
                      borderColor: selectedCat === cat._id ? '#0C831F' : '#E8E8E8',
                    }}
                  >
                    <Text style={{ fontSize: r.fontSize.sm }}>{cat.icon}</Text>
                    <Text style={{
                      fontSize: r.fontSize.sm, fontWeight: '700',
                      color: selectedCat === cat._id ? '#fff' : '#1C1C1C',
                    }}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Products Grid */}
        <Text style={{ fontSize: r.fontSize.lg, fontWeight: '800', color: '#1C1C1C', marginBottom: 14 }}>
          {searchQuery ? `Results for "${searchQuery}"` : selectedCat ? 'Category Products' : 'All Products'}
          <Text style={{ color: '#878787', fontSize: r.fontSize.sm, fontWeight: '600' }}> ({filteredProducts.length})</Text>
        </Text>

        {filteredProducts.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🛒</Text>
            <Text style={{ fontSize: r.fontSize.lg, fontWeight: '700', color: '#1C1C1C', marginBottom: 4 }}>
              No products found
            </Text>
            <Text style={{ fontSize: r.fontSize.sm, color: '#878787' }}>Try a different search</Text>
          </View>
        ) : (
          // Manual grid using rows
          <View style={{ marginBottom: 24 }}>
            {Array.from({ length: Math.ceil(filteredProducts.length / cols) }, (_, rowIdx) => (
              <View key={rowIdx} style={{ flexDirection: 'row', marginBottom: 0 }}>
                {filteredProducts.slice(rowIdx * cols, rowIdx * cols + cols).map(product => (
                  <ProductCard key={product._id} product={product} cardWidth={cardWidth} />
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
