import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Get auth token from localStorage or sessionStorage
export const getAuthToken = () => {
  return (
    localStorage.getItem("token") || sessionStorage.getItem("token") || null
  );
};

// Set auth token
export const setAuthToken = (token) => {
  if (token) {
    // Only set in localStorage - sessionStorage is handled separately
    // The caller (authSlice) decides where to store based on rememberMe
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Get image URL
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = import.meta.env.VITE_API_URL;
  // Remove trailing slash from baseUrl if it ends with /api
  const cleanBaseUrl = baseUrl.replace(/\/api$/, "");
  return `${cleanBaseUrl}${path}`;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's not an auth endpoint and we have a token
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes("/auth/");

      // Don't redirect on auth endpoints (login, register, etc.)
      if (!isAuthEndpoint) {
        // Token expired or invalid
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];

        // Only redirect if not already on login page
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register") &&
          !window.location.pathname.includes("/forgot-password") &&
          !window.location.pathname.includes("/reset-password")
        ) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
