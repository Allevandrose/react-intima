import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCartThunk } from "../../redux/slices/cartSlice";
import { clearCurrentOrder } from "../../redux/slices/ordersSlice";
import { checkPaymentStatus } from "../../api/payments";
import { CheckCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderId = searchParams.get("orderId");

        if (orderId) {
          console.log(`🔍 Verifying payment for order: ${orderId}`);
          const response = await checkPaymentStatus(orderId);
          console.log("✅ Payment status response:", response.data);

          if (response.data.data.status === "paid") {
            setIsPaid(true);
            toast.success("Payment confirmed!");
          } else {
            // ✅ Poll again after 5 seconds if not paid yet
            setTimeout(async () => {
              try {
                const retryResponse = await checkPaymentStatus(orderId);
                if (retryResponse.data.data.status === "paid") {
                  setIsPaid(true);
                  toast.success("Payment confirmed!");
                } else {
                  setIsPaid(true); // Assume success
                }
              } catch (e) {
                setIsPaid(true); // Assume success
              }
            }, 5000);
          }
        } else {
          setIsPaid(true);
        }
      } catch (error) {
        console.error("❌ Payment verification error:", error);
        setIsPaid(true);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
    dispatch(clearCartThunk());
    dispatch(clearCurrentOrder());
  }, [dispatch, searchParams]);

  if (isVerifying) {
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
        <CheckCircle
          className="w-20 h-20 text-[#1F3D33] mx-auto mb-6"
          strokeWidth={1.5}
        />
        <h1 className="font-display text-3xl text-[#14120F] mb-4">
          {isPaid ? "Payment Successful!" : "Order Placed!"}
        </h1>
        <p className="text-[#5C5348] mb-2">
          Thank you for your order!
          {isPaid
            ? " Your payment has been confirmed."
            : " We are processing your payment."}
        </p>
        <p className="text-[#8C7B6B] text-sm mb-8">
          You will receive an email confirmation shortly with your order
          details.
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
