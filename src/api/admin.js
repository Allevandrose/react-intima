import api from "./index";

// Dashboard Stats
export const getDashboardStats = () => {
  return api.get("/admin/stats");
};

// Products (Admin) - with FormData support for images
export const createProduct = (data) => {
  // If data is FormData, use it directly
  if (data instanceof FormData) {
    return api.post("/products", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
  return api.post("/products", data);
};

export const updateProduct = (id, data) => {
  if (data instanceof FormData) {
    return api.put(`/products/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
  return api.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};

// Categories (Admin)
export const createCategory = (data) => {
  return api.post("/categories", data);
};

export const updateCategory = (id, data) => {
  return api.put(`/categories/${id}`, data);
};

export const deleteCategory = (id) => {
  return api.delete(`/categories/${id}`);
};

// Orders (Admin)
export const getAllOrders = (params) => {
  return api.get("/orders", { params });
};

export const updateOrderStatus = (id, data) => {
  return api.put(`/orders/${id}/status`, data);
};
