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
    status: "pending",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "credit_card",
    currency: "USD",
    transaction_id: "",
    amount: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [invoiceExists, setInvoiceExists] = useState(null);
  const [isCheckingInvoice, setIsCheckingInvoice] = useState(false);

  // ✅ التحقق من وجود الفاتورة
  const checkInvoiceExists = async (invoiceId, invoiceType) => {
    if (!invoiceId) {
      setInvoiceExists(null);
      return;
    }

    try {
      setIsCheckingInvoice(true);
      const id = parseInt(invoiceId);
      if (isNaN(id) || id <= 0) {
        setInvoiceExists({
          exists: false,
          message:
            t("invalidInvoiceId", "payments") ||
            "Invoice ID must be a positive number",
        });
        setIsCheckingInvoice(false);
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
        setIsCheckingInvoice(false);
        return;
      }

      const response = await api.get(endpoint);
      const invoiceData = response.data?.invoice || response.data?.data;

      if (invoiceData) {
        setInvoiceExists({
          exists: true,
          message: t("invoiceFound", "payments"),
        });
      } else {
        setInvoiceExists({
          exists: false,
          message: t("invoiceNotFound", "payments"),
        });
      }
    } catch (err) {
      console.error("Error checking invoice:", err);
      setInvoiceExists({
        exists: false,
        message: t("invoiceNotFound", "payments"),
      });
    } finally {
      setIsCheckingInvoice(false);
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

    if (!paymentData.invoice_type) {
      errors.invoice_type =
        t("invoiceTypeRequired", "payments") || "Invoice type is required";
    }

    // التحقق من أن الأرقام هي أرقام صحيحة موجبة
    const numericFields = ["invoice_id"];
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

    // التحقق من وجود الفاتورة (إذا تم إدخال ID)
    if (paymentData.invoice_id) {
      if (!paymentData.invoice_type) {
        errors.invoice_type =
          t("invoiceTypeRequired", "payments") ||
          "Invoice type is required when providing invoice ID";
      } else if (invoiceExists && !invoiceExists.exists) {
        errors.invoice_id = invoiceExists.message;
      } else if (!invoiceExists && paymentData.invoice_id) {
        errors.invoice_id =
          t("pleaseCheckInvoiceId", "payments") ||
          "Please check if invoice ID exists";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ معالجة تغيير الحقول
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // التحقق من أن الحقول الرقمية تحتوي على أرقام فقط
    const numericFields = ["invoice_id", "amount"];
    if (numericFields.includes(name) && value !== "") {
      // السماح فقط بالأرقام
      const numericValue = value.replace(/[^0-9]/g, "");
      setPaymentData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setPaymentData((prev) => ({ ...prev, [name]: value }));
    }

    // حذف رسالة الخطأ لهذا الحقل عند التغيير
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // عند تغيير نوع الفاتورة، نتحقق من وجود الفاتورة إذا كان هناك ID
    if (name === "invoice_type" && paymentData.invoice_id) {
      setTimeout(() => checkInvoiceExists(paymentData.invoice_id, value), 500);
    }
  };

  // ✅ عند تغيير قيمة Invoice ID، نتحقق من وجودها
  const handleInvoiceIdBlur = () => {
    const { invoice_id, invoice_type } = paymentData;
    if (invoice_id && invoice_type) {
      checkInvoiceExists(invoice_id, invoice_type);
    }
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
        status: paymentData.status,
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        currency: paymentData.currency,
        transaction_id: paymentData.transaction_id || `TRX-${Date.now()}`,
        amount: parseFloat(paymentData.amount),
        notes: paymentData.notes || "",
      };

      console.log("Submitting payment data:", submitData);

      const response = await api.post("/createpayment", submitData);
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
      status: "pending",
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "credit_card",
      currency: "USD",
      transaction_id: "",
      amount: "",
      notes: "",
    });
    setValidationErrors({});
    setError(null);
    setInvoiceExists(null);
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

  // ✅ الحصول على نص طريقة الدفع
  const getPaymentMethodText = (method) => {
    const methods = {
      paypal: "PayPal",
      credit_card: "Credit Card",
      bank_transfer: "Bank Transfer",
      cash: "Cash",
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

            {/* معلومات الحالة */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <CheckCircle className="text-purple-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("status", "payments")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("setPaymentStatus", "payments") || "Set payment status"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
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
                    {t("linkPaymentToInvoice", "payments") ||
                      "Link payment to invoice (Required fields)"}
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
                    {t("invoiceId", "payments")} *
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
                      onBlur={handleInvoiceIdBlur}
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.invoice_id
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder={
                        t("enterInvoiceId", "payments") || "Enter invoice ID"
                      }
                      required
                    />
                    {isCheckingInvoice && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
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
                {t("invoiceIdCheck", "payments") || "Invoice ID Check"}:
              </span>{" "}
              {t("invoiceIdCheckDescription", "payments") ||
                "System will verify if the invoice exists before submitting"}
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
