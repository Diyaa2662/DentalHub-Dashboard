/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
import {
  ArrowLeft,
  Save,
  Plus,
  Calendar,
  DollarSign,
  CreditCard,
  Users,
  Building,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Hash,
  ArrowDown,
  ArrowUp,
  ShoppingCart,
  AlertTriangle,
  Info,
} from "lucide-react";

const AddPayment = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // ✅ حالة نموذج الدفعة
  const [paymentData, setPaymentData] = useState({
    invoice_type: "customer_invoice",
    invoice_id: "",
    payable_type: "order",
    payable_id: "",
    payer_type: "customer",
    payer_id: "",
    status: "pending",
    payment_date: new Date().toISOString().split("T")[0],
    payment_type: "incoming",
    payment_method: "credit_card",
    currency: "USD",
    transaction_id: "",
    amount: "",
    notes: "",
  });

  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [invoiceExists, setInvoiceExists] = useState(null);
  const [payableExists, setPayableExists] = useState(null);
  const [payerExists, setPayerExists] = useState(null);

  useEffect(() => {
    fetchCustomers();
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ جلب قائمة العملاء
  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      const customersData = response.data?.data || [];

      const formattedCustomers = customersData.map((customer) => ({
        id: customer.id,
        name: customer.name || `${t("customer", "payments")} #${customer.id}`,
        email: customer.email || "",
        phone: customer.phone || "",
      }));

      setCustomers(formattedCustomers);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  // ✅ جلب قائمة الموردين
  const fetchSuppliers = async () => {
    try {
      const response = await api.get("/suppliers");
      const suppliersData = response.data?.data || [];

      const formattedSuppliers = suppliersData.map((supplier) => ({
        id: supplier.id,
        name: supplier.name || `${t("supplier", "payments")} #${supplier.id}`,
        email: supplier.email || "",
        phone: supplier.phone || "",
      }));

      setSuppliers(formattedSuppliers);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  // ✅ التحقق من وجود الفاتورة
  const checkInvoiceExists = async (invoiceId, invoiceType) => {
    if (!invoiceId) {
      setInvoiceExists(null);
      return;
    }

    try {
      const id = parseInt(invoiceId);
      if (isNaN(id) || id <= 0) {
        setInvoiceExists({
          exists: false,
          message:
            t("invalidInvoiceId", "payments") ||
            "Invoice ID must be a positive number",
        });
        return;
      }

      // بناء على نوع الفاتورة، نستخدم endpoint مختلف
      let endpoint = "";
      if (invoiceType === "customer_invoice") {
        endpoint = `/invoices/${invoiceId}`;
      } else if (invoiceType === "supplier_invoice") {
        endpoint = `/supplierinvoices/${invoiceId}`;
      }

      if (!endpoint) {
        setInvoiceExists({
          exists: false,
          message:
            t("selectInvoiceTypeFirst", "payments") ||
            "Please select invoice type first",
        });
        return;
      }

      const response = await api.get(endpoint);
      const invoiceData = response.data?.invoice || response.data?.data;

      if (invoiceData) {
        setInvoiceExists({
          exists: true,
          message:
            t("invoiceFound", "payments", {
              number: invoiceData.invoice_number || `#${invoiceId}`,
            }) ||
            `Invoice found: ${invoiceData.invoice_number || `#${invoiceId}`}`,
          invoice: invoiceData,
        });
      } else {
        setInvoiceExists({
          exists: false,
          message:
            t("invoiceNotFound", "payments", { id: invoiceId }) ||
            `Invoice #${invoiceId} not found`,
        });
      }
    } catch (err) {
      console.error("Error checking invoice:", err);
      setInvoiceExists({
        exists: false,
        message:
          t("invoiceNotFound", "payments", { id: invoiceId }) ||
          `Invoice #${invoiceId} not found`,
      });
    }
  };

  // ✅ التحقق من وجود القابل للدفع (order/supplier_order)
  const checkPayableExists = async (payableId, payableType) => {
    if (!payableId) {
      setPayableExists(null);
      return;
    }

    try {
      const id = parseInt(payableId);
      if (isNaN(id) || id <= 0) {
        setPayableExists({
          exists: false,
          message:
            t("invalidPayableId", "payments") ||
            "Payable ID must be a positive number",
        });
        return;
      }

      // بناء على النوع، نستخدم endpoint مختلف
      let endpoint = "";
      if (payableType === "order") {
        endpoint = `/customerorders/${payableId}`;
      } else if (payableType === "supplier_order") {
        endpoint = `/supplierorders/${payableId}`;
      }

      if (!endpoint) {
        setPayableExists({
          exists: false,
          message:
            t("selectPayableTypeFirst", "payments") ||
            "Please select payable type first",
        });
        return;
      }

      const response = await api.get(endpoint);
      const payableData = response.data?.order || response.data?.data;

      if (payableData) {
        setPayableExists({
          exists: true,
          message:
            t(
              payableType === "order" ? "orderFound" : "supplierOrderFound",
              "payments",
              {
                number: payableData.order_number || `#${payableId}`,
              },
            ) ||
            `${payableType === "order" ? "Order" : "Supplier Order"} found: ${payableData.order_number || `#${payableId}`}`,
          payable: payableData,
        });
      } else {
        setPayableExists({
          exists: false,
          message:
            t(
              payableType === "order"
                ? "orderNotFound"
                : "supplierOrderNotFound",
              "payments",
              { id: payableId },
            ) ||
            `${payableType === "order" ? "Order" : "Supplier Order"} #${payableId} not found`,
        });
      }
    } catch (err) {
      console.error("Error checking payable:", err);
      setPayableExists({
        exists: false,
        message:
          t(
            payableType === "order" ? "orderNotFound" : "supplierOrderNotFound",
            "payments",
            { id: payableId },
          ) ||
          `${payableType === "order" ? "Order" : "Supplier Order"} #${payableId} not found`,
      });
    }
  };

  // ✅ التحقق من وجود الدافع (customer/supplier)
  const checkPayerExists = async (payerId, payerType) => {
    if (!payerId) {
      setPayerExists(null);
      return;
    }

    try {
      const id = parseInt(payerId);
      if (isNaN(id) || id <= 0) {
        setPayerExists({
          exists: false,
          message:
            t("invalidPayerId", "payments") ||
            "Payer ID must be a positive number",
        });
        return;
      }

      // بناء على النوع، نستخدم endpoint مختلف
      let endpoint = "";
      if (payerType === "customer") {
        endpoint = `/users/${payerId}`;
      } else if (payerType === "supplier") {
        endpoint = `/suppliers/${payerId}`;
      }

      if (!endpoint) {
        setPayerExists({
          exists: false,
          message:
            t("selectPayerTypeFirst", "payments") ||
            "Please select payer type first",
        });
        return;
      }

      const response = await api.get(endpoint);
      console.log("Payer response:", response);
      const payerData =
        response.data?.customer ||
        response.data?.supplier ||
        response.data?.data;

      if (payerData) {
        setPayerExists({
          exists: true,
          message:
            t(
              payerType === "customer" ? "customerFound" : "supplierFound",
              "payments",
              {
                name: payerData.name || `#${payerId}`,
              },
            ) ||
            `${payerType === "customer" ? "Customer" : "Supplier"} found: ${payerData.name || `#${payerId}`}`,
          payer: payerData,
        });
      } else {
        setPayerExists({
          exists: false,
          message:
            t(
              payerType === "customer"
                ? "customerNotFound"
                : "supplierNotFound",
              "payments",
              { id: payerId },
            ) ||
            `${payerType === "customer" ? "Customer" : "Supplier"} #${payerId} not found`,
        });
      }
    } catch (err) {
      console.error("Error checking payer:", err);
      setPayerExists({
        exists: false,
        message:
          t(
            payerType === "customer" ? "customerNotFound" : "supplierNotFound",
            "payments",
            { id: payerId },
          ) ||
          `${payerType === "customer" ? "Customer" : "Supplier"} #${payerId} not found`,
      });
    }
  };

  // ✅ التحقق من صحة البيانات
  const validateForm = () => {
    const errors = {};

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      errors.amount =
        t("validAmountRequired", "payments") || "Valid amount is required";
    }

    if (!paymentData.payment_date) {
      errors.payment_date =
        t("paymentDateRequired", "payments") || "Payment date is required";
    }

    if (!paymentData.currency) {
      errors.currency =
        t("currencyRequired", "payments") || "Currency is required";
    }

    if (!paymentData.payment_method) {
      errors.payment_method =
        t("paymentMethodRequired", "payments") || "Payment method is required";
    }

    if (!paymentData.status) {
      errors.status = t("statusRequired", "payments") || "Status is required";
    }

    if (!paymentData.payment_type) {
      errors.payment_type =
        t("paymentTypeRequired", "payments") || "Payment type is required";
    }

    if (!paymentData.payer_type) {
      errors.payer_type =
        t("payerTypeRequired", "payments") || "Payer type is required";
    }

    if (!paymentData.invoice_type) {
      errors.invoice_type =
        t("invoiceTypeRequired", "payments") || "Invoice type is required";
    }

    if (!paymentData.payable_type) {
      errors.payable_type =
        t("payableTypeRequired", "payments") || "Payable type is required";
    }

    // التحقق من أن الأرقام هي أرقام صحيحة موجبة
    const numericFields = ["invoice_id", "payable_id", "payer_id"];
    numericFields.forEach((field) => {
      if (paymentData[field]) {
        const value = parseInt(paymentData[field]);
        if (isNaN(value) || value <= 0) {
          errors[field] =
            t("positiveNumberRequired", "payments") ||
            "Must be a positive number";
        }
      }
    });

    // التحقق من وجود الفاتورة
    if (paymentData.invoice_id && invoiceExists && !invoiceExists.exists) {
      errors.invoice_id = invoiceExists.message;
    }

    // التحقق من وجود القابل للدفع
    if (paymentData.payable_id && payableExists && !payableExists.exists) {
      errors.payable_id = payableExists.message;
    }

    // التحقق من وجود الدافع
    if (paymentData.payer_id && payerExists && !payerExists.exists) {
      errors.payer_id = payerExists.message;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ معالجة تغيير الحقول
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // التحقق من أن الحقول الرقمية تحتوي على أرقام فقط
    const numericFields = ["invoice_id", "payable_id", "payer_id", "amount"];
    if (numericFields.includes(name) && value !== "") {
      // السماح فقط بالأرقام والنقطة
      const numericValue = value.replace(/[^0-9.]/g, "");
      setPaymentData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setPaymentData((prev) => ({ ...prev, [name]: value }));
    }

    // حذف رسالة الخطأ لهذا الحقل عند التغيير
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // عند تغيير نوع الفاتورة، نتحقق من وجود الفاتورة
    if (name === "invoice_type" && paymentData.invoice_id) {
      setTimeout(() => checkInvoiceExists(paymentData.invoice_id, value), 500);
    }

    // عند تغيير نوع القابل للدفع، نتحقق من وجوده
    if (name === "payable_type" && paymentData.payable_id) {
      setTimeout(() => checkPayableExists(paymentData.payable_id, value), 500);
    }

    // عند تغيير نوع الدافع، نتحقق من وجوده
    if (name === "payer_type" && paymentData.payer_id) {
      setTimeout(() => checkPayerExists(paymentData.payer_id, value), 500);
    }
  };

  // ✅ عند تغيير قيمة ID، نتحقق من وجود الكيان
  const handleIdBlur = (fieldName, id, type) => {
    if (!id) return;

    switch (fieldName) {
      case "invoice_id":
        checkInvoiceExists(id, paymentData.invoice_type);
        break;
      case "payable_id":
        checkPayableExists(id, paymentData.payable_type);
        break;
      case "payer_id":
        checkPayerExists(id, paymentData.payer_type);
        break;
      default:
        break;
    }
  };

  // ✅ توليد رقم معاملة تلقائياً
  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const transactionId = `TRX-${timestamp}-${random}`;
    setPaymentData((prev) => ({ ...prev, transaction_id: transactionId }));
  };

  // ✅ إرسال الدفعة
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // تحضير البيانات للإرسال
      const submitData = {
        invoice_type: paymentData.invoice_type,
        invoice_id: paymentData.invoice_id
          ? parseInt(paymentData.invoice_id)
          : null,
        payable_type: paymentData.payable_type,
        payable_id: paymentData.payable_id
          ? parseInt(paymentData.payable_id)
          : null,
        payer_type: paymentData.payer_type,
        payer_id: paymentData.payer_id ? parseInt(paymentData.payer_id) : null,
        status: paymentData.status,
        payment_date: paymentData.payment_date,
        payment_type: paymentData.payment_type,
        payment_method: paymentData.payment_method,
        currency: paymentData.currency,
        transaction_id: paymentData.transaction_id || `TRX-${Date.now()}`,
        amount: parseFloat(paymentData.amount),
        notes: paymentData.notes || "",
      };

      console.log("Submitting payment data:", submitData);

      const response = await api.post("/payments", submitData);
      console.log("Payment created response:", response.data);

      setSuccess(true);

      // إعادة التوجيه بعد ثانيتين
      setTimeout(() => {
        navigate("/payments");
      }, 2000);
    } catch (err) {
      console.error("Error creating payment:", err);
      setError(
        err.response?.data?.message ||
          t("createPaymentError", "payments") ||
          "Failed to create payment. Please check your data and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ إعادة التعيين
  const handleReset = () => {
    setPaymentData({
      invoice_type: "customer_invoice",
      invoice_id: "",
      payable_type: "order",
      payable_id: "",
      payer_type: "customer",
      payer_id: "",
      status: "pending",
      payment_date: new Date().toISOString().split("T")[0],
      payment_type: "incoming",
      payment_method: "credit_card",
      currency: "USD",
      transaction_id: "",
      amount: "",
      notes: "",
    });
    setValidationErrors({});
    setError(null);
    setInvoiceExists(null);
    setPayableExists(null);
    setPayerExists(null);
  };

  // ✅ الحصول على أيقونة الحالة
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-green-600" />;
      case "pending":
        return <Clock size={16} className="text-yellow-600" />;
      case "failed":
        return <XCircle size={16} className="text-red-600" />;
      case "refunded":
        return <RefreshCw size={16} className="text-blue-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  // ✅ الحصول على نص الحالة
  const getStatusText = (status) => {
    return t(status, "payments") || status;
  };

  // ✅ الحصول على أيقونة نوع الدفع
  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case "incoming":
        return <ArrowDown size={16} className="text-green-600" />;
      case "outgoing":
        return <ArrowUp size={16} className="text-red-600" />;
      default:
        return <CreditCard size={16} className="text-gray-600" />;
    }
  };

  // ✅ الحصول على نص نوع الدفع
  const getPaymentTypeText = (type) => {
    return t(type, "payments") || type;
  };

  // ✅ الحصول على أيقونة نوع الدافع
  const getPayerTypeIcon = (type) => {
    switch (type) {
      case "customer":
        return <Users size={16} className="text-blue-600" />;
      case "supplier":
        return <Building size={16} className="text-purple-600" />;
      default:
        return <Users size={16} className="text-gray-600" />;
    }
  };

  // ✅ الحصول على نص نوع الدافع
  const getPayerTypeText = (type) => {
    return t(type, "payments") || type;
  };

  // ✅ الحصول على أيقونة نوع الفاتورة
  const getInvoiceTypeIcon = (type) => {
    switch (type) {
      case "customer_invoice":
        return <FileText size={16} className="text-blue-600" />;
      case "supplier_invoice":
        return <FileText size={16} className="text-purple-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  // ✅ الحصول على نص نوع الفاتورة
  const getInvoiceTypeText = (type) => {
    return (
      t(
        type === "customer_invoice" ? "customerInvoice" : "supplierInvoice",
        "payments",
      ) || type
    );
  };

  // ✅ الحصول على أيقونة نوع القابل للدفع
  const getPayableTypeIcon = (type) => {
    switch (type) {
      case "order":
        return <ShoppingCart size={16} className="text-blue-600" />;
      case "supplier_order":
        return <ShoppingCart size={16} className="text-purple-600" />;
      default:
        return <ShoppingCart size={16} className="text-gray-600" />;
    }
  };

  // ✅ الحصول على نص نوع القابل للدفع
  const getPayableTypeText = (type) => {
    return t(type === "order" ? "order" : "supplierOrder", "payments") || type;
  };

  // ✅ الحصول على نص طريقة الدفع
  const getPaymentMethodText = (method) => {
    const methods = {
      paypal: "PayPal",
      credit_card: "Credit Card",
      bank_transfer: "Bank Transfer",
      cash: "Cash",
      stripe: "Stripe",
      other: "Other",
    };
    return methods[method] || method || "Unknown";
  };

  // ✅ حالة التحميل
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
            {t("addPayment", "payments") || "Add Payment"}
          </h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {t("loading", "common") || "Loading..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/payments")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("addPayment", "payments") || "Add Payment"}
            </h1>
            <p className="text-gray-600">
              {t("addPaymentDescription", "payments") ||
                "Add a new payment record to the system"}
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <span>{t("reset", "common") || "Reset"}</span>
          </button>
        </div>
      </div>

      {/* رسالة النجاح */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-green-800">
                {t("paymentCreatedSuccess", "payments") ||
                  "Payment Created Successfully!"}
              </h3>
              <p className="text-green-700">
                {t("redirectingToPayments", "payments") ||
                  "Redirecting to payments list..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* رسالة الخطأ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("error", "common") || "Error"}
              </h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* النموذج */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* العمود الأيسر: معلومات الدفعة الأساسية */}
          <div className="space-y-6">
            {/* معلومات المدفوعات */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CreditCard className="text-dental-blue" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("paymentInformation", "payments") ||
                      "Payment Information"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("enterPaymentDetails", "payments") ||
                      "Enter payment details"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* المبلغ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("amount", "payments")} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="amount"
                      value={paymentData.amount}
                      onChange={handleInputChange}
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.amount
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {validationErrors.amount && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.amount}
                    </p>
                  )}
                </div>

                {/* العملة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("currency", "payments")} *
                  </label>
                  <select
                    name="currency"
                    value={paymentData.currency}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.currency
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                    <option value="SEK">Swedish Krona (SEK)</option>
                  </select>
                  {validationErrors.currency && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.currency}
                    </p>
                  )}
                </div>

                {/* طريقة الدفع */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("paymentMethod", "payments")} *
                  </label>
                  <select
                    name="payment_method"
                    value={paymentData.payment_method}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.payment_method
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="credit_card">
                      {t("creditCard", "payments") || "Credit Card"}
                    </option>
                    <option value="paypal">
                      {t("paypal", "payments") || "PayPal"}
                    </option>
                    <option value="bank_transfer">
                      {t("bankTransfer", "payments") || "Bank Transfer"}
                    </option>
                    <option value="cash">
                      {t("cash", "payments") || "Cash"}
                    </option>
                    <option value="stripe">
                      {t("stripe", "payments") || "Stripe"}
                    </option>
                    <option value="other">
                      {t("other", "payments") || "Other"}
                    </option>
                  </select>
                  {validationErrors.payment_method && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.payment_method}
                    </p>
                  )}
                </div>

                {/* تاريخ الدفع */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("paymentDate", "payments")} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="payment_date"
                      value={paymentData.payment_date}
                      onChange={handleInputChange}
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.payment_date
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.payment_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.payment_date}
                    </p>
                  )}
                </div>

                {/* رقم المعاملة */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("transactionId", "payments")}
                    </label>
                    <button
                      type="button"
                      onClick={generateTransactionId}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <RefreshCw size={12} />
                      <span>{t("generate", "payments") || "Generate"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="transaction_id"
                      value={paymentData.transaction_id}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={
                        t("transactionIdPlaceholder", "payments") ||
                        "TRX-1234567890"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* معلومات الحالة والنوع */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <CheckCircle className="text-purple-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("statusAndType", "payments") || "Status & Type"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("setPaymentStatusAndType", "payments") ||
                      "Set payment status and type"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* الحالة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("status", "payments")} *
                  </label>
                  <select
                    name="status"
                    value={paymentData.status}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.status
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="pending">
                      {t("pending", "payments") || "Pending"}
                    </option>
                    <option value="completed">
                      {t("completed", "payments") || "Completed"}
                    </option>
                    <option value="failed">
                      {t("failed", "payments") || "Failed"}
                    </option>
                    <option value="refunded">
                      {t("refunded", "payments") || "Refunded"}
                    </option>
                  </select>
                  {validationErrors.status && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.status}
                    </p>
                  )}
                </div>

                {/* نوع الدفع */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("paymentType", "payments")} *
                  </label>
                  <select
                    name="payment_type"
                    value={paymentData.payment_type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.payment_type
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="incoming">
                      {t("incoming", "payments") || "Incoming"}
                    </option>
                    <option value="outgoing">
                      {t("outgoing", "payments") || "Outgoing"}
                    </option>
                  </select>
                  {validationErrors.payment_type && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.payment_type}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* العمود الأيمن: معلومات الكيانات المرتبطة */}
          <div className="space-y-6">
            {/* معلومات الكيانات */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FileText className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("relatedEntities", "payments") || "Related Entities"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("linkPaymentToEntities", "payments") ||
                      "Link payment to invoice, order, and payer"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* نوع الفاتورة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("invoiceType", "payments")} *
                  </label>
                  <select
                    name="invoice_type"
                    value={paymentData.invoice_type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.invoice_type
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="customer_invoice">
                      {t("customerInvoice", "payments") || "Customer Invoice"}
                    </option>
                    <option value="supplier_invoice">
                      {t("supplierInvoice", "payments") || "Supplier Invoice"}
                    </option>
                  </select>
                  {validationErrors.invoice_type && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.invoice_type}
                    </p>
                  )}
                </div>

                {/* ID الفاتورة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("invoiceId", "payments")} ({t("optional", "common")})
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="invoice_id"
                      value={paymentData.invoice_id}
                      onChange={handleInputChange}
                      onBlur={() =>
                        handleIdBlur(
                          "invoice_id",
                          paymentData.invoice_id,
                          paymentData.invoice_type,
                        )
                      }
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.invoice_id
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder={
                        t("enterInvoiceId", "payments") || "Enter invoice ID"
                      }
                    />
                  </div>
                  {validationErrors.invoice_id ? (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.invoice_id}
                    </p>
                  ) : (
                    invoiceExists && (
                      <p
                        className={`mt-1 text-sm ${invoiceExists.exists ? "text-green-600" : "text-red-600"}`}
                      >
                        {invoiceExists.message}
                      </p>
                    )
                  )}
                </div>

                {/* نوع القابل للدفع */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("payableType", "payments")} *
                  </label>
                  <select
                    name="payable_type"
                    value={paymentData.payable_type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.payable_type
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="order">
                      {t("order", "payments") || "Order"}
                    </option>
                    <option value="supplier_order">
                      {t("supplierOrder", "payments") || "Supplier Order"}
                    </option>
                  </select>
                  {validationErrors.payable_type && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.payable_type}
                    </p>
                  )}
                </div>

                {/* ID القابل للدفع */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("payableId", "payments")} ({t("optional", "common")})
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="payable_id"
                      value={paymentData.payable_id}
                      onChange={handleInputChange}
                      onBlur={() =>
                        handleIdBlur(
                          "payable_id",
                          paymentData.payable_id,
                          paymentData.payable_type,
                        )
                      }
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.payable_id
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder={
                        t("enterPayableId", "payments") || "Enter payable ID"
                      }
                    />
                  </div>
                  {validationErrors.payable_id ? (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.payable_id}
                    </p>
                  ) : (
                    payableExists && (
                      <p
                        className={`mt-1 text-sm ${payableExists.exists ? "text-green-600" : "text-red-600"}`}
                      >
                        {payableExists.message}
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* معلومات الدافع */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("payerInformation", "payments") || "Payer Information"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("selectOrEnterPayerDetails", "payments") ||
                      "Select or enter payer details"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* نوع الدافع */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("payerType", "payments")} *
                  </label>
                  <select
                    name="payer_type"
                    value={paymentData.payer_type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.payer_type
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="customer">
                      {t("customer", "payments") || "Customer"}
                    </option>
                    <option value="supplier">
                      {t("supplier", "payments") || "Supplier"}
                    </option>
                  </select>
                  {validationErrors.payer_type && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.payer_type}
                    </p>
                  )}
                </div>

                {/* اختيار الدافع من القائمة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("selectPayer", "payments")} ({t("optional", "common")})
                  </label>
                  <select
                    name="payer_id_select"
                    onChange={(e) => {
                      if (e.target.value) {
                        setPaymentData((prev) => ({
                          ...prev,
                          payer_id: e.target.value,
                        }));
                        setTimeout(
                          () =>
                            checkPayerExists(
                              e.target.value,
                              paymentData.payer_type,
                            ),
                          500,
                        );
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">
                      {t("selectFromList", "payments") || "Select from list"}
                    </option>
                    {paymentData.payer_type === "customer"
                      ? customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}{" "}
                            {customer.email ? `(${customer.email})` : ""}
                          </option>
                        ))
                      : suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}{" "}
                            {supplier.email ? `(${supplier.email})` : ""}
                          </option>
                        ))}
                  </select>
                </div>

                {/* أو إدخال ID الدافع يدوياً */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("orEnterPayerId", "payments")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="payer_id"
                      value={paymentData.payer_id}
                      onChange={handleInputChange}
                      onBlur={() =>
                        handleIdBlur(
                          "payer_id",
                          paymentData.payer_id,
                          paymentData.payer_type,
                        )
                      }
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.payer_id
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder={
                        t("enterPayerId", "payments") || "Enter payer ID"
                      }
                    />
                  </div>
                  {validationErrors.payer_id ? (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.payer_id}
                    </p>
                  ) : (
                    payerExists && (
                      <p
                        className={`mt-1 text-sm ${payerExists.exists ? "text-green-600" : "text-red-600"}`}
                      >
                        {payerExists.message}
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* الملاحظات */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <FileText className="text-yellow-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("notes", "payments")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("additionalPaymentInformation", "payments") ||
                      "Additional information about this payment"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("notes", "payments")} ({t("optional", "common")})
                </label>
                <textarea
                  name="notes"
                  value={paymentData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    t("enterNotesHere", "payments") ||
                    "Enter any special instructions or notes here..."
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <span className="font-medium">
                {t("note", "payments") || "Note"}:
              </span>{" "}
              {t("fieldsMarkedWithStar", "payments") ||
                "Fields marked with * are required"}
            </p>
            <p>
              <span className="font-medium">
                {t("optionalFields", "payments") || "Optional fields"}:
              </span>{" "}
              {t("optionalFieldsDescription", "payments") ||
                "Invoice ID, Payable ID, and Payer ID can be left empty if not applicable"}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate("/payments")}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              {t("cancel", "common") || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-3 rounded-lg font-medium transition flex items-center space-x-2 ${
                submitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-dental-blue hover:bg-blue-600 text-white"
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{t("saving", "payments") || "Saving..."}</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>
                    {t("createPayment", "payments") || "Create Payment"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPayment;
