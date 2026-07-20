import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Shield,
  Truck,
  CreditCard,
} from "lucide-react";
import {
  removeFromCart,
  updateCartItem,
  clearCartThunk,
  selectCartItems,
  selectTotalItems,
  selectSubtotal,
  selectShipping,
  selectTotal,
  fetchCart, // ✅ Added: To refresh cart on mount
} from "../../redux/slices/cartSlice";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector(selectCartItems) || [];
  const totalItems = useSelector(selectTotalItems) || 0;
  const subtotal = useSelector(selectSubtotal) || 0;
  const shipping = useSelector(selectShipping) || 0;
  const total = useSelector(selectTotal) || 0;
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ NEW: Refresh cart on mount to ensure it's in sync with backend
  React.useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      dispatch(fetchCart())
        .unwrap()
        .catch((err) => {
          console.warn("Failed to fetch cart on mount:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [dispatch, isAuthenticated]);

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

  // ✅ FIXED: Use itemId instead of productId
  const handleUpdateQuantity = async (item, newQuantity) => {
    if (isUpdating) return;

    if (newQuantity < 1) {
      await handleRemoveItem(item);
      return;
    }

    const maxStock = item.product?.stock || 0;
    const variantStock =
      item.product?.variants?.find(
        (v) =>
          v.size === item.selectedVariant?.size &&
          v.color === item.selectedVariant?.color,
      )?.stock || 0;

    const availableStock = item.selectedVariant?.size ? variantStock : maxStock;

    if (newQuantity > availableStock) {
      toast.error(`Only ${availableStock} available in stock`);
      return;
    }

    setIsUpdating(true);
    try {
      // ✅ Use itemId from the cart item
      await dispatch(
        updateCartItem({
          itemId: item.itemId || item._id,
          quantity: newQuantity,
        }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ FIXED: Use itemId instead of productId
  const handleRemoveItem = async (item) => {
    const result = await Swal.fire({
      title: "Remove Item?",
      text: `Are you sure you want to remove ${item.name} from your bag?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8C4B3A",
      cancelButtonColor: "#14120F",
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Cancel",
      background: "#F7F3EA",
    });

    if (result.isConfirmed) {
      setIsUpdating(true);
      try {
        // ✅ Use itemId from the cart item
        await dispatch(
          removeFromCart({
            itemId: item.itemId || item._id,
          }),
        ).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Removed!",
          text: "Item has been removed from your bag.",
          timer: 1500,
          showConfirmButton: false,
          background: "#F7F3EA",
          iconColor: "#B08D4F",
        });
      } catch (error) {
        console.error("Failed to remove item:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // ✅ FIXED: Clear cart with proper error handling
  const handleClearCart = async () => {
    const result = await Swal.fire({
      title: "Clear Bag?",
      text: "Are you sure you want to remove all items from your bag?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8C4B3A",
      cancelButtonColor: "#14120F",
      confirmButtonText: "Yes, Clear All",
      cancelButtonText: "Cancel",
      background: "#F7F3EA",
    });

    if (result.isConfirmed) {
      setIsUpdating(true);
      try {
        await dispatch(clearCartThunk()).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Cleared!",
          text: "Your bag is now empty.",
          timer: 1500,
          showConfirmButton: false,
          background: "#F7F3EA",
          iconColor: "#B08D4F",
        });
      } catch (error) {
        console.error("Failed to clear cart:", error);
        toast.error("Failed to clear cart. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      await Swal.fire({
        icon: "info",
        title: "Login Required",
        text: "Please login to proceed to checkout.",
        background: "#F7F3EA",
        iconColor: "#B08D4F",
        confirmButtonColor: "#14120F",
        confirmButtonText: "Login Now",
      });
      navigate("/login");
      return;
    }

    // ✅ Check if cart has items before proceeding
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    navigate("/checkout");
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] font-['Work_Sans'] flex items-center justify-center">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
          .font-display { font-family: 'Fraunces', serif; }
        `}</style>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#E6DFD1] border-t-[#B08D4F] rounded-full animate-spin mx-auto"></div>
          <p className="text-[#8C7B6B] text-sm mt-4">Loading your bag...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
          .font-display { font-family: 'Fraunces', serif; }
        `}</style>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag
              className="w-14 h-14 text-[#D8CFBC] mx-auto mb-6"
              strokeWidth={1.25}
            />
            <h2 className="font-display text-3xl text-[#14120F] mb-3">
              Your bag is empty
            </h2>
            <p className="text-[#8C7B6B] text-sm mb-9">
              Looks like you haven't added any pieces yet.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-[#14120F] text-[#F7F3EA] px-8 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors duration-300"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Cart State
  return (
    <div className="min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="flex justify-between items-end mb-10 border-b border-[#E6DFD1] pb-8">
          <h1 className="font-display text-4xl text-[#14120F]">Your Bag</h1>
          <button
            onClick={handleClearCart}
            disabled={isUpdating}
            className="text-xs uppercase tracking-[0.2em] text-[#8C4B3A] hover:text-[#73392D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear Bag
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Cart Items List */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#E6DFD1]">
              {/* Desktop Grid Headers */}
              <div className="hidden md:grid grid-cols-12 gap-4 bg-[#FBF9F4] px-6 py-3.5 text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] border-b border-[#E6DFD1]">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items Row Mapping */}
              <div className="divide-y divide-[#EFEAE0]">
                {items.map((item, index) => (
                  <div
                    key={`${item.itemId || item.productId}-${index}`}
                    className="px-5 md:px-6 py-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Product Image & Info */}
                      <div className="md:col-span-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-20 bg-[#EFEAE0] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/64x80?text=No+Image";
                                }}
                              />
                            ) : (
                              <ShoppingBag
                                className="w-6 h-6 text-[#B7AC98]"
                                strokeWidth={1.5}
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-display text-base text-[#14120F] truncate">
                              {item.name}
                            </h3>
                            {item.selectedVariant &&
                              item.selectedVariant.size && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {item.selectedVariant.color && (
                                    <span className="text-[11px] border border-[#E6DFD1] px-2 py-0.5 flex items-center gap-1.5 text-[#5C5348] tracking-wide">
                                      <span
                                        className="w-2 h-2 rounded-full inline-block border border-[#D8CFBC]"
                                        style={{
                                          backgroundColor:
                                            item.selectedVariant.color.toLowerCase(),
                                        }}
                                      />
                                      {item.selectedVariant.color}
                                    </span>
                                  )}
                                  {item.selectedVariant.size && (
                                    <span className="text-[11px] border border-[#E6DFD1] px-2 py-0.5 text-[#5C5348] tracking-wide">
                                      Size {item.selectedVariant.size}
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Individual Price */}
                      <div className="md:col-span-2 text-left md:text-center">
                        <span className="text-[#5C5348] text-sm">
                          {formatCurrency(item.price)}
                        </span>
                      </div>

                      {/* ✅ FIXED: Quantity Controls - matching ProductDetail style */}
                      <div className="md:col-span-2 flex items-center justify-start md:justify-center">
                        <div className="flex items-center border border-[#D8CFBC]">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item, item.quantity - 1)
                            }
                            disabled={isUpdating || item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center hover:bg-[#EFEAE0] transition-colors text-[#14120F] disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-[#14120F]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item, item.quantity + 1)
                            }
                            disabled={isUpdating}
                            className="w-8 h-8 flex items-center justify-center hover:bg-[#EFEAE0] transition-colors text-[#14120F] disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Line Item Total & Delete */}
                      <div className="md:col-span-2 flex items-center justify-between md:justify-end">
                        <span className="font-medium text-[#B08D4F] md:hidden text-sm">
                          Total: {formatCurrency(item.price * item.quantity)}
                        </span>
                        <span className="font-medium text-[#B08D4F] hidden md:inline text-sm">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item)}
                          disabled={isUpdating}
                          className="ml-4 text-[#B7AC98] hover:text-[#8C4B3A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Return Path */}
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 mt-7 text-xs uppercase tracking-[0.2em] text-[#5C5348] hover:text-[#14120F] transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Sticky Side Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E6DFD1] p-7 sticky top-28">
              <h2 className="font-display text-xl text-[#14120F] mb-6">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-[#5C5348]">
                  <span>Subtotal ({totalItems} items)</span>
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
                    Free shipping on orders over {formatCurrency(1)}
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
                onClick={handleCheckout}
                disabled={items.length === 0 || isUpdating}
                className="w-full mt-7 bg-[#14120F] text-[#F7F3EA] py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#F7F3EA] border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="mt-7 space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-[#5C5348] tracking-wide">
                  <Shield
                    className="w-4 h-4 text-[#B08D4F]"
                    strokeWidth={1.5}
                  />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#5C5348] tracking-wide">
                  <Truck className="w-4 h-4 text-[#B08D4F]" strokeWidth={1.5} />
                  <span>Discreet packaging</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#5C5348] tracking-wide">
                  <CreditCard
                    className="w-4 h-4 text-[#B08D4F]"
                    strokeWidth={1.5}
                  />
                  <span>Pay via M-Pesa or Card</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
