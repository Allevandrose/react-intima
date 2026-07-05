/**
 * CheckoutPage — luxury boutique redesign (matches CartPage / ShopPage / ProductDetail / Header)
 * ------------------------------------------------------------------
 * Fonts: "Fraunces" (display serif) + "Work Sans" (body/UI).
 * Add to public/index.html for best performance:
 *
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 *   <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
 *
 * All checkout logic (redux thunks, form validation, effects, submit
 * handler) is untouched — only markup/classNames changed.
 * ------------------------------------------------------------------
 */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createOrderThunk,
  initiatePaymentThunk,
  clearCurrentOrder,
} from "../../redux/slices/ordersSlice";
import { clearCart } from "../../redux/slices/cartSlice";
import { Shield, Truck, CreditCard, ArrowLeft, Loader } from "lucide-react";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, shipping, total } = useSelector(
    (state) => state.cart,
  );
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { loading, paymentUrl, currentOrder } = useSelector(
    (state) => state.orders,
  );

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    county: "",
    postalCode: "",
    phone: user?.phone || "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    if (user?.phone) {
      setFormData((prev) => ({ ...prev, phone: user.phone }));
    }
  }, [isAuthenticated, items.length, navigate, user]);

  useEffect(() => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  }, [paymentUrl]);

  useEffect(() => {
    if (currentOrder && !loading && !paymentUrl) {
      dispatch(initiatePaymentThunk(currentOrder._id));
    }
  }, [currentOrder, loading, paymentUrl, dispatch]);

  const formatCurrency = (amount) => {
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
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.street) newErrors.street = "Street address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.county) newErrors.county = "County is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (formData.phone.length < 10)
      newErrors.phone = "Enter a valid phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const phone = formData.phone.replace(/\D/g, "");
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const orderData = {
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant || null,
      })),
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        county: formData.county,
        postalCode: formData.postalCode || "00100",
        phone: phone,
      },
      notes: formData.notes,
    };

    const result = await dispatch(createOrderThunk(orderData));

    if (result.error) {
      toast.error(result.error.message || "Failed to create order");
    } else {
      toast.success("Order created! Redirecting to payment...");
    }
  };

  if (loading || paymentUrl) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
          .font-display { font-family: 'Fraunces', serif; }
        `}</style>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-5">
          <Loader
            className="w-10 h-10 text-[#B08D4F] animate-spin mb-6"
            strokeWidth={1.5}
          />
          <h2 className="font-display text-2xl text-[#14120F] mb-2">
            Processing your order...
          </h2>
          <p className="text-[#8C7B6B] text-sm tracking-wide">
            Please wait while we redirect you to payment
          </p>
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
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back to Cart
        </button>

        <div className="mb-10 border-b border-[#E6DFD1] pb-8">
          <h1 className="font-display text-4xl text-[#14120F]">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#E6DFD1] p-6 sm:p-7">
              <h2 className="font-display text-xl text-[#14120F] mb-6">
                Shipping Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] mb-2">
                    Street Address <span className="text-[#8C4B3A]">*</span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className={`lux-input w-full px-4 py-3 bg-white border text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors ${
                      errors.street ? "border-[#8C4B3A]" : "border-[#D8CFBC]"
                    }`}
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
                      className={`lux-input w-full px-4 py-3 bg-white border text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors ${
                        errors.city ? "border-[#8C4B3A]" : "border-[#D8CFBC]"
                      }`}
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
                      className={`lux-select w-full px-4 py-3 bg-white border text-sm text-[#14120F] transition-colors ${
                        errors.county ? "border-[#8C4B3A]" : "border-[#D8CFBC]"
                      }`}
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
                      className={`lux-input w-full px-4 py-3 bg-white border text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors ${
                        errors.phone ? "border-[#8C4B3A]" : "border-[#D8CFBC]"
                      }`}
                      placeholder="0712345678"
                    />
                    {errors.phone && (
                      <p className="text-[#8C4B3A] text-xs mt-1.5 tracking-wide">
                        {errors.phone}
                      </p>
                    )}
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
                      className="lux-input w-full px-4 py-3 bg-white border border-[#D8CFBC] text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors"
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
                    rows="3"
                    className="lux-textarea w-full px-4 py-3 bg-white border border-[#D8CFBC] text-sm text-[#14120F] placeholder-[#B7AC98] transition-colors"
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
                    key={index}
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
                {shipping > 0 && (
                  <div className="text-xs text-[#8C7B6B]">
                    Free shipping on orders over {formatCurrency(5000)}
                  </div>
                )}
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

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-7 bg-[#14120F] text-[#F7F3EA] py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
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
