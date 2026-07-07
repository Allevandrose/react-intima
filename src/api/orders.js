import api from "./index";

export const createOrder = (data) => {
  return api.post("/orders", data);
};

export const getMyOrders = () => {
  return api.get("/orders/my");
};

export const getOrder = (id) => {
  return api.get(`/orders/${id}`);
};

// 🆕 Cancel order (user context)
export const cancelOrder = (id) => {
  return api.put(`/orders/${id}/cancel`);
};

// Admin only
export const getAllOrders = (params) => {
  return api.get("/orders", { params });
};

export const updateOrderStatus = (id, data) => {
  return api.put(`/orders/${id}/status`, data);
};
