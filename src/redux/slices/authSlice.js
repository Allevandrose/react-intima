import { createSlice } from "@reduxjs/toolkit";
import {
  login,
  register,
  getProfile,
  logout as apiLogout,
} from "../../api/auth";
import { setAuthToken, getAuthToken } from "../../api/index";
import { fetchCart, clearCartState } from "./cartSlice";

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
      setAuthToken(action.payload, state.rememberMe);
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    // ✅ Fixed: Rename the logout reducer to clearAuth to avoid conflict
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.rememberMe = false;
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// ✅ Fixed: Export actions with clearAuth instead of logout
export const {
  setLoading,
  setUser,
  setToken,
  setError,
  clearAuth,
  clearError,
  setRememberMe,
} = authSlice.actions;

// ✅ Fixed: Rename logoutUser thunk to use clearAuth
export const logoutUser = () => async (dispatch) => {
  try {
    await apiLogout();
  } catch (error) {
    // Ignore errors on logout
  }
  dispatch(clearAuth());
  dispatch(clearCartState());
};

export const loginUser =
  (credentials, rememberMe = false) =>
  async (dispatch) => {
    try {
      dispatch(setLoading(true));
      dispatch(setRememberMe(rememberMe));

      const response = await login(credentials);
      const { token, refreshToken, ...user } = response.data.data;

      dispatch(setToken(token));
      dispatch(setUser(user));

      // Store refresh token
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Fetch cart only if not admin
      if (user.role !== "admin") {
        await dispatch(fetchCart());
      } else {
        dispatch(clearCartState());
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
    const response = await register(userData);
    const { token, refreshToken, ...user } = response.data.data;

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
    return { success: false, error: error.response?.data?.message };
  }
};

export const loadUser = () => async (dispatch) => {
  try {
    const token = getAuthToken();
    if (!token) {
      // Check session storage
      const sessionToken = sessionStorage.getItem("token");
      if (!sessionToken) return;
    }

    const response = await getProfile();
    const user = response.data.data;
    dispatch(setUser(user));

    if (user.role !== "admin") {
      dispatch(fetchCart());
    } else {
      dispatch(clearCartState());
    }
  } catch (error) {
    dispatch(logoutUser());
  }
};

export default authSlice.reducer;
