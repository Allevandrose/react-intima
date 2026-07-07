import { createSlice } from "@reduxjs/toolkit";
import { login, register, getProfile } from "../../api/auth";
// 🆕 Added clearCartState import alongside fetchCart
import { fetchCart, clearCartState } from "./cartSlice";

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
      // 🆕 Note: clearCartState is handled inside the logoutUser async thunk below
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setUser, setToken, setError, logout, clearError } =
  authSlice.actions;

// Async thunks

// 🆕 Async logout thunk to cleanly clear both auth and cart states
export const logoutUser = () => (dispatch) => {
  dispatch(logout());
  dispatch(clearCartState());
};

// 🆕 Updated with role-based cart management and role redirection payload
export const loginUser = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await login(credentials);
    const { token, ...user } = response.data.data;

    dispatch(setToken(token));
    dispatch(setUser(user));

    // 🆕 Fetch cart only if user is NOT admin
    if (user.role !== "admin") {
      await dispatch(fetchCart());
    } else {
      // 🆕 Clear cart for admin users
      dispatch(clearCartState());
    }

    dispatch(setLoading(false));

    // 🆕 Return role for redirection
    return { success: true, role: user.role };
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
    const user = response.data.data;
    dispatch(setUser(user));

    // 🆕 Added role check to loadUser as well to keep behaviors consistent on refresh
    if (user.role !== "admin") {
      dispatch(fetchCart());
    } else {
      dispatch(clearCartState());
    }
  } catch (error) {
    dispatch(logoutUser()); // Updated to clean up cart states on invalid session tokens too
  }
};

export default authSlice.reducer;
