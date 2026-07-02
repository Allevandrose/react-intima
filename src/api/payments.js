import api from './index';

export const initiatePayment = (orderId) => {
  return api.post('/payments/initiate', { orderId });
};

export const checkPaymentStatus = (orderId) => {
  return api.get(`/payments/status/${orderId}`);
};
