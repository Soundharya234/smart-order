// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  StatusBar, SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { login, register, clearError } from '../store/authSlice';
import { fetchCart } from '../store/cartSlice';
import { useResponsive } from '../utils/responsive';
import Toast from 'react-native-toast-message';

export default function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const dispatch = useDispatch();
  const { loading, error } = useSelector(s => s.auth);
  const r = useResponsive();

  const update = (field) => (val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        const res = await dispatch(login({ email: form.email, password: form.password })).unwrap();
        await dispatch(fetchCart());
        Toast.show({ type: 'success', text1: `Welcome back, ${res.user.name}! 🎉` });
        navigation.replace(res.user.role === 'admin' ? 'Admin' : 'Main');
      } else {
        const res = await dispatch(register(form)).unwrap();
        Toast.show({ type: 'success', text1: `Welcome to QuickPick, ${res.user.name}! 🚀` });
        navigation.replace('Main');
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: err || 'Something went wrong' });
    }
  };



  const inputStyle = {
    height: r.inputHeight,
    fontSize: r.fontSize.base,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingRight: 48,
    backgroundColor: '#fff',
    color: '#1C1C1C',
    marginBottom: 14,
  };

  const cardWidth = r.isMobile ? '100%' : r.isTablet ? '80%' : '40%';
  const maxCardWidth = r.isDesktop ? 460 : r.isTablet ? 480 : '100%';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: r.spacing.lg,
            paddingVertical: r.spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card */}
          <View style={{
            width: cardWidth,
            maxWidth: maxCardWidth,
            backgroundColor: '#fff',
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
            elevation: 8,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <View style={{ padding: r.isMobile ? 28 : 40, paddingBottom: r.spacing.lg }}>
              {/* Logo */}
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: r.fontSize['4xl'], fontWeight: '900', letterSpacing: -1 }}>
                  <Text style={{ color: '#0C831F' }}>Quick</Text>
                  <Text style={{ color: '#F8CB46' }}>Pick</Text>
                </Text>
                <Text style={{ fontSize: r.fontSize.xs, color: '#878787', fontWeight: '600', marginTop: 2 }}>
                  India's last minute app
                </Text>
              </View>

              {/* Tabs */}
              <View style={{
                flexDirection: 'row',
                backgroundColor: '#F5F5F5',
                borderRadius: 14,
                padding: 4,
                marginBottom: 24,
              }}>
                {['Log in', 'Sign up'].map((tab, i) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => { setIsLogin(i === 0); dispatch(clearError()); }}
                    style={{
                      flex: 1,
                      height: r.isMobile ? 42 : 46,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 10,
                      backgroundColor: (isLogin ? i === 0 : i === 1) ? '#fff' : 'transparent',
                      shadowColor: (isLogin ? i === 0 : i === 1) ? '#000' : 'transparent',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.06,
                      shadowRadius: 4,
                      elevation: (isLogin ? i === 0 : i === 1) ? 2 : 0,
                    }}
                  >
                    <Text style={{
                      fontSize: r.fontSize.sm,
                      fontWeight: '700',
                      color: (isLogin ? i === 0 : i === 1) ? '#1C1C1C' : '#878787',
                    }}>{tab}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Form */}
              {!isLogin && (
                <>
                  <TextInput
                    placeholder="Full Name"
                    value={form.name}
                    onChangeText={update('name')}
                    style={inputStyle}
                    placeholderTextColor="#BDBDBD"
                  />
                  <TextInput
                    placeholder="Phone Number"
                    value={form.phone}
                    onChangeText={update('phone')}
                    keyboardType="phone-pad"
                    style={inputStyle}
                    placeholderTextColor="#BDBDBD"
                  />
                </>
              )}
              <TextInput
                placeholder="Email Address"
                value={form.email}
                onChangeText={update('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                style={inputStyle}
                placeholderTextColor="#BDBDBD"
              />
              <View style={{ position: 'relative', marginBottom: 14 }}>
                <TextInput
                  placeholder="Password"
                  value={form.password}
                  onChangeText={update('password')}
                  secureTextEntry={!showPass}
                  style={{ ...inputStyle, marginBottom: 0 }}
                  placeholderTextColor="#BDBDBD"
                />
                <TouchableOpacity
                  onPress={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' }}
                >
                  <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color="#BDBDBD" />
                </TouchableOpacity>
              </View>

              {error && (
                <View style={{
                  backgroundColor: '#FEF2F2',
                  borderWidth: 1,
                  borderColor: '#FECACA',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 14,
                }}>
                  <Text style={{ color: '#DC2626', fontSize: r.fontSize.sm, textAlign: 'center' }}>{error}</Text>
                </View>
              )}

              {/* Submit */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={{
                  height: r.btnHeight,
                  backgroundColor: '#0C831F',
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 4,
                  opacity: loading ? 0.8 : 1,
                }}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: '#fff', fontWeight: '800', fontSize: r.fontSize.base, letterSpacing: 0.5 }}>
                      Continue
                    </Text>
                }
              </TouchableOpacity>
            </View>



            {/* Footer */}
            <View style={{ backgroundColor: '#FAFAFA', padding: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>
              <Text style={{ fontSize: r.fontSize.xs, color: '#878787', textAlign: 'center' }}>
                By continuing, you agree to our Terms & Privacy Policy
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
