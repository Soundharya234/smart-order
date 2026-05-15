// src/navigation/MainNavigator.js
import React, { useState } from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useResponsive } from '../utils/responsive';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import AdminScreen from '../screens/AdminScreen';
import Navbar from '../components/Navbar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabLayout({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { items } = useSelector(s => s.cart);
  const r = useResponsive();
  const cartCount = items?.reduce((a, i) => a + i.quantity, 0) || 0;

  return (
    <View style={{ flex: 1 }}>
      <Navbar navigation={navigation} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            height: r.isMobile ? 72 : 78,
            paddingBottom: r.isMobile ? 14 : 16,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: r.fontSize.xs,
            fontWeight: '700',
            marginTop: 2,
          },
          tabBarActiveTintColor: '#0C831F',
          tabBarInactiveTintColor: '#BDBDBD',
          tabBarIcon: ({ color, focused }) => {
            const icons = {
              HomeTab: focused ? 'home' : 'home-outline',
              ProductsTab: focused ? 'cube' : 'cube-outline',
              CartTab: focused ? 'bag' : 'bag-outline',
              OrdersTab: focused ? 'receipt' : 'receipt-outline',
            };
            return <Ionicons name={icons[route.name]} size={r.isMobile ? 22 : 24} color={color} />;
          },
        })}
      >
        <Tab.Screen name="HomeTab" options={{ title: 'Home' }}>
          {() => <HomeScreen searchQuery={searchQuery} />}
        </Tab.Screen>
        <Tab.Screen name="ProductsTab" options={{ title: 'Products' }}>
          {() => <ProductsScreen searchQuery={searchQuery} />}
        </Tab.Screen>
        <Tab.Screen
          name="CartTab"
          options={{
            title: 'Cart',
            tabBarBadge: cartCount > 0 ? cartCount : undefined,
            tabBarBadgeStyle: { backgroundColor: '#0C831F', color: '#fff', fontSize: 10 },
          }}
        >
          {() => <CartScreen navigation={navigation} />}
        </Tab.Screen>
        <Tab.Screen name="OrdersTab" options={{ title: 'Orders' }}>
          {() => <OrdersScreen navigation={navigation} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Auth" component={LoginScreen} />
      <Stack.Screen name="Main" component={TabLayout} />
      <Stack.Screen name="Admin" component={AdminScreen} />
    </Stack.Navigator>
  );
}
