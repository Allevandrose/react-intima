import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, updateOrderStatusThunk } from '../../redux/slices/adminSlice';
import { fetchOrder } from '../../redux/slices/ordersSlice';
import Sidebar from '../../components/admin/Sidebar';
import { Eye, RefreshCw, CheckCircle, XCircle, Truck, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const OrdersAdmin = () => {
  const dispatch = useDispatch();
  const { orders, loading, total, page, pages } = useSelector((state) => state.admin);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    dispatch(fetchAdminOrders({ status: filter || undefined }));
  }, [dispatch, filter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    const result = await dispatch(updateOrderStatusThunk({ 
      id: orderId, 
      data: { status: newStatus, note: `Order ${newStatus}` }
    }));
    
    if (result.payload) {
      toast.success(`Order status updated to ${newStatus}`);
      dispatch(fetchAdminOrders({ status: filter || undefined }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pages) {
      dispatch(fetchAdminOrders({ status: filter || undefined, page: newPage }));
    }
  };

  const statusOptions = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No orders found</h3>
            <p className="text-gray-500">Orders will appear here once customers make purchases</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm font-medium text-gray-600">
                      <th className="px-6 py-3">Order #</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Items</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-800">#{order.orderNumber}</td>
                        <td className="px-6 py-4 text-gray-600">{order.user?.email || 'N/A'}</td>
                        <td className="px-6 py-4 font-semibold text-primary-600">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{order.items.length}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">Page {page} of {pages}</span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
