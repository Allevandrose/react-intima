// src/pages/checkout/PaymentSuccess.jsx - Simplified

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import api from "../../api/index";
import toast from "react-hot-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [orderData, setOrderData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const orderNumber = searchParams.get("order") || searchParams.get("api_ref");
  const statusParam = searchParams.get("status");

  useEffect(() => {
    console.log("🔍 PaymentSuccess mounted with:", {
      orderNumber,
      statusParam,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    // If status is already success from URL or redirect
    if (
      statusParam === "success" ||
      searchParams.get("payment") === "success"
    ) {
      setStatus("success");
      if (orderNumber) {
        verifyOrder(orderNumber);
      }
      return;
    }

    if (statusParam === "failed" || statusParam === "error") {
      setStatus("error");
      setErrorMessage("Payment was not completed successfully.");
      return;
    }

    if (!orderNumber) {
      setStatus("error");
      setErrorMessage("No order ID found. Please check your orders page.");
      return;
    }

    verifyOrder(orderNumber);
  }, [orderNumber, statusParam]);

  const verifyOrder = async (orderNumber) => {
    try {
      const ordersResponse = await api.get("/orders/my");
      const orders = ordersResponse.data.data || [];
      const order = orders.find((o) => o.orderNumber === orderNumber);

      if (!order) {
        setStatus("error");
        setErrorMessage(`Order ${orderNumber} not found.`);
        return;
      }

      setOrderData(order);

      if (order.status === "paid") {
        setStatus("success");
        toast.success("Payment confirmed! 🎉");
        return;
      }

      // Check payment status
      const statusResponse = await api.get(`/payments/status/${order.id}`);
      if (statusResponse.data.success) {
        const { orderStatus } = statusResponse.data.data;
        if (orderStatus === "paid") {
          setStatus("success");
          toast.success("Payment confirmed! 🎉");
          const updatedOrder = await api.get(`/orders/${order.id}`);
          setOrderData(updatedOrder.data.data);
          return;
        }
        if (orderStatus === "payment_failed") {
          setStatus("error");
          setErrorMessage("Payment failed. Please try again.");
          return;
        }
      }

      setStatus("pending");
    } catch (error) {
      console.error("❌ Verification error:", error);
      setStatus("error");
      setErrorMessage(
        "Failed to verify payment. Please check your orders page.",
      );
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5 font-['Work_Sans']">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E6DFD1] border-t-[#B08D4F] rounded-full animate-spin mx-auto"></div>
          <h2 className="font-display text-2xl text-[#14120F] mt-6">
            Verifying Payment...
          </h2>
          <p className="text-[#8C7B6B] mt-2 text-sm tracking-wide">
            Please wait while we confirm your payment
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5 font-['Work_Sans']">
        <div className="bg-white border border-[#E6DFD1] p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display text-3xl text-[#14120F] mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-[#5C5348] text-sm leading-relaxed">
            Your order has been confirmed. You will receive a confirmation email
            shortly.
          </p>
          {orderData && (
            <div className="bg-[#FBF9F4] border border-[#E6DFD1] p-4 mt-6 mb-6 text-left text-sm">
              <div className="flex justify-between py-1">
                <span className="text-[#8C7B6B]">Order Number</span>
                <span className="font-medium text-[#14120F]">
                  {orderData.orderNumber}
                </span>
              </div>
              <div className="flex justify-between py-1 border-t border-[#E6DFD1]">
                <span className="text-[#8C7B6B]">Total</span>
                <span className="font-medium text-[#B08D4F]">
                  Ksh {orderData.totalAmount?.toLocaleString() || "0"}
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/orders")}
              className="flex-1 bg-[#14120F] text-[#F7F3EA] py-3 px-4 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              View Orders
            </button>
            <button
              onClick={() => navigate("/shop")}
              className="flex-1 border border-[#14120F] text-[#14120F] py-3 px-4 text-xs uppercase tracking-[0.2em] hover:bg-[#14120F] hover:text-[#F7F3EA] transition-colors flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pending state
  if (status === "pending") {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5 font-['Work_Sans']">
        <div className="bg-white border border-[#E6DFD1] p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#FBF9F4] rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader className="w-10 h-10 text-[#B08D4F] animate-spin" />
          </div>
          <h1 className="font-display text-2xl text-[#14120F] mb-2">
            Payment Processing
          </h1>
          <p className="text-[#5C5348] text-sm leading-relaxed">
            Your payment is being processed. This may take a few moments.
          </p>
          <p className="text-sm text-[#8C7B6B] mt-4">
            You will receive a confirmation once the payment is complete.
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="w-full mt-6 bg-[#14120F] text-[#F7F3EA] py-3 px-4 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5 font-['Work_Sans']">
      <div className="bg-white border border-[#E6DFD1] p-8 sm:p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="font-display text-2xl text-[#14120F] mb-2">
          Payment Issue
        </h1>
        <p className="text-[#5C5348] text-sm leading-relaxed">
          {errorMessage ||
            "There was an issue confirming your payment. Please check your orders page."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 bg-[#14120F] text-[#F7F3EA] py-3 px-4 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors"
          >
            Check Orders
          </button>
          <button
            onClick={() => navigate("/shop")}
            className="flex-1 border border-[#14120F] text-[#14120F] py-3 px-4 text-xs uppercase tracking-[0.2em] hover:bg-[#14120F] hover:text-[#F7F3EA] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
