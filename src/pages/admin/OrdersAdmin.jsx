/**
 * OrdersAdmin — refined back-office styling (matches ProductsAdmin / Sidebar)
 * ------------------------------------------------------------------
 * Fonts: "Fraunces" (page title) + "Work Sans" (everything else).
 * Add to public/index.html for best performance:
 *
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 *   <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
 *
 * Status colors were remapped from six unrelated hues (yellow/blue/
 * indigo/purple/green/red) to tonal variants within the brand palette,
 * so each status is still instantly distinguishable but the table
 * doesn't look like a random badge generator.
 *
 * All state, dispatches, and pagination logic are untouched — only
 * markup/classNames changed.
 * ------------------------------------------------------------------
 */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminOrders,
  updateOrderStatusThunk,
} from "../../redux/slices/adminSlice";
import { fetchOrder } from "../../redux/slices/ordersSlice";
import Sidebar from "../../components/admin/Sidebar";
import {
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Truck,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

const OrdersAdmin = () => {
  const dispatch = useDispatch();
  const { orders, loading, total, page, pages } = useSelector(
    (state) => state.admin,
  );
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    dispatch(fetchAdminOrders({ status: filter || undefined }));
  }, [dispatch, filter]);

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

  const handleStatusUpdate = async (orderId, newStatus) => {
    const result = await dispatch(
      updateOrderStatusThunk({
        id: orderId,
        data: { status: newStatus, note: `Order ${newStatus}` },
      }),
    );

    if (result.payload) {
      toast.success(`Order status updated to ${newStatus}`);
      dispatch(fetchAdminOrders({ status: filter || undefined }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pages) {
      dispatch(
        fetchAdminOrders({ status: filter || undefined, page: newPage }),
      );
    }
  };

  const statusOptions = [
    "pending",
    "processing",
    "paid",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="flex min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      <Sidebar />
      <div className="flex-1 p-6 sm:p-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-2xl text-[#14120F]">Orders</h1>
            <p className="text-xs text-[#8C7B6B] tracking-wide mt-1">
              {total} order{total === 1 ? "" : "s"} total
            </p>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[#E6DFD1] text-sm text-[#14120F] focus:outline-none focus:border-[#B08D4F] transition-colors"
          >
            <option value="">All Orders</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-9 w-9 border-[3px] border-[#B08D4F] border-t-transparent"></div>
            <p className="mt-4 text-sm text-[#8C7B6B] tracking-wide">
              Loading orders…
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E6DFD1]">
            <Package
              className="w-12 h-12 text-[#D8CFBC] mx-auto mb-4"
              strokeWidth={1.25}
            />
            <h3 className="font-display text-xl text-[#14120F]">
              No orders found
            </h3>
            <p className="text-[#8C7B6B] text-sm mt-1">
              Orders will appear here once customers make purchases
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-[#E6DFD1] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FBF9F4] border-b border-[#E6DFD1]">
                    <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B]">
                      <th className="px-6 py-3.5 font-medium">Order #</th>
                      <th className="px-6 py-3.5 font-medium">Customer</th>
                      <th className="px-6 py-3.5 font-medium">Total</th>
                      <th className="px-6 py-3.5 font-medium">Items</th>
                      <th className="px-6 py-3.5 font-medium">Status</th>
                      <th className="px-6 py-3.5 font-medium">Date</th>
                      <th className="px-6 py-3.5 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEAE0]">
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-[#FBF9F4] transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-[#14120F] text-sm">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-4 text-[#5C5348] text-sm">
                          {order.user?.email || "N/A"}
                        </td>
                        <td className="px-6 py-4 font-medium text-[#B08D4F] text-sm">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-[#5C5348] text-sm">
                          {order.items.length}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${getStatusColor(order.status)}`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#8C7B6B] text-xs tracking-wide">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusUpdate(order._id, e.target.value)
                            }
                            className="text-xs px-2.5 py-1.5 bg-white border border-[#E6DFD1] focus:outline-none focus:border-[#B08D4F] transition-colors text-[#14120F]"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center items-center gap-8 mt-8 pt-6">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="text-xs uppercase tracking-[0.2em] text-[#14120F] disabled:text-[#D8CFBC] disabled:cursor-not-allowed hover:text-[#B08D4F] transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-[#8C7B6B] tracking-wide font-display">
                  {page} / {pages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pages}
                  className="text-xs uppercase tracking-[0.2em] text-[#14120F] disabled:text-[#D8CFBC] disabled:cursor-not-allowed hover:text-[#B08D4F] transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersAdmin;
