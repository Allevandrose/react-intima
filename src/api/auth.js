import api from './index';

export const register = (userData) => {
  return api.post('/auth/register', userData);
};

export const login = (credentials) => {
  return api.post('/auth/login', credentials);
};

export const getProfile = () => {
  return api.get('/auth/me');
};

export const updateProfile = (data) => {
  return api.put('/auth/me', data);
};
