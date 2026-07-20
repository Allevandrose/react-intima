/**
 * CheckoutPage — Complete fixed version
 * Fixes: Order creation, payment initiation, error handling, loading states, cart clearing
 */
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Truck,
  CreditCard,
  ArrowLeft,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

// ✅ Import the configured api instance
import api from "../../api/index";

// ✅ Import selectors from cartSlice
import {
  selectCartItems,
  selectSubtotal,
  selectShipping,
  selectTotal,
  clearCartState,
  clearCartThunk, // ✅ ADDED: Import the thunk
} from "../../redux/slices/cartSlice";

// ✅ Import orders actions
import {
  createOrderThunk,
  initiatePaymentThunk,
} from "../../redux/slices/ordersSlice";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Use selectors to get cart data
  const items = useSelector(selectCartItems) || [];
  const subtotal = useSelector(selectSubtotal) || 0;
  const shipping = useSelector(selectShipping) || 0;
  const total = useSelector(selectTotal) || 0;

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { loading: ordersLoading, error: ordersError } = useSelector(
    (state) => state.orders,
  );

  // ✅ Local state management
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState("idle");
  const [createdOrder, setCreatedOrder] = useState(null);
  // ✅ NEW: Flag to prevent "cart empty" redirect during checkout
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    county: "",
    postalCode: "",
    phone: user?.phone || "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // ✅ FIXED: Prevent redirect during checkout
  useEffect(() => {
    // ✅ Skip all checks if we're in the redirecting phase
    if (isRedirecting) return;

    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    if (user?.phone) {
      setFormData((prev) => ({ ...prev, phone: user.phone }));
    }
  }, [isAuthenticated, items.length, navigate, user, isRedirecting]);

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount) || amount === 0) {
      return "Ksh 0";
    }
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (checkoutError) {
      setCheckoutError(null);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.street?.trim())
      newErrors.street = "Street address is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.county?.trim()) newErrors.county = "County is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
    else if (formData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Enter a valid phone number (e.g., 0712345678)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ MAIN CHECKOUT FUNCTION - Complete flow
  const handleCheckout = async () => {
    if (isProcessing) return;
    setCheckoutError(null);

    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const phone = formData.phone.replace(/\D/g, "");
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const validItems = items.filter((item) => item.productId);
    if (validItems.length === 0) {
      toast.error("No valid items in cart");
      return;
    }

    // Build order data
    const orderData = {
      items: validItems.map((item) => {
        const hasVariant =
          item.selectedVariant?.size || item.selectedVariant?.color;
        const itemData = {
          productId: item.productId,
          quantity: item.quantity,
        };
        if (hasVariant) {
          itemData.selectedVariant = {
            size: item.selectedVariant.size || "",
            color: item.selectedVariant.color || "",
            priceAdjustment: item.selectedVariant.priceAdjustment || 0,
          };
        }
        return itemData;
      }),
      shippingAddress: {
        street: formData.street.trim(),
        city: formData.city.trim(),
        county: formData.county.trim(),
        postalCode: formData.postalCode?.trim() || "00100",
        phone: phone,
      },
      notes: formData.notes?.trim() || "",
    };

    console.log("🛒 Processing checkout...");
    console.log("📦 Order data:", orderData);

    setIsProcessing(true);

    try {
      // ─── Step 1: Create Order ───
      setCheckoutStep("creating");
      console.log("📝 Creating order...");

      const orderResponse = await api.post("/orders", orderData);

      console.log("✅ Order response:", orderResponse.data);

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || "Failed to create order");
      }

      const order = orderResponse.data.data;
      setCreatedOrder(order);
      console.log("✅ Order created:", order.orderNumber);
      console.log("✅ Order ID:", order.id);

      // Show success toast
      toast.success(`Order ${order.orderNumber} created!`);

      // ─── Step 2: Initiate Payment ───
      setCheckoutStep("paying");
      console.log("💳 Initiating payment for order:", order.id);

      const paymentResponse = await api.post("/payments/initiate", {
        orderId: order.id,
        paymentMethod: "checkout",
      });

      console.log("💳 Payment response:", paymentResponse.data);

      if (!paymentResponse.data.success) {
        throw new Error(
          paymentResponse.data.message || "Failed to initiate payment",
        );
      }

      const paymentData = paymentResponse.data.data;

      // ─── Step 3: Redirect to Payment ───
      if (paymentData.paymentUrl) {
        setCheckoutStep("redirecting");
        // ✅ Set redirecting flag to prevent "cart empty" redirect
        setIsRedirecting(true);
        console.log("🔗 Redirecting to payment URL:", paymentData.paymentUrl);

        // ✅ STEP A: Clear backend cart first
        try {
          await api.delete("/cart");
          console.log("✅ Backend cart cleared successfully");
        } catch (err) {
          console.warn("⚠️ Could not clear backend cart:", err);
          // Don't block the payment flow if cart clear fails
        }

        // ✅ STEP B: Clear frontend cart (Redux + localStorage)
        try {
          // Use clearCartThunk to clear both frontend and backend
          await dispatch(clearCartThunk()).unwrap();
          console.log("✅ Frontend cart cleared via Redux");
        } catch (err) {
          console.warn("⚠️ Could not clear frontend cart via Redux:", err);
          // Fallback: manual clear
          dispatch(clearCartState());
          localStorage.removeItem("cart");
        }

        // ✅ Double-check localStorage is cleared
        localStorage.removeItem("cart");

        // ✅ Show SweetAlert before redirect
        await Swal.fire({
          icon: "success",
          title: "Order Created!",
          text: `Order #${order.orderNumber} created. You will be redirected to payment.`,
          timer: 2000,
          showConfirmButton: false,
          background: "#F7F3EA",
          iconColor: "#B08D4F",
          timerProgressBar: true,
        });

        // ✅ Redirect to IntaSend
        setTimeout(() => {
          window.location.href = paymentData.paymentUrl;
        }, 500);
      } else {
        throw new Error("No payment URL received from payment provider");
      }
    } catch (error) {
      console.error("❌ Checkout error:", error);

      // ✅ Better error handling
      let errorMessage = "Checkout failed. Please try again.";
      let errorTitle = "Checkout Failed";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Check if it's an authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorTitle = "Session Expired";
        errorMessage = "Your session has expired. Please login again.";
        setCheckoutError(errorMessage);
        toast.error(errorMessage);

        // Show SweetAlert for session expiry
        await Swal.fire({
          icon: "warning",
          title: errorTitle,
          text: errorMessage,
          background: "#F7F3EA",
          iconColor: "#B08D4F",
          confirmButtonColor: "#14120F",
          confirmButtonText: "Login Now",
        });

        setTimeout(() => {
          navigate("/login", { state: { from: "/checkout" } });
        }, 500);
        return;
      }

      // Stock or validation errors
      if (
        errorMessage.includes("stock") ||
        errorMessage.includes("available")
      ) {
        await Swal.fire({
          icon: "error",
          title: "Stock Issue",
          text: errorMessage,
          background: "#F7F3EA",
          iconColor: "#8C4B3A",
          confirmButtonColor: "#14120F",
        });
      }

      setCheckoutError(errorMessage);
      toast.error(errorMessage);
      setCheckoutStep("idle");
      // ✅ Reset redirecting flag on error
      setIsRedirecting(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepLabel = () => {
    switch (checkoutStep) {
      case "creating":
        return "Creating your order...";
      case "paying":
        return "Setting up payment...";
      case "redirecting":
        return "Redirecting to payment...";
      default:
        return "Processing your order...";
    }
  };

  const getStepDescription = () => {
    switch (checkoutStep) {
      case "creating":
        return "Please wait while we create your order";
      case "paying":
        return "Connecting to secure payment gateway";
      case "redirecting":
        return "You will be redirected to IntaSend payment page";
      default:
        return "Please wait, do not close this page";
    }
  };

  if (isProcessing && checkoutStep !== "idle") {
    return (
      <div className="min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
          .font-display { font-family: 'Fraunces', serif; }
        `}</style>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-5">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#E6DFD1] border-t-[#B08D4F] rounded-full animate-spin"></div>
            {checkoutStep === "creating" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[#B08D4F] text-xs font-medium">1/3</span>
              </div>
            )}
            {checkoutStep === "paying" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[#B08D4F] text-xs font-medium">2/3</span>
              </div>
            )}
            {checkoutStep === "redirecting" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[#B08D4F] text-xs font-medium">3/3</span>
              </div>
            )}
          </div>
          <h2 className="font-display text-2xl text-[#14120F] mt-6 mb-2">
            {getStepLabel()}
          </h2>
          <p className="text-[#8C7B6B] text-sm tracking-wide">
            {getStepDescription()}
          </p>
          {createdOrder && (
            <p className="text-xs text-[#B08D4F] mt-4 font-medium">
              Order #{createdOrder.orderNumber}
            </p>
          )}
          <div className="mt-6 w-full max-w-xs bg-[#EFEAE0] h-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B08D4F] transition-all duration-500 rounded-full"
              style={{
                width:
                  checkoutStep === "creating"
                    ? "33%"
                    : checkoutStep === "paying"
                      ? "66%"
                      : "100%",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .lux-input:focus, .lux-select:focus, .lux-textarea:focus {
          outline: none;
          border-color: #B08D4F;
          box-shadow: 0 0 0 1px #B08D4F;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#5C5348] hover:text-[#14120F] transition-colors mb-8"
          disabled={isProcessing}
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back to Cart
        </button>

        <div className="mb-10 border-b border-[#E6DFD1] pb-8">
          <h1 className="font-display text-4xl text-[#14120F]">Checkout</h1>
          <p className="text-[#8C7B6B] text-sm mt-2 tracking-wide">
            {items.length} item{items.length > 1 ? "s" : ""} in your bag
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#E6DFD1] p-6 sm:p-7">
              <h2 className="font-display text-xl text-[#14120F] mb-6">
                Shipping Information
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCheckout();
                }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                    Street Address <span className="text-[#8C4B3A]">*</span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    disabled={isProcessing}
                    className={`lux-input w-full px-4 py-3 bg-white border text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors ${
                      errors.street ? "border-[#8C4B3A]" : "border-[#D8CFBC]"
                    } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                    placeholder="Enter your street address"
                  />
                  {errors.street && (
                    <p className="text-[#8C4B3A] text-xs mt-1.5 tracking-wide">
                      {errors.street}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                      City <span className="text-[#8C4B3A]">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={isProcessing}
                      className={`lux-input w-full px-4 py-3 bg-white border text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors ${
                        errors.city ? "border-[#8C4B3A]" : "border-[#D8CFBC]"
                      } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                      placeholder="Enter your city"
                    />
                    {errors.city && (
                      <p className="text-[#8C4B3A] text-xs mt-1.5 tracking-wide">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                      County <span className="text-[#8C4B3A]">*</span>
                    </label>
                    <select
                      name="county"
                      value={formData.county}
                      onChange={handleChange}
                      disabled={isProcessing}
                      className={`lux-select w-full px-4 py-3 bg-white border text-sm text-[#14120F] transition-colors ${
                        errors.county ? "border-[#8C4B3A]" : "border-[#D8CFBC]"
                      } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="">Select County</option>
                      <option value="Nairobi">Nairobi</option>
                      <option value="Mombasa">Mombasa</option>
                      <option value="Kisumu">Kisumu</option>
                      <option value="Nakuru">Nakuru</option>
                      <option value="Eldoret">Eldoret</option>
                      <option value="Thika">Thika</option>
                      <option value="Malindi">Malindi</option>
                      <option value="Kitale">Kitale</option>
                      <option value="Kakamega">Kakamega</option>
                      <option value="Nyeri">Nyeri</option>
                      <option value="Meru">Meru</option>
                    </select>
                    {errors.county && (
                      <p className="text-[#8C4B3A] text-xs mt-1.5 tracking-wide">
                        {errors.county}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                      Phone Number <span className="text-[#8C4B3A]">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isProcessing}
                      className={`lux-input w-full px-4 py-3 bg-white border text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors ${
                        errors.phone ? "border-[#8C4B3A]" : "border-[#D8CFBC]"
                      } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                      placeholder="0712345678"
                    />
                    {errors.phone && (
                      <p className="text-[#8C4B3A] text-xs mt-1.5 tracking-wide">
                        {errors.phone}
                      </p>
                    )}
                    <p className="text-[11px] text-[#8C7B6B] mt-1 tracking-wide">
                      For delivery confirmation and M-Pesa payments
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      disabled={isProcessing}
                      className={`lux-input w-full px-4 py-3 bg-white border border-[#D8CFBC] text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors ${
                        isProcessing ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="00100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={isProcessing}
                    rows="3"
                    className={`lux-textarea w-full px-4 py-3 bg-white border border-[#D8CFBC] text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors ${
                      isProcessing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    placeholder="Any special instructions for delivery..."
                  />
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-xs text-[#5C5348] tracking-wide pt-2">
                  <div className="flex items-center gap-2.5">
                    <Shield
                      className="w-4 h-4 text-[#B08D4F]"
                      strokeWidth={1.5}
                    />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Truck
                      className="w-4 h-4 text-[#B08D4F]"
                      strokeWidth={1.5}
                    />
                    <span>Discreet packaging</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CreditCard
                      className="w-4 h-4 text-[#B08D4F]"
                      strokeWidth={1.5}
                    />
                    <span>M-Pesa / Card</span>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E6DFD1] p-7 sticky top-28">
              <h2 className="font-display text-xl text-[#14120F] mb-6">
                Order Summary
              </h2>

              <div className="max-h-48 overflow-y-auto space-y-2.5 mb-5 pr-1">
                {items.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="text-[#5C5348]">
                      {item.name}{" "}
                      {item.selectedVariant?.color &&
                        `(${item.selectedVariant.color})`}{" "}
                      × {item.quantity}
                    </span>
                    <span className="font-medium text-[#14120F] whitespace-nowrap">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E6DFD1] pt-4 space-y-3.5 text-sm">
                <div className="flex justify-between text-[#5C5348]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#5C5348]">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? "Free" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="border-t border-[#E6DFD1] pt-4 mt-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-display text-lg text-[#14120F]">
                      Total
                    </span>
                    <span className="text-[#B08D4F] text-lg font-medium">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              {checkoutError && (
                <div className="mt-5 p-3.5 bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 leading-relaxed">
                    {checkoutError}
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                type="button"
                disabled={isProcessing}
                className="w-full mt-5 bg-[#14120F] text-[#F7F3EA] py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>

              <div className="mt-5 p-3.5 bg-[#FBF9F4] border border-[#E6DFD1] text-xs text-[#5C5348] text-center tracking-wide">
                🔒 Your privacy is our priority. All information is encrypted
                and secure.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
