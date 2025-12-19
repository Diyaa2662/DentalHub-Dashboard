// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../../src/contexts/LanguageContext";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
} from "devextreme-react/data-grid";
import {
  Users,
  Plus,
  Download,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react";

const Suppliers = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // بيانات وهمية للمزودين
  const suppliersData = [
    {
      id: 1,
      name: "Dental Equipment Co.",
      //   contactPerson: "John Smith",
      email: "john@dentalequip.com",
      phone: "(555) 123-4567",
      address: "123 Equipment St, New York",
      productsSupplied: ["Dental Chairs", "X-Ray Machines"],
      //   rating: 4.8,
      //   status: "active",
      lastOrderDate: "2024-01-15",
      totalOrders: 12,
      //   totalSpent: "$45,800",
    },
    // ... يمكنك إضافة المزيد
  ];

  const handleAddSupplier = () => {
    alert(t("addSupplier", "procurement") || "Add supplier functionality");
  };

  // eslint-disable-next-line no-unused-vars
  const handleViewSupplier = (id) => {
    navigate(`/procurement/suppliers/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("suppliersManagement", "procurement")}
          </h1>
          <p className="text-gray-600">{t("manageSuppliers", "procurement")}</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => alert("Export functionality")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <Download size={20} />
            <span>{t("exportSuppliers", "procurement")}</span>
          </button>
          <button
            onClick={handleAddSupplier}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t("addSupplier", "procurement")}</span>
          </button>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataGrid
          dataSource={suppliersData}
          showBorders={true}
          columnAutoWidth={true}
          height={500}
        >
          <SearchPanel visible={true} placeholder="Search suppliers..." />
          <Paging defaultPageSize={10} />
          <Pager
            showPageSizeSelector={true}
            allowedPageSizes={[5, 10, 20]}
            showInfo={true}
          />

          {/* سيتم إضافة الأعمدة هنا */}
        </DataGrid>
      </div>
    </div>
  );
};

export default Suppliers;
