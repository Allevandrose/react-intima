// src/redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cartApi from "../../api/cart";
import toast from "react-hot-toast";

// Async thunks - these need to be exported
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.getCart();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart",
      );
    }
  },
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartApi.addToCart(productId, quantity);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to cart",
      );
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartApi.updateCartItem(productId, quantity);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update cart",
      );
    }
  },
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await cartApi.removeFromCart(productId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from cart",
      );
    }
  },
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.clearCart();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear cart",
      );
    }
  },
);

export const syncCart = createAsyncThunk(
  "cart/syncCart",
  async (items, { rejectWithValue }) => {
    try {
      const response = await cartApi.syncCart(items);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to sync cart",
      );
    }
  },
);

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
  isSynced: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.isSynced = false;
    },
    setCartFromLocal: (state, action) => {
      state.items = action.payload;
      state.totalItems = action.payload.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.totalPrice = action.payload.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          productId: item.product._id,
        }));
        state.totalItems = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        state.totalPrice = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        state.isSynced = true;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to cart
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          productId: item.product._id,
        }));
        state.totalItems = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        state.totalPrice = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        toast.success("Added to cart");
      })
      .addCase(addToCart.rejected, (state, action) => {
        toast.error(action.payload || "Failed to add to cart");
      })
      // Update cart item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          productId: item.product._id,
        }));
        state.totalItems = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        state.totalPrice = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        toast.error(action.payload || "Failed to update cart");
      })
      // Remove from cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          productId: item.product._id,
        }));
        state.totalItems = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        state.totalPrice = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        toast.success("Removed from cart");
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        toast.error(action.payload || "Failed to remove from cart");
      })
      // Clear cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        toast.success("Cart cleared");
      })
      .addCase(clearCart.rejected, (state, action) => {
        toast.error(action.payload || "Failed to clear cart");
      })
      // Sync cart
      .addCase(syncCart.fulfilled, (state, action) => {
        state.items = action.payload.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          productId: item.product._id,
        }));
        state.totalItems = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        state.totalPrice = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        state.isSynced = true;
      });
  },
});

export const { clearCartState, setCartFromLocal } = cartSlice.actions;
export default cartSlice.reducer;
// src/redux/slices/cartSlice.js - add this export
export { updateCartItem as updateQuantity }; // Add this at the bottom
