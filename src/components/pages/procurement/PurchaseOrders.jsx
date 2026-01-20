import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import api from "../../../services/api";
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
  Eye,
  Edit,
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
  RefreshCw,
  Hash,
} from "lucide-react"; // ✅ أضفنا Hash لأيقونة ID

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [purchaseOrdersData, setPurchaseOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });

  useEffect(() => {
    fetchPurchaseOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ دالة لتحويل حالة الـ API إلى حالة داخلية موحدة
  const normalizeStatus = (apiStatus) => {
    if (!apiStatus) return "pending";

    const statusLower = apiStatus.toLowerCase();

    if (statusLower.includes("confirm")) {
      return "confirmed";
    } else if (statusLower.includes("cancel")) {
      return "cancelled";
    } else if (statusLower.includes("ship")) {
      return "shipped";
    } else if (statusLower.includes("deliver")) {
      return "delivered";
    } else if (statusLower.includes("pending")) {
      return "pending";
    }

    return "pending";
  };

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/supplierorders");
      const apiData = response.data?.data || [];

      const formattedData = apiData.map((order) => ({
        id: order.id,
        poNumber: order.supplier_order_number || `PO-${order.id}`,
        supplier: order.supplier || "Unknown Supplier",
        orderDate: order.order_date || order.created_at?.split("T")[0] || "N/A",
        totalAmount: parseFloat(order.total_amount) || 0,
        itemsOrdered: order.number_of_items || 0,
        status: normalizeStatus(order.status || "pending"), // ✅ استخدام normalizeStatus
        originalStatus: order.status, // حفظ الحالة الأصلية
        paymentMethod: order.payment_method || "Unknown",
        originalData: order,
      }));

      setPurchaseOrdersData(formattedData);
      calculateStats(formattedData);
    } catch (err) {
      console.error("Error fetching purchase orders:", err);
      setError(
        t("fetchPurchaseOrdersError", "procurement") ||
          "Failed to load purchase orders",
      );
      setPurchaseOrdersData([]);
      setStats({
        totalOrders: 0,
        totalAmount: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalOrders = data.length;
    const totalAmount = data.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    );
    const pendingOrders = data.filter(
      (order) => order.status === "pending",
    ).length;
    const deliveredOrders = data.filter(
      (order) => order.status === "delivered",
    ).length;
    const cancelledOrders = data.filter(
      (order) => order.status === "cancelled",
    ).length;

    setStats({
      totalOrders,
      totalAmount,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

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

  const getPaymentMethodIcon = (method) => {
    if (!method) return <CreditCard size={16} className="text-gray-600" />;

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

  // ✅ خلية عرض ID
  const idCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <Hash size={14} className="text-gray-400" />
        <span className="font-mono font-medium text-gray-700">
          {data.data.id}
        </span>
      </div>
    );
  };

  const statusCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon(data.data.status)}
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            data.data.status,
          )}`}
        >
          {getStatusText(data.data.status)}
        </span>
      </div>
    );
  };

  const paymentMethodCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        {getPaymentMethodIcon(data.data.paymentMethod)}
        <span className="text-sm font-medium text-gray-700">
          {data.data.paymentMethod || "N/A"}
        </span>
      </div>
    );
  };

  const amountCellRender = (data) => {
    return (
      <div className="font-medium text-gray-900">
        {formatCurrency(data.data.totalAmount)}
      </div>
    );
  };

  // ✅ خلية الإجراءات المعدلة (بدون زر الحذف)
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
      </div>
    );
  };

  const handleAddPurchaseOrder = () => {
    navigate("/procurement/purchase-orders/add");
  };

  const handleRefresh = () => {
    fetchPurchaseOrders();
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("purchaseOrdersManagement", "procurement") ||
                "Purchase Orders Management"}
            </h1>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {t("loadingPurchaseOrders", "procurement") ||
                "Loading purchase orders..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("purchaseOrdersManagement", "procurement") ||
                "Purchase Orders Management"}
            </h1>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-4 md:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>{t("retry", "common") || "Retry"}</span>
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {t("errorLoadingData", "common") || "Error Loading Data"}
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            {t("tryAgain", "common") || "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
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
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
            title={t("refresh", "common") || "Refresh"}
          >
            <RefreshCw size={20} />
            <span className="hidden md:inline">
              {t("refresh", "common") || "Refresh"}
            </span>
          </button>
          <button
            onClick={handleAddPurchaseOrder}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t("addPurchaseOrder", "procurement") || "Add PO"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t("totalOrders", "procurement") || "Total Orders"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalOrders}
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
                {formatCurrency(stats.totalAmount)}
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
                {stats.pendingOrders}
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
                {stats.deliveredOrders}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t("cancelled", "procurement") || "Cancelled"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.cancelledOrders}
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {purchaseOrdersData.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {t("noPurchaseOrders", "procurement") || "No Purchase Orders"}
            </h3>
            <p className="text-gray-500 mb-4">
              {t("noPurchaseOrdersDescription", "procurement") ||
                "You haven't created any purchase orders yet"}
            </p>
            <button
              onClick={handleAddPurchaseOrder}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition"
            >
              {t("createFirstPurchaseOrder", "procurement") ||
                "Create First Purchase Order"}
            </button>
          </div>
        ) : (
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

            {/* ✅ عمود ID الجديد - كأول عمود */}
            <Column
              dataField="id"
              caption={t("id", "products") || "ID"}
              width={80}
              alignment="center"
              allowGrouping={false}
              allowSorting={true}
              cellRender={idCellRender}
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
              width={100}
              alignment="center"
              cellRender={actionCellRender}
            />
          </DataGrid>
        )}
      </div>

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
