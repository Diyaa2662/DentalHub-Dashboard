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
  FileText,
  Truck,
  ChevronRight,
  FolderTree,
  Building,
  Briefcase,
  TrendingUp,
  Users2,
  Receipt,
} from "lucide-react";

const Sidebar = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({
    sales: true,
    inventory: true,
    suppliersInvoices: true,
    team: true,
    reports: true,
  });
  const navigate = useNavigate();

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const menuGroups = [
    {
      id: "dashboard",
      singleItem: true,
      items: [
        {
          id: "dashboard",
          label: t("dashboard", "navigation"),
          icon: <LayoutDashboard size={20} />,
          path: "/dashboard",
        },
      ],
    },
    {
      id: "inventory",
      label: t("inventoryProducts", "navigation"),
      icon: <Package size={20} />,
      items: [
        {
          id: "products",
          label: t("products", "navigation") || t("products", "products"),
          icon: <Package size={18} />,
          path: "/products",
        },
        {
          id: "categories",
          label: t("categories", "navigation"),
          icon: <FolderTree size={18} />,
          path: "/categories",
        },
        {
          id: "inventory",
          label: t("inventoryManagement", "navigation"),
          icon: <Package size={18} />,
          path: "/inventory",
        },
      ],
    },
    {
      id: "sales",
      label: t("salesCustomers", "navigation"),
      icon: <ShoppingCart size={20} />,
      items: [
        {
          id: "orders",
          label: t("orders", "navigation"),
          icon: <ShoppingCart size={18} />,
          path: "/orders",
        },
        {
          id: "customers",
          label: t("customers", "navigation"),
          icon: <Users size={18} />,
          path: "/customers",
        },
        {
          id: "invoices",
          label: t("invoices", "navigation"),
          icon: <FileText size={18} />,
          path: "/invoices",
        },
      ],
    },
    {
      id: "suppliersInvoices",
      label: t("suppliersInvoices", "navigation") || "Suppliers & Invoices",
      icon: <Receipt size={20} />,
      items: [
        {
          id: "suppliers",
          label: t("suppliers", "navigation"),
          icon: <Building size={18} />,
          path: "/procurement/suppliers",
        },
        {
          id: "purchase-orders",
          label: t("purchaseOrders", "navigation"),
          icon: <FileText size={18} />,
          path: "/procurement/purchase-orders",
        },
        {
          id: "supplier-invoices",
          label: t("supplierInvoices", "navigation"),
          icon: <Receipt size={18} />,
          path: "/procurement/supplier-invoices",
        },
      ],
    },
    {
      id: "team",
      label: t("teamAdministration", "navigation"),
      icon: <Users2 size={20} />,
      items: [
        {
          id: "employees",
          label: t("employees", "navigation"),
          icon: <Briefcase size={18} />,
          path: "/employees",
        },
        {
          id: "settings",
          label: t("settings", "navigation") || t("settings", "common"),
          icon: <Settings size={18} />,
          path: "/settings",
        },
      ],
    },
    {
      id: "reports",
      label: t("reportsAnalytics", "navigation"),
      icon: <TrendingUp size={20} />,
      items: [
        {
          id: "analytics",
          label: t("analytics", "navigation") || t("analytics", "common"),
          icon: <BarChart3 size={18} />,
          path: "/analytics",
        },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
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
              <p className="text-sm text-gray-500">
                {t("adminDashboard", "navigation") || "لوحة التحكم"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuGroups.map((group) => {
            // إذا كان عنصر منفرد (مثل Dashboard)
            if (group.singleItem) {
              return group.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-2
                    ${
                      isActive
                        ? "bg-primary-50 text-primary-700 border-l-4 border-primary-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                  end
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={
                          isActive ? "text-primary-600" : "text-gray-500"
                        }
                      >
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ));
            }

            // المجموعات مع عناصر فرعية
            return (
              <div key={group.id} className="mb-2">
                {/* عنوان المجموعة */}
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleGroup(group.id)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">{group.icon}</span>
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                  <ChevronRight
                    className={`transform transition-transform ${
                      expandedGroups[group.id] ? "rotate-90" : ""
                    }`}
                    size={16}
                  />
                </div>

                {/* العناصر الفرعية */}
                {expandedGroups[group.id] && (
                  <div className="ml-1 space-y-1 mt-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => `
                          flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm
                          ${
                            isActive
                              ? "bg-primary-50 text-primary-700 border-l-2 border-primary-600"
                              : "text-gray-600 hover:bg-gray-50"
                          }
                        `}
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={
                                isActive ? "text-primary-600" : "text-gray-400"
                              }
                            >
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* معلومات المستخدم */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-dental-blue to-dental-teal flex items-center justify-center">
              <span className="text-white font-bold">AD</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">
                {t("adminUser", "navigation") || "المدير"}
              </p>
              <p className="text-sm text-gray-500">admin@dentalpro.com</p>
            </div>
          </div>

          {/* زر تسجيل الخروج */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 rounded-lg hover:from-red-100 hover:to-red-200 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">
              {t("logout", "navigation") || t("signOut", "common")}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
