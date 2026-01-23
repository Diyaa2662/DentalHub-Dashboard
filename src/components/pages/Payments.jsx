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
  LoadPanel,
  HeaderFilter,
} from "devextreme-react/data-grid";
import {
  CreditCard,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Hash,
  TrendingUp,
  Users,
  Building,
  ArrowUp,
  ArrowDown,
  Filter,
  FileText,
  Circle,
  CircleCheck,
  CircleX,
  CircleDollarSign,
} from "lucide-react";

const Payments = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    completedPayments: 0,
    pendingPayments: 0,
    incomingAmount: 0,
    outgoingAmount: 0,
  });
  const [filters, setFilters] = useState({
    paymentType: "all", // all, incoming, outgoing
    status: "all", // all, completed, pending, failed, refunded
    payerType: "all", // all, customer, supplier
  });

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/payments");
      const paymentsData = response.data?.data || [];

      // ✅ تنسيق البيانات من API
      const formattedPayments = paymentsData.map((payment) => {
        // ✅ تحديد أيقونة ولون الحالة
        let statusConfig = getStatusConfig(payment.status);

        // ✅ تحديد أيقونة ولون نوع الدفع
        let paymentTypeConfig = getPaymentTypeConfig(payment.payment_type);

        // ✅ تحديد أيقونة ولون نوع الدافع
        let payerTypeConfig = getPayerTypeConfig(payment.payer_type);

        // ✅ تحديد أيقونة نوع الفاتورة
        let invoiceTypeConfig = getInvoiceTypeConfig(payment.invoice_type);

        return {
          id: payment.id,
          paymentId: payment.id,
          invoiceType: payment.invoice_type,
          invoiceTypeText: getInvoiceTypeText(payment.invoice_type),
          invoiceTypeIcon: invoiceTypeConfig.icon,
          invoiceTypeColor: invoiceTypeConfig.color,
          invoiceId: payment.invoice_id,
          payableType: payment.payable_type,
          payableTypeText: getPayableTypeText(payment.payable_type),
          payableId: payment.payable_id,
          paymentType: payment.payment_type,
          paymentTypeText: getPaymentTypeText(payment.payment_type),
          paymentTypeIcon: paymentTypeConfig.icon,
          paymentTypeColor: paymentTypeConfig.color,
          payerType: payment.payer_type,
          payerTypeText: getPayerTypeText(payment.payer_type),
          payerTypeIcon: payerTypeConfig.icon,
          payerTypeColor: payerTypeConfig.color,
          payerId: payment.payer_id,
          status: payment.status,
          statusText: getStatusText(payment.status),
          statusIcon: statusConfig.icon,
          statusColor: statusConfig.color,
          paymentDate: payment.payment_date || "N/A",
          paymentMethod: payment.payment_method || "Unknown",
          paymentMethodText: getPaymentMethodText(payment.payment_method),
          currency: payment.currency || "USD",
          transactionId: payment.transaction_id || `TRX-${payment.id}`,
          amount: parseFloat(payment.amount) || 0,
          notes: payment.notes || "",
          createdDate: payment.created_at?.split("T")[0] || "N/A",
          originalData: payment,
        };
      });

      setPayments(formattedPayments);
      calculateStats(formattedPayments);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(
        t("failedToLoadPayments", "payments") || "Failed to load payments data",
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ دالة الحصول على تكوين الحالة
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          icon: <CheckCircle size={16} />,
          color: "bg-green-100 text-green-800 border border-green-200",
        };
      case "pending":
        return {
          icon: <Clock size={16} />,
          color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        };
      case "failed":
        return {
          icon: <XCircle size={16} />,
          color: "bg-red-100 text-red-800 border border-red-200",
        };
      case "refunded":
        return {
          icon: <RefreshCw size={16} />,
          color: "bg-blue-100 text-blue-800 border border-blue-200",
        };
      default:
        return {
          icon: <Circle size={16} />,
          color: "bg-gray-100 text-gray-800 border border-gray-200",
        };
    }
  };

  // ✅ دالة الحصول على نص الحالة
  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return t("completed", "payments") || "Completed";
      case "pending":
        return t("pending", "payments") || "Pending";
      case "failed":
        return t("failed", "payments") || "Failed";
      case "refunded":
        return t("refunded", "payments") || "Refunded";
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown";
    }
  };

  // ✅ دالة الحصول على تكوين نوع الدفع
  const getPaymentTypeConfig = (paymentType) => {
    switch (paymentType?.toLowerCase()) {
      case "incoming":
        return {
          icon: <ArrowDown size={16} />,
          color: "text-green-600",
          bg: "bg-green-50",
        };
      case "outgoing":
        return {
          icon: <ArrowUp size={16} />,
          color: "text-red-600",
          bg: "bg-red-50",
        };
      default:
        return {
          icon: <CreditCard size={16} />,
          color: "text-gray-600",
          bg: "bg-gray-50",
        };
    }
  };

  // ✅ دالة الحصول على نص نوع الدفع
  const getPaymentTypeText = (paymentType) => {
    switch (paymentType?.toLowerCase()) {
      case "incoming":
        return t("incoming", "payments") || "Incoming";
      case "outgoing":
        return t("outgoing", "payments") || "Outgoing";
      default:
        return paymentType || "Unknown";
    }
  };

  // ✅ دالة الحصول على تكوين نوع الدافع
  const getPayerTypeConfig = (payerType) => {
    switch (payerType?.toLowerCase()) {
      case "customer":
        return {
          icon: <Users size={16} />,
          color: "text-blue-600",
          bg: "bg-blue-50",
        };
      case "supplier":
        return {
          icon: <Building size={16} />,
          color: "text-purple-600",
          bg: "bg-purple-50",
        };
      default:
        return {
          icon: <Users size={16} />,
          color: "text-gray-600",
          bg: "bg-gray-50",
        };
    }
  };

  // ✅ دالة الحصول على نص نوع الدافع
  const getPayerTypeText = (payerType) => {
    switch (payerType?.toLowerCase()) {
      case "customer":
        return t("customer", "payments") || "Customer";
      case "supplier":
        return t("supplier", "payments") || "Supplier";
      default:
        return payerType || "Unknown";
    }
  };

  // ✅ دالة الحصول على تكوين نوع الفاتورة
  const getInvoiceTypeConfig = (invoiceType) => {
    switch (invoiceType?.toLowerCase()) {
      case "customer_invoice":
        return {
          icon: <FileText size={16} />,
          color: "text-blue-600",
        };
      case "supplier_invoice":
        return {
          icon: <FileText size={16} />,
          color: "text-purple-600",
        };
      default:
        return {
          icon: <FileText size={16} />,
          color: "text-gray-600",
        };
    }
  };

  // ✅ دالة الحصول على نص نوع الفاتورة
  const getInvoiceTypeText = (invoiceType) => {
    switch (invoiceType?.toLowerCase()) {
      case "customer_invoice":
        return t("customerInvoice", "payments") || "Customer Invoice";
      case "supplier_invoice":
        return t("supplierInvoice", "payments") || "Supplier Invoice";
      default:
        return invoiceType || "Unknown";
    }
  };

  // ✅ دالة الحصول على نص نوع القابل للدفع
  const getPayableTypeText = (payableType) => {
    switch (payableType?.toLowerCase()) {
      case "order":
        return t("order", "payments") || "Order";
      case "supplier_order":
        return t("supplierOrder", "payments") || "Supplier Order";
      default:
        return payableType || "Unknown";
    }
  };

  // ✅ دالة الحصول على نص طريقة الدفع
  const getPaymentMethodText = (paymentMethod) => {
    const methods = {
      paypal: "PayPal",
      credit_card: "Credit Card",
      bank_transfer: "Bank Transfer",
      cash: "Cash",
      stripe: "Stripe",
      other: "Other",
    };
    return methods[paymentMethod] || paymentMethod || "Unknown";
  };

  const calculateStats = (paymentsData) => {
    const totalPayments = paymentsData.length;
    const totalAmount = paymentsData.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const completedPayments = paymentsData.filter(
      (p) => p.status === "completed",
    ).length;
    const pendingPayments = paymentsData.filter(
      (p) => p.status === "pending",
    ).length;

    const incomingAmount = paymentsData
      .filter((p) => p.paymentType === "incoming")
      .reduce((sum, p) => sum + p.amount, 0);

    const outgoingAmount = paymentsData
      .filter((p) => p.paymentType === "outgoing")
      .reduce((sum, p) => sum + p.amount, 0);

    setStats({
      totalPayments,
      totalAmount,
      completedPayments,
      pendingPayments,
      incomingAmount,
      outgoingAmount,
    });
  };

  const handleRefresh = () => {
    fetchPayments();
  };

  const handleAddPayment = () => {
    navigate("/payments/add");
  };

  const handleViewPayment = (id) => {
    navigate(`/payments/${id}`);
  };

  const handleEditPayment = (id) => {
    navigate(`/payments/edit/${id}`);
  };

  const handleDeletePayment = async (id) => {
    if (
      window.confirm(
        t("confirmDeletePayment", "payments") ||
          "Are you sure you want to delete this payment?",
      )
    ) {
      try {
        await api.delete(`/deletepayment/${id}`);
        alert(
          t("paymentDeletedSuccess", "payments") ||
            "Payment deleted successfully!",
        );
        fetchPayments();
      } catch (err) {
        console.error("Error deleting payment:", err);
        alert(
          t("deletePaymentError", "payments") || "Failed to delete payment",
        );
      }
    }
  };

  // ✅ فلترة البيانات حسب الفلاتر المختارة
  const getFilteredPayments = () => {
    let filtered = payments;

    if (filters.paymentType !== "all") {
      filtered = filtered.filter((p) => p.paymentType === filters.paymentType);
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters.payerType !== "all") {
      filtered = filtered.filter((p) => p.payerType === filters.payerType);
    }

    return filtered;
  };

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // ✅ خلية عرض ID الدفعة
  const idCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <Hash size={14} className="text-gray-400" />
        <span className="font-mono font-medium">{data.data.id}</span>
      </div>
    );
  };

  // ✅ خلية عرض المبلغ
  const amountCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <div className={`p-1.5 rounded-lg ${data.data.paymentTypeColor.bg}`}>
          <DollarSign size={14} className={data.data.paymentTypeColor.color} />
        </div>
        <div>
          <p className="font-bold text-gray-900">
            {formatCurrency(data.data.amount, data.data.currency)}
          </p>
          <p className="text-xs text-gray-500">{data.data.currency}</p>
        </div>
      </div>
    );
  };

  // ✅ خلية عرض الحالة
  const statusCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        {data.data.statusIcon}
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${data.data.statusColor}`}
        >
          {data.data.statusText}
        </span>
      </div>
    );
  };

  // ✅ خلية عرض نوع الدفع
  const paymentTypeCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        {data.data.paymentTypeIcon}
        <span className="font-medium">{data.data.paymentTypeText}</span>
      </div>
    );
  };

  // ✅ خلية عرض نوع الدافع
  const payerTypeCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        {data.data.payerTypeIcon}
        <span className="font-medium">{data.data.payerTypeText}</span>
      </div>
    );
  };

  // ✅ خلية عرض نوع الفاتورة
  const invoiceTypeCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        {data.data.invoiceTypeIcon}
        <span className="font-medium">{data.data.invoiceTypeText}</span>
      </div>
    );
  };

  // ✅ خلية عرض التاريخ
  const dateCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <Calendar size={14} className="text-gray-400" />
        <span>{data.data.paymentDate}</span>
      </div>
    );
  };

  // ✅ خلية عرض طريقة الدفع
  const methodCellRender = (data) => {
    return (
      <div className="font-medium text-gray-900">
        {data.data.paymentMethodText}
      </div>
    );
  };

  // ✅ خلية عرض رقم المعاملة
  const transactionCellRender = (data) => {
    return (
      <div className="font-mono text-sm text-gray-700">
        {data.data.transactionId}
      </div>
    );
  };

  // ✅ خلية عرض الإجراءات
  const actionCellRender = (data) => {
    return (
      <div className="flex items-center space-x-3">
        <button
          onClick={() => handleViewPayment(data.data.id)}
          className="text-blue-600 hover:text-blue-800 transition"
          title={t("viewPayment", "payments") || "View Payment"}
        >
          <Eye size={18} />
        </button>
        <button
          onClick={() => handleEditPayment(data.data.id)}
          className="text-green-600 hover:text-green-800 transition"
          title={t("edit", "common") || "Edit"}
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => handleDeletePayment(data.data.id)}
          className="text-red-600 hover:text-red-800 transition"
          title={t("delete", "common") || "Delete"}
        >
          <Trash2 size={18} />
        </button>
      </div>
    );
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {t("payments", "navigation") || "Payments"}
            </h1>
            <p className="text-gray-600">
              {t("loadingPayments", "payments") || "Loading payments..."}
            </p>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-blue"></div>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {t("payments", "navigation") || "Payments"}
            </h1>
            <p className="text-gray-600">
              {t("managePayments", "payments") ||
                "Manage and track all payments"}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>{t("retry", "common") || "Retry"}</span>
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoadingPayments", "payments") ||
                  "Error Loading Payments"}
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

  const filteredPayments = getFilteredPayments();

  return (
    <div className="p-6 space-y-6">
      {/* العنوان والإحصائيات */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {t("payments", "navigation") || "Payments"}
            </h1>
            <p className="text-gray-600">
              {t("managePayments", "payments") ||
                "Manage and track all payments"}
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center space-x-2"
            >
              <RefreshCw size={20} />
              <span>{t("refresh", "common") || "Refresh"}</span>
            </button>
            <button
              onClick={handleAddPayment}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>{t("addPayment", "payments") || "Add Payment"}</span>
            </button>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {t("totalPayments", "payments") || "Total Payments"}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalPayments}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <CreditCard className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {t("totalAmount", "payments") || "Total Amount"}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(stats.totalAmount, "USD")}
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
                  {t("completedPayments", "payments") || "Completed"}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.completedPayments}
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
                  {t("pendingPayments", "payments") || "Pending"}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.pendingPayments}
                </p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* بطاقات إضافية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {t("incomingAmount", "payments") || "Incoming Amount"}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.incomingAmount, "USD")}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <ArrowDown className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {t("outgoingAmount", "payments") || "Outgoing Amount"}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.outgoingAmount, "USD")}
                </p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <ArrowUp className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* فلترة سريعة */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800 flex items-center space-x-2">
            <Filter size={18} />
            <span>{t("quickFilters", "payments") || "Quick Filters"}</span>
          </h3>
          <span className="text-sm text-gray-500">
            {filteredPayments.length}{" "}
            {t("paymentsFound", "payments") || "payments found"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* فلترة نوع الدفع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("paymentType", "payments") || "Payment Type"}
            </label>
            <select
              value={filters.paymentType}
              onChange={(e) =>
                setFilters({ ...filters, paymentType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">
                {t("allTypes", "payments") || "All Types"}
              </option>
              <option value="incoming">
                {t("incoming", "payments") || "Incoming"}
              </option>
              <option value="outgoing">
                {t("outgoing", "payments") || "Outgoing"}
              </option>
            </select>
          </div>

          {/* فلترة الحالة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("status", "payments") || "Status"}
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">
                {t("allStatuses", "payments") || "All Statuses"}
              </option>
              <option value="completed">
                {t("completed", "payments") || "Completed"}
              </option>
              <option value="pending">
                {t("pending", "payments") || "Pending"}
              </option>
              <option value="failed">
                {t("failed", "payments") || "Failed"}
              </option>
              <option value="refunded">
                {t("refunded", "payments") || "Refunded"}
              </option>
            </select>
          </div>

          {/* فلترة نوع الدافع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("payerType", "payments") || "Payer Type"}
            </label>
            <select
              value={filters.payerType}
              onChange={(e) =>
                setFilters({ ...filters, payerType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">
                {t("allPayers", "payments") || "All Payers"}
              </option>
              <option value="customer">
                {t("customer", "payments") || "Customer"}
              </option>
              <option value="supplier">
                {t("supplier", "payments") || "Supplier"}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* جدول المدفوعات باستخدام DevExtreme DataGrid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {t("noPayments", "payments") || "No Payments"}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("noPaymentsDescription", "payments") ||
                "No payment records found"}
            </p>
            <button
              onClick={handleAddPayment}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2 mx-auto"
            >
              <Plus size={20} />
              <span>
                {t("addFirstPayment", "payments") || "Add First Payment"}
              </span>
            </button>
          </div>
        ) : (
          <DataGrid
            dataSource={filteredPayments}
            showBorders={true}
            columnAutoWidth={true}
            height={500}
            allowColumnResizing={true}
            allowColumnReordering={true}
            columnResizingMode="widget"
            showColumnLines={true}
            showRowLines={true}
            rowAlternationEnabled={true}
          >
            <LoadPanel enabled={false} />
            <SearchPanel
              visible={true}
              placeholder={
                t("searchPayments", "payments") || "Search payments..."
              }
            />
            <HeaderFilter visible={true} />
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

            {/* ID */}
            <Column
              dataField="id"
              caption={t("id", "common") || "ID"}
              width="auto"
              alignment="left"
              allowGrouping={false}
              cellRender={idCellRender}
            />

            {/* المبلغ */}
            <Column
              dataField="amount"
              caption={t("amount", "payments") || "Amount"}
              width="auto"
              alignment="left"
              allowGrouping={false}
              cellRender={amountCellRender}
            />

            {/* نوع الدفع */}
            <Column
              dataField="paymentType"
              caption={t("paymentType", "payments") || "Payment Type"}
              width="auto"
              alignment="left"
              cellRender={paymentTypeCellRender}
            />

            {/* الحالة */}
            <Column
              dataField="status"
              caption={t("status", "payments") || "Status"}
              width="auto"
              alignment="left"
              cellRender={statusCellRender}
            />

            {/* نوع الدافع */}
            <Column
              dataField="payerType"
              caption={t("payerType", "payments") || "Payer Type"}
              width="auto"
              alignment="left"
              cellRender={payerTypeCellRender}
            />

            {/* نوع الفاتورة */}
            <Column
              dataField="invoiceType"
              caption={t("invoiceType", "payments") || "Invoice Type"}
              width="auto"
              alignment="left"
              cellRender={invoiceTypeCellRender}
            />

            {/* طريقة الدفع */}
            <Column
              dataField="paymentMethod"
              caption={t("paymentMethod", "payments") || "Payment Method"}
              width="auto"
              alignment="left"
              cellRender={methodCellRender}
            />

            {/* تاريخ الدفع */}
            <Column
              dataField="paymentDate"
              caption={t("paymentDate", "payments") || "Payment Date"}
              width="auto"
              alignment="left"
              cellRender={dateCellRender}
            />

            {/* رقم المعاملة */}
            <Column
              dataField="transactionId"
              caption={t("transactionId", "payments") || "Transaction ID"}
              width="auto"
              alignment="left"
              allowGrouping={false}
              cellRender={transactionCellRender}
            />

            {/* الإجراءات */}
            <Column
              caption={t("actions", "common") || "Actions"}
              width="auto"
              alignment="left"
              cellRender={actionCellRender}
            />
          </DataGrid>
        )}
      </div>

      {/* إحصائيات إضافية */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800">
            {t("paymentStatistics", "payments") || "Payment Statistics"}
          </h3>
          <TrendingUp className="text-gray-500" size={20} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalPayments}
            </div>
            <div className="text-sm text-gray-600">
              {t("total", "common") || "Total"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.completedPayments}
            </div>
            <div className="text-sm text-gray-600">
              {t("completed", "payments") || "Completed"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingPayments}
            </div>
            <div className="text-sm text-gray-600">
              {t("pending", "payments") || "Pending"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {payments.filter((p) => p.status === "failed").length}
            </div>
            <div className="text-sm text-gray-600">
              {t("failed", "payments") || "Failed"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {payments.filter((p) => p.status === "refunded").length}
            </div>
            <div className="text-sm text-gray-600">
              {t("refunded", "payments") || "Refunded"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {formatCurrency(stats.totalAmount, "USD")}
            </div>
            <div className="text-sm text-gray-600">
              {t("totalValue", "payments") || "Total Value"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
