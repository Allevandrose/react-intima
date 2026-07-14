// src/pages/checkout/PaymentSuccess.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import api from "../../api/index";
import toast from "react-hot-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // ✅ Get order from URL params - check both 'order' and 'orderId'
        const orderNumber =
          searchParams.get("order") || searchParams.get("orderId");

        console.log("🔍 Checking payment for order:", orderNumber);

        if (!orderNumber) {
          console.error("❌ No order ID in URL");
          setStatus("error");
          toast.error("No order ID found in URL");
          return;
        }

        // ✅ First, find the order by orderNumber
        try {
          // Get all orders or use the order number to find the order
          const ordersResponse = await api.get("/orders/my");
          const orders = ordersResponse.data.data || [];
          const order = orders.find((o) => o.orderNumber === orderNumber);

          if (!order) {
            console.error("❌ Order not found:", orderNumber);
            setStatus("error");
            toast.error("Order not found");
            return;
          }

          console.log("📦 Found order:", order);
          setOrderData(order);

          // Check if order is paid
          if (order.status === "paid") {
            setStatus("success");
            toast.success("Payment confirmed! 🎉");
          } else {
            // Verify with backend
            const statusResponse = await api.get(
              `/payments/status/${order._id}`,
            );

            if (statusResponse.data.success) {
              const { orderStatus, paymentStatus } = statusResponse.data.data;

              if (orderStatus === "paid") {
                setStatus("success");
                toast.success("Payment confirmed! 🎉");
              } else if (paymentStatus === "pending") {
                // Check again after 5 seconds
                setTimeout(verifyPayment, 5000);
              } else {
                setStatus("pending");
                toast.info("Payment is being processed...");
              }
            }
          }
        } catch (error) {
          console.error("❌ Error checking order:", error);
          setStatus("error");
          toast.error("Failed to verify payment");
        }
      } catch (error) {
        console.error("❌ Payment verification error:", error);
        setStatus("error");
        toast.error("Payment verification failed");
      }
    };

    verifyPayment();
  }, [searchParams]);

  // ✅ Also check for status parameter from IntaSend
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam === "success") {
      setStatus("success");
    } else if (statusParam === "failed") {
      setStatus("error");
    }
  }, [searchParams]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#B08D4F] animate-spin mx-auto mb-4" />
          <h2 className="font-display text-2xl text-[#14120F]">
            Verifying Payment...
          </h2>
          <p className="text-[#8C7B6B] mt-2">
            Please wait while we confirm your payment
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5">
        <div className="bg-white border border-[#E6DFD1] p-8 sm:p-12 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-display text-2xl text-[#14120F] mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-[#5C5348] mb-4">
            Your order has been confirmed. You will receive a confirmation email
            shortly.
          </p>
          {orderData && (
            <div className="bg-[#FBF9F4] p-4 mb-6 text-left text-sm">
              <p>
                <span className="font-medium">Order Number:</span>{" "}
                {orderData.orderNumber}
              </p>
              <p>
                <span className="font-medium">Total:</span> Ksh{" "}
                {orderData.totalAmount}
              </p>
            </div>
          )}
          <button
            onClick={() => navigate("/orders")}
            className="w-full bg-[#14120F] text-[#F7F3EA] py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  // Pending state
  if (status === "pending") {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5">
        <div className="bg-white border border-[#E6DFD1] p-8 sm:p-12 max-w-md w-full text-center">
          <Loader className="w-12 h-12 text-[#B08D4F] animate-spin mx-auto mb-4" />
          <h1 className="font-display text-2xl text-[#14120F] mb-2">
            Payment Processing
          </h1>
          <p className="text-[#5C5348]">
            Your payment is being processed. This may take a few moments.
          </p>
          <p className="text-sm text-[#8C7B6B] mt-4">
            You will receive a confirmation once the payment is complete.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5">
      <div className="bg-white border border-[#E6DFD1] p-8 sm:p-12 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="font-display text-2xl text-[#14120F] mb-2">
          Payment Issue
        </h1>
        <p className="text-[#5C5348] mb-6">
          There was an issue confirming your payment. Please check your orders
          page or contact support.
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="w-full bg-[#14120F] text-[#F7F3EA] py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors"
        >
          Check My Orders
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
