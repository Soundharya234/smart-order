// src/services/api.js
import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://smart-order-rg1e.onrender.com/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach token from store dynamically
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const getProducts = (params) => api.get('/products', { params });
export const getCategories = () => api.get('/categories');
export const getBanners = () => api.get('/banners');
export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart/add', data);
export const updateCartItem = (data) => api.put('/cart/update', data);
export const removeCartItem = (productId) => api.delete(`/cart/remove/${productId}`);
export const getOrders = () => api.get('/orders/my');
export const createOrder = (data) => api.post('/orders', data);

export default api;
