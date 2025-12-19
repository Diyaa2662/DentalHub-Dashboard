import React from "react";
import { useLanguage } from "../../../../src/contexts/LanguageContext";
import { Truck, Users, FileText, Package, ArrowRight } from "lucide-react";

const Procurement = () => {
  const { t } = useLanguage();

  const procurementCards = [
    {
      title: t("suppliersManagement", "procurement"),
      description: t("manageSuppliers", "procurement"),
      icon: <Users size={24} />,
      path: "/procurement/suppliers",
      count: 12,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: t("purchaseOrdersManagement", "procurement"),
      description: t("managePurchaseOrders", "procurement"),
      icon: <FileText size={24} />,
      path: "/procurement/purchase-orders",
      count: 8,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("procurementManagement", "procurement")}
          </h1>
          <p className="text-gray-600">Manage suppliers and purchase orders</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {procurementCards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => (window.location.href = card.path)}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className={`p-3 rounded-lg ${card.color} ${card.iconColor} bg-white`}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div>
                    <p className="text-3xl font-bold text-gray-800">
                      {card.count}
                    </p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                  <ArrowRight className="text-gray-400" size={20} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Active Suppliers</p>
            <p className="text-2xl font-bold text-gray-800">8</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Pending Orders</p>
            <p className="text-2xl font-bold text-yellow-600">3</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">This Month Spend</p>
            <p className="text-2xl font-bold text-green-600">$12,450</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Procurement;
