// src/api/cart.js (complete)
import api from "./index";

export const getCart = () => {
  return api.get("/cart");
};

export const addToCart = (productId, quantity = 1) => {
  return api.post("/cart/items", { productId, quantity });
};

export const updateCartItem = (productId, quantity) => {
  return api.put(`/cart/items/${productId}`, { quantity });
};

export const removeFromCart = (productId) => {
  return api.delete(`/cart/items/${productId}`);
};

export const clearCart = () => {
  return api.delete("/cart");
};

export const syncCart = (items) => {
  return api.post("/cart/sync", { items });
};
