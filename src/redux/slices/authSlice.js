// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { login, register, getProfile } from "../../api/auth";
import { fetchCart } from "./cartSlice";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setUser, setToken, setError, logout, clearError } =
  authSlice.actions;

// Async thunks
export const loginUser = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await login(credentials);
    const { token, ...user } = response.data.data;

    dispatch(setToken(token));
    dispatch(setUser(user));

    // Fetch user's cart after login
    await dispatch(fetchCart());

    dispatch(setLoading(false));
    return { success: true };
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Login failed"));
    dispatch(setLoading(false));
    return { success: false, error: error.response?.data?.message };
  }
};

export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await register(userData);
    const { token, ...user } = response.data.data;
    dispatch(setToken(token));
    dispatch(setUser(user));

    dispatch(setLoading(false));
    return { success: true };
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Registration failed"));
    dispatch(setLoading(false));
    return { success: false, error: error.response?.data?.message };
  }
};

export const loadUser = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await getProfile();
    dispatch(setUser(response.data.data));
    dispatch(fetchCart());
  } catch (error) {
    dispatch(logout());
  }
};

export default authSlice.reducer;
