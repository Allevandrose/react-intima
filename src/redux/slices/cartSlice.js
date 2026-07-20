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
      if (
        parsed.timestamp &&
        Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000
      ) {
        return {
          items: parsed.items || [],
          totalItems: parsed.totalItems || 0,
          totalPrice: parsed.totalPrice || 0,
          isSynced: false,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return null;
  }
};

// Helper: Transform cart items safely
const transformCartItems = (items) => {
  if (!items || !Array.isArray(items)) return [];

  return items.map((item) => {
    const basePrice = item.product?.price || 0;
    const variantPrice = item.selectedVariant?.priceAdjustment || 0;
    const finalPrice = basePrice + variantPrice;

    const image =
      item.product?.images && item.product.images.length > 0
        ? item.product.images[0]
        : null;

    return {
      // ✅ IMPORTANT: Use the cart item's _id as the itemId
      itemId: item._id || item.product?._id || "",
      productId: item.product?._id || "",
      _id: item._id || item.product?._id || "",
      name: item.product?.name || "Unknown Product",
      price: finalPrice,
      image: image,
      quantity: item.quantity || 1,
      slug: item.product?.slug || "",
      selectedVariant: item.selectedVariant || null,
      product: item.product || null,
      productPrice: basePrice,
    };
  });
};

// Helper: Update cart totals safely
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

// ✅ FIXED: Clear cart completely (both Redux and localStorage)
const clearCartCompletely = (state) => {
  state.items = [];
  state.totalItems = 0;
  state.totalPrice = 0;
  state.isSynced = false;
  state.error = null;
  state.isLoading = false;
  // Remove from localStorage
  localStorage.removeItem("cart");
  // Also remove from sessionStorage as a safety measure
  try {
    sessionStorage.removeItem("cart");
  } catch (e) {
    // Ignore
  }
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
    { rejectWithValue, getState },
  ) => {
    try {
      // ✅ Optimistic: Check if item already exists
      const state = getState();
      const existingItem = state.cart.items.find(
        (item) => item.productId === productId,
      );

      // If item exists, we'll just update quantity
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const response = await cartApi.updateCartItem(
          existingItem.itemId,
          newQuantity,
        );
        return response.data.data;
      }

      const response = await cartApi.addToCart(
        productId,
        quantity,
        selectedVariant,
      );
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add to cart";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// ✅ FIXED: Use itemId from cart item
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartApi.updateCartItem(itemId, quantity);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update cart";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// ✅ FIXED: Use itemId from cart item
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ itemId }, { rejectWithValue }) => {
    try {
      const response = await cartApi.removeFromCart(itemId);
      return response.data.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to remove from cart";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// ✅ FIXED: Clear cart with comprehensive cleanup
export const clearCartThunk = createAsyncThunk(
  "cart/clearCartThunk",
  async (_, { rejectWithValue }) => {
    try {
      // Call the backend API to clear the cart
      const response = await cartApi.clearCart();
      return response.data.data;
    } catch (error) {
      // Even if backend fails, we should still clear locally
      console.warn("Backend clear failed, but we'll clear locally:", error);
      return { items: [] };
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
// Selectors
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
    // ✅ FIXED: Comprehensive cart clear
    clearCartState: (state) => {
      clearCartCompletely(state);
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
    // ✅ NEW: Force reset cart (for logout scenarios)
    resetCartState: (state) => {
      clearCartCompletely(state);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
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

      // Add to Cart
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
      })

      // Update Cart Item
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
      })

      // Remove from Cart
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
      })

      // ✅ FIXED: Clear Cart - Comprehensive cleanup
      .addCase(clearCartThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCartThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        // ✅ Clear everything
        clearCartCompletely(state);
        // ✅ Mark as synced since we called the API
        state.isSynced = true;
        toast.success("Cart cleared");
      })
      .addCase(clearCartThunk.rejected, (state, action) => {
        state.isLoading = false;
        // ✅ Even on rejection, clear locally
        clearCartCompletely(state);
        state.error = action.payload || "Failed to clear cart";
        // Show a warning but don't block the user
        toast.warning("Cart cleared locally, but sync may have failed");
      })

      // Sync Cart
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
      });
  },
});

export const {
  clearCartState,
  setCartFromLocal,
  restoreCartFromLocal,
  clearCartError,
  resetCartState, // ✅ NEW: Export reset action
} = cartSlice.actions;

// ✅ Keep both clearCart and clearCartState for compatibility
export const clearCart = clearCartState;

export default cartSlice.reducer;