// src/components/Navbar.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  useWindowDimensions, Modal, ScrollView, Pressable,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../store/authSlice';
import { useResponsive } from '../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Navbar({ navigation, searchQuery, setSearchQuery }) {
  const { user } = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const dispatch = useDispatch();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

  const navLinks = [
    { label: 'Home', screen: 'HomeTab' },
    { label: 'Products', screen: 'ProductsTab' },
    { label: 'Orders', screen: 'OrdersTab' },
  ];

  return (
    <>
      <View style={{
        backgroundColor: '#fff',
        paddingTop: insets.top + (r.isMobile ? 8 : 12),
        paddingBottom: r.isMobile ? 10 : 14,
        paddingHorizontal: r.isMobile ? 16 : r.isTablet ? 24 : 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
      }}>
        {/* Row 1: Logo + Actions */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: r.isMobile ? 10 : 0,
        }}>
          {/* Logo */}
          <TouchableOpacity onPress={() => navigation.navigate('HomeTab')}>
            <Text style={{ fontSize: r.fontSize.xl, fontWeight: '900', letterSpacing: -0.5 }}>
              <Text style={{ color: '#0C831F' }}>Quick</Text>
              <Text style={{ color: '#F8CB46' }}>Pick</Text>
            </Text>
          </TouchableOpacity>

          {/* Desktop Nav Links */}
          {!r.isMobile && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
              {navLinks.map(l => (
                <TouchableOpacity key={l.screen} onPress={() => navigation.navigate('Main', { screen: l.screen })}>
                  <Text style={{ fontSize: r.fontSize.sm, fontWeight: '600', color: '#1C1C1C' }}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: r.isMobile ? 12 : 16 }}>
            {/* Cart */}
            <TouchableOpacity
              onPress={() => navigation.navigate('CartTab')}
              style={{ position: 'relative', padding: 2 }}
            >
              <Ionicons name="bag-outline" size={r.isMobile ? 22 : 26} color="#1C1C1C" />
              {cartCount > 0 && (
                <View style={{
                  position: 'absolute', top: -4, right: -6,
                  backgroundColor: '#0C831F',
                  borderRadius: 10, minWidth: 18, height: 18,
                  alignItems: 'center', justifyContent: 'center',
                  paddingHorizontal: 3,
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* User */}
            {user ? (
              <TouchableOpacity
                onPress={() => {
                  dispatch(logout());
                  navigation.replace('Auth');
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#F5F5F5',
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 10,
                }}
              >
                <View style={{
                  width: r.isMobile ? 24 : 28,
                  height: r.isMobile ? 24 : 28,
                  backgroundColor: '#0C831F',
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: r.fontSize.xs }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                {!r.isMobile && (
                  <Text style={{ fontSize: r.fontSize.sm, fontWeight: '600', color: '#1C1C1C' }}>
                    {user.name?.split(' ')[0]}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.replace('Auth')}
                style={{
                  backgroundColor: '#0C831F',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: r.fontSize.sm }}>Login</Text>
              </TouchableOpacity>
            )}

            {/* Hamburger for mobile */}
            {r.isMobile && (
              <TouchableOpacity onPress={() => setMenuOpen(true)}>
                <Ionicons name="menu" size={26} color="#1C1C1C" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Bar - always visible */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F5F5F5',
          borderRadius: 12,
          paddingHorizontal: 14,
          height: r.isMobile ? 42 : 48,
          gap: 10,
        }}>
          <Ionicons name="search" size={18} color="#878787" />
          <TextInput
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              fontSize: r.fontSize.sm,
              color: '#1C1C1C',
              paddingVertical: 0,
            }}
            placeholderTextColor="#BDBDBD"
          />
          {searchQuery?.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#BDBDBD" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mobile Menu Modal */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setMenuOpen(false)}>
          <View style={{
            position: 'absolute',
            right: 0, top: 0, bottom: 0,
            width: '72%',
            backgroundColor: '#fff',
            paddingTop: insets.top + 20,
            paddingHorizontal: 24,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>
              <Text style={{ fontSize: r.fontSize.xl, fontWeight: '900' }}>
                <Text style={{ color: '#0C831F' }}>Quick</Text>
                <Text style={{ color: '#F8CB46' }}>Pick</Text>
              </Text>
              <TouchableOpacity onPress={() => setMenuOpen(false)}>
                <Ionicons name="close" size={24} color="#1C1C1C" />
              </TouchableOpacity>
            </View>
            {navLinks.map(l => (
              <TouchableOpacity
                key={l.screen}
                onPress={() => { navigation.navigate('Main', { screen: l.screen }); setMenuOpen(false); }}
                style={{
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F5F5F5',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Text style={{ fontSize: r.fontSize.lg, fontWeight: '600', color: '#1C1C1C' }}>{l.label}</Text>
              </TouchableOpacity>
            ))}
            {user && (
              <TouchableOpacity
                onPress={() => { dispatch(logout()); navigation.replace('Auth'); setMenuOpen(false); }}
                style={{
                  marginTop: 24,
                  backgroundColor: '#FEF2F2',
                  padding: 14,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: r.fontSize.base }}>Logout</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
