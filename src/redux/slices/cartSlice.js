import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: JSON.parse(localStorage.getItem('cart')) || [],
  totalItems: 0,
  subtotal: 0,
  shipping: 0,
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { productId, quantity, selectedVariant, price, name } = action.payload;
      
      // Check if item already exists (same product and same variant)
      const existingItem = state.items.find(
        item => item.productId === productId && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          productId,
          name,
          quantity,
          price,
          selectedVariant: selectedVariant || null
        });
      }

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
      
      // Recalculate totals
      calculateTotals(state);
    },
    removeFromCart: (state, action) => {
      const { productId, selectedVariant } = action.payload;
      state.items = state.items.filter(
        item => !(item.productId === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant))
      );
      localStorage.setItem('cart', JSON.stringify(state.items));
      calculateTotals(state);
    },
    updateQuantity: (state, action) => {
      const { productId, selectedVariant, quantity } = action.payload;
      const item = state.items.find(
        item => item.productId === productId && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
      );
      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items = state.items.filter(
            i => !(i.productId === productId && 
              JSON.stringify(i.selectedVariant) === JSON.stringify(selectedVariant))
          );
        } else {
          item.quantity = quantity;
        }
        localStorage.setItem('cart', JSON.stringify(state.items));
        calculateTotals(state);
      }
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
      calculateTotals(state);
    },
  },
});

const calculateTotals = (state) => {
  state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  state.subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  state.shipping = state.subtotal >= 5000 ? 0 : 250;
  state.total = state.subtotal + state.shipping;
};

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
