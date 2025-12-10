import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
} from "devextreme-react/data-grid";
import {
  ShoppingCart,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  DollarSign,
  Calendar,
} from "lucide-react";

const Orders = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { t } = useLanguage();

  // Mock data for orders
  const ordersData = [
    {
      id: 1001,
      customer: "Dr. Sarah Johnson",
      amount: "$450",
      status: "Completed",
      date: "2024-01-15",
      items: 3,
      payment: "Paid",
      shipping: "Delivered",
    },
    {
      id: 1002,
      customer: "Dr. Michael Chen",
      amount: "$2,800",
      status: "Processing",
      date: "2024-01-14",
      items: 1,
      payment: "Pending",
      shipping: "Processing",
    },
    {
      id: 1003,
      customer: "Dr. Emily Williams",
      amount: "$320",
      status: "Pending",
      date: "2024-01-14",
      items: 5,
      payment: "Pending",
      shipping: "Not Shipped",
    },
    {
      id: 1004,
      customer: "Dr. Robert Kim",
      amount: "$180",
      status: "Completed",
      date: "2024-01-13",
      items: 2,
      payment: "Paid",
      shipping: "Delivered",
    },
    {
      id: 1005,
      customer: "Dr. Lisa Martinez",
      amount: "$1,250",
      status: "Shipped",
      date: "2024-01-12",
      items: 4,
      payment: "Paid",
      shipping: "In Transit",
    },
    {
      id: 1006,
      customer: "Dr. James Wilson",
      amount: "$890",
      status: "Processing",
      date: "2024-01-12",
      items: 2,
      payment: "Pending",
      shipping: "Processing",
    },
    {
      id: 1007,
      customer: "Dr. Maria Garcia",
      amount: "$1,450",
      status: "Completed",
      date: "2024-01-11",
      items: 3,
      payment: "Paid",
      shipping: "Delivered",
    },
    {
      id: 1008,
      customer: "Dr. David Brown",
      amount: "$560",
      status: "Cancelled",
      date: "2024-01-11",
      items: 1,
      payment: "Refunded",
      shipping: "Cancelled",
    },
  ];

  const statusFilters = [
    {
      id: "all",
      label: t("allOrders", "orders"),
      count: 45,
      icon: <ShoppingCart size={16} />,
      color: "bg-gray-100 text-gray-800",
    },
    {
      id: "pending",
      label: t("pending", "common"),
      count: 8,
      icon: <Clock size={16} />,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      id: "processing",
      label: t("processing", "common"),
      count: 12,
      icon: <Filter size={16} />,
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "completed",
      label: t("completed", "common"),
      count: 25,
      icon: <CheckCircle size={16} />,
      color: "bg-green-100 text-green-800",
    },
    {
      id: "shipped",
      label: t("shipped", "orders"),
      count: 15,
      icon: <Truck size={16} />,
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "cancelled",
      label: t("cancelled", "common"),
      count: 5,
      icon: <XCircle size={16} />,
      color: "bg-red-100 text-red-800",
    },
  ];

  const filteredOrders =
    selectedStatus === "all"
      ? ordersData
      : ordersData.filter(
          (order) => order.status.toLowerCase() === selectedStatus
        );

  const handleExportOrders = () => {
    alert(t("exportOrdersMessage", "orders") || "Export orders functionality");
  };

  const handleViewOrder = (orderId) => {
    alert(`${t("viewingOrder", "orders")} #${orderId}`);
  };

  const handlePrintInvoice = (orderId) => {
    alert(`${t("printingInvoice", "orders")} #${orderId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("ordersManagement", "orders")}
          </h1>
          <p className="text-gray-600">{t("manageTrackOrders", "orders")}</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleExportOrders}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <Download size={20} />
            <span>{t("exportOrders", "orders")}</span>
          </button>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalOrders", "orders")}
              </p>
              <p className="text-2xl font-bold text-gray-800">245</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingCart className="text-dental-blue" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            +15% {t("fromLastMonth", "orders")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalRevenue", "dashboard")}
              </p>
              <p className="text-2xl font-bold text-gray-800">$45,680</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            +22% {t("fromLastMonth", "orders")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("pendingOrders", "orders")}
              </p>
              <p className="text-2xl font-bold text-yellow-600">18</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">
            {t("requiresAttention", "orders")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("avgOrderValue", "orders")}
              </p>
              <p className="text-2xl font-bold text-gray-800">$845</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <ShoppingCart className="text-purple-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            +8% {t("fromLastMonth", "orders")}
          </p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t("filterByStatus", "orders")}
        </h3>
        <div className="flex flex-wrap gap-3">
          {statusFilters.map((status) => (
            <button
              key={status.id}
              onClick={() => setSelectedStatus(status.id)}
              className={`px-4 py-3 rounded-lg font-medium transition flex items-center space-x-3 ${
                selectedStatus === status.id
                  ? "ring-2 ring-offset-2 ring-blue-500"
                  : "hover:opacity-90"
              } ${status.color}`}
            >
              {status.icon}
              <div className="text-left">
                <div className="font-medium">{status.label}</div>
                <div className="text-sm opacity-75">
                  {status.count} {t("orders", "navigation").toLowerCase()}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <DataGrid
            dataSource={filteredOrders}
            showBorders={true}
            columnAutoWidth={true}
            height={500}
          >
            <SearchPanel
              visible={true}
              placeholder={t("searchOrders", "orders")}
            />
            <Paging defaultPageSize={10} />
            <Pager
              showPageSizeSelector={true}
              allowedPageSizes={[5, 10, 20]}
              showInfo={true}
            />

            <Column
              dataField="id"
              caption={t("orderId", "orders")}
              width={100}
            />
            <Column
              dataField="customer"
              caption={t("customer", "navigation")}
            />
            <Column dataField="amount" caption={t("amount", "common")} />
            <Column
              dataField="items"
              caption={t("items", "orders")}
              width={80}
            />
            <Column
              dataField="status"
              caption={t("status", "common")}
              cellRender={({ data }) => {
                const statusConfig = {
                  Completed: {
                    color: "bg-green-100 text-green-800",
                    icon: <CheckCircle size={12} />,
                  },
                  Processing: {
                    color: "bg-blue-100 text-blue-800",
                    icon: <Filter size={12} />,
                  },
                  Pending: {
                    color: "bg-yellow-100 text-yellow-800",
                    icon: <Clock size={12} />,
                  },
                  Shipped: {
                    color: "bg-purple-100 text-purple-800",
                    icon: <Truck size={12} />,
                  },
                  Cancelled: {
                    color: "bg-red-100 text-red-800",
                    icon: <XCircle size={12} />,
                  },
                };

                const config = statusConfig[data.status] || {
                  color: "bg-gray-100 text-gray-800",
                };

                return (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1 ${config.color}`}
                  >
                    {config.icon && <>{config.icon}</>}
                    <span>
                      {data.status === "Completed"
                        ? t("completed", "common")
                        : data.status === "Processing"
                        ? t("processing", "common")
                        : data.status === "Pending"
                        ? t("pending", "common")
                        : data.status === "Shipped"
                        ? t("shipped", "orders")
                        : t("cancelled", "common")}
                    </span>
                  </span>
                );
              }}
            />
            <Column dataField="payment" caption={t("payment", "orders")} />
            <Column dataField="shipping" caption={t("shipping", "orders")} />
            <Column
              dataField="date"
              caption={t("date", "orders")}
              width={100}
            />
            <Column
              caption={t("actions", "products")}
              width={120}
              cellRender={({ data }) => (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewOrder(data.id)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                    title={t("view", "common")}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handlePrintInvoice(data.id)}
                    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition"
                    title={t("printInvoice", "orders")}
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>
              )}
            />
          </DataGrid>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("recentActivity", "orders")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("latestOrderUpdates", "orders")}
            </p>
          </div>
          <Calendar className="text-dental-teal" size={24} />
        </div>

        <div className="space-y-4">
          {[
            {
              id: 1,
              action: t("orderShipped", "orders"),
              order: "#1005",
              customer: "Dr. Lisa Martinez",
              time: "2 hours ago",
            },
            {
              id: 2,
              action: t("paymentReceived", "orders"),
              order: "#1002",
              customer: "Dr. Michael Chen",
              time: "4 hours ago",
            },
            {
              id: 3,
              action: t("orderProcessed", "orders"),
              order: "#1006",
              customer: "Dr. James Wilson",
              time: "6 hours ago",
            },
            {
              id: 4,
              action: t("orderCancelled", "orders"),
              order: "#1008",
              customer: "Dr. David Brown",
              time: "1 day ago",
            },
            {
              id: 5,
              action: t("orderDelivered", "orders"),
              order: "#1004",
              customer: "Dr. Robert Kim",
              time: "2 days ago",
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
