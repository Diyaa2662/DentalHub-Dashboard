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
  FileText,
  Plus,
  Download,
  Eye,
  Calendar,
  Truck,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const PurchaseOrders = () => {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const { t } = useLanguage();

  // بيانات وهمية لطلبات الشراء
  const purchaseOrdersData = [
    {
      id: 1,
      poNumber: "PO-2024-001",
      supplier: "Dental Equipment Co.",
      orderDate: "2024-01-15",
      expectedDelivery: "2024-01-22",
      totalAmount: "$4,500",
      itemsOrdered: 3,
      status: "confirmed",
    },
    // ... يمكنك إضافة المزيد
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("purchaseOrdersManagement", "procurement")}
          </h1>
          <p className="text-gray-600">
            {t("managePurchaseOrders", "procurement")}
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => alert("Add PO functionality")}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t("addPurchaseOrder", "procurement")}</span>
          </button>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataGrid
          dataSource={purchaseOrdersData}
          showBorders={true}
          columnAutoWidth={true}
          height={500}
        >
          <SearchPanel visible={true} placeholder="Search purchase orders..." />
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

export default PurchaseOrders;
