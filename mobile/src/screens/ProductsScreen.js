// src/screens/ProductsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../utils/responsive';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const SORT_OPTIONS = [
  { label: 'Popular', value: 'popular' },
  { label: 'Price: Low', value: 'price_asc' },
  { label: 'Price: High', value: 'price_desc' },
  { label: 'Discount', value: 'discount' },
];

export default function ProductsScreen({ searchQuery }) {
  const r = useResponsive();
  const { width } = useWindowDimensions();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [sort, setSort] = useState('popular');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts({ limit: 60 }), getCategories()])
      .then(([pRes, cRes]) => {
        setProducts(pRes.data.products || []);
        setCategories(cRes.data.categories || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const cols = r.productColumns;
  const hPad = r.isMobile ? 12 : r.isTablet ? 20 : 40;
  const cardWidth = (width - hPad * 2 - 12 * (cols - 1)) / cols - 12;

  const filtered = products
    .filter(p => (!searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
              && (!selectedCat || p.category?._id === selectedCat))
    .sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'discount') return b.discount - a.discount;
      return b.reviewCount - a.reviewCount;
    });

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#0C831F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: hPad, paddingVertical: 16 }}>

          {/* Sort Options */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setSort(opt.value)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: sort === opt.value ? '#0C831F' : '#fff',
                    borderWidth: 1.5,
                    borderColor: sort === opt.value ? '#0C831F' : '#E8E8E8',
                  }}
                >
                  <Text style={{
                    fontSize: r.fontSize.sm, fontWeight: '700',
                    color: sort === opt.value ? '#fff' : '#878787',
                  }}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setSelectedCat(null)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: !selectedCat ? '#1C1C1C' : '#fff',
                  borderWidth: 1.5,
                  borderColor: !selectedCat ? '#1C1C1C' : '#E8E8E8',
                }}
              >
                <Text style={{ fontSize: r.fontSize.xs, fontWeight: '700', color: !selectedCat ? '#fff' : '#878787' }}>All</Text>
              </TouchableOpacity>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat._id}
                  onPress={() => setSelectedCat(selectedCat === cat._id ? null : cat._id)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                    paddingHorizontal: 12, paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: selectedCat === cat._id ? '#1C1C1C' : '#fff',
                    borderWidth: 1.5,
                    borderColor: selectedCat === cat._id ? '#1C1C1C' : '#E8E8E8',
                  }}
                >
                  <Text style={{ fontSize: 12 }}>{cat.icon}</Text>
                  <Text style={{
                    fontSize: r.fontSize.xs, fontWeight: '700',
                    color: selectedCat === cat._id ? '#fff' : '#878787',
                  }}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Count */}
          <Text style={{ fontSize: r.fontSize.sm, color: '#878787', marginBottom: 14, fontWeight: '600' }}>
            {filtered.length} products
          </Text>

          {/* Grid */}
          <View>
            {Array.from({ length: Math.ceil(filtered.length / cols) }, (_, i) => (
              <View key={i} style={{ flexDirection: 'row' }}>
                {filtered.slice(i * cols, i * cols + cols).map(p => (
                  <ProductCard key={p._id} product={p} cardWidth={cardWidth} />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
