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

export const updateCartItem = (productId, quantity, selectedVariant = null) => {
  return api.put(`/cart/items/${productId}`, {
    quantity,
    selectedVariant,
  });
};

// ✅ FIXED: Properly send selectedVariant in the request body
export const removeFromCart = (productId, selectedVariant = null) => {
  return api.delete(`/cart/items/${productId}`, {
    data: { selectedVariant },
  });
};

export const clearCart = () => {
  return api.delete("/cart");
};

export const syncCart = (items) => {
  return api.post("/cart/sync", { items });
};
