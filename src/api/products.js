import api from "./index";

export const getProducts = (params) => {
  return api.get("/products", { params });
};

export const getProduct = (slug) => {
  return api.get(`/products/${slug}`);
};

export const getFeaturedProducts = () => {
  return api.get("/products?isFeatured=true");
};

// Admin only - with image upload support
export const createProduct = (data) => {
  // If data has files, use FormData
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
  // If data has files, use FormData
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
