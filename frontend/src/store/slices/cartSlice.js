import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.getCart();
    return data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addItemToCart = createAsyncThunk('cart/add', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.addToCart({ productId, quantity });
    return data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.updateCartItem({ productId, quantity });
    return data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeItem = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await api.removeFromCart(productId);
    return data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const applyCartCoupon = createAsyncThunk('cart/coupon', async (code, { rejectWithValue }) => {
  try {
    const { data } = await api.applyCoupon(code);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], discount: 0, coupon: null, loading: false, error: null, isOpen: false },
  reducers: {
    toggleCart: (state) => { state.isOpen = !state.isOpen; },
    closeCart: (state) => { state.isOpen = false; },
    clearCartState: (state) => { state.items = []; state.discount = 0; state.coupon = null; },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.items = action.payload.items || [];
        state.discount = action.payload.discount || 0;
        state.coupon = action.payload.coupon || null;
      }
    };
    builder
      .addCase(fetchCart.pending, (s) => { s.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(addItemToCart.pending, (s) => { s.loading = true; })
      .addCase(addItemToCart.fulfilled, setCart)
      .addCase(updateItem.fulfilled, setCart)
      .addCase(removeItem.fulfilled, setCart)
      .addCase(applyCartCoupon.fulfilled, (s, a) => { s.discount = a.payload.discount; })
      .addMatcher((action) => action.type.endsWith('/rejected'), (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { toggleCart, closeCart, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
