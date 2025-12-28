import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
  HeaderFilter,
  GroupPanel,
} from "devextreme-react/data-grid";
import {
  FileText,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Truck,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  Wallet,
  Building,
} from "lucide-react";

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // بيانات وهمية لطلبات الشراء مع التعديلات
  const purchaseOrdersData = [
    {
      id: 1,
      poNumber: "PO-2024-001",
      supplier: "Dental Equipment Co.",
      orderDate: "2024-01-15",
      totalAmount: 4500.0,
      itemsOrdered: 3,
      status: "confirmed",
      paymentMethod: "Credit Card", // ✅ عمود جديد
    },
    {
      id: 2,
      poNumber: "PO-2024-002",
      supplier: "MediDent Supplies",
      orderDate: "2024-01-18",
      totalAmount: 3200.5,
      itemsOrdered: 5,
      status: "pending",
      paymentMethod: "Bank Transfer", // ✅ عمود جديد
    },
    {
      id: 3,
      poNumber: "PO-2024-003",
      supplier: "Oral Care Experts",
      orderDate: "2024-01-20",
      totalAmount: 1850.75,
      itemsOrdered: 2,
      status: "shipped",
      paymentMethod: "Cash", // ✅ عمود جديد
    },
    {
      id: 4,
      poNumber: "PO-2024-004",
      supplier: "Dental Tools Ltd",
      orderDate: "2024-01-22",
      totalAmount: 6200.0,
      itemsOrdered: 8,
      status: "delivered",
      paymentMethod: "Credit Card", // ✅ عمود جديد
    },
    {
      id: 5,
      poNumber: "PO-2024-005",
      supplier: "Clinic Essentials",
      orderDate: "2024-01-25",
      totalAmount: 2800.0,
      itemsOrdered: 4,
      status: "cancelled",
      paymentMethod: "Bank Transfer", // ✅ عمود جديد
    },
  ];

  // تنسيق المبلغ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle size={16} className="text-green-600" />;
      case "pending":
        return <Clock size={16} className="text-yellow-600" />;
      case "shipped":
        return <Truck size={16} className="text-blue-600" />;
      case "delivered":
        return <CheckCircle size={16} className="text-green-600" />;
      case "cancelled":
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // الحصول على نص الحالة
  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return t("confirmed", "procurement") || "Confirmed";
      case "pending":
        return t("pending", "procurement") || "Pending";
      case "shipped":
        return t("shipped", "procurement") || "Shipped";
      case "delivered":
        return t("delivered", "procurement") || "Delivered";
      case "cancelled":
        return t("cancelled", "procurement") || "Cancelled";
      default:
        return status;
    }
  };

  // الحصول على أيقونة طريقة الدفع
  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case "credit card":
        return <CreditCard size={16} className="text-blue-600" />;
      case "bank transfer":
        return <Building size={16} className="text-green-600" />;
      case "cash":
        return <Wallet size={16} className="text-yellow-600" />;
      default:
        return <CreditCard size={16} className="text-gray-600" />;
    }
  };

  // عرض خلية الحالة
  const statusCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon(data.data.status)}
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            data.data.status
          )}`}
        >
          {getStatusText(data.data.status)}
        </span>
      </div>
    );
  };

  // ✅ عرض خلية طريقة الدفع الجديدة
  const paymentMethodCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        {getPaymentMethodIcon(data.data.paymentMethod)}
        <span className="text-sm font-medium text-gray-700">
          {data.data.paymentMethod}
        </span>
      </div>
    );
  };

  // عرض خلية المبلغ
  const amountCellRender = (data) => {
    return (
      <div className="font-medium text-gray-900">
        {formatCurrency(data.data.totalAmount)}
      </div>
    );
  };

  // ✅ دالة معالجة أزرار Actions معدلة
  const actionCellRender = (data) => {
    return (
      <div className="flex items-center space-x-3">
        <button
          className="text-blue-600 hover:text-blue-800 transition"
          title={t("view", "common") || "View"}
          onClick={() =>
            navigate(`/procurement/purchase-orders/view/${data.data.id}`)
          }
        >
          <Eye size={18} />
        </button>
        <button
          className="text-green-600 hover:text-green-800 transition"
          title={t("edit", "common") || "Edit"}
          onClick={() =>
            navigate(`/procurement/purchase-orders/edit/${data.data.id}`)
          }
        >
          <Edit size={18} />
        </button>
        <button
          className="text-red-600 hover:text-red-800 transition"
          title={t("delete", "common") || "Delete"}
          onClick={() => {
            if (
              window.confirm(
                `${
                  t("confirmDeletePurchaseOrder", "procurement") ||
                  "Delete purchase order"
                } #${data.data.poNumber}?`
              )
            ) {
              alert(
                `${
                  t("purchaseOrderDeleted", "procurement") ||
                  "Purchase order deleted"
                }: ${data.data.poNumber}`
              );
            }
          }}
        >
          <Trash2 size={18} />
        </button>
      </div>
    );
  };

  // ✅ دالة لإضافة طلب شراء جديد
  const handleAddPurchaseOrder = () => {
    navigate("/procurement/purchase-orders/add");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("purchaseOrdersManagement", "procurement") ||
              "Purchase Orders Management"}
          </h1>
          <p className="text-gray-600">
            {t("managePurchaseOrders", "procurement") ||
              "Manage and track purchase orders"}
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleAddPurchaseOrder}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t("addPurchaseOrder", "procurement") || "Add PO"}</span>
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t("totalOrders", "procurement") || "Total Orders"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {purchaseOrdersData.length}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t("totalAmount", "procurement") || "Total Amount"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(
                  purchaseOrdersData.reduce(
                    (sum, order) => sum + order.totalAmount,
                    0
                  )
                )}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t("pending", "procurement") || "Pending"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {
                  purchaseOrdersData.filter((o) => o.status === "pending")
                    .length
                }
              </p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t("delivered", "procurement") || "Delivered"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {
                  purchaseOrdersData.filter((o) => o.status === "delivered")
                    .length
                }
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataGrid
          dataSource={purchaseOrdersData}
          showBorders={true}
          columnAutoWidth={true}
          height={500}
          allowColumnResizing={true}
          allowColumnReordering={true}
          columnResizingMode="widget"
        >
          <HeaderFilter visible={true} />
          <SearchPanel
            visible={true}
            placeholder={
              t("searchPurchaseOrders", "procurement") ||
              "Search purchase orders..."
            }
          />
          <GroupPanel
            visible={true}
            emptyPanelText={
              t("dragColumnHereToGroup", "products") ||
              "Drag a column header here to group by that column"
            }
            allowColumnDragging={true}
          />
          <Paging defaultPageSize={10} />
          <Pager
            showPageSizeSelector={true}
            allowedPageSizes={[5, 10, 20]}
            showInfo={true}
          />

          <Column
            dataField="poNumber"
            caption={t("purchaseOrderNumber", "procurement") || "PO Number"}
            width={"auto"}
            alignment="left"
            allowGrouping={false}
          />

          <Column
            dataField="supplier"
            caption={t("supplier", "procurement") || "Supplier"}
            width={"auto"}
            alignment="left"
            allowGrouping={true}
          />

          <Column
            dataField="totalAmount"
            caption={t("totalAmount", "procurement") || "Amount"}
            width={"auto"}
            alignment="left"
            cellRender={amountCellRender}
            allowGrouping={false}
          />

          <Column
            dataField="itemsOrdered"
            caption={t("itemsOrdered", "procurement") || "Items"}
            width={"auto"}
            alignment="left"
            allowGrouping={false}
          />

          <Column
            dataField="status"
            caption={t("poStatus", "procurement") || "Status"}
            width={"auto"}
            alignment="left"
            cellRender={statusCellRender}
            allowGrouping={true}
          />

          {/* ✅ عمود طريقة الدفع الجديد */}
          <Column
            dataField="paymentMethod"
            caption={t("paymentMethod", "procurement") || "Payment Method"}
            width={"auto"}
            alignment="left"
            cellRender={paymentMethodCellRender}
            allowGrouping={true}
          />

          <Column
            dataField="orderDate"
            caption={t("orderDate", "procurement") || "Order Date"}
            width={"auto"}
            alignment="left"
            allowGrouping={true}
          />

          <Column
            caption={t("actions", "procurement") || "Actions"}
            width={"auto"}
            alignment="left"
            cellRender={actionCellRender}
          />
        </DataGrid>
      </div>

      {/* زر إنشاء طلب شراء جديد */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">
              {t("createNewPurchaseOrder", "procurement") ||
                "Create New Purchase Order"}
            </h3>
            <p className="text-sm text-gray-600">
              {t("quicklyCreateNewPO", "procurement") ||
                "Quickly create a new purchase order"}
            </p>
          </div>
          <button
            onClick={handleAddPurchaseOrder}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>
              {t("createNewPurchaseOrder", "procurement") || "Create PO"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;
