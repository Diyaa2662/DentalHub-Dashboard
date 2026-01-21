import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
import {
  ArrowLeft,
  Edit,
  Printer,
  Download,
  CreditCard,
  Calendar,
  DollarSign,
  Hash,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  FileText,
  Building,
  Users,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  Copy,
  ExternalLink,
  Eye,
  AlertCircle,
  Info,
  Package,
  User,
  Truck,
  CreditCard as CreditCardIcon,
  Coins,
  Wallet,
} from "lucide-react";

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [payerDetails, setPayerDetails] = useState(null);
  const [payableDetails, setPayableDetails] = useState(null);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPaymentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/payments/${id}`);
      console.log("Payment details response:", response.data);

      const paymentData = response.data?.data;
      if (paymentData) {
        setPayment(paymentData);
        // جلب تفاصيل الكيانات المرتبطة
        fetchRelatedDetails(paymentData);
      } else {
        setError(
          t("paymentNotFound", "payments") ||
            "Payment not found or invalid data",
        );
      }
    } catch (err) {
      console.error("Error fetching payment details:", err);
      setError(
        err.response?.data?.message ||
          t("loadPaymentFailed", "payments") ||
          "Failed to load payment details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedDetails = async (paymentData) => {
    try {
      setLoadingRelated(true);

      // جلب تفاصيل الفاتورة
      if (paymentData.invoice_id) {
        try {
          const endpoint =
            paymentData.invoice_type === "customer_invoice"
              ? `/invoices/${paymentData.invoice_id}`
              : `/supplierinvoices/${paymentData.invoice_id}`;
          const response = await api.get(endpoint);
          const invoiceData =
            response.data?.invoice || response.data?.data || null;
          setInvoiceDetails(invoiceData);
        } catch (invoiceErr) {
          console.error("Error fetching invoice details:", invoiceErr);
        }
      }

      // جلب تفاصيل الدافع
      if (paymentData.payer_id) {
        try {
          const endpoint =
            paymentData.payer_type === "customer"
              ? `/customers/${paymentData.payer_id}`
              : `/suppliers/${paymentData.payer_id}`;
          const response = await api.get(endpoint);
          const payerData =
            response.data?.customer ||
            response.data?.supplier ||
            response.data?.data ||
            null;
          setPayerDetails(payerData);
        } catch (payerErr) {
          console.error("Error fetching payer details:", payerErr);
        }
      }

      // جلب تفاصيل القابل للدفع
      if (paymentData.payable_id) {
        try {
          const endpoint =
            paymentData.payable_type === "order"
              ? `/customerorders/${paymentData.payable_id}`
              : `/supplierorders/${paymentData.payable_id}`;
          const response = await api.get(endpoint);
          const payableData =
            response.data?.order || response.data?.data || null;
          setPayableDetails(payableData);
        } catch (payableErr) {
          console.error("Error fetching payable details:", payableErr);
        }
      }
    } catch (err) {
      console.error("Error fetching related details:", err);
    } finally {
      setLoadingRelated(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle size={16} className="text-green-600" />,
        label: t("completed", "payments") || "Completed",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock size={16} className="text-yellow-600" />,
        label: t("pending", "payments") || "Pending",
      },
      failed: {
        color: "bg-red-100 text-red-800",
        icon: <XCircle size={16} className="text-red-600" />,
        label: t("failed", "payments") || "Failed",
      },
      refunded: {
        color: "bg-blue-100 text-blue-800",
        icon: <RefreshCw size={16} className="text-blue-600" />,
        label: t("refunded", "payments") || "Refunded",
      },
    };

    return (
      configs[status] || {
        color: "bg-gray-100 text-gray-800",
        icon: <Info size={16} className="text-gray-600" />,
        label: status,
      }
    );
  };

  const getPaymentTypeConfig = (type) => {
    const configs = {
      incoming: {
        color: "bg-green-100 text-green-800",
        icon: <ArrowDown size={16} className="text-green-600" />,
        label: t("incoming", "payments") || "Incoming",
        description: t("incomingPayment", "payments") || "Payment received",
      },
      outgoing: {
        color: "bg-red-100 text-red-800",
        icon: <ArrowUp size={16} className="text-red-600" />,
        label: t("outgoing", "payments") || "Outgoing",
        description: t("outgoingPayment", "payments") || "Payment made",
      },
    };

    return (
      configs[type] || {
        color: "bg-gray-100 text-gray-800",
        icon: <CreditCardIcon size={16} className="text-gray-600" />,
        label: type,
        description: "",
      }
    );
  };

  const getPaymentMethodConfig = (method) => {
    const configs = {
      credit_card: {
        icon: <CreditCardIcon size={20} className="text-blue-600" />,
        label: t("creditCard", "payments") || "Credit Card",
        color: "text-blue-600",
      },
      paypal: {
        icon: <CreditCardIcon size={20} className="text-blue-500" />,
        label: "PayPal",
        color: "text-blue-500",
      },
      bank_transfer: {
        icon: <Building size={20} className="text-green-600" />, // استخدم Building بدلاً من Bank
        label: t("bankTransfer", "payments") || "Bank Transfer",
        color: "text-green-600",
      },
      cash: {
        icon: <Coins size={20} className="text-yellow-600" />,
        label: t("cash", "payments") || "Cash",
        color: "text-yellow-600",
      },
      stripe: {
        icon: <CreditCardIcon size={20} className="text-purple-600" />,
        label: "Stripe",
        color: "text-purple-600",
      },
      other: {
        icon: <Wallet size={20} className="text-gray-600" />,
        label: t("other", "payments") || "Other",
        color: "text-gray-600",
      },
    };

    return (
      configs[method] || {
        icon: <CreditCardIcon size={20} className="text-gray-600" />,
        label: method,
        color: "text-gray-600",
      }
    );
  };
  const getEntityTypeText = (type) => {
    const types = {
      customer_invoice: t("customerInvoice", "payments") || "Customer Invoice",
      supplier_invoice: t("supplierInvoice", "payments") || "Supplier Invoice",
      order: t("order", "payments") || "Order",
      supplier_order: t("supplierOrder", "payments") || "Supplier Order",
      customer: t("customer", "payments") || "Customer",
      supplier: t("supplier", "payments") || "Supplier",
    };

    return types[type] || type;
  };

  const getEntityIcon = (type) => {
    const icons = {
      customer_invoice: <FileText size={16} className="text-blue-600" />,
      supplier_invoice: <FileText size={16} className="text-purple-600" />,
      order: <Package size={16} className="text-green-600" />,
      supplier_order: <Package size={16} className="text-orange-600" />,
      customer: <User size={16} className="text-blue-600" />,
      supplier: <Truck size={16} className="text-purple-600" />,
    };

    return icons[type] || <FileText size={16} className="text-gray-600" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyTransactionId = () => {
    if (payment?.transaction_id) {
      navigator.clipboard.writeText(payment.transaction_id);
      alert(
        t("transactionIdCopied", "payments") ||
          "Transaction ID copied to clipboard!",
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/payments")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("paymentDetails", "payments") || "Payment Details"}
          </h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {t("loadingPaymentDetails", "payments") ||
                "Loading payment details..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/payments")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("paymentDetails", "payments") || "Payment Details"}
          </h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoadingPayment", "payments") ||
                  "Error Loading Payment"}
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/payments")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              {t("backToPayments", "payments") || "Back to Payments"}
            </button>
            <button
              onClick={fetchPaymentDetails}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
            >
              <RefreshCw size={18} />
              <span>{t("tryAgain", "common") || "Try Again"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/payments")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("paymentDetails", "payments") || "Payment Details"}
          </h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="text-yellow-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-yellow-800">
                {t("paymentNotFound", "payments") || "Payment Not Found"}
              </h3>
              <p className="text-yellow-700">
                {t("paymentNotFoundDescription", "payments") ||
                  "The payment you're looking for doesn't exist or has been deleted."}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/payments")}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            {t("backToPayments", "payments") || "Back to Payments"}
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(payment.status);
  const paymentTypeConfig = getPaymentTypeConfig(payment.payment_type);
  const paymentMethodConfig = getPaymentMethodConfig(payment.payment_method);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/payments")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("paymentDetails", "payments") || "Payment Details"}
            </h1>
            <p className="text-gray-600">
              {t("paymentId", "payments")}: #{payment.id} •{" "}
              {formatDate(payment.payment_date)}
            </p>
          </div>
        </div>

        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => navigate(`/payments/edit/${payment.id}`)}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Edit size={18} />
            <span>{t("edit", "common") || "Edit"}</span>
          </button>
        </div>
      </div>

      {/* Payment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Amount Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("paymentAmount", "payments") || "Payment Amount"}
            </h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="text-blue-500" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-2">
            {payment.amount} {payment.currency}
          </p>
          <p className="text-sm text-gray-600">
            {paymentTypeConfig.description}
          </p>
        </div>

        {/* Payment Status Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("paymentStatus", "payments") || "Payment Status"}
            </h3>
            <div className="p-2 bg-purple-50 rounded-lg">
              {statusConfig.icon}
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${statusConfig.color}`}
            >
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.label}</span>
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {t("lastUpdated", "payments")}: {formatDateTime(payment.updated_at)}
          </p>
        </div>

        {/* Payment Method Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("paymentMethod", "payments") || "Payment Method"}
            </h3>
            <div className="p-2 bg-green-50 rounded-lg">
              {paymentMethodConfig.icon}
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`text-lg font-semibold ${paymentMethodConfig.color}`}
            >
              {paymentMethodConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {paymentTypeConfig.label} • {payment.currency}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Payment Information */}
        <div className="space-y-6">
          {/* Payment Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CreditCard className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("paymentDetails", "payments") || "Payment Details"}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("completePaymentInformation", "payments") ||
                    "Complete payment information"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Transaction ID */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Hash size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {t("transactionId", "payments")}:
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {payment.transaction_id}
                  </code>
                  <button
                    onClick={handleCopyTransactionId}
                    className="p-1 hover:bg-gray-100 rounded"
                    title={
                      t("copyToClipboard", "common") || "Copy to clipboard"
                    }
                  >
                    <Copy size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Payment Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {t("paymentDate", "payments")}:
                  </span>
                </div>
                <span className="text-sm text-gray-800">
                  {formatDate(payment.payment_date)}
                </span>
              </div>

              {/* Payment Type */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {paymentTypeConfig.icon}
                  <span className="text-sm font-medium text-gray-700">
                    {t("paymentType", "payments")}:
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${paymentTypeConfig.color}`}
                >
                  {paymentTypeConfig.label}
                </span>
              </div>

              {/* Created At */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {t("createdAt", "payments")}:
                  </span>
                </div>
                <span className="text-sm text-gray-800">
                  {formatDateTime(payment.created_at)}
                </span>
              </div>

              {/* Updated At */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {t("updatedAt", "payments")}:
                  </span>
                </div>
                <span className="text-sm text-gray-800">
                  {formatDateTime(payment.updated_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {payment.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <FileText className="text-yellow-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("notes", "payments")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("additionalInformation", "payments") ||
                      "Additional information"}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {payment.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Related Entities */}
        <div className="space-y-6">
          {/* Invoice Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  {getEntityIcon(payment.invoice_type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {getEntityTypeText(payment.invoice_type)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("linkedInvoice", "payments") || "Linked invoice details"}
                  </p>
                </div>
              </div>
              {invoiceDetails && (
                <Link
                  to={
                    payment.invoice_type === "customer_invoice"
                      ? `/invoices/${payment.invoice_id}`
                      : `/supplier-invoices/${payment.invoice_id}`
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title={t("viewDetails", "common") || "View details"}
                >
                  <ExternalLink size={18} className="text-gray-500" />
                </Link>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {t("invoiceId", "payments")}:
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  #{payment.invoice_id}
                </span>
              </div>

              {invoiceDetails ? (
                <>
                  {invoiceDetails.invoice_number && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {t("invoiceNumber", "payments")}:
                      </span>
                      <span className="text-sm text-gray-800">
                        {invoiceDetails.invoice_number}
                      </span>
                    </div>
                  )}

                  {invoiceDetails.total_amount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {t("invoiceAmount", "payments")}:
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {invoiceDetails.total_amount}{" "}
                        {invoiceDetails.currency || payment.currency}
                      </span>
                    </div>
                  )}

                  {invoiceDetails.status && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {t("invoiceStatus", "payments")}:
                      </span>
                      <span className="text-sm text-gray-800 capitalize">
                        {invoiceDetails.status}
                      </span>
                    </div>
                  )}
                </>
              ) : loadingRelated ? (
                <div className="flex justify-center py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500">
                    {t("noInvoiceDetails", "payments") ||
                      "No invoice details available"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payer Details Card */}
          {payment.payer_id && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {getEntityIcon(payment.payer_type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {getEntityTypeText(payment.payer_type)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("payerInformation", "payments") || "Payer information"}
                    </p>
                  </div>
                </div>
                {payerDetails && (
                  <Link
                    to={
                      payment.payer_type === "customer"
                        ? `/customers/${payment.payer_id}`
                        : `/suppliers/${payment.payer_id}`
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title={t("viewDetails", "common") || "View details"}
                  >
                    <ExternalLink size={18} className="text-gray-500" />
                  </Link>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {t("payerId", "payments")}:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    #{payment.payer_id}
                  </span>
                </div>

                {payerDetails ? (
                  <>
                    {payerDetails.name && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {t("name", "common")}:
                        </span>
                        <span className="text-sm text-gray-800">
                          {payerDetails.name}
                        </span>
                      </div>
                    )}

                    {payerDetails.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {t("email", "common")}:
                        </span>
                        <span className="text-sm text-gray-800">
                          {payerDetails.email}
                        </span>
                      </div>
                    )}

                    {payerDetails.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {t("phone", "common")}:
                        </span>
                        <span className="text-sm text-gray-800">
                          {payerDetails.phone}
                        </span>
                      </div>
                    )}
                  </>
                ) : loadingRelated ? (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500">
                      {t("noPayerDetails", "payments") ||
                        "No payer details available"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payable Details Card */}
          {payment.payable_id && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    {getEntityIcon(payment.payable_type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {getEntityTypeText(payment.payable_type)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("payableInformation", "payments") ||
                        "Payable information"}
                    </p>
                  </div>
                </div>
                {payableDetails && (
                  <Link
                    to={
                      payment.payable_type === "order"
                        ? `/orders/${payment.payable_id}`
                        : `/supplier-orders/${payment.payable_id}`
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title={t("viewDetails", "common") || "View details"}
                  >
                    <ExternalLink size={18} className="text-gray-500" />
                  </Link>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {t("payableId", "payments")}:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    #{payment.payable_id}
                  </span>
                </div>

                {payableDetails ? (
                  <>
                    {payableDetails.order_number && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {t("orderNumber", "payments")}:
                        </span>
                        <span className="text-sm text-gray-800">
                          {payableDetails.order_number}
                        </span>
                      </div>
                    )}

                    {payableDetails.total_amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {t("orderAmount", "payments")}:
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                          {payableDetails.total_amount}{" "}
                          {payableDetails.currency || payment.currency}
                        </span>
                      </div>
                    )}

                    {payableDetails.status && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {t("orderStatus", "payments")}:
                        </span>
                        <span className="text-sm text-gray-800 capitalize">
                          {payableDetails.status}
                        </span>
                      </div>
                    )}
                  </>
                ) : loadingRelated ? (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500">
                      {t("noPayableDetails", "payments") ||
                        "No payable details available"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p>
            {t("paymentRecordId", "payments") || "Payment Record ID"}:{" "}
            <span className="font-mono font-medium">#{payment.id}</span>
          </p>
          <p className="mt-1">
            {t("lastActivity", "payments") || "Last activity"}:{" "}
            {formatDateTime(payment.updated_at)}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => navigate("/payments")}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            {t("backToPayments", "payments") || "Back to Payments"}
          </button>
          <button
            onClick={() => navigate(`/payments/edit/${payment.id}`)}
            className="px-6 py-3 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Edit size={18} />
            <span>{t("editPayment", "payments") || "Edit Payment"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
