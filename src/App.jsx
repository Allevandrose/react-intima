import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./redux/store";

// ✅ Lazy load pages for better initial load time
const HomePage = lazy(() => import("./pages/home/HomePage"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const ShopPage = lazy(() => import("./pages/shop/ShopPage"));
const ProductDetail = lazy(() => import("./pages/shop/ProductDetail"));
const CartPage = lazy(() => import("./pages/cart/CartPage"));
const CheckoutPage = lazy(() => import("./pages/checkout/CheckoutPage"));
const PaymentSuccess = lazy(() => import("./pages/checkout/PaymentSuccess"));
const OrdersPage = lazy(() => import("./pages/orders/OrdersPage"));
const OrderDetail = lazy(() => import("./pages/orders/OrderDetail"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/ProductsAdmin"));
const AdminOrders = lazy(() => import("./pages/admin/OrdersAdmin"));
const AdminCategories = lazy(() => import("./pages/admin/CategoriesAdmin"));

import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import { getAuthToken } from "./api/index.js";
import { loadUser } from "./redux/slices/authSlice";
import { fetchCart, restoreCartFromLocal } from "./redux/slices/cartSlice";

import "./styles/index.css";

// Loading fallback component
const PageLoader = () => (
  <div className="flex justify-center items-center h-[60vh] bg-[#F7F3EA]">
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-2 border-[#B08D4F] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-sm text-[#8C7B6B] tracking-wide">Loading...</p>
    </div>
  </div>
);

// ✅ Optimized Cart Initializer with debounce
const CartInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const token = getAuthToken();

  useEffect(() => {
    let mounted = true;
    let timeoutId = null;

    const initializeCart = async () => {
      // Small delay to prevent race conditions
      timeoutId = setTimeout(async () => {
        if (!mounted) return;

        if (token && isAuthenticated) {
          try {
            await dispatch(fetchCart()).unwrap();
          } catch (error) {
            console.error("Failed to fetch cart:", error);
            if (mounted) {
              dispatch(restoreCartFromLocal());
            }
          }
        } else if (!isAuthenticated) {
          if (mounted) {
            dispatch(restoreCartFromLocal());
          }
        }
      }, 100);
    };

    initializeCart();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [dispatch, token, isAuthenticated]);

  return children;
};

// ✅ App Initializer - loads user on mount
const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const token = getAuthToken();

  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppInitializer>
          <CartInitializer>
            <div className="min-h-screen flex flex-col bg-[#F7F3EA]">
              <Header />
              <main className="flex-grow">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                    <Route
                      path="/reset-password/:token"
                      element={<ResetPassword />}
                    />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<CartPage />} />

                    {/* Protected Routes */}
                    <Route
                      path="/checkout"
                      element={
                        <PrivateRoute>
                          <CheckoutPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/checkout/success"
                      element={
                        <PrivateRoute>
                          <PaymentSuccess />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <PrivateRoute>
                          <OrdersPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/orders/:id"
                      element={
                        <PrivateRoute>
                          <OrderDetail />
                        </PrivateRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/products"
                      element={
                        <AdminRoute>
                          <AdminProducts />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <AdminRoute>
                          <AdminOrders />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/categories"
                      element={
                        <AdminRoute>
                          <AdminCategories />
                        </AdminRoute>
                      }
                    />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#F7F3EA",
                    color: "#14120F",
                    border: "1px solid #E6DFD1",
                  },
                }}
              />
            </div>
          </CartInitializer>
        </AppInitializer>
      </Router>
    </Provider>
  );
}

export default App;
