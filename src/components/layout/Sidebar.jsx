import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Activity,
  Menu,
  X,
  LogOut,
  FileText, // إضافة أيقونة الفواتير
} from "lucide-react";

const Sidebar = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("dashboard");
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "dashboard",
      label: t("dashboard", "navigation"),
      icon: <LayoutDashboard size={20} />,
      path: "/",
    },
    {
      id: "products",
      label: t("products", "navigation"),
      icon: <Package size={20} />,
      path: "/products",
    },
    {
      id: "orders",
      label: t("orders", "navigation"),
      icon: <ShoppingCart size={20} />,
      path: "/orders",
    },
    {
      id: "customers",
      label: t("customers", "navigation"),
      icon: <Users size={20} />,
      path: "/customers",
    },
    {
      id: "invoices",
      label: t("invoices", "navigation"),
      icon: <FileText size={20} />,
      path: "/invoices",
    },
    {
      id: "analytics",
      label: t("analytics", "navigation"),
      icon: <BarChart3 size={20} />,
      path: "/analytics",
    },
    {
      id: "settings",
      label: t("settings", "navigation"),
      icon: <Settings size={20} />,
      path: "/settings",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-primary-600 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        fixed lg:relative z-40 w-64 h-full transition-transform duration-300
        bg-white border-r border-gray-200 flex flex-col
      `}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-dental-blue rounded-lg">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                DentalPro Shop
              </h1>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-primary-50 text-primary-700 border-l-4 border-primary-600"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
              onClick={() => setActiveItem(item.id)}
            >
              <span
                className={
                  activeItem === item.id ? "text-primary-600" : "text-gray-500"
                }
              >
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* معلومات المستخدم */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-dental-blue to-dental-teal flex items-center justify-center">
              <span className="text-white font-bold">AD</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Admin User</p>
              <p className="text-sm text-gray-500">admin@dentalpro.com</p>
            </div>
          </div>

          {/* زر تسجيل الخروج */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 rounded-lg hover:from-red-100 hover:to-red-200 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
