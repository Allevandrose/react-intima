import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.VITE_BASE_URL;

// Create axios instance with timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Token management
export const getAuthToken = () => {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("tokenExpiry");

  if (token && expiry) {
    // Check if token is expired
    if (Date.now() > parseInt(expiry)) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("user");
      return null;
    }
    return token;
  }
  return null;
};

export const setAuthToken = (token, rememberMe = false) => {
  if (token) {
    localStorage.setItem("token", token);
    // Set expiry: 30 days if remember me, otherwise session only (browser close)
    if (rememberMe) {
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
      localStorage.setItem("tokenExpiry", expiry.toString());
    } else {
      // Session storage for non-remembered
      sessionStorage.setItem("token", token);
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    sessionStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
};

// Check if token exists (either storage)
export const hasValidToken = () => {
  const token = getAuthToken();
  if (token) return true;
  // Check session storage
  const sessionToken = sessionStorage.getItem("token");
  return !!sessionToken;
};

// Get image URL helper
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads")) {
    return `${BASE_URL}${path}`;
  }
  return path;
};

// ✅ NEW: Refresh token function
export const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const response = await api.post("/auth/refresh-token", { refreshToken });
    const { token, refreshToken: newRefreshToken } = response.data.data;

    setAuthToken(token, true);
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }
    return token;
  } catch (error) {
    // Refresh failed - clear everything
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    return null;
  }
};

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    // Skip auth header for refresh token endpoint
    if (config.url?.includes("/auth/refresh-token")) {
      return config;
    }

    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ NEW: Response interceptor with retry and refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for auth endpoints
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAuthToken();
        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Refresh failed - redirect to login
          processQueue(new Error("Refresh failed"), null);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("tokenExpiry");
          localStorage.removeItem("user");
          sessionStorage.removeItem("token");
          if (
            !window.location.pathname.includes("/login") &&
            !window.location.pathname.includes("/register") &&
            !window.location.pathname.includes("/forgot-password")
          ) {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register") &&
        !window.location.pathname.includes("/forgot-password")
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
