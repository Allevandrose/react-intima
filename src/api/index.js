import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// ✅ EXPORT THIS - getAuthToken is needed by App.jsx
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

// ✅ EXPORT THIS - For completeness
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
};

// ✅ EXPORT THIS - Get full image URL
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads")) {
    return `${BASE_URL}${path}`;
  }
  return path;
};

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on login page
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

// ✅ DEFAULT EXPORT - This is the main export
export default api;
