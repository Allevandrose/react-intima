import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../redux/slices/adminSlice';
import { 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp,
  DollarSign,
  Clock,
  Tag
} from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50',
      color: 'text-blue-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      bg: 'bg-green-50',
      color: 'text-green-600'
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: <Package className="w-6 h-6 text-purple-600" />,
      bg: 'bg-purple-50',
      color: 'text-purple-600'
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: <Users className="w-6 h-6 text-orange-600" />,
      bg: 'bg-orange-50',
      color: 'text-orange-600'
    },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                    </div>
                    <div className={`${card.bg} p-3 rounded-lg`}>
                      {card.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {stats?.recentOrders && stats.recentOrders.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3">Order #</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order._id} className="border-b last:border-0">
                          <td className="py-3 text-sm font-medium text-gray-700">#{order.orderNumber}</td>
                          <td className="py-3 text-sm text-gray-600">{order.user?.email || 'N/A'}</td>
                          <td className="py-3 text-sm font-medium text-primary-600">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'paid' ? 'bg-green-100 text-green-700' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'delivered' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => window.location.href = '/admin/products'}
                className="bg-primary-600 text-white p-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Package className="w-6 h-6 mx-auto mb-2" />
                <span className="font-medium">Add New Product</span>
              </button>
              <button 
                onClick={() => window.location.href = '/admin/orders'}
                className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                <ShoppingBag className="w-6 h-6 mx-auto mb-2" />
                <span className="font-medium">View All Orders</span>
              </button>
              <button 
                onClick={() => window.location.href = '/admin/categories'}
                className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Tag className="w-6 h-6 mx-auto mb-2" />
                <span className="font-medium">Manage Categories</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
