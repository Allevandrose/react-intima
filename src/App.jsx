import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./redux/store";

// Import pages
import HomePage from "./pages/home/HomePage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ShopPage from "./pages/shop/ShopPage";
import ProductDetail from "./pages/shop/ProductDetail";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import PaymentSuccess from "./pages/checkout/PaymentSuccess";
import OrdersPage from "./pages/orders/OrdersPage";
import OrderDetail from "./pages/orders/OrderDetail";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/ProductsAdmin";
import AdminOrders from "./pages/admin/OrdersAdmin";
import AdminCategories from "./pages/admin/CategoriesAdmin";

// Import components
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

// Import routes
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

// Import cart actions
import { fetchCart, restoreCartFromLocal } from "./redux/slices/cartSlice";

// ✅ CORRECT IMPORT - Import from api (index.js is default)
import { getAuthToken } from "./api/index.js";

import "./styles/index.css";

// Component to initialize cart on app load
const CartInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isSynced, items } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const token = getAuthToken();

  useEffect(() => {
    const initializeCart = async () => {
      // If user is authenticated, fetch cart from server
      if (token && isAuthenticated) {
        try {
          await dispatch(fetchCart()).unwrap();
        } catch (error) {
          console.error("Failed to fetch cart:", error);
          // If fetch fails, try to restore from localStorage
          dispatch(restoreCartFromLocal());
        }
      } else {
        // If not authenticated, restore from localStorage
        dispatch(restoreCartFromLocal());
      }
    };

    initializeCart();
  }, [dispatch, token, isAuthenticated]);

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <CartInitializer>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
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
            </main>
            <Footer />
            <Toaster position="bottom-right" />
          </div>
        </CartInitializer>
      </Router>
    </Provider>
  );
}

export default App;
