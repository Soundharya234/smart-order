import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('leoedi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('leoedi_token');
      localStorage.removeItem('leoedi_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Products
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const searchSuggestions = (q) => API.get('/products/search/suggestions', { params: { q } });
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// Categories
export const getCategories = () => API.get('/categories');
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Cart
export const getCart = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart/add', data);
export const updateCartItem = (data) => API.put('/cart/update', data);
export const removeFromCart = (productId) => API.delete(`/cart/remove/${productId}`);
export const clearCart = () => API.delete('/cart/clear');
export const applyCoupon = (code) => API.post('/cart/coupon', { code });

// Orders
export const placeOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/my');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);
export const getAllOrders = (params) => API.get('/orders/admin/all', { params });
export const updateOrderStatus = (id, data) => API.put(`/orders/admin/${id}/status`, data);
export const getAnalytics = () => API.get('/orders/admin/analytics');

// Banners
export const getBanners = (params) => API.get('/banners', { params });
export const createBanner = (data) => API.post('/banners', data);
export const updateBanner = (id, data) => API.put(`/banners/${id}`, data);
export const deleteBanner = (id) => API.delete(`/banners/${id}`);

// Coupons
export const getCoupons = () => API.get('/coupons');
export const getAllCoupons = () => API.get('/coupons/admin/all');
export const createCoupon = (data) => API.post('/coupons/admin', data);
export const deleteCoupon = (id) => API.delete(`/coupons/admin/${id}`);

// Users
export const getAddresses = () => API.get('/users/addresses');
export const addAddress = (data) => API.post('/users/addresses', data);
export const deleteAddress = (id) => API.delete(`/users/addresses/${id}`);
export const toggleWishlist = (productId) => API.put(`/users/wishlist/${productId}`);
export const getAllUsers = (params) => API.get('/users/admin/all', { params });
export const toggleUserStatus = (id) => API.put(`/users/admin/${id}/toggle`);

export default API;
