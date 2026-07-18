import api from "./index";

export const getCart = () => {
  return api.get("/cart");
};

export const addToCart = (productId, quantity = 1, selectedVariant = null) => {
  return api.post("/cart/items", {
    productId,
    quantity,
    selectedVariant,
  });
};

// ✅ FIXED: Use itemId from the cart item, not productId
export const updateCartItem = (itemId, quantity) => {
  return api.put(`/cart/items/${itemId}`, { quantity });
};

// ✅ FIXED: Use itemId from the cart item, not productId
export const removeFromCart = (itemId) => {
  return api.delete(`/cart/items/${itemId}`);
};

export const clearCart = () => {
  return api.delete("/cart");
};

export const syncCart = (items) => {
  return api.post("/cart/sync", { items });
};
