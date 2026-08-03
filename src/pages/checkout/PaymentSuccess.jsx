// src/pages/checkout/PaymentSuccess.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
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
  const [orderId, setOrderId] = useState(null);
  const [showSweetAlert, setShowSweetAlert] = useState(false);
  const [isPolling, setIsPolling] = useState(true);

  // ✅ FIXED: Increased from 15 to 30 to wait for webhook (up to 90 seconds)
  const MAX_POLLING_ATTEMPTS = 30;
  const POLLING_INTERVAL = 3000; // 3 seconds between checks

  const orderNumber =
    searchParams.get("order") ||
    searchParams.get("orderId") ||
    searchParams.get("api_ref");
  const statusParam = searchParams.get("status");
  const invoiceId =
    searchParams.get("invoice_id") || searchParams.get("invoiceId");

  const isIntaSendRedirect =
    searchParams.get("payment") === "success" || statusParam === "success";

  // ✅ Get order ID from URL or localStorage
  useEffect(() => {
    console.log("🔍 PaymentSuccess mounted with:", {
      orderNumber,
      statusParam,
      invoiceId,
      isIntaSendRedirect,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    // ✅ If there's no orderNumber, check sessionStorage for recent order
    if (!orderNumber) {
      const savedOrder = sessionStorage.getItem("lastOrderNumber");
      if (savedOrder) {
        console.log("📦 Found order in sessionStorage:", savedOrder);
        verifyOrder(savedOrder);
        return;
      }
    }

    // If status is already success from URL
    if (statusParam === "success" || isIntaSendRedirect) {
      setStatus("success");
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

    // If no order number, show error with option to go to orders
    if (!orderNumber) {
      console.error("❌ No order ID in URL");
      setStatus("error");
      setErrorMessage(
        "No order ID found. Please check your orders page for confirmation.",
      );
      return;
    }

    // ✅ Verify the order
    verifyOrder(orderNumber);
  }, [orderNumber, statusParam, isIntaSendRedirect]);

  const verifyOrder = async (orderNumber) => {
    try {
      console.log(`🔍 Verifying order: ${orderNumber}`);

      // ✅ Store order number in session for recovery
      sessionStorage.setItem("lastOrderNumber", orderNumber);

      // ✅ First, get all orders and find by orderNumber
      const ordersResponse = await api.get("/orders/my");
      const orders = ordersResponse.data.data || [];
      const order = orders.find((o) => o.orderNumber === orderNumber);

      if (!order) {
        console.error("❌ Order not found:", orderNumber);

        // ✅ If we've been polling and still not found, show pending state
        if (pollingCount > 3) {
          setStatus("pending");
          setErrorMessage(
            "Your order is being processed. Please wait or check your orders page.",
          );
          setIsPolling(false);
          return;
        }

        setStatus("error");
        setErrorMessage(
          `Order ${orderNumber} not found. Please check your orders page or contact support.`,
        );
        return;
      }

      console.log("📦 Found order:", order);
      console.log("📦 Order ID:", order.id);
      console.log("📦 Order Status:", order.status);
      setOrderData(order);
      setOrderId(order.id);

      // ✅ Check order status - SUCCESS
      if (order.status === "paid") {
        setStatus("success");
        toast.success("Payment confirmed! 🎉");
        setIsPolling(false);

        // ✅ Show SweetAlert on success (only once)
        if (!showSweetAlert) {
          setShowSweetAlert(true);
          await Swal.fire({
            icon: "success",
            title: "Payment Successful! 🎉",
            text: `Your order #${order.orderNumber} has been confirmed. A confirmation email has been sent.`,
            background: "#F7F3EA",
            iconColor: "#B08D4F",
            confirmButtonColor: "#14120F",
            confirmButtonText: "View Orders",
            timer: 6000,
            timerProgressBar: true,
          }).then((result) => {
            if (
              result.isConfirmed ||
              result.dismiss === Swal.DismissReason.timer
            ) {
              // ✅ Navigate to orders instead of home
              navigate("/orders");
            }
          });
        }
        return;
      }

      // ✅ If order is still pending/processing, check with backend
      if (order.status === "pending" || order.status === "processing") {
        try {
          const statusResponse = await api.get(`/payments/status/${order.id}`);
          console.log("📊 Payment status:", statusResponse.data);

          if (statusResponse.data.success) {
            const { orderStatus, paymentStatus } = statusResponse.data.data;

            // ✅ Payment completed
            if (orderStatus === "paid") {
              setStatus("success");
              toast.success("Payment confirmed! 🎉");
              setIsPolling(false);

              const updatedOrder = await api.get(`/orders/${order.id}`);
              setOrderData(updatedOrder.data.data);
              setOrderId(updatedOrder.data.data.id);

              if (!showSweetAlert) {
                setShowSweetAlert(true);
                await Swal.fire({
                  icon: "success",
                  title: "Payment Successful! 🎉",
                  text: `Your order #${order.orderNumber} has been confirmed. A confirmation email has been sent.`,
                  background: "#F7F3EA",
                  iconColor: "#B08D4F",
                  confirmButtonColor: "#14120F",
                  confirmButtonText: "View Orders",
                  timer: 6000,
                  timerProgressBar: true,
                }).then((result) => {
                  if (
                    result.isConfirmed ||
                    result.dismiss === Swal.DismissReason.timer
                  ) {
                    navigate("/orders");
                  }
                });
              }
              return;
            }

            // ✅ Payment failed
            if (
              paymentStatus === "failed" ||
              orderStatus === "payment_failed"
            ) {
              setStatus("error");
              setErrorMessage(
                "Payment failed. Please try again or contact support.",
              );
              setIsPolling(false);
              return;
            }

            // ✅ Still pending - continue polling
            if (paymentStatus === "pending" || paymentStatus === "processing") {
              if (pollingCount < MAX_POLLING_ATTEMPTS) {
                setPollingCount((prev) => prev + 1);
                console.log(
                  `⏳ Polling... Attempt ${pollingCount + 1}/${MAX_POLLING_ATTEMPTS}`,
                );
                setTimeout(() => verifyOrder(orderNumber), POLLING_INTERVAL);
                return;
              } else {
                // ✅ Max attempts reached - show pending state with refresh button
                setIsPolling(false);
                setStatus("pending");
                setErrorMessage(
                  "Payment is taking longer than expected. You can check status manually.",
                );
                return;
              }
            }
          }
        } catch (statusError) {
          console.error("❌ Status check error:", statusError);
          // ✅ Don't fail immediately - continue polling
          if (pollingCount < MAX_POLLING_ATTEMPTS) {
            setPollingCount((prev) => prev + 1);
            setTimeout(() => verifyOrder(orderNumber), POLLING_INTERVAL);
            return;
          }
          setStatus("pending");
          setIsPolling(false);
        }
      }

      // ✅ Default fallback
      setStatus("pending");
      setIsPolling(false);
    } catch (error) {
      console.error("❌ Verification error:", error);
      // ✅ Don't show error immediately - try polling
      if (pollingCount < MAX_POLLING_ATTEMPTS) {
        setPollingCount((prev) => prev + 1);
        setTimeout(() => verifyOrder(orderNumber), POLLING_INTERVAL);
        return;
      }
      setStatus("error");
      setErrorMessage(
        "Unable to verify payment. Please check your orders page.",
      );
      setIsPolling(false);
    }
  };

  // ✅ Manual refresh status
  const handleRefreshStatus = async () => {
    if (!orderData && !orderNumber) {
      toast.error("No order data available");
      return;
    }

    setStatus("loading");
    setIsPolling(true);
    setPollingCount(0);

    const orderNum = orderData?.orderNumber || orderNumber;
    if (orderNum) {
      verifyOrder(orderNum);
    } else {
      toast.error("No order number found");
      setStatus("pending");
    }
  };

  // ✅ Navigate to orders page
  const goToOrders = () => {
    navigate("/orders");
  };

  // ✅ Loading state
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
              Checking status ({pollingCount}/{MAX_POLLING_ATTEMPTS})
            </p>
          )}
          <button
            onClick={() => navigate("/orders")}
            className="mt-6 text-xs text-[#B08D4F] hover:text-[#14120F] transition-colors underline"
          >
            View your orders instead
          </button>
        </div>
      </div>
    );
  }

  // ✅ Success state
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
            Your order has been confirmed. A confirmation email has been sent to
            your email address.
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
              onClick={goToOrders}
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

  // ✅ Pending state with manual refresh
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
            {errorMessage ||
              "Your payment is being processed. This may take a few moments."}
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
              className="flex-1 bg-[#14120F] text-[#F7F3EA] py-3 px-4 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Check Status
            </button>
            <button
              onClick={goToOrders}
              className="flex-1 border border-[#14120F] text-[#14120F] py-3 px-4 text-xs uppercase tracking-[0.2em] hover:bg-[#14120F] hover:text-[#F7F3EA] transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
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
          Payment Status
        </h1>
        <p className="text-[#5C5348] text-sm leading-relaxed">
          {errorMessage ||
            "There was an issue confirming your payment. Please check your orders page."}
        </p>
        {orderData && (
          <p className="text-xs text-[#8C7B6B] mt-2">
            Order #{orderData.orderNumber}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={goToOrders}
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
