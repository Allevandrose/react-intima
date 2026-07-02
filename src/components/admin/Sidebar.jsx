import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Tag, 
  Settings,
  Users,
  BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders' },
    { path: '/admin/products', icon: <Package className="w-5 h-5" />, label: 'Products' },
    { path: '/admin/categories', icon: <Tag className="w-5 h-5" />, label: 'Categories' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800">Admin Panel</h2>
        <p className="text-sm text-gray-500">Manage your store</p>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="px-4 py-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Store Management</p>
          <p className="text-sm font-medium text-gray-700">IntimaCare Admin</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
