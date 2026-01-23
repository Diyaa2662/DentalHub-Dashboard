import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import api from "../../../services/api";
import {
  ArrowLeft,
  Save,
  Plus,
  Calendar,
  DollarSign,
  Building,
  ShoppingCart,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Hash,
  Info,
  AlertTriangle,
} from "lucide-react";

const AddSupplierInvoice = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // ✅ حالة نموذج الفاتورة
  const [invoiceData, setInvoiceData] = useState({
    supplier_id: "",
    supplier_order_id: "",
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0], // تاريخ اليوم
    subtotal: "",
    tax_amount: "",
    total_amount: "",
    currency: "USD",
    due_date: "",
    payment_status: "unpaid",
    notes: "",
  });

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [orderExists, setOrderExists] = useState(null); // ✅ للتحقق من وجود الطلب

  useEffect(() => {
    fetchSuppliers();
    // حساب تاريخ الاستحقاق (30 يوم من تاريخ الفاتورة)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    setInvoiceData((prev) => ({
      ...prev,
      due_date: dueDate.toISOString().split("T")[0],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ جلب قائمة الموردين
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/suppliers");
      const suppliersData = response.data?.data || [];

      const formattedSuppliers = suppliersData.map((supplier) => ({
        id: supplier.id,
        name: supplier.name || `Supplier #${supplier.id}`,
        email: supplier.email || "",
        phone: supplier.phone || "",
      }));

      setSuppliers(formattedSuppliers);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError(
        t("failedToLoadSuppliers", "procurement") || "Failed to load suppliers",
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ التحقق من وجود طلب الشراء
  const checkOrderExists = async (orderId) => {
    if (!orderId || !invoiceData.supplier_id) {
      setOrderExists(null);
      return;
    }

    try {
      // تحقق من أن orderId رقم صحيح موجب
      const id = parseInt(orderId);
      if (isNaN(id) || id <= 0) {
        setOrderExists({
          exists: false,
          message:
            t("invalidOrderId", "procurement") ||
            "Order ID must be a positive number",
        });
        return;
      }

      // جلب تفاصيل الطلب
      const response = await api.get(`/supplierorders/${orderId}`);
      const orderData = response.data?.order;

      if (orderData) {
        // تحقق من أن الطلب يخص المورد المحدد
        if (orderData.supplier_id == invoiceData.supplier_id) {
          setOrderExists({
            exists: true,
            message:
              t("orderFoundForSupplier", "procurement") ||
              `Order found: ${orderData.supplier_order_number}`,
            order: orderData,
          });
        } else {
          setOrderExists({
            exists: false,
            message:
              t("orderNotForSupplier", "procurement") ||
              `Order #${orderId} does not belong to selected supplier`,
          });
        }
      } else {
        setOrderExists({
          exists: false,
          message:
            t("orderNotFound", "procurement") || `Order #${orderId} not found`,
        });
      }
    } catch (err) {
      console.error("Error checking order:", err);
      setOrderExists({
        exists: false,
        message:
          t("orderNotFound", "procurement") || `Order #${orderId} not found`,
      });
    }
  };

  // ✅ التحقق من صحة البيانات
  const validateForm = () => {
    const errors = {};

    if (!invoiceData.supplier_id) {
      errors.supplier_id =
        t("supplierRequired", "procurement") || "Supplier is required";
    }

    if (!invoiceData.supplier_order_id) {
      errors.supplier_order_id =
        t("orderIdRequired", "procurement") || "Order ID is required";
    } else {
      const orderId = parseInt(invoiceData.supplier_order_id);
      if (isNaN(orderId) || orderId <= 0) {
        errors.supplier_order_id =
          t("invalidOrderId", "procurement") ||
          "Order ID must be a positive number";
      } else if (orderExists && !orderExists.exists) {
        errors.supplier_order_id = orderExists.message;
      }
    }

    if (!invoiceData.invoice_number) {
      errors.invoice_number =
        t("invoiceNumberRequired", "procurement") ||
        "Invoice number is required";
    }

    if (!invoiceData.subtotal || parseFloat(invoiceData.subtotal) <= 0) {
      errors.subtotal =
        t("validSubtotalRequired", "procurement") ||
        "Valid subtotal is required";
    }

    if (!invoiceData.tax_amount || parseFloat(invoiceData.tax_amount) < 0) {
      errors.tax_amount =
        t("validTaxRequired", "procurement") || "Valid tax amount is required";
    }

    if (
      !invoiceData.total_amount ||
      parseFloat(invoiceData.total_amount) <= 0
    ) {
      errors.total_amount =
        t("validTotalRequired", "procurement") ||
        "Valid total amount is required";
    }

    if (!invoiceData.invoice_date) {
      errors.invoice_date =
        t("invoiceDateRequired", "procurement") || "Invoice date is required";
    }

    if (!invoiceData.due_date) {
      errors.due_date =
        t("dueDateRequired", "procurement") || "Due date is required";
    }

    // التحقق من أن إجمالي المبلغ = subtotal + tax
    const subtotal = parseFloat(invoiceData.subtotal) || 0;
    const tax = parseFloat(invoiceData.tax_amount) || 0;
    const total = parseFloat(invoiceData.total_amount) || 0;

    if (Math.abs(total - (subtotal + tax)) > 0.01) {
      errors.total_amount =
        t("totalMismatch", "procurement") ||
        "Total amount must equal Subtotal + Tax Amount";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ معالجة تغيير الحقول
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // التحقق من أن supplier_order_id رقم صحيح
    if (name === "supplier_order_id") {
      // السماح فقط بالأرقام
      const numericValue = value.replace(/[^0-9]/g, "");
      setInvoiceData((prev) => ({ ...prev, [name]: numericValue }));

      // التحقق من وجود الطلب بعد تغيير القيمة
      if (numericValue && invoiceData.supplier_id) {
        setTimeout(() => checkOrderExists(numericValue), 500);
      } else {
        setOrderExists(null);
      }
    } else if (name === "invoice_number") {
      // السماح لأرقام الفاتورة أن تحتوي على أحرف وأرقام
      setInvoiceData((prev) => ({ ...prev, [name]: value }));
    } else {
      setInvoiceData((prev) => ({ ...prev, [name]: value }));
    }

    // حذف رسالة الخطأ لهذا الحقل عند التغيير
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ عند تغيير المورد، نتحقق من وجود الطلب إذا كان هناك order_id
  useEffect(() => {
    if (invoiceData.supplier_order_id && invoiceData.supplier_id) {
      checkOrderExists(invoiceData.supplier_order_id);
    } else {
      setOrderExists(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceData.supplier_id]);

  // ✅ حساب الإجمالي تلقائياً
  const calculateTotal = () => {
    const subtotal = parseFloat(invoiceData.subtotal) || 0;
    const tax = parseFloat(invoiceData.tax_amount) || 0;
    const total = subtotal + tax;

    setInvoiceData((prev) => ({
      ...prev,
      total_amount: total.toFixed(2),
    }));
  };

  // ✅ إرسال الفاتورة
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
        supplier_id: invoiceData.supplier_id,
        supplier_order_id: invoiceData.supplier_order_id, // الآن إجباري
        invoice_number: invoiceData.invoice_number, // الآن إجباري
        invoice_date: invoiceData.invoice_date,
        subtotal: parseFloat(invoiceData.subtotal),
        tax_amount: parseFloat(invoiceData.tax_amount),
        total_amount: parseFloat(invoiceData.total_amount),
        currency: invoiceData.currency,
        due_date: invoiceData.due_date,
        payment_status: invoiceData.payment_status,
        notes: invoiceData.notes || "",
      };

      console.log("Submitting invoice data:", submitData);

      const response = await api.post(
        "/enforcecreatesupplierinvoice",
        submitData,
      );
      console.log("Invoice created response:", response.data);

      setSuccess(true);

      // إعادة التوجيه بعد ثانيتين
      setTimeout(() => {
        navigate("/procurement/supplier-invoices");
      }, 2000);
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError(
        err.response?.data?.message ||
          t("createInvoiceError", "procurement") ||
          "Failed to create invoice. Please check your data and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ إعادة التعيين
  const handleReset = () => {
    setInvoiceData({
      supplier_id: "",
      supplier_order_id: "",
      invoice_number: "",
      invoice_date: new Date().toISOString().split("T")[0],
      subtotal: "",
      tax_amount: "",
      total_amount: "",
      currency: "USD",
      due_date: new Date(new Date().setDate(new Date().getDate() + 30))
        .toISOString()
        .split("T")[0],
      payment_status: "unpaid",
      notes: "",
    });
    setValidationErrors({});
    setError(null);
    setOrderExists(null);
  };

  // ✅ الحصول على أيقونة حالة الدفع
  // eslint-disable-next-line no-unused-vars
  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={16} className="text-green-600" />;
      case "unpaid":
        return <Clock size={16} className="text-yellow-600" />;
      case "overdue":
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  // ✅ الحصول على نص حالة الدفع
  const getPaymentStatusText = (status) => {
    switch (status) {
      case "paid":
        return t("paid", "procurement") || "Paid";
      case "unpaid":
        return t("unpaid", "procurement") || "Unpaid";
      case "overdue":
        return t("overdue", "procurement") || "Overdue";
      default:
        return status;
    }
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/procurement/supplier-invoices")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("addSupplierInvoice", "procurement") || "Add Supplier Invoice"}
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
            onClick={() => navigate("/procurement/supplier-invoices")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("addSupplierInvoice", "procurement") || "Add Supplier Invoice"}
            </h1>
            <p className="text-gray-600">
              {t("addInvoiceManuallyDescription", "procurement") ||
                "Add a supplier invoice manually. All fields marked with * are required."}
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
                {t("invoiceCreatedSuccess", "procurement") ||
                  "Invoice Created Successfully!"}
              </h3>
              <p className="text-green-700">
                {t("redirectingToInvoices", "procurement") ||
                  "Redirecting to invoices list..."}
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

      {/* تحذير حول طريقة الإضافة */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle
            className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0"
            size={20}
          />
          <div>
            <h3 className="font-bold text-yellow-800">
              {t("manualInvoiceWarningTitle", "procurement") ||
                "Important Notice"}
            </h3>
            <p className="text-yellow-700">
              {t("manualInvoiceWarning", "procurement") ||
                "This is NOT the standard way to create supplier invoices. The correct method is to generate invoices directly from confirmed purchase orders in the purchase order details page."}
            </p>
            <p className="text-yellow-700 mt-1">
              {t("manualInvoiceUsage", "procurement") ||
                "Use this form only for adding old invoices that were created outside the system."}
            </p>
          </div>
        </div>
      </div>

      {/* النموذج */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* العمود الأيسر: معلومات المورد والفاتورة */}
          <div className="space-y-6">
            {/* معلومات المورد */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Building className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("supplierInformation", "procurement") ||
                      "Supplier Information"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("selectInvoiceSupplier", "procurement") ||
                      "Select the supplier for this invoice"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* اختيار المورد */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("supplier", "procurement") || "Supplier"} *
                  </label>
                  <select
                    name="supplier_id"
                    value={invoiceData.supplier_id}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.supplier_id
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  >
                    <option value="">
                      {t("selectSupplier", "procurement") || "Select Supplier"}
                    </option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}{" "}
                        {supplier.email ? `(${supplier.email})` : ""}
                      </option>
                    ))}
                  </select>
                  {validationErrors.supplier_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.supplier_id}
                    </p>
                  )}
                </div>

                {/* إدخال رقم طلب الشراء (إجباري الآن) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("relatedOrderId", "procurement") || "Related Order ID"} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="supplier_order_id"
                      value={invoiceData.supplier_order_id}
                      onChange={handleInputChange}
                      placeholder={
                        t("enterOrderIdPlaceholder", "procurement") ||
                        "Enter purchase order ID (numbers only)"
                      }
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.supplier_order_id
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.supplier_order_id ? (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.supplier_order_id}
                    </p>
                  ) : (
                    orderExists && (
                      <p
                        className={`mt-1 text-sm ${orderExists.exists ? "text-green-600" : "text-red-600"}`}
                      >
                        {orderExists.message}
                      </p>
                    )
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {t("orderIdHelpRequired", "procurement") ||
                      "Enter the purchase order ID (positive integer) to link this invoice to an existing order"}
                  </p>
                </div>
              </div>
            </div>

            {/* معلومات الفاتورة */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="text-dental-blue" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("invoiceInformation", "procurement") ||
                      "Invoice Information"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("enterInvoiceDetails", "procurement") ||
                      "Enter invoice number and dates"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* رقم الفاتورة (إجباري الآن) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("invoiceNumber", "procurement") || "Invoice Number"} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="invoice_number"
                      value={invoiceData.invoice_number}
                      onChange={handleInputChange}
                      placeholder={
                        t("enterInvoiceNumber", "procurement") ||
                        "e.g., INV-2024-001"
                      }
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.invoice_number
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.invoice_number && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.invoice_number}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {t("invoiceNumberHelpRequired", "procurement") ||
                      "Enter invoice number provided by supplier"}
                  </p>
                </div>

                {/* حالة الدفع */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("paymentStatus", "procurement") || "Payment Status"} *
                  </label>
                  <select
                    name="payment_status"
                    value={invoiceData.payment_status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="unpaid">
                      {getPaymentStatusText("unpaid")}
                    </option>
                    <option value="paid">{getPaymentStatusText("paid")}</option>
                    <option value="overdue">
                      {getPaymentStatusText("overdue")}
                    </option>
                  </select>
                </div>

                {/* تاريخ الفاتورة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("invoiceDate", "procurement") || "Invoice Date"} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="invoice_date"
                      value={invoiceData.invoice_date}
                      onChange={handleInputChange}
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.invoice_date
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.invoice_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.invoice_date}
                    </p>
                  )}
                </div>

                {/* تاريخ الاستحقاق */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("dueDate", "procurement") || "Due Date"} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="due_date"
                      value={invoiceData.due_date}
                      onChange={handleInputChange}
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.due_date
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.due_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.due_date}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* العمود الأيمن: المبالغ المالية والملاحظات */}
          <div className="space-y-6">
            {/* المبالغ المالية */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("financialDetails", "procurement") ||
                      "Financial Details"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("enterInvoiceAmounts", "procurement") ||
                      "Enter invoice amounts"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* العملة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("currency", "procurement") || "Currency"} *
                  </label>
                  <select
                    name="currency"
                    value={invoiceData.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">
                      {t("USD", "procurement") || "US Dollar (USD)"}
                    </option>
                    <option value="EUR">
                      {t("EUR", "procurement") || "Euro (EUR)"}
                    </option>
                    <option value="GBP">
                      {t("GBP", "procurement") || "British Pound (GBP)"}
                    </option>
                  </select>
                </div>

                {/* المبلغ بدون ضريبة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("subtotal", "procurement") || "Subtotal"} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="subtotal"
                      value={invoiceData.subtotal}
                      onChange={handleInputChange}
                      onBlur={calculateTotal}
                      step="0.01"
                      min="0"
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.subtotal
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {validationErrors.subtotal && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.subtotal}
                    </p>
                  )}
                </div>

                {/* مبلغ الضريبة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("taxAmount", "procurement") || "Tax Amount"} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="tax_amount"
                      value={invoiceData.tax_amount}
                      onChange={handleInputChange}
                      onBlur={calculateTotal}
                      step="0.01"
                      min="0"
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.tax_amount
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {validationErrors.tax_amount && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.tax_amount}
                    </p>
                  )}
                </div>

                {/* المبلغ الإجمالي */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("totalAmount", "procurement") || "Total Amount"} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="total_amount"
                      value={invoiceData.total_amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full pl-10 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.total_amount
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {validationErrors.total_amount && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.total_amount}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={calculateTotal}
                    className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
                  >
                    {t("calculateTotal", "procurement") ||
                      "Calculate Total (Subtotal + Tax)"}
                  </button>
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
                    {t("notes", "procurement") || "Notes"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("additionalInformation", "procurement") ||
                      "Additional information about this invoice"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("notes", "procurement") || "Notes"} (
                  {t("optional", "common") || "Optional"})
                </label>
                <textarea
                  name="notes"
                  value={invoiceData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    t("enterNotesHere", "procurement") ||
                    "Enter any special instructions or notes here..."
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">
                {t("correctInvoiceMethod", "procurement") ||
                  "✅ Correct Way to Create Invoices:"}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  •{" "}
                  {t("correctMethodStep1", "procurement") ||
                    "Go to Purchase Orders Management"}
                </li>
                <li>
                  •{" "}
                  {t("correctMethodStep2", "procurement") ||
                    "Find the confirmed purchase order"}
                </li>
                <li>
                  •{" "}
                  {t("correctMethodStep3", "procurement") ||
                    "Click 'View Details' on the order"}
                </li>
                <li>
                  •{" "}
                  {t("correctMethodStep4", "procurement") ||
                    "Click 'Generate Invoice' button"}
                </li>
                <li>
                  •{" "}
                  {t("correctMethodStep5", "procurement") ||
                    "Invoice will be created automatically with correct data"}
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start">
                <Info
                  className="text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                  size={16}
                />
                <p className="text-sm text-blue-700">
                  {t("useThisFormForOldInvoices", "procurement") ||
                    "Use this manual form only for adding old invoices that were created outside the system. All fields marked with * are required."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate("/procurement/supplier-invoices")}
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
                  <span>{t("saving", "procurement") || "Saving..."}</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>
                    {t("createInvoice", "procurement") || "Create Invoice"}
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

export default AddSupplierInvoice;
