import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../redux/slices/adminSlice";
import {
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Tag,
} from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: (
        <ShoppingBag className="w-5 h-5 text-[#14120F]" strokeWidth={1.5} />
      ),
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: <DollarSign className="w-5 h-5 text-[#14120F]" strokeWidth={1.5} />,
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: <Package className="w-5 h-5 text-[#14120F]" strokeWidth={1.5} />,
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: <Users className="w-5 h-5 text-[#14120F]" strokeWidth={1.5} />,
    },
  ];

  const statusStyles = {
    paid: "bg-[#EAF0EC] text-[#1F3D33]",
    pending: "bg-[#FBF1E4] text-[#8A6A2E]",
    shipped: "bg-[#EFEAE0] text-[#5C5348]",
    delivered: "bg-[#F3EAE5] text-[#8C4B3A]",
  };

  return (
    <div className="flex min-h-screen bg-[#F7F3EA] font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>
      <Sidebar />
      <div className="flex-1 p-6 sm:p-8">
        <h1 className="font-display text-3xl text-[#14120F] mb-8 pb-6 border-b border-[#E6DFD1]">
          Dashboard
        </h1>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-[#B08D4F] border-t-transparent"></div>
            <p className="mt-4 text-[#8C7B6B] text-sm tracking-wide">
              Loading dashboard...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {statCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#E6DFD1] p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B]">
                        {card.title}
                      </p>
                      <p className="font-display text-2xl text-[#14120F] mt-2">
                        {card.value}
                      </p>
                    </div>
                    <div className="bg-[#FBF9F4] border border-[#E6DFD1] p-3">
                      {card.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {stats?.recentOrders && stats.recentOrders.length > 0 && (
              <div className="bg-white border border-[#E6DFD1] p-6 sm:p-7">
                <h2 className="font-display text-xl text-[#14120F] mb-5">
                  Recent Orders
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-[#8C7B6B] border-b border-[#E6DFD1]">
                        <th className="pb-3.5">Order #</th>
                        <th className="pb-3.5">Customer</th>
                        <th className="pb-3.5">Total</th>
                        <th className="pb-3.5">Status</th>
                        <th className="pb-3.5">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="border-b border-[#EFEAE0] last:border-0"
                        >
                          <td className="py-3.5 text-sm font-medium text-[#14120F]">
                            #{order.orderNumber}
                          </td>
                          <td className="py-3.5 text-sm text-[#5C5348]">
                            {order.user?.email || "N/A"}
                          </td>
                          <td className="py-3.5 text-sm font-medium text-[#B08D4F]">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`px-2.5 py-1 text-[11px] uppercase tracking-wide ${
                                statusStyles[order.status] ||
                                "bg-[#EFEAE0] text-[#5C5348]"
                              }`}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3.5 text-sm text-[#8C7B6B]">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <button
                onClick={() => (window.location.href = "/admin/products")}
                className="bg-[#14120F] text-[#F7F3EA] p-5 hover:bg-[#1F3D33] transition-colors duration-300"
              >
                <Package className="w-5 h-5 mx-auto mb-2.5" strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-[0.2em]">
                  Add New Product
                </span>
              </button>
              <button
                onClick={() => (window.location.href = "/admin/orders")}
                className="bg-[#14120F] text-[#F7F3EA] p-5 hover:bg-[#1F3D33] transition-colors duration-300"
              >
                <ShoppingBag
                  className="w-5 h-5 mx-auto mb-2.5"
                  strokeWidth={1.5}
                />
                <span className="text-xs uppercase tracking-[0.2em]">
                  View All Orders
                </span>
              </button>
              <button
                onClick={() => (window.location.href = "/admin/categories")}
                className="bg-[#14120F] text-[#F7F3EA] p-5 hover:bg-[#1F3D33] transition-colors duration-300"
              >
                <Tag className="w-5 h-5 mx-auto mb-2.5" strokeWidth={1.5} />
                <span className="text-xs uppercase tracking-[0.2em]">
                  Manage Categories
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
