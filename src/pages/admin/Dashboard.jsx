import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../redux/slices/adminSlice";
import Sidebar from "../../components/admin/Sidebar";
import {
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertTriangle,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../api";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "Ksh 0";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Summary Cards Mapping
  const summaryCards = stats?.summary
    ? [
        {
          title: "Total Revenue",
          value: formatCurrency(stats.summary.totalRevenue),
          icon: TrendingUp,
          color: "text-[#B08D4F]",
          bg: "bg-[#B08D4F]/10",
        },
        {
          title: "Total Orders",
          value: stats.summary.totalOrders || 0,
          icon: ShoppingBag,
          color: "text-[#1F3D33]",
          bg: "bg-[#1F3D33]/10",
        },
        {
          title: "Total Products",
          value: stats.summary.totalProducts || 0,
          icon: Package,
          color: "text-[#3D5A4C]",
          bg: "bg-[#3D5A4C]/10",
        },
        {
          title: "Total Users",
          value: stats.summary.totalUsers || stats.summary.totalCustomers || 0,
          icon: Users,
          color: "text-[#8C7B6B]",
          bg: "bg-[#8C7B6B]/10",
        },
      ]
    : [];

  // Fine-grained Status Counter Grid Mapping
  const statusCards = stats?.orderStatus
    ? [
        {
          label: "Pending",
          count: stats.orderStatus.pending || 0,
          icon: Clock,
          color: "text-[#B08D4F]",
          bg: "bg-[#B08D4F]/10",
        },
        {
          label: "Processing",
          count: stats.orderStatus.processing || 0,
          icon: Clock,
          color: "text-[#8C7B6B]",
          bg: "bg-[#8C7B6B]/10",
        },
        {
          label: "Paid",
          count: stats.orderStatus.paid || 0,
          icon: CheckCircle,
          color: "text-[#1F3D33]",
          bg: "bg-[#1F3D33]/10",
        },
        {
          label: "Shipped",
          count: stats.orderStatus.shipped || 0,
          icon: Truck,
          color: "text-[#3D5A4C]",
          bg: "bg-[#3D5A4C]/10",
        },
        {
          label: "Delivered",
          count: stats.orderStatus.delivered || 0,
          icon: CheckCircle,
          color: "text-[#14120F]",
          bg: "bg-[#14120F]/10",
        },
        {
          label: "Cancelled",
          count: stats.orderStatus.cancelled || 0,
          icon: XCircle,
          color: "text-[#8C4B3A]",
          bg: "bg-[#8C4B3A]/10",
        },
      ]
    : [];

  const statusStyles = {
    paid: "bg-[#EAF0EC] text-[#1F3D33]",
    pending: "bg-[#FBF1E4] text-[#8A6A2E]",
    processing: "bg-[#8C7B6B]/10 text-[#8C7B6B]",
    shipped: "bg-[#EFEAE0] text-[#5C5348]",
    delivered: "bg-[#F3EAE5] text-[#8C4B3A]",
    cancelled: "bg-[#8C4B3A]/10 text-[#8C4B3A]",
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F7F3EA]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-[#B08D4F] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F7F3EA]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="text-center">
            <p className="text-[#8C4B3A] text-sm tracking-wide">{error}</p>
            <button
              onClick={() => dispatch(fetchDashboardStats())}
              className="mt-4 border border-[#14120F] text-[#14120F] px-6 py-2.5 text-xs uppercase tracking-[0.2em] hover:bg-[#14120F] hover:text-[#F7F3EA] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      <Sidebar />

      <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl text-[#14120F]">Dashboard</h1>
          <p className="text-sm text-[#8C7B6B] mt-1 tracking-wide">
            Welcome back! Here's what's happening with your store.
          </p>
          {stats?.updatedAt && (
            <p className="text-xs text-[#B7AC98] mt-2">
              Last updated: {formatDate(stats.updatedAt)}
            </p>
          )}
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white border border-[#E6DFD1] p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-[#8C7B6B]">
                      {card.title}
                    </p>
                    <p className="font-display text-2xl text-[#14120F] mt-1.5">
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bg}`}>
                    <Icon
                      className={`w-5 h-5 ${card.color}`}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Status Grid Breakdown */}
        {statusCards.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {statusCards.map((status, index) => {
              const Icon = status.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-[#E6DFD1] p-4 text-center"
                >
                  <div
                    className={`${status.color} flex items-center justify-center gap-2`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-medium">{status.count}</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#8C7B6B] mt-1">
                    {status.label}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Orders and Low Stock Alerts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders Table Panel */}
          <div className="bg-white border border-[#E6DFD1] overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-[#E6DFD1]">
              <h2 className="font-display text-lg text-[#14120F]">
                Recent Orders
              </h2>
              <Link
                to="/admin/orders"
                className="text-xs uppercase tracking-[0.2em] text-[#B08D4F] hover:text-[#14120F] transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="p-5">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentOrders.slice(0, 5).map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between border-b border-[#EFEAE0] pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#14120F]">
                          #{order.orderNumber}
                        </p>
                        <p className="text-xs text-[#8C7B6B]">
                          {order.user?.email || "Guest"} •{" "}
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#B08D4F]">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <span
                          className={`text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 ${
                            statusStyles[order.status] ||
                            "bg-[#EFEAE0] text-[#5C5348]"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#8C7B6B] text-center py-4">
                  No recent orders
                </p>
              )}
            </div>
          </div>

          {/* Low Stock Product Alerts Panel */}
          <div className="bg-white border border-[#E6DFD1] overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-[#E6DFD1]">
              <h2 className="font-display text-lg text-[#14120F] flex items-center gap-2">
                <AlertTriangle
                  className="w-4 h-4 text-[#B08D4F]"
                  strokeWidth={1.5}
                />
                Low Stock Alert
              </h2>
              <Link
                to="/admin/products"
                className="text-xs uppercase tracking-[0.2em] text-[#B08D4F] hover:text-[#14120F] transition-colors"
              >
                Manage Products
              </Link>
            </div>
            <div className="p-5">
              {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.lowStockProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-4 border-b border-[#EFEAE0] pb-3 last:border-0 last:pb-0"
                    >
                      <div className="w-12 h-12 bg-[#EFEAE0] overflow-hidden flex-shrink-0 border border-[#E6DFD1]">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={getImageUrl(product.images[0])}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/48x48?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#B7AC98]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#14120F] truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#8C4B3A]">
                          {product.stock !== undefined && product.stock < 10
                            ? `Stock: ${product.stock}`
                            : ""}
                          {product.variants &&
                            product.variants.some((v) => v.stock < 10) && (
                              <span> Some variants low</span>
                            )}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-[#8C4B3A] bg-[#8C4B3A]/10 px-2 py-1 whitespace-nowrap">
                        Low Stock
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle
                    className="w-8 h-8 text-[#1F3D33] mx-auto mb-2"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm text-[#1F3D33]">
                    All products are well stocked!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 7-Day Text Matrix Chart Breakdown */}
        {stats?.dailyRevenue && stats.dailyRevenue.length > 0 && (
          <div className="mt-6 bg-white border border-[#E6DFD1] p-5">
            <h2 className="font-display text-lg text-[#14120F] mb-4">
              Daily Revenue (Last 7 Days)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {stats.dailyRevenue.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="bg-[#FBF9F4] p-3 border border-[#E6DFD1]">
                    <p className="text-xs text-[#8C7B6B] truncate">{day._id}</p>
                    <p className="text-sm font-medium text-[#B08D4F] mt-1">
                      {formatCurrency(day.revenue)}
                    </p>
                    <p className="text-[10px] text-[#B7AC98] mt-0.5">
                      {day.orders} orders
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Action Navigation Grid Toolbar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            to="/admin/products"
            className="bg-[#14120F] text-[#F7F3EA] p-5 hover:bg-[#1F3D33] transition-colors duration-300 text-center flex flex-col items-center justify-center"
          >
            <Package className="w-5 h-5 mb-2.5" strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.2em]">
              Add New Product
            </span>
          </Link>
          <Link
            to="/admin/orders"
            className="bg-[#14120F] text-[#F7F3EA] p-5 hover:bg-[#1F3D33] transition-colors duration-300 text-center flex flex-col items-center justify-center"
          >
            <ShoppingBag className="w-5 h-5 mb-2.5" strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.2em]">
              View All Orders
            </span>
          </Link>
          <Link
            to="/admin/categories"
            className="bg-[#14120F] text-[#F7F3EA] p-5 hover:bg-[#1F3D33] transition-colors duration-300 text-center flex flex-col items-center justify-center"
          >
            <Tag className="w-5 h-5 mb-2.5" strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-[0.2em]">
              Manage Categories
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
