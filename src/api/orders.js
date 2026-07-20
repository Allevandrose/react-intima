import api from "./index";

// ✅ Create a new order
export const createOrder = (data) => {
  return api.post("/orders", data);
};

// ✅ Get current user's orders
export const getMyOrders = () => {
  return api.get("/orders/my");
};

// ✅ Get single order by ID
export const getOrder = (id) => {
  return api.get(`/orders/${id}`);
};

// ✅ Cancel order (user context)
export const cancelOrder = (id) => {
  return api.put(`/orders/${id}/cancel`);
};

// ✅ Admin only - Get all orders
export const getAllOrders = (params) => {
  return api.get("/orders", { params });
};

// ✅ Admin only - Update order status
export const updateOrderStatus = (id, data) => {
  return api.put(`/orders/${id}/status`, data);
};
