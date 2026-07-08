import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchOrder } from "../../redux/slices/ordersSlice";
import { getImageUrl } from "../../api";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
} from "lucide-react";

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrder(id));
    }
  }, [dispatch, id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-[#1F3D33] bg-[#1F3D33]/10";
      case "pending":
        return "text-[#B08D4F] bg-[#B08D4F]/10";
      case "processing":
        return "text-[#8C7B6B] bg-[#8C7B6B]/10";
      case "shipped":
        return "text-[#3D5A4C] bg-[#3D5A4C]/10";
      case "delivered":
        return "text-[#14120F] bg-[#14120F]/10";
      case "cancelled":
        return "text-[#8C4B3A] bg-[#8C4B3A]/10";
      default:
        return "text-[#8C7B6B] bg-[#8C7B6B]/10";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Clock className="w-4 h-4" />;
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F7F3EA]">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-[#B08D4F] border-t-transparent"></div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F7F3EA] px-5">
        <div className="text-center">
          <p className="text-[#8C4B3A] text-sm tracking-wide">
            {error || "Order not found"}
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 border border-[#14120F] text-[#14120F] px-6 py-2.5 text-xs uppercase tracking-[0.2em] hover:bg-[#14120F] hover:text-[#F7F3EA] transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const order = currentOrder;

  return (
    <div className="min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {/* Back Button */}
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#5C5348] hover:text-[#14120F] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back to Orders
        </button>

        {/* Order Header */}
        <div className="bg-white border border-[#E6DFD1] p-6 sm:p-8 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl text-[#14120F]">
                Order #{order.orderNumber}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] flex items-center gap-1.5 ${getStatusColor(order.status)}`}
                >
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className="text-xs text-[#8C7B6B]">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  {new Date(order.createdAt).toLocaleDateString("en-KE", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#8C7B6B]">Total Amount</p>
              <p className="font-display text-2xl text-[#B08D4F]">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2">
            <div className="bg-white border border-[#E6DFD1] p-6">
              <h2 className="font-display text-lg text-[#14120F] mb-4">
                Items
              </h2>
              <div className="divide-y divide-[#EFEAE0]">
                {order.items.map((item, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex gap-4">
                      <div className="w-16 h-20 bg-[#EFEAE0] overflow-hidden flex-shrink-0">
                        {item.product?.images &&
                        item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]} // Direct Cloudinary URL
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/64x80?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-[#B7AC98]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-[#14120F] font-medium">
                              {item.name}
                            </p>
                            {item.selectedVariant?.color && (
                              <p className="text-xs text-[#8C7B6B]">
                                Color: {item.selectedVariant.color}
                              </p>
                            )}
                            {item.selectedVariant?.size && (
                              <p className="text-xs text-[#8C7B6B]">
                                Size: {item.selectedVariant.size}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-[#B08D4F] font-medium">
                              {formatCurrency(item.price)}
                            </p>
                            <p className="text-xs text-[#8C7B6B]">
                              × {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t border-[#E6DFD1] mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8C7B6B]">Subtotal</span>
                  <span className="text-[#14120F]">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8C7B6B]">Shipping</span>
                  <span className="text-[#14120F]">
                    {order.shippingCost === 0
                      ? "Free"
                      : formatCurrency(order.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-display pt-2 border-t border-[#E6DFD1]">
                  <span className="text-[#14120F]">Total</span>
                  <span className="text-[#B08D4F]">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="md:col-span-1">
            <div className="bg-white border border-[#E6DFD1] p-6">
              <h2 className="font-display text-lg text-[#14120F] mb-4">
                Shipping
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin
                    className="w-4 h-4 text-[#B08D4F] mt-0.5"
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className="text-sm text-[#14120F]">
                      {order.shippingAddress?.street}
                    </p>
                    <p className="text-sm text-[#14120F]">
                      {order.shippingAddress?.city}
                    </p>
                    <p className="text-sm text-[#14120F]">
                      {order.shippingAddress?.county}
                    </p>
                    {order.shippingAddress?.postalCode && (
                      <p className="text-sm text-[#14120F]">
                        {order.shippingAddress.postalCode}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone
                    className="w-4 h-4 text-[#B08D4F] mt-0.5"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm text-[#14120F]">
                    {order.shippingAddress?.phone}
                  </p>
                </div>
                {order.notes && (
                  <div className="mt-3 p-3 bg-[#FBF9F4] border border-[#E6DFD1]">
                    <p className="text-xs text-[#8C7B6B]">Notes:</p>
                    <p className="text-sm text-[#14120F]">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            {order.payment && (
              <div className="bg-white border border-[#E6DFD1] p-6 mt-4">
                <h2 className="font-display text-lg text-[#14120F] mb-4">
                  Payment
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard
                      className="w-4 h-4 text-[#B08D4F]"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm text-[#14120F] capitalize">
                      {order.payment.method || "M-Pesa"}
                    </span>
                  </div>
                  {order.payment.paymentStatus && (
                    <p
                      className={`text-xs ${order.payment.paymentStatus === "completed" ? "text-[#1F3D33]" : "text-[#B08D4F]"}`}
                    >
                      Status:{" "}
                      {order.payment.paymentStatus.charAt(0).toUpperCase() +
                        order.payment.paymentStatus.slice(1)}
                    </p>
                  )}
                  {order.payment.paidAt && (
                    <p className="text-xs text-[#8C7B6B]">
                      Paid:{" "}
                      {new Date(order.payment.paidAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
