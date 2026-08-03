// src/pages/checkout/PaymentSuccess.jsx

import React, { useEffect, useState, useRef } from "react";
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
  const [errorMessage, setErrorMessage] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // ✅ Refs to prevent duplicate actions
  const sweetAlertShown = useRef(false);
  const redirectDone = useRef(false);
  const pollingAttempts = useRef(0);
  const pollingInterval = useRef(null);
  const maxAttempts = 20;

  // ✅ Get order number from URL
  const orderNumber =
    searchParams.get("order") ||
    searchParams.get("api_ref") ||
    searchParams.get("orderId");
  const statusParam = searchParams.get("status");
  const isIntaSendRedirect =
    searchParams.get("payment") === "success" || statusParam === "success";

  useEffect(() => {
    console.log("🔍 PaymentSuccess mounted");
    console.log("📋 Order Number:", orderNumber);
    console.log("📋 Status Param:", statusParam);
    console.log("📋 All Params:", Object.fromEntries(searchParams.entries()));

    // ✅ If no order number, try to get from localStorage (fallback)
    if (!orderNumber) {
      const savedOrder = localStorage.getItem("lastOrderNumber");
      if (savedOrder) {
        console.log("📋 Found order in localStorage:", savedOrder);
        // Use the saved order number
        verifyOrder(savedOrder);
        return;
      }

      setStatus("error");
      setErrorMessage("No order found. Please check your orders page.");
      return;
    }

    // ✅ Start verification
    verifyOrder(orderNumber);

    // ✅ Cleanup polling on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [orderNumber]);

  // ✅ Main verification function
  const verifyOrder = async (orderNumber) => {
    try {
      console.log(`🔍 Verifying order: ${orderNumber}`);

      // ✅ Fetch all orders and find by orderNumber
      const ordersResponse = await api.get("/orders/my");
      const orders = ordersResponse.data.data || [];
      const order = orders.find((o) => o.orderNumber === orderNumber);

      if (!order) {
        console.error("❌ Order not found:", orderNumber);

        // ✅ If order not found, try to fetch by ID if we have it
        if (orderId) {
          try {
            const singleOrder = await api.get(`/orders/${orderId}`);
            if (singleOrder.data.success) {
              const foundOrder = singleOrder.data.data;
              setOrderData(foundOrder);
              setOrderId(foundOrder.id);
              checkOrderStatus(foundOrder);
              return;
            }
          } catch (e) {
            console.error("❌ Failed to fetch single order:", e);
          }
        }

        setStatus("error");
        setErrorMessage(
          `Order ${orderNumber} not found. Please contact support.`,
        );
        return;
      }

      console.log("📦 Found order:", order);
      setOrderData(order);
      setOrderId(order.id);

      // ✅ Save order number for fallback
      localStorage.setItem("lastOrderNumber", order.orderNumber);

      // ✅ Check status
      checkOrderStatus(order);
    } catch (error) {
      console.error("❌ Verification error:", error);
      setStatus("error");
      setErrorMessage(
        "Failed to verify payment. Please check your orders page.",
      );
    }
  };

  // ✅ Check order status
  const checkOrderStatus = async (order) => {
    // ✅ If already paid, show success
    if (
      order.status === "paid" ||
      order.payment?.paymentStatus === "completed"
    ) {
      setStatus("success");
      toast.success("Payment confirmed! 🎉");
      await showSuccessAlert(order);
      return;
    }

    // ✅ Check payment status via API
    try {
      const statusResponse = await api.get(`/payments/status/${order.id}`);
      console.log("📊 Payment status:", statusResponse.data);

      if (statusResponse.data.success) {
        const { orderStatus, paymentStatus, isPaid } = statusResponse.data.data;

        if (isPaid || orderStatus === "paid") {
          setStatus("success");
          toast.success("Payment confirmed! 🎉");

          // ✅ Fetch updated order
          const updatedOrder = await api.get(`/orders/${order.id}`);
          setOrderData(updatedOrder.data.data);
          await showSuccessAlert(updatedOrder.data.data);
          return;
        }

        if (paymentStatus === "failed" || orderStatus === "payment_failed") {
          setStatus("error");
          setErrorMessage(
            "Payment failed. Please try again or contact support.",
          );
          return;
        }

        // ✅ Still pending - start polling
        if (paymentStatus === "pending" || paymentStatus === "processing") {
          startPolling(order.id, order.orderNumber);
          return;
        }
      }
    } catch (error) {
      console.error("❌ Status check error:", error);
      // If status check fails, try polling anyway
      startPolling(order.id, order.orderNumber);
    }
  };

  // ✅ Polling function
  const startPolling = (orderId, orderNumber) => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }

    pollingAttempts.current = 0;
    console.log(`🔍 Starting polling for order ${orderNumber}`);

    const checkStatus = async () => {
      pollingAttempts.current += 1;
      console.log(
        `🔍 Polling attempt ${pollingAttempts.current}/${maxAttempts}`,
      );

      if (pollingAttempts.current > maxAttempts) {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
        setStatus("pending");
        return;
      }

      try {
        const response = await api.get(`/payments/status/${orderId}`);
        const data = response.data.data;

        if (data.isPaid) {
          console.log("✅ Payment confirmed via polling!");
          if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
          }

          setStatus("success");
          toast.success("Payment confirmed! 🎉");

          const updatedOrder = await api.get(`/orders/${orderId}`);
          setOrderData(updatedOrder.data.data);
          await showSuccessAlert(updatedOrder.data.data);
        }
      } catch (error) {
        console.error("❌ Polling error:", error);
      }
    };

    // ✅ Check immediately, then every 3 seconds
    setTimeout(checkStatus, 1000);
    pollingInterval.current = setInterval(checkStatus, 3000);
  };

  // ✅ Show success alert
  const showSuccessAlert = async (order) => {
    if (sweetAlertShown.current) return;
    sweetAlertShown.current = true;

    const orderNum = order?.orderNumber || orderData?.orderNumber || "N/A";

    await Swal.fire({
      icon: "success",
      title: "Payment Successful! 🎉",
      text: `Your order #${orderNum} has been confirmed. You will receive a confirmation email shortly.`,
      background: "#F7F3EA",
      iconColor: "#B08D4F",
      confirmButtonColor: "#14120F",
      confirmButtonText: "View Orders",
      timer: 8000,
      timerProgressBar: true,
      allowOutsideClick: false,
    }).then((result) => {
      if (!redirectDone.current) {
        redirectDone.current = true;
        localStorage.removeItem("lastOrderNumber");
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
          navigate("/orders");
        }
      }
    });
  };

  // ✅ Manual refresh
  const handleRefresh = async () => {
    if (!orderData && !orderId) {
      toast.error("No order data available");
      return;
    }

    setStatus("loading");
    const id = orderId || orderData?.id;
    if (id) {
      try {
        const response = await api.get(`/payments/status/${id}`);
        if (response.data.success) {
          const { isPaid, orderStatus } = response.data.data;
          if (isPaid || orderStatus === "paid") {
            setStatus("success");
            const updatedOrder = await api.get(`/orders/${id}`);
            setOrderData(updatedOrder.data.data);
            await showSuccessAlert(updatedOrder.data.data);
            return;
          }
        }
      } catch (error) {
        console.error("Refresh error:", error);
      }
    }
    setStatus("pending");
    toast.info("Still processing. Please wait.");
  };

  // ─── RENDER STATES ───

  // Loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E6DFD1] border-t-[#B08D4F] rounded-full animate-spin mx-auto"></div>
          <h2 className="font-display text-2xl text-[#14120F] mt-6">
            Verifying Payment...
          </h2>
          <p className="text-[#8C7B6B] mt-2 text-sm">
            Please wait while we confirm your payment
          </p>
          {orderNumber && (
            <p className="text-xs text-[#B08D4F] mt-2">Order #{orderNumber}</p>
          )}
        </div>
      </div>
    );
  }

  // Success
  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5">
        <div className="bg-white border border-[#E6DFD1] p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display text-3xl text-[#14120F] mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-[#5C5348] text-sm">
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

  // Pending
  if (status === "pending") {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5">
        <div className="bg-white border border-[#E6DFD1] p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#FBF9F4] rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader className="w-10 h-10 text-[#B08D4F] animate-spin" />
          </div>
          <h1 className="font-display text-2xl text-[#14120F] mb-2">
            Payment Processing
          </h1>
          <p className="text-[#5C5348] text-sm">
            Your payment is being processed. This may take a few moments.
          </p>
          {orderData && (
            <p className="text-xs text-[#B08D4F] mt-2">
              Order #{orderData.orderNumber}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleRefresh}
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

  // Error
  return (
    <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-5">
      <div className="bg-white border border-[#E6DFD1] p-8 sm:p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="font-display text-2xl text-[#14120F] mb-2">
          Payment Issue
        </h1>
        <p className="text-[#5C5348] text-sm">
          {errorMessage || "There was an issue confirming your payment."}
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
            View Orders
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
