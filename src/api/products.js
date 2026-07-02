import api from './index';

export const getProducts = (params) => {
  return api.get('/products', { params });
};

export const getProduct = (slug) => {
  return api.get(`/products/${slug}`);
};

export const getFeaturedProducts = () => {
  return api.get('/products?isFeatured=true');
};

// Admin only
export const createProduct = (data) => {
  return api.post('/products', data);
};

export const updateProduct = (id, data) => {
  return api.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};
