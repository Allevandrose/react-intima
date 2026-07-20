// src/pages/checkout/PaymentSuccess.jsx

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
import Swal from "sweetalert2";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [orderData, setOrderData] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  // ✅ Get order from URL params
  const orderNumber =
    searchParams.get("order") ||
    searchParams.get("orderId") ||
    searchParams.get("api_ref");
  const statusParam = searchParams.get("status");
  const invoiceId =
    searchParams.get("invoice_id") || searchParams.get("invoiceId");

  // ✅ Check if this is a direct redirect from IntaSend
  const isIntaSendRedirect =
    searchParams.get("payment") === "success" || statusParam === "success";

  useEffect(() => {
    console.log("🔍 PaymentSuccess mounted with:", {
      orderNumber,
      statusParam,
      invoiceId,
      isIntaSendRedirect,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    // If status is already success from URL
    if (statusParam === "success" || isIntaSendRedirect) {
      setStatus("success");
      // Try to find order by order number
      if (orderNumber) {
        verifyOrder(orderNumber);
      }
      return;
    }

    // If status is failed from URL
    if (statusParam === "failed" || statusParam === "error") {
      setStatus("error");
      setErrorMessage("Payment was not completed successfully.");
      return;
    }

    // If no order number, show error
    if (!orderNumber) {
      console.error("❌ No order ID in URL");
      setStatus("error");
      setErrorMessage(
        "No order ID found in the URL. Please check your orders page.",
      );
      return;
    }

    // ✅ Verify the order
    verifyOrder(orderNumber);
  }, [orderNumber, statusParam, isIntaSendRedirect]);

  const verifyOrder = async (orderNumber) => {
    try {
      console.log(`🔍 Verifying order: ${orderNumber}`);

      // ✅ First, get all orders and find by orderNumber
      const ordersResponse = await api.get("/orders/my");
      const orders = ordersResponse.data.data || [];
      const order = orders.find((o) => o.orderNumber === orderNumber);

      if (!order) {
        console.error("❌ Order not found:", orderNumber);
        setStatus("error");
        setErrorMessage(
          `Order ${orderNumber} not found. Please contact support.`,
        );
        return;
      }

      console.log("📦 Found order:", order);
      setOrderData(order);

      // ✅ Check order status
      if (order.status === "paid") {
        setStatus("success");
        toast.success("Payment confirmed! 🎉");
        return;
      }

      // ✅ If order is still pending/processing, check with backend
      if (order.status === "pending" || order.status === "processing") {
        // Check payment status
        try {
          const statusResponse = await api.get(`/payments/status/${order._id}`);
          console.log("📊 Payment status:", statusResponse.data);

          if (statusResponse.data.success) {
            const { orderStatus, paymentStatus } = statusResponse.data.data;

            if (orderStatus === "paid") {
              setStatus("success");
              toast.success("Payment confirmed! 🎉");
              // Refresh order data
              const updatedOrder = await api.get(`/orders/${order._id}`);
              setOrderData(updatedOrder.data.data);
              return;
            }

            if (
              paymentStatus === "failed" ||
              orderStatus === "payment_failed"
            ) {
              setStatus("error");
              setErrorMessage(
                "Payment failed. Please try again or contact support.",
              );
              return;
            }

            // Still pending - poll a few times
            if (paymentStatus === "pending" || paymentStatus === "processing") {
              if (pollingCount < 5) {
                setPollingCount((prev) => prev + 1);
                console.log(`⏳ Polling... Attempt ${pollingCount + 1}/5`);
                setTimeout(() => verifyOrder(orderNumber), 3000);
                return;
              } else {
                // After 5 attempts, show pending
                setStatus("pending");
                return;
              }
            }
          }
        } catch (error) {
          console.error("❌ Status check error:", error);
          // If we can't check status, show pending
          setStatus("pending");
        }
      }

      // Default: show pending
      setStatus("pending");
    } catch (error) {
      console.error("❌ Verification error:", error);
      setStatus("error");
      setErrorMessage(
        "Failed to verify payment. Please check your orders page.",
      );
    }
  };

  // ✅ Manual refresh status
  const handleRefreshStatus = async () => {
    if (!orderData) {
      toast.error("No order data available");
      return;
    }

    setStatus("loading");
    try {
      const response = await api.get(`/payments/status/${orderData._id}`);
      if (response.data.success) {
        const { orderStatus } = response.data.data;
        if (orderStatus === "paid") {
          setStatus("success");
          toast.success("Payment confirmed! 🎉");
          const updatedOrder = await api.get(`/orders/${orderData._id}`);
          setOrderData(updatedOrder.data.data);
        } else {
          toast.info("Payment still processing. Please wait.");
          setStatus("pending");
        }
      }
    } catch (error) {
      toast.error("Failed to refresh status");
      setStatus("pending");
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5 font-['Work_Sans']">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
          .font-display { font-family: 'Fraunces', serif; }
        `}</style>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E6DFD1] border-t-[#B08D4F] rounded-full animate-spin mx-auto"></div>
          <h2 className="font-display text-2xl text-[#14120F] mt-6">
            Verifying Payment...
          </h2>
          <p className="text-[#8C7B6B] mt-2 text-sm tracking-wide">
            Please wait while we confirm your payment
          </p>
          {pollingCount > 0 && (
            <p className="text-xs text-[#B08D4F] mt-2">
              Checking status ({pollingCount}/5)
            </p>
          )}
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5 font-['Work_Sans']">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
          .font-display { font-family: 'Fraunces', serif; }
        `}</style>
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
              <div className="flex justify-between py-1 border-t border-[#E6DFD1]">
                <span className="text-[#8C7B6B]">Items</span>
                <span className="font-medium text-[#14120F]">
                  {orderData.items?.length || 0} products
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
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
          .font-display { font-family: 'Fraunces', serif; }
        `}</style>
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
          {orderData && (
            <p className="text-xs text-[#B08D4F] mt-2">
              Order #{orderData.orderNumber}
            </p>
          )}
          <p className="text-sm text-[#8C7B6B] mt-4">
            You will receive a confirmation once the payment is complete.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleRefreshStatus}
              className="flex-1 bg-[#14120F] text-[#F7F3EA] py-3 px-4 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors"
            >
              Check Status
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="flex-1 border border-[#14120F] text-[#14120F] py-3 px-4 text-xs uppercase tracking-[0.2em] hover:bg-[#14120F] hover:text-[#F7F3EA] transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5 font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>
      <div className="bg-white border border-[#E6DFD1] p-8 sm:p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="font-display text-2xl text-[#14120F] mb-2">
          Payment Issue
        </h1>
        <p className="text-[#5C5348] text-sm leading-relaxed">
          {errorMessage ||
            "There was an issue confirming your payment. Please check your orders page or contact support."}
        </p>
        {orderData && (
          <p className="text-xs text-[#8C7B6B] mt-2">
            Order #{orderData.orderNumber}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 bg-[#14120F] text-[#F7F3EA] py-3 px-4 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors"
          >
            Check Orders
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="flex-1 border border-[#14120F] text-[#14120F] py-3 px-4 text-xs uppercase tracking-[0.2em] hover:bg-[#14120F] hover:text-[#F7F3EA] transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
