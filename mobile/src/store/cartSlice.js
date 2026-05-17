// src/store/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../services/api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await getCart();
    return data.cart;
  } catch { return rejectWithValue('Failed to load cart'); }
});

export const addItem = createAsyncThunk('cart/add', async (payload, { dispatch, rejectWithValue }) => {
  try {
    await addToCart(payload);
    dispatch(fetchCart());
  } catch { return rejectWithValue('Failed to add item'); }
});

export const updateItem = createAsyncThunk('cart/update', async ({ productId, qty }, { dispatch }) => {
  await updateCartItem({ productId, quantity: qty });
  dispatch(fetchCart());
});

export const removeItem = createAsyncThunk('cart/remove', async (productId, { dispatch }) => {
  await removeCartItem(productId);
  dispatch(fetchCart());
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCart.pending, (s) => { s.loading = true; })
     .addCase(fetchCart.fulfilled, (s, a) => {
       s.loading = false;
       s.items = a.payload?.items || [];
       s.total = s.items.reduce((sum, item) => sum + (item.price || item.product?.price || 0) * item.quantity, 0) - (a.payload?.discount || 0);
     })
     .addCase(fetchCart.rejected, (s) => { s.loading = false; });
  },
});

export default cartSlice.reducer;
