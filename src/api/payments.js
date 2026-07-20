import api from "./index";

// ✅ Initiate payment for an order
export const initiatePayment = (orderId, paymentMethod = "checkout") => {
  return api.post("/payments/initiate", {
    orderId,
    paymentMethod,
  });
};

// ✅ Check payment status
export const checkPaymentStatus = (orderId) => {
  return api.get(`/payments/status/${orderId}`);
};

// ✅ Admin only - Manual verify payment
export const verifyPaymentManually = (orderId) => {
  return api.get(`/payments/verify/${orderId}`);
};
