import axios from "axios";

// ✅ FIXED: Use environment variable with fallback and logging
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ✅ Log the API URL so you can see what's being used
console.log(`🔗 API URL: ${API_URL}`);

// ✅ Create axios instance
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
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Get image URL
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
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
    // ✅ Log the full URL being called
    console.log(
      `📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
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
    // ✅ FIX: Don't redirect on logout endpoint
    const isLogoutEndpoint = error.config?.url?.includes("/auth/logout");

    // ✅ Log the error URL
    console.error(`❌ API Error:`, error.response?.status, error.config?.url);

    // ✅ Skip redirect for logout endpoint
    if (error.response?.status === 401 && !isLogoutEndpoint) {
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
