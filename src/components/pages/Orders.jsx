import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
  GroupPanel,
  HeaderFilter,
} from "devextreme-react/data-grid";
import {
  ShoppingCart,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  Wallet,
  RefreshCw,
  AlertCircle,
  Hash,
  HelpCircle,
} from "lucide-react";

const Orders = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "confirmed", "pending", "canceled", "unchecked"

  // ✅ تعريف الحالات الثابتة  
  const STATUSES = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CANCELED: "canceled",
    UNCHECKED: "unchecked",  
  };

  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    canceled: 0,
    unchecked: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
  });

  // ✅ جلب بيانات الطلبات من API
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/customerorders");

      // ✅ استخراج البيانات من هيكل الاستجابة
      const apiData = response.data?.data;

      if (Array.isArray(apiData)) {
        if (apiData.length === 0) {
          // ✅ لا يوجد طلبات
          setOrdersData([]);
          setStats({
            total: 0,
            confirmed: 0,
            pending: 0,
            canceled: 0,
            unchecked: 0,   
            totalRevenue: 0,
            avgOrderValue: 0,
          });
        } else {
          // ✅ تحويل البيانات للتنسيق المناسب
          const formattedData = apiData.map((order) => {
            // ✅ حساب إجمالي المبلغ إذا كان غير موجود
            const totalAmount = order.total_amount
              ? parseFloat(order.total_amount)
              : 0;

            // ✅ معالجة الحالة من API
            let status = STATUSES.UNCHECKED; // الافتراضي غير مؤكد (unchecked)

            if (order.status) {
              const statusLower = order.status.toLowerCase();
              if (statusLower === STATUSES.CONFIRMED) {
                status = STATUSES.CONFIRMED;
              } else if (statusLower === STATUSES.CANCELED) {
                status = STATUSES.CANCELED;
              } else if (statusLower === STATUSES.PENDING) {
                status = STATUSES.PENDING;
              } else if (statusLower === STATUSES.UNCHECKED) {
                status = STATUSES.UNCHECKED;
              }
            }

            return {
              id: order.id,
              orderNumber: order.order_number || `ORD-${order.id}`,
              customer: order.user_name || `Customer #${order.user_id}`,
              amount: totalAmount,
              subtotal: parseFloat(order.subtotal) || 0,
              tax: parseFloat(order.tax_amount) || 0,
              discount: parseFloat(order.discount_amount) || 0,
              status: status, // استخدام الحالة المعالجة
              originalStatus: order.status, // حفظ الحالة الأصلية للAPI
              date: order.order_date || order.created_at?.split("T")[0] || "",
              items: order.number_of_items || 0,
              paymentMethod: order.payment_method || "not_specified",
              currency: order.currency || "USD",
              notes: order.notes || "",
            };
          });

          setOrdersData(formattedData);

          // ✅ حساب الإحصائيات
          calculateStats(formattedData);
        }
      } else {
        // ✅ حالة عدم وجود بيانات أو تنسيق غير صحيح
        setError(
          t("invalidDataFormat", "orders") ||
            "No order data found or invalid data format",
        );
        setOrdersData([]);
        setStats({
          total: 0,
          confirmed: 0,
          pending: 0,
          canceled: 0,
          unchecked: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
        });
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("failedToLoadOrders", "orders") ||
          "Failed to load orders",
      );
      setOrdersData([]);
      setStats({
        total: 0,
        confirmed: 0,
        pending: 0,
        canceled: 0,
        unchecked: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ حساب الإحصائيات من البيانات - أضفنا unchecked
  const calculateStats = (data) => {
    const total = data.length;
    const confirmed = data.filter(
      (o) => o.status === STATUSES.CONFIRMED,
    ).length;
    const pending = data.filter((o) => o.status === STATUSES.PENDING).length;
    const canceled = data.filter((o) => o.status === STATUSES.CANCELED).length;
    const unchecked = data.filter(
      (o) => o.status === STATUSES.UNCHECKED,
    ).length; // أضفنا الحالة الجديدة
    const totalRevenue = data.reduce((sum, order) => sum + order.amount, 0);
    const avgOrderValue = total > 0 ? totalRevenue / total : 0;

    setStats({
      total,
      confirmed,
      pending,
      canceled,
      unchecked,
      totalRevenue,
      avgOrderValue,
    });
  };

  // ✅ فلترة الطلبات حسب الحالة
  const getFilteredOrders = () => {
    if (filterStatus === "all") {
      return ordersData;
    }
    return ordersData.filter((order) => order.status === filterStatus);
  };

  // ✅ تطبيق الفلتر عند النقر على كرت الإحصائية
  const handleFilterClick = (status) => {
    setFilterStatus(status);
  };

  // ✅ دالة إعادة التحميل
  const handleRefresh = () => {
    fetchOrders();
  };

  // ✅ تنسيق المبلغ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // ✅ دوال مساعدة لعرض Payment Method
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
      not_specified: {
        text: t("notSpecified", "orders") || "Not Specified",
        icon: <CreditCard size={14} />,
        color: "text-gray-600",
        bg: "bg-gray-50",
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

  // ✅ الحصول على أيقونة الحالة - أضفنا حالة unchecked
  const getStatusIcon = (status) => {
    switch (status) {
      case STATUSES.CONFIRMED:
        return <CheckCircle size={16} className="text-green-600" />;
      case STATUSES.PENDING:
        return <Clock size={16} className="text-yellow-600" />;
      case STATUSES.CANCELED:
        return <XCircle size={16} className="text-red-600" />;
      case STATUSES.UNCHECKED: // أضفنا الحالة الجديدة
        return <HelpCircle size={16} className="text-gray-600" />;
      default:
        return <HelpCircle size={16} className="text-gray-600" />;
    }
  };

  // ✅ الحصول على لون الحالة - أضفنا حالة unchecked
  const getStatusColor = (status) => {
    switch (status) {
      case STATUSES.CONFIRMED:
        return "bg-green-100 text-green-800";
      case STATUSES.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case STATUSES.CANCELED:
        return "bg-red-100 text-red-800";
      case STATUSES.UNCHECKED: // أضفنا الحالة الجديدة
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // ✅ الحصول على نص الحالة - أضفنا حالة unchecked
  const getStatusText = (status) => {
    switch (status) {
      case STATUSES.CONFIRMED:
        return t("confirmed", "common") || "Confirmed";
      case STATUSES.PENDING:
        return t("pending", "common") || "Pending";
      case STATUSES.CANCELED:
        return t("canceled", "common") || "Canceled";
      case STATUSES.UNCHECKED: // أضفنا الحالة الجديدة
        return t("unchecked", "orders") || "Unchecked";
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown";
    }
  };

  // ✅ عرض خلية ID
  const idCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <Hash size={14} className="text-gray-400" />
        <span className="font-mono font-medium text-gray-800">
          {data.data.id}
        </span>
      </div>
    );
  };

  // ✅ عرض خلية رقم الطلب
  const orderNumberCellRender = (data) => {
    return (
      <div className="font-medium text-gray-900">{data.data.orderNumber}</div>
    );
  };

  // ✅ عرض خلية الحالة (بدون dropdown للتغيير)
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

  // ✅ عرض خلية المبلغ
  const amountCellRender = (data) => {
    return (
      <div className="font-medium text-gray-900">
        {formatCurrency(data.data.amount)}
      </div>
    );
  };

  // ✅ عرض خلية طريقة الدفع
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

  // ✅ عرض خلية الإجراءات (فقط زر المشاهدة)
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
      </div>
    );
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("ordersManagement", "orders") || "Orders Management"}
            </h1>
            <p className="text-gray-600">
              {t("manageTrackOrders", "orders") ||
                "Manage and track all orders"}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2 mt-4 md:mt-0"
            disabled
          >
            <RefreshCw size={18} className="animate-spin" />
            <span>{t("loading", "common") || "Loading..."}</span>
          </button>
        </div>

        {/* كروت الإحصائيات أثناء التحميل */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto mb-4"></div>
            <p className="text-gray-600">
              {t("loadingOrders", "orders") || "Loading orders..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("ordersManagement", "orders") || "Orders Management"}
            </h1>
            <p className="text-gray-600">
              {t("manageTrackOrders", "orders") ||
                "Manage and track all orders"}
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoadingOrders", "orders") || "Error Loading Orders"}
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition flex items-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>{t("tryAgain", "common") || "Try Again"}</span>
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

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
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
            title={t("refresh", "common") || "Refresh"}
          >
            <RefreshCw size={18} />
            <span>{t("refresh", "common") || "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Order Stats - مع فلتر عند النقر */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {" "}
        {/* عدلنا من 4 إلى 5 أعمدة */}
        {/* Total Orders */}
        <button
          onClick={() => handleFilterClick("all")}
          className={`bg-white p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
            filterStatus === "all"
              ? "border-dental-blue ring-2 ring-blue-100"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalOrders", "orders") || "Total Orders"}
              </p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingCart className="text-dental-blue" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t("clickToViewAll", "orders") || "Click to view all orders"}
          </p>
        </button>
        {/* Unchecked Orders - كرت جديد */}
        <button
          onClick={() => handleFilterClick(STATUSES.UNCHECKED)}
          className={`bg-white p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
            filterStatus === STATUSES.UNCHECKED
              ? "border-gray-500 ring-2 ring-gray-100"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("uncheckedOrders", "orders") || "Unchecked Orders"}
              </p>
              <p className="text-2xl font-bold text-gray-600">
                {stats.unchecked}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <HelpCircle className="text-gray-500" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t("needsReview", "orders") || "Needs review"}
          </p>
        </button>
        {/* Confirmed Orders */}
        <button
          onClick={() => handleFilterClick(STATUSES.CONFIRMED)}
          className={`bg-white p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
            filterStatus === STATUSES.CONFIRMED
              ? "border-green-500 ring-2 ring-green-100"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("confirmedOrders", "orders") || "Confirmed Orders"}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.confirmed}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t("clickToFilter", "orders") || "Click to filter confirmed orders"}
          </p>
        </button>
        {/* Pending Orders */}
        <button
          onClick={() => handleFilterClick(STATUSES.PENDING)}
          className={`bg-white p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
            filterStatus === STATUSES.PENDING
              ? "border-yellow-500 ring-2 ring-yellow-100"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("pendingOrders", "orders") || "Pending Orders"}
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t("requiresAttention", "orders") || "Requires attention"}
          </p>
        </button>
        {/* Canceled Orders */}
        <button
          onClick={() => handleFilterClick(STATUSES.CANCELED)}
          className={`bg-white p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
            filterStatus === STATUSES.CANCELED
              ? "border-red-500 ring-2 ring-red-100"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("canceledOrders", "orders") || "Canceled Orders"}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.canceled}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircle className="text-red-500" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t("viewCanceled", "orders") || "View canceled orders"}
          </p>
        </button>
      </div>

      {/* فلتر نشط */}
      {filterStatus !== "all" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${getStatusColor(filterStatus).split(" ")[0]}`}
            >
              {getStatusIcon(filterStatus)}
            </div>
            <div>
              <p className="font-medium text-gray-800">
                {t("showingFiltered", "orders") || "Showing"}{" "}
                {filteredOrders.length} {t("orders", "navigation")} -{" "}
                {getStatusText(filterStatus)}
              </p>
              <p className="text-sm text-gray-600">
                {t("filteredByStatus", "orders") || "Filtered by status"} "
                {getStatusText(filterStatus)}"
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterStatus("all")}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            {t("clearFilter", "common") || "Clear Filter"}
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {filterStatus === "all"
                ? t("noOrdersYet", "orders") || "No Orders Yet"
                : t("noFilteredOrders", "orders") ||
                  "No orders found for this filter"}
            </h3>
            <p className="text-gray-600 mb-4">
              {filterStatus === "all"
                ? t("startByReceivingOrders", "orders") ||
                  "Start by receiving orders from customers"
                : t("tryDifferentFilter", "orders") ||
                  "Try a different filter or check back later"}
            </p>
            {filterStatus !== "all" && (
              <button
                onClick={() => setFilterStatus("all")}
                className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
              >
                {t("viewAllOrders", "orders") || "View All Orders"}
              </button>
            )}
          </div>
        ) : (
          <DataGrid
            dataSource={filteredOrders}
            showBorders={true}
            columnAutoWidth={true}
            allowColumnResizing={true}
            columnMinWidth={50}
            height={500}
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
              dataField="id"
              caption={t("id", "orders") || "ID"}
              width={80}
              alignment="left"
              allowHeaderFiltering={true}
              allowFiltering={true}
              sortOrder="asc"
              cellRender={idCellRender}
            />

            <Column
              dataField="orderNumber"
              caption={t("orderNumber", "orders") || "Order Number"}
              width={"auto"}
              alignment="left"
              allowHeaderFiltering={true}
              allowFiltering={true}
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
        )}
      </div>
    </div>
  );
};

export default Orders;
