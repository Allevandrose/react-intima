import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../../redux/slices/ordersSlice";
import { getImageUrl } from "../../api";
import { cancelOrder } from "../../api/orders"; // 🆕 Imported cancelOrder endpoint
import {
  Package,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  // 🆕 Handles user request to cancel an active order card locally
  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrder(orderId);
        toast.success("Order cancelled successfully");
        dispatch(fetchMyOrders()); // Refresh orders list asynchronously
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to cancel order");
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-[#B08D4F]" />;
      case "processing":
        return <Clock className="w-4 h-4 text-[#8C7B6B]" />;
      case "paid":
        return <CheckCircle className="w-4 h-4 text-[#1F3D33]" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-[#3D5A4C]" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-[#14120F]" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-[#8C4B3A]" />;
      default:
        return <Clock className="w-4 h-4 text-[#8C7B6B]" />;
    }
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F7F3EA]">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-[#B08D4F] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F7F3EA] px-5">
        <div className="text-center">
          <p className="text-[#8C4B3A] text-sm tracking-wide">{error}</p>
          <button
            onClick={() => dispatch(fetchMyOrders())}
            className="mt-4 border border-[#14120F] text-[#14120F] px-6 py-2.5 text-xs uppercase tracking-[0.2em] hover:bg-[#14120F] hover:text-[#F7F3EA] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="border-b border-[#E6DFD1] pb-8 mb-10">
          <h1 className="font-display text-4xl text-[#14120F]">My Orders</h1>
          <p className="text-[#8C7B6B] text-sm mt-2 tracking-wide">
            {orders.length} order{orders.length === 1 ? "" : "s"} total
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E6DFD1]">
            <Package
              className="w-12 h-12 text-[#D8CFBC] mx-auto mb-5"
              strokeWidth={1.25}
            />
            <h3 className="font-display text-xl text-[#14120F] mb-2">
              No orders yet
            </h3>
            <p className="text-[#8C7B6B] text-sm">
              Start shopping to see your orders here
            </p>
            <Link
              to="/shop"
              className="inline-block mt-6 bg-[#14120F] text-[#F7F3EA] px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#1F3D33] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-[#E6DFD1] overflow-hidden"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[#FBF9F4] border-b border-[#E6DFD1]">
                  <div className="flex items-center gap-4">
                    <span className="font-display text-sm text-[#14120F]">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs text-[#8C7B6B]">
                      {new Date(order.createdAt).toLocaleDateString("en-KE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] flex items-center gap-1.5 ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                    <span className="font-medium text-[#B08D4F]">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-5">
                  <div className="flex flex-wrap gap-4">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-[#EFEAE0] overflow-hidden flex-shrink-0">
                          {item.product?.images &&
                          item.product.images.length > 0 ? (
                            <img
                              src={getImageUrl(item.product.images[0])}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/48x64?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-[#B7AC98]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-[#14120F] font-medium">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#8C7B6B]">
                            × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-sm text-[#8C7B6B] self-center">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Actions Layout */}
                  <div className="flex items-center justify-between mt-4">
                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#5C5348] hover:text-[#14120F] transition-colors"
                    >
                      View Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* 🆕 Context-aware Order Cancellation Button */}
                    {["pending", "processing"].includes(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="text-xs uppercase tracking-[0.2em] text-[#8C4B3A] hover:text-[#73392D] transition-colors font-medium"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
