/**
 * Sidebar — refined back-office styling (matches ProductsAdmin).
 * ------------------------------------------------------------------
 * Fonts: "Fraunces" (panel title) + "Work Sans" (nav labels).
 * Add to public/index.html for best performance:
 *
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 *   <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
 *
 * All routing/active-state logic is untouched — only markup/classNames
 * changed.
 * ------------------------------------------------------------------
 */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Settings,
  Users,
  BarChart3,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: "/admin",
      icon: <LayoutDashboard className="w-4.5 h-4.5" strokeWidth={1.5} />,
      label: "Dashboard",
    },
    {
      path: "/admin/orders",
      icon: <ShoppingBag className="w-4.5 h-4.5" strokeWidth={1.5} />,
      label: "Orders",
    },
    {
      path: "/admin/products",
      icon: <Package className="w-4.5 h-4.5" strokeWidth={1.5} />,
      label: "Products",
    },
    {
      path: "/admin/categories",
      icon: <Tag className="w-4.5 h-4.5" strokeWidth={1.5} />,
      label: "Categories",
    },
  ];

  return (
    <div className="w-64 bg-[#FBF9F4] border-r border-[#E6DFD1] min-h-screen p-5 font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>

      <div className="mb-9 px-1">
        <h2 className="font-display text-lg text-[#14120F]">Admin Panel</h2>
        <p className="text-xs text-[#8C7B6B] tracking-wide mt-0.5">
          Manage your store
        </p>
      </div>

      <nav className="space-y-0.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors border-l-2 ${
                isActive
                  ? "bg-white border-[#B08D4F] text-[#14120F] font-medium"
                  : "border-transparent text-[#5C5348] hover:bg-white/60 hover:text-[#14120F]"
              }`}
            >
              <span className={isActive ? "text-[#B08D4F]" : "text-[#8C7B6B]"}>
                {item.icon}
              </span>
              <span className="tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-9 pt-6 border-t border-[#E6DFD1]">
        <div className="px-4 py-3.5 bg-white border border-[#E6DFD1]">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8C7B6B]">
            Store Management
          </p>
          <p className="font-display text-sm text-[#14120F] mt-1">
            IntimaCare Admin
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
