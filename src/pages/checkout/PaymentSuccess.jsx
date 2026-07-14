import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCartThunk } from "../../redux/slices/cartSlice";
import { clearCurrentOrder } from "../../redux/slices/ordersSlice";
import { checkPaymentStatus } from "../../api/payments";
import { CheckCircle, Loader, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const timerRef = useRef(null);

  useEffect(() => {
    const orderId = searchParams.get("orderId");

    const verifyPayment = async () => {
      if (!orderId) {
        console.error("No order ID in URL");
        setPaymentStatus("error");
        return;
      }

      try {
        console.log(`🔍 Verifying payment for order: ${orderId}`);
        const response = await checkPaymentStatus(orderId);
        const { status: orderStatus } = response.data.data;

        console.log("📊 Payment status:", orderStatus);

        if (orderStatus === "paid") {
          console.log("✅ Payment confirmed!");
          setPaymentStatus("success");
          dispatch(clearCartThunk());
          dispatch(clearCurrentOrder());
          toast.success("Payment confirmed!");
        } else if (orderStatus === "processing") {
          console.log("⏳ Payment processing...");
          // Poll for status update every 5 seconds
          timerRef.current = setTimeout(verifyPayment, 5000);
        } else {
          console.log("⚠️ Payment status:", orderStatus);
          setPaymentStatus("error");
        }
      } catch (error) {
        console.error("❌ Payment verification error:", error);
        setPaymentStatus("error");
      }
    };

    verifyPayment();

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dispatch, searchParams]);

  if (paymentStatus === "verifying") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F7F3EA]">
        <Loader
          className="w-12 h-12 text-[#B08D4F] animate-spin mb-6"
          strokeWidth={1.5}
        />
        <h2 className="font-display text-2xl text-[#14120F]">
          Verifying Payment...
        </h2>
        <p className="text-[#8C7B6B] text-sm mt-2">
          Please wait while we confirm your payment.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#F7F3EA] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      <div className="text-center max-w-md bg-white p-10 border border-[#E6DFD1]">
        {paymentStatus === "success" ? (
          <CheckCircle
            className="w-20 h-20 text-[#1F3D33] mx-auto mb-6"
            strokeWidth={1.5}
          />
        ) : (
          <XCircle
            className="w-20 h-20 text-red-600 mx-auto mb-6"
            strokeWidth={1.5}
          />
        )}

        <h1 className="font-display text-3xl text-[#14120F] mb-4">
          {paymentStatus === "success"
            ? "Payment Successful!"
            : "Payment Issue"}
        </h1>
        <p className="text-[#5C5348] mb-8">
          {paymentStatus === "success"
            ? "Thank you for your order! Your payment has been confirmed."
            : "There was an issue confirming your payment. Please check your orders page or contact support."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/orders")}
            className="bg-[#14120F] text-[#F7F3EA] px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate("/shop")}
            className="border border-[#D8CFBC] text-[#14120F] px-8 py-3 text-xs uppercase tracking-[0.2em] hover:border-[#14120F] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
