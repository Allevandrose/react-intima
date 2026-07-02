import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: JSON.parse(localStorage.getItem('cart')) || [],
  totalItems: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { productId, quantity, selectedVariant } = action.payload;
      const existingItem = state.items.find(
        item => item.productId === productId && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ productId, quantity, selectedVariant });
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
        item.quantity = quantity;
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
  state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
