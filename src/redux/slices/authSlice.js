import { createSlice } from "@reduxjs/toolkit";
import {
  login,
  register,
  getProfile,
  logout as apiLogout,
} from "../../api/auth";
import { setAuthToken, getAuthToken } from "../../api/index";
import { clearCartState } from "./cartSlice";

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
    // ✅ FIXED: Use setAuthToken to properly remove the header
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
      // ✅ FIX: Use setAuthToken to properly remove the header
      setAuthToken(null);
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

// ✅ FIXED: Logout handles API call first, then clears local state
export const logoutUser = () => async (dispatch) => {
  // ✅ Step 1: Try server logout (with current token)
  try {
    await apiLogout();
    console.log("✅ Server logout successful");
  } catch (error) {
    // ✅ Server logout failed - ignore, we'll clear locally anyway
    const status = error.response?.status;
    if (status === 401) {
      console.debug("Token expired, clearing locally");
    } else {
      console.debug("Logout API call failed:", error.message);
    }
  }

  // ✅ Step 2: Always clear local state (regardless of API success)
  dispatch(clearAuth());
  dispatch(clearCartState());
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
