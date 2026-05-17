// src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, registerUser, getMe, setAuthToken } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await loginUser(creds);
    await AsyncStorage.setItem('qp_token', data.token);
    await AsyncStorage.setItem('qp_user', JSON.stringify(data.user));
    setAuthToken(data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (form, { rejectWithValue }) => {
  try {
    const { data } = await registerUser(form);
    await AsyncStorage.setItem('qp_token', data.token);
    await AsyncStorage.setItem('qp_user', JSON.stringify(data.user));
    setAuthToken(data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loadStoredAuth = createAsyncThunk('auth/loadStored', async () => {
  const token = await AsyncStorage.getItem('qp_token');
  const user = await AsyncStorage.getItem('qp_user');
  if (token) setAuthToken(token);
  return { token, user: user ? JSON.parse(user) : null };
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, loading: false, error: null, initialized: false },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      AsyncStorage.removeItem('qp_token');
      AsyncStorage.removeItem('qp_user');
      setAuthToken(null);
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(login.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; })
     .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(register.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(register.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; })
     .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(loadStoredAuth.fulfilled, (s, a) => { s.user = a.payload.user; s.token = a.payload.token; s.initialized = true; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
