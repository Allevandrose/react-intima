// src/redux/slices/cartSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cartApi from "../../api/cart";
import toast from "react-hot-toast";

// ✅ UPDATED: Free shipping for orders of 1 KES or more
const SHIPPING_FEE = 250;
const FREE_SHIPPING_THRESHOLD = 1;

// Helper: Save cart to localStorage safely
const saveCartToLocalStorage = (state) => {
  try {
    const cartData = {
      items: state.items || [],
      totalItems: state.totalItems || 0,
      totalPrice: state.totalPrice || 0,
      timestamp: Date.now(),
    };
    localStorage.setItem("cart", JSON.stringify(cartData));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

// Helper: Load cart from localStorage safely
const loadCartFromLocalStorage = () => {
  try {
    const data = localStorage.getItem("cart");
    if (data) {
      const parsed = JSON.parse(data);
      // Check if data is not too old (7 days)
      if (
        parsed.timestamp &&
        Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000
      ) {
        return {
          items: parsed.items || [],
          totalItems: parsed.totalItems || 0,
          totalPrice: parsed.totalPrice || 0,
          isSynced: false, // Need to re-sync with server
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return null;
  }
};

// ✅ FIXED: Helper function to transform cart items safely
const transformCartItems = (items) => {
  if (!items || !Array.isArray(items)) return [];

  return items.map((item) => {
    // Safely calculate price with variant adjustment
    const basePrice = item.product?.price || 0;
    const variantPrice = item.selectedVariant?.priceAdjustment || 0;
    const finalPrice = basePrice + variantPrice;

    // Safely extract first image
    const image =
      item.product?.images && item.product.images.length > 0
        ? item.product.images[0]
        : null;

    return {
      productId: item.product?._id || item.product || "",
      _id: item.product?._id || item.product || "",
      name: item.product?.name || "Unknown Product",
      price: finalPrice,
      image: image,
      quantity: item.quantity || 1,
      slug: item.product?.slug || "",
      selectedVariant: item.selectedVariant || null,
      product: item.product || null,
    };
  });
};

// ✅ ADDED: Helper function to update cart totals safely (DRY principle)
const updateCartTotals = (state) => {
  if (!state.items || !Array.isArray(state.items)) {
    state.items = [];
    state.totalItems = 0;
    state.totalPrice = 0;
    return;
  }

  state.totalItems = state.items.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );
  state.totalPrice = state.items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  );
};

// Load initial state from localStorage
const localCartData = loadCartFromLocalStorage();

const initialState = localCartData || {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
  isSynced: false,
};

// ============================================
// Async Thunks
// ============================================

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
  async (
    { productId, quantity = 1, selectedVariant = null },
    { rejectWithValue },
  ) => {
    try {
      const response = await cartApi.addToCart(
        productId,
        quantity,
        selectedVariant,
      );
      return response.data.data;
    } catch (error) {
      // ✅ Extract stock error message from response
      const message = error.response?.data?.message || "Failed to add to cart";

      // ✅ Show toast with specific error
      toast.error(message);

      return rejectWithValue(message);
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async (
    { productId, quantity, selectedVariant = null },
    { rejectWithValue },
  ) => {
    try {
      const response = await cartApi.updateCartItem(
        productId,
        quantity,
        selectedVariant,
      );
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
  async ({ productId, selectedVariant = null }, { rejectWithValue }) => {
    try {
      const response = await cartApi.removeFromCart(productId, selectedVariant);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from cart",
      );
    }
  },
);

// ✅ RENAMED: clearCart → clearCartThunk to avoid naming conflict with reducer
export const clearCartThunk = createAsyncThunk(
  "cart/clearCartThunk",
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

// ============================================
// Selectors with default values to prevent NaN
// ============================================

export const selectCartItems = (state) => state.cart?.items || [];
export const selectTotalItems = (state) => state.cart?.totalItems || 0;
export const selectSubtotal = (state) => state.cart?.totalPrice || 0;

export const selectShipping = (state) => {
  const subtotal = selectSubtotal(state);
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
};

export const selectTotal = (state) => {
  const subtotal = selectSubtotal(state);
  const shipping = selectShipping(state);
  return subtotal + shipping;
};

export const selectIsCartLoading = (state) => state.cart?.isLoading || false;
export const selectCartError = (state) => state.cart?.error || null;
export const selectIsCartSynced = (state) => state.cart?.isSynced || false;

// ============================================
// Slice
// ============================================

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.isSynced = false;
      state.error = null;
      localStorage.removeItem("cart");
    },
    setCartFromLocal: (state, action) => {
      state.items = action.payload || [];
      updateCartTotals(state);
      saveCartToLocalStorage(state);
    },
    restoreCartFromLocal: (state) => {
      const data = loadCartFromLocalStorage();
      if (data) {
        state.items = data.items || [];
        state.totalItems = data.totalItems || 0;
        state.totalPrice = data.totalPrice || 0;
        state.isSynced = false;
      }
    },
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================
      // Fetch Cart
      // ============================================
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = transformCartItems(action.payload?.items || []);
        updateCartTotals(state);
        state.isSynced = true;
        saveCartToLocalStorage(state);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch cart";
      })

      // ============================================
      // Add to Cart
      // ============================================
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = transformCartItems(action.payload?.items || []);
        updateCartTotals(state);
        state.isSynced = true;
        saveCartToLocalStorage(state);
        toast.success("Added to cart");
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to add to cart";
        // Note: toast.error is handled inside the Thunk itself, but we still handle the slice error state here
      })

      // ============================================
      // Update Cart Item
      // ============================================
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = transformCartItems(action.payload?.items || []);
        updateCartTotals(state);
        state.isSynced = true;
        saveCartToLocalStorage(state);
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update cart";
        toast.error(action.payload || "Failed to update cart");
      })

      // ============================================
      // Remove from Cart
      // ============================================
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = transformCartItems(action.payload?.items || []);
        updateCartTotals(state);
        state.isSynced = true;
        saveCartToLocalStorage(state);
        toast.success("Removed from cart");
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to remove from cart";
        toast.error(action.payload || "Failed to remove from cart");
      })

      // ============================================
      // Clear Cart (Thunk)
      // ============================================
      .addCase(clearCartThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCartThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        state.isSynced = true;
        localStorage.removeItem("cart");
        toast.success("Cart cleared");
      })
      .addCase(clearCartThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to clear cart";
        toast.error(action.payload || "Failed to clear cart");
      })

      // ============================================
      // Sync Cart
      // ============================================
      .addCase(syncCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = transformCartItems(action.payload?.items || []);
        updateCartTotals(state);
        state.isSynced = true;
        saveCartToLocalStorage(state);
        toast.success("Cart synced successfully");
      })
      .addCase(syncCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to sync cart";
        toast.error(action.payload || "Failed to sync cart");
      });
  },
});

export const {
  clearCartState,
  setCartFromLocal,
  restoreCartFromLocal,
  clearCartError,
} = cartSlice.actions;

export default cartSlice.reducer;
