import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
  Grouping,
  GroupPanel,
  ColumnChooser,
  HeaderFilter,
  // ❌ إزالة FilterRow
} from "devextreme-react/data-grid";
import {
  ShoppingCart,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  DollarSign,
  Calendar,
  CreditCard,
  Wallet,
  Building,
  Smartphone,
  Banknote,
  Package,
  TrendingUp,
} from "lucide-react";

const Orders = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Mock data for orders
  const ordersData = [
    {
      id: 1001,
      orderNumber: "ORD-2024-1001",
      customer: "Dr. Sarah Johnson",
      amount: 450.0,
      status: "Completed",
      date: "2024-01-15",
      items: 3,
      paymentMethod: "credit_card",
    },
    {
      id: 1002,
      orderNumber: "ORD-2024-1002",
      customer: "Dr. Michael Chen",
      amount: 2800.0,
      status: "Processing",
      date: "2024-01-14",
      items: 1,
      paymentMethod: "bank_transfer",
    },
    {
      id: 1003,
      orderNumber: "ORD-2024-1003",
      customer: "Dr. Emily Williams",
      amount: 320.0,
      status: "Pending",
      date: "2024-01-14",
      items: 5,
      paymentMethod: "cash",
    },
    {
      id: 1004,
      orderNumber: "ORD-2024-1004",
      customer: "Dr. Robert Kim",
      amount: 180.0,
      status: "Completed",
      date: "2024-01-13",
      items: 2,
      paymentMethod: "mobile_payment",
    },
    {
      id: 1005,
      orderNumber: "ORD-2024-1005",
      customer: "Dr. Lisa Martinez",
      amount: 1250.0,
      status: "Shipped",
      date: "2024-01-12",
      items: 4,
      paymentMethod: "credit_card",
    },
    {
      id: 1006,
      orderNumber: "ORD-2024-1006",
      customer: "Dr. James Wilson",
      amount: 890.0,
      status: "Processing",
      date: "2024-01-12",
      items: 2,
      paymentMethod: "online_banking",
    },
    {
      id: 1007,
      orderNumber: "ORD-2024-1007",
      customer: "Dr. Maria Garcia",
      amount: 1450.0,
      status: "Completed",
      date: "2024-01-11",
      items: 3,
      paymentMethod: "credit_card",
    },
    {
      id: 1008,
      orderNumber: "ORD-2024-1008",
      customer: "Dr. David Brown",
      amount: 560.0,
      status: "Cancelled",
      date: "2024-01-11",
      items: 1,
      paymentMethod: "credit_card",
    },
    {
      id: 1009,
      orderNumber: "ORD-2024-1009",
      customer: "Dr. Jennifer Lee",
      amount: 3200.0,
      status: "Shipped",
      date: "2024-01-10",
      items: 6,
      paymentMethod: "bank_transfer",
    },
    {
      id: 1010,
      orderNumber: "ORD-2024-1010",
      customer: "Dr. Thomas Anderson",
      amount: 750.0,
      status: "Pending",
      date: "2024-01-10",
      items: 4,
      paymentMethod: "mobile_payment",
    },
  ];

  // تنسيق المبلغ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // دوال مساعدة لعرض Payment Method
  const getPaymentMethodDisplay = (method) => {
    const methods = {
      credit_card: {
        text: t("creditCard", "orders") || "Credit Card",
        icon: <CreditCard size={14} />,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      bank_transfer: {
        text: t("bankTransfer", "orders") || "Bank Transfer",
        icon: <Building size={14} />,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      cash: {
        text: t("cash", "orders") || "Cash",
        icon: <Banknote size={14} />,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      mobile_payment: {
        text: t("mobilePayment", "orders") || "Mobile Payment",
        icon: <Smartphone size={14} />,
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
      online_banking: {
        text: t("onlineBanking", "orders") || "Online Banking",
        icon: <Wallet size={14} />,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
      },
    };

    return (
      methods[method] || {
        text: method,
        icon: <CreditCard size={14} />,
        color: "text-gray-600",
        bg: "bg-gray-50",
      }
    );
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle size={16} className="text-green-600" />;
      case "Processing":
        return <Clock size={16} className="text-blue-600" />;
      case "Pending":
        return <Clock size={16} className="text-yellow-600" />;
      case "Shipped":
        return <Truck size={16} className="text-purple-600" />;
      case "Cancelled":
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // الحصول على نص الحالة
  const getStatusText = (status) => {
    switch (status) {
      case "Completed":
        return t("completed", "common") || "Completed";
      case "Processing":
        return t("processing", "common") || "Processing";
      case "Pending":
        return t("pending", "common") || "Pending";
      case "Shipped":
        return t("shipped", "orders") || "Shipped";
      case "Cancelled":
        return t("cancelled", "common") || "Cancelled";
      default:
        return status;
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

  // عرض خلية المبلغ
  const amountCellRender = (data) => {
    return (
      <div className="font-medium text-gray-900">
        {formatCurrency(data.data.amount)}
      </div>
    );
  };

  // عرض خلية طريقة الدفع
  const paymentMethodCellRender = (data) => {
    const payment = getPaymentMethodDisplay(data.data.paymentMethod);
    return (
      <div
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${payment.bg}`}
      >
        {payment.icon}
        <span className={`text-sm font-medium ${payment.color}`}>
          {payment.text}
        </span>
      </div>
    );
  };

  // عرض خلية رقم الطلب
  const orderNumberCellRender = (data) => {
    return (
      <div>
        <div className="font-medium text-gray-900">{data.data.orderNumber}</div>
        <div className="text-sm text-gray-500">ID: {data.data.id}</div>
      </div>
    );
  };

  // عرض خلية الإجراءات
  const actionCellRender = (data) => {
    return (
      <div className="flex items-center space-x-3">
        <button
          className="text-blue-600 hover:text-blue-800 transition"
          title={t("view", "common") || "View"}
          onClick={() => navigate(`/orders/view/${data.data.id}`)}
        >
          <Eye size={18} />
        </button>
        <button
          className="text-red-600 hover:text-red-800 transition"
          title={t("delete", "common") || "Delete"}
          onClick={() => {
            if (
              window.confirm(
                `${t("confirmDeleteOrder", "orders") || "Delete order"} #${
                  data.data.orderNumber
                }?`
              )
            ) {
              alert(
                `${t("orderDeleted", "orders") || "Order deleted"}: ${
                  data.data.orderNumber
                }`
              );
            }
          }}
        >
          <Trash2 size={18} />
        </button>
      </div>
    );
  };

  // حساب الإحصائيات
  const totalOrders = ordersData.length;
  const totalRevenue = ordersData.reduce((sum, order) => sum + order.amount, 0);
  const pendingOrders = ordersData.filter((o) => o.status === "Pending").length;
  const avgOrderValue = totalRevenue / totalOrders;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("ordersManagement", "orders") || "Orders Management"}
          </h1>
          <p className="text-gray-600">
            {t("manageTrackOrders", "orders") || "Manage and track all orders"}
          </p>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalOrders", "orders") || "Total Orders"}
              </p>
              <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingCart className="text-dental-blue" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            +15% {t("fromLastMonth", "orders") || "from last month"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalRevenue", "dashboard") || "Total Revenue"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            +22% {t("fromLastMonth", "orders") || "from last month"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("pendingOrders", "orders") || "Pending Orders"}
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingOrders}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">
            {t("requiresAttention", "orders") || "Requires attention"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("avgOrderValue", "orders") || "Average Order Value"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(avgOrderValue)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <ShoppingCart className="text-purple-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            +8% {t("fromLastMonth", "orders") || "from last month"}
          </p>
        </div>
      </div>

      {/* Orders Table مع ميزات DevExtreme المتقدمة */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataGrid
          dataSource={ordersData}
          showBorders={true}
          columnAutoWidth={true}
          allowColumnResizing={true}
          columnMinWidth={50}
          height={500}
          selection={{ mode: "multiple" }}
          onSelectionChanged={(e) => setSelectedRows(e.selectedRowsData)}
          allowColumnReordering={true}
          columnResizingMode="widget"
          showColumnLines={true}
          showRowLines={true}
          rowAlternationEnabled={true}
        >
          <HeaderFilter visible={true} />
          <SearchPanel
            visible={true}
            placeholder={t("searchOrders", "orders") || "Search orders..."}
          />
          <GroupPanel
            visible={true}
            emptyPanelText={
              t("dragColumnHereToGroup", "orders") ||
              "Drag a column header here to group by that column"
            }
            allowColumnDragging={true}
          />
          <Paging defaultPageSize={10} />
          <Pager
            showPageSizeSelector={true}
            allowedPageSizes={[5, 10, 20]}
            showInfo={true}
            showNavigationButtons={true}
          />

          <Column
            dataField="orderNumber"
            caption={t("orderNumber", "orders") || "Order Number"}
            width={"auto"}
            alignment="left"
            allowHeaderFiltering={true}
            allowFiltering={true}
            sortOrder="asc"
            cellRender={orderNumberCellRender}
          />

          <Column
            dataField="customer"
            caption={t("customer", "orders") || "Customer"}
            width={"auto"}
            alignment="left"
            allowHeaderFiltering={true}
            allowFiltering={true}
          />

          <Column
            dataField="amount"
            caption={t("amount", "orders") || "Amount"}
            width={"auto"}
            alignment="left"
            dataType="number"
            format="currency"
            allowHeaderFiltering={true}
            allowFiltering={true}
            filterOperations={["=", "<", ">", "<=", ">=", "between"]}
            cellRender={amountCellRender}
          />

          <Column
            dataField="items"
            caption={t("items", "orders") || "Items"}
            width={"auto"}
            alignment="left"
            dataType="number"
            allowHeaderFiltering={true}
            allowFiltering={true}
          />

          <Column
            dataField="status"
            caption={t("status", "orders") || "Status"}
            width={"auto"}
            alignment="left"
            allowHeaderFiltering={true}
            allowFiltering={true}
            allowGrouping={true}
            cellRender={statusCellRender}
          />

          <Column
            dataField="paymentMethod"
            caption={t("paymentMethod", "orders") || "Payment Method"}
            width={"auto"}
            alignment="left"
            allowHeaderFiltering={true}
            allowFiltering={true}
            allowGrouping={true}
            cellRender={paymentMethodCellRender}
          />

          <Column
            dataField="date"
            caption={t("date", "orders") || "Date"}
            width={"auto"}
            alignment="left"
            dataType="date"
            format="yyyy-MM-dd"
            allowHeaderFiltering={true}
            allowFiltering={true}
            filterOperations={["=", "<", ">", "<=", ">=", "between"]}
          />

          <Column
            caption={t("actions", "orders") || "Actions"}
            width={"auto"}
            alignment="left"
            allowFiltering={false}
            allowHeaderFiltering={false}
            cellRender={actionCellRender}
          />
        </DataGrid>
      </div>

      {/* إجراءات جماعية */}
      {selectedRows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="text-gray-500" size={20} />
              <span className="font-medium text-gray-700">
                {selectedRows.length}{" "}
                {t("ordersSelected", "orders") || "orders selected"}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `${t("confirmBulkDelete", "orders") || "Delete"} ${
                        selectedRows.length
                      } ${t("orders", "navigation") || "orders"}?`
                    )
                  ) {
                    alert(
                      `${t("bulkDeleteSuccess", "orders") || "Deleted"} ${
                        selectedRows.length
                      } ${t("orders", "navigation") || "orders"}`
                    );
                    setSelectedRows([]);
                  }
                }}
                className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>{t("bulkDelete", "common") || "Bulk Delete"}</span>
              </button>
              <button
                onClick={() => alert(`Export ${selectedRows.length} orders`)}
                className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition flex items-center space-x-2"
              >
                <Download size={16} />
                <span>{t("bulkExport", "common") || "Bulk Export"}</span>
              </button>
              <button
                onClick={() =>
                  alert(`Update status of ${selectedRows.length} orders`)
                }
                className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition flex items-center space-x-2"
              >
                <CheckCircle size={16} />
                <span>{t("updateStatus", "orders") || "Update Status"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("recentActivity", "orders") || "Recent Activity"}
            </h3>
            <p className="text-sm text-gray-600">
              {t("latestOrderUpdates", "orders") || "Latest order updates"}
            </p>
          </div>
          <Calendar className="text-dental-teal" size={24} />
        </div>

        <div className="space-y-4">
          {[
            {
              id: 1,
              action: t("orderShipped", "orders") || "Order Shipped",
              order: "#1005",
              customer: "Dr. Lisa Martinez",
              time: "2 hours ago",
            },
            {
              id: 2,
              action: t("paymentReceived", "orders") || "Payment Received",
              order: "#1002",
              customer: "Dr. Michael Chen",
              time: "4 hours ago",
            },
            {
              id: 3,
              action: t("orderProcessed", "orders") || "Order Processed",
              order: "#1006",
              customer: "Dr. James Wilson",
              time: "6 hours ago",
            },
            {
              id: 4,
              action: t("orderCancelled", "orders") || "Order Cancelled",
              order: "#1008",
              customer: "Dr. David Brown",
              time: "1 day ago",
            },
          ].map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-blue-500" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-600">
                    {activity.order} • {activity.customer}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
