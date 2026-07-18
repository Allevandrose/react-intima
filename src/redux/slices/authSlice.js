import { createSlice } from "@reduxjs/toolkit";
import {
  login,
  register,
  getProfile,
  logout as apiLogout,
} from "../../api/auth";
import { setAuthToken, getAuthToken } from "../../api/index";
import { clearCartState } from "./cartSlice";

// ✅ FIX: Import axios to remove auth header
import axios from "axios";

// Check both localStorage and sessionStorage for token
const getStoredToken = () => {
  const token = localStorage.getItem("token");
  if (token) return token;
  return sessionStorage.getItem("token") || null;
};

const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const initialState = {
  user: getUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  isLoading: false,
  error: null,
  rememberMe: false,
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
      if (state.rememberMe) {
        localStorage.setItem("token", action.payload);
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("token", action.payload);
        localStorage.removeItem("token");
      }
      setAuthToken(action.payload);
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    // ✅ Immediate logout - clears state without waiting for API
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.rememberMe = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      // ✅ FIX: Remove auth header from axios
      delete axios.defaults.headers.common["Authorization"];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setUser,
  setToken,
  setError,
  clearAuth,
  clearError,
  setRememberMe,
} = authSlice.actions;

// ✅ OPTIMIZED: Logout clears state immediately, API call is non-blocking
export const logoutUser = () => async (dispatch) => {
  // ✅ Clear auth state FIRST (instant)
  dispatch(clearAuth());
  dispatch(clearCartState());

  // ✅ Then try to notify server (non-blocking) - don't await, let it run in background
  apiLogout().catch((error) => {
    // Ignore errors on logout - user is already logged out locally
    console.debug("Logout API call failed, but user is logged out locally");
  });
};

export const loginUser =
  (credentials, rememberMe = false) =>
  async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      dispatch(setRememberMe(rememberMe));

      const response = await login(credentials);
      const { token, refreshToken, ...user } = response.data.data;

      dispatch(setToken(token));
      dispatch(setUser(user));

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      dispatch(setLoading(false));
      return { success: true, role: user.role, user };
    } catch (error) {
      dispatch(setError(error.response?.data?.message || "Login failed"));
      dispatch(setLoading(false));
      return { success: false, error: error.response?.data?.message };
    }
  };

export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const response = await register(userData);
    const { token, refreshToken, ...user } = response.data.data;

    dispatch(setRememberMe(true));
    dispatch(setToken(token));
    dispatch(setUser(user));

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    dispatch(setLoading(false));
    return { success: true, user };
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Registration failed"));
    dispatch(setLoading(false));
    return {
      success: false,
      error: error.response?.data?.message,
      field: error.response?.data?.field,
      errors: error.response?.data?.errors,
    };
  }
};

export const loadUser = () => async (dispatch) => {
  try {
    const token = getAuthToken();
    if (!token) {
      const sessionToken = sessionStorage.getItem("token");
      if (!sessionToken) {
        dispatch(clearAuth());
        return;
      }
    }

    const response = await getProfile();
    const user = response.data.data;
    dispatch(setUser(user));
  } catch (error) {
    dispatch(clearAuth());
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

export default authSlice.reducer;
