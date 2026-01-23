import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import api from "../../../services/api";
import {
  ArrowLeft,
  Mail,
  DollarSign,
  CreditCard,
  Calendar,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  ShoppingCart,
  PackageIcon,
  Building,
  AlertCircle,
  RefreshCw,
  Hash,
  Layers,
  Check,
  X,
  MapPin,
  User,
  Image as ImageIcon,
  Truck,
  Download,
  Printer,
  AlertTriangle,
} from "lucide-react";

const SupplierInvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // ✅ تعريف حالات الفاتورة
  const INVOICE_STATUSES = {
    PAID: "paid",
    UNPAID: "unpaid",
    OVERDUE: "overdue",
  };

  const [invoice, setInvoice] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [loadingSupplier, setLoadingSupplier] = useState(false);
  const [supplierError, setSupplierError] = useState(null);

  useEffect(() => {
    fetchInvoiceDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ دالة لإنشاء رابط الصورة الكامل
  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://nethy-production.up.railway.app${url}`;
  };

  // ✅ دالة للتحقق من وجود الصورة
  const checkImageExists = (url) => {
    return new Promise((resolve) => {
      if (!url) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  // ✅ دالة لجلب معلومات المزود
  const fetchSupplierInfo = async (supplierId) => {
    if (!supplierId) return;

    try {
      setLoadingSupplier(true);
      setSupplierError(null);

      const response = await api.get(`/suppliers/${supplierId}`);
      const supplierData = response.data?.data;

      if (supplierData) {
        setSupplierInfo({
          id: supplierData.id,
          name: supplierData.name || "Unknown Supplier",
          email: supplierData.email || "",
          phone: supplierData.phone || "",
          address: supplierData.address || "",
          productType: supplierData.product_type || "",
          notes: supplierData.notes || "",
        });
      }
    } catch (err) {
      console.error("Error fetching supplier info:", err);
      setSupplierError(
        err.response?.data?.message ||
          err.message ||
          t("failedToLoadSupplier", "procurement") ||
          "Failed to load supplier information",
      );
    } finally {
      setLoadingSupplier(false);
    }
  };

  // ✅ دالة لجلب تفاصيل الطلب المرتبط
  const fetchOrderDetails = async (orderId) => {
    if (!orderId) return;

    try {
      const response = await api.get(`/supplierorders/${orderId}`);
      const orderData = response.data?.order;
      const relatedProducts = response.data?.related_products || [];

      if (orderData) {
        setOrderDetails({
          id: orderData.id,
          poNumber: orderData.supplier_order_number || `S_ORD-${orderData.id}`,
          status: orderData.status,
          orderDate:
            orderData.order_date ||
            orderData.created_at?.split("T")[0] ||
            "N/A",
          paymentMethod: orderData.payment_method || "Unknown",
          notes: orderData.notes || "",
        });

        // ✅ تنسيق المنتجات المرتبطة
        const formattedItems = await Promise.all(
          relatedProducts.map(async (product, index) => {
            const pivot = product.pivot || {};

            // ✅ التحقق من وجود الصور
            let productImage = null;
            let hasValidImage = false;

            if (
              product.images &&
              product.images.length > 0 &&
              product.images[0].url
            ) {
              const fullImageUrl = getFullImageUrl(product.images[0].url);
              hasValidImage = await checkImageExists(fullImageUrl);
              if (hasValidImage) {
                productImage = fullImageUrl;
              }
            }

            return {
              id: product.id,
              product: product.name || product.s_name || `Product ${index + 1}`,
              sku: product.sku || `SKU-${product.id}`,
              quantity: pivot.quantity || 1,
              unitCost: parseFloat(pivot.unit_cost_price) || 0,
              taxRate: parseFloat(pivot.tax_rate) || 0,
              taxAmount: parseFloat(pivot.tax_amount) || 0,
              subTotal: parseFloat(pivot.subtotal) || 0,
              finalPrice:
                (parseFloat(pivot.subtotal) || 0) +
                (parseFloat(pivot.tax_amount) || 0),
              currentStock: product.stock_quantity || 0,
              image: productImage,
              hasImage: hasValidImage,
              originalProduct: product,
            };
          }),
        );

        setOrderItems(formattedItems);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      // لا نعرض خطأ لأنها معلومات إضافية فقط
    }
  };

  // ✅ دالة لجلب تفاصيل الفاتورة
  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setSupplierInfo(null);
      setSupplierError(null);
      setOrderDetails(null);
      setOrderItems([]);

      // ✅ جلب تفاصيل الفاتورة
      const response = await api.get(`/supplierinvoices/${id}`);
      const invoiceData = response.data?.data;

      if (!invoiceData) {
        throw new Error("Invoice data not found");
      }

      // ✅ تنسيق بيانات الفاتورة
      const formattedInvoice = {
        id: invoiceData.id,
        invoiceNumber: invoiceData.invoice_number || `INV-${invoiceData.id}`,
        invoiceDate: invoiceData.invoice_date || "N/A",
        dueDate: invoiceData.due_date || "N/A",
        subtotal: parseFloat(invoiceData.subtotal) || 0,
        taxAmount: parseFloat(invoiceData.tax_amount) || 0,
        totalAmount: parseFloat(invoiceData.total_amount) || 0,
        currency: invoiceData.currency || "USD",
        status:
          invoiceData.payment_status?.toLowerCase() || INVOICE_STATUSES.UNPAID,
        notes: invoiceData.notes || "",
        orderId: invoiceData.supplier_order_id,
        supplierId: invoiceData.supplier_id,
        createdDate: invoiceData.created_at?.split("T")[0] || "N/A",
        originalData: invoiceData,
      };

      setInvoice(formattedInvoice);

      // ✅ جلب معلومات المزود
      if (invoiceData.supplier_id) {
        await fetchSupplierInfo(invoiceData.supplier_id);
      }

      // ✅ جلب تفاصيل الطلب المرتبط
      if (invoiceData.supplier_order_id) {
        await fetchOrderDetails(invoiceData.supplier_order_id);
      }
    } catch (err) {
      console.error("Error fetching invoice details:", err);
      setError(
        t("fetchInvoiceDetailsError", "procurement") ||
          "Failed to load invoice details",
      );
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ دالة تغيير حالة الفاتورة
  const handleChangeStatus = async (newStatus) => {
    if (!invoice) return;

    if (
      window.confirm(
        t("changeInvoiceStatusConfirmation", "procurement") ||
          `Are you sure you want to change invoice status to "${newStatus}"?`,
      )
    ) {
      setUpdatingStatus(true);
      try {
        const response = await api.post(`/changesupplierinvoicestatus/${id}`, {
          payment_status: newStatus,
        });

        alert(
          t("invoiceStatusUpdated", "procurement") ||
            "Invoice status updated successfully!",
        );
        fetchInvoiceDetails();
      } catch (err) {
        console.error("Error changing invoice status:", err);
        alert(
          err.response?.data?.message ||
            t("changeStatusError", "procurement") ||
            "Failed to change invoice status",
        );
      } finally {
        setUpdatingStatus(false);
      }
    }
  };

  // ✅ دالة طباعة الفاتورة
  const handlePrintInvoice = () => {
    window.print();
  };

  const handleRefresh = () => {
    fetchInvoiceDetails();
  };

  const handleBack = () => {
    navigate("/procurement/supplier-invoices");
  };

  // ✅ الحصول على أيقونة الحالة
  const getStatusIcon = (status) => {
    switch (status) {
      case INVOICE_STATUSES.PAID:
        return <CheckCircle size={16} className="text-green-600" />;
      case INVOICE_STATUSES.UNPAID:
        return <Clock size={16} className="text-yellow-600" />;
      case INVOICE_STATUSES.OVERDUE:
        return <AlertTriangle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  // ✅ الحصول على لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case INVOICE_STATUSES.PAID:
        return "bg-green-100 text-green-800 border border-green-200";
      case INVOICE_STATUSES.UNPAID:
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case INVOICE_STATUSES.OVERDUE:
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // ✅ الحصول على نص الحالة
  const getStatusText = (status) => {
    switch (status) {
      case INVOICE_STATUSES.PAID:
        return t("paid", "procurement") || "Paid";
      case INVOICE_STATUSES.UNPAID:
        return t("unpaid", "procurement") || "Unpaid";
      case INVOICE_STATUSES.OVERDUE:
        return t("overdue", "procurement") || "Overdue";
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown";
    }
  };

  // ✅ ترجمة العملة
  const getCurrencyDisplay = (currencyCode) => {
    const currencies = {
      USD: t("USD", "procurement") || "US Dollar",
      EUR: t("EUR", "procurement") || "Euro",
      GBP: t("GBP", "procurement") || "British Pound",
    };
    return currencies[currencyCode] || currencyCode;
  };

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handleContactSupplier = () => {
    if (supplierInfo?.email) {
      window.location.href = `mailto:${supplierInfo.email}`;
    } else {
      alert(
        t("supplierEmailNotAvailable", "procurement") ||
          "Supplier email is not available",
      );
    }
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("supplierInvoiceDetails", "procurement") ||
              "Supplier Invoice Details"}
          </h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {t("loadingInvoiceDetails", "procurement") ||
                "Loading invoice details..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error || !invoice) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("supplierInvoiceDetails", "procurement") ||
              "Supplier Invoice Details"}
          </h1>
          <button
            onClick={handleRefresh}
            className="ml-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>{t("retry", "common") || "Retry"}</span>
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {t("errorLoadingInvoice", "procurement") || "Error Loading Invoice"}
          </h3>
          <p className="text-red-600 mb-4">
            {error ||
              t("invoiceNotFound", "procurement") ||
              "Invoice not found"}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition mr-2"
          >
            {t("backToInvoices", "procurement") || "Back to Invoices"}
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition"
          >
            {t("tryAgain", "common") || "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("supplierInvoiceDetails", "procurement") ||
                "Supplier Invoice Details"}
            </h1>
            <div className="flex items-center space-x-4 mt-1 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Hash size={14} className="text-gray-400" />
                <p className="text-gray-600 font-medium">
                  {t("invoice", "procurement") || "Invoice"} #
                  {invoice.invoiceNumber}
                </p>
              </div>
              <span className="text-gray-500">•</span>
              {supplierInfo?.name && (
                <>
                  <p className="text-gray-600">{supplierInfo.name}</p>
                  <span className="text-gray-500">•</span>
                </>
              )}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center space-x-1 ${getStatusColor(
                  invoice.status,
                )}`}
              >
                {getStatusIcon(invoice.status)}
                <span>{getStatusText(invoice.status)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
            title={t("refresh", "common") || "Refresh"}
          >
            <RefreshCw size={20} />
            <span className="hidden md:inline">
              {t("refresh", "common") || "Refresh"}
            </span>
          </button>

          <button
            onClick={handlePrintInvoice}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <Printer size={20} />
            <span>{t("printInvoice", "procurement") || "Print Invoice"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Invoice Summary & Items */}
        <div className="lg:col-span-2">
          {/* Invoice Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="text-dental-blue" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("invoiceSummary", "procurement") || "Invoice Summary"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    #{invoice.invoiceNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-3">
                <p className="text-gray-700">
                  {t("subtotal", "procurement") || "Subtotal"}
                </p>
                <p className="font-medium text-gray-800">
                  {formatCurrency(invoice.subtotal, invoice.currency)}
                </p>
              </div>

              <div className="flex justify-between items-center py-3 border-t border-gray-200">
                <p className="text-gray-700">
                  {t("taxAmount", "procurement") || "Tax Amount"}
                </p>
                <p className="font-medium text-red-600">
                  {formatCurrency(invoice.taxAmount, invoice.currency)}
                </p>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-gray-200 font-bold">
                <div>
                  <p className="text-lg text-gray-800">
                    {t("totalAmount", "procurement") || "Total Amount"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("currency", "procurement") || "Currency"}:{" "}
                    {getCurrencyDisplay(invoice.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl text-gray-800">
                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("grandTotal", "procurement") || "Grand Total"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items (if available) */}
          {orderItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <ShoppingCart className="text-green-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("orderedItems", "procurement") || "Ordered Items"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {orderItems.length} {t("items", "procurement") || "items"}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  <Layers size={16} className="mr-1" />
                  <span>
                    {t("totalItems", "procurement") || "Total Items"}:{" "}
                    {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.hasImage ? (
                          <img
                            src={item.image}
                            alt={item.product}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center">
                                  <div class="text-center">
                                    <svg class="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <p class="text-xs text-gray-500 mt-1">No Image</p>
                                  </div>
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
                            <p className="text-xs text-gray-500 mt-1">
                              {t("noImage", "procurement") || "No Image"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-gray-800 text-lg truncate">
                            {item.product}
                          </p>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            SKU: {item.sku}
                          </span>
                        </div>

                        <div className="text-sm text-gray-700 flex flex-wrap items-center gap-3">
                          <div className="flex items-center bg-blue-50 px-2 py-1 rounded">
                            <span className="font-medium mr-1">
                              {t("quantityShort", "procurement") || "Qty"}:
                            </span>
                            <span className="text-blue-700 font-bold">
                              {item.quantity}
                            </span>
                          </div>

                          <div className="flex items-center">
                            <span className="font-medium mr-1">
                              {t("unitCost", "procurement") || "Unit Cost"}:
                            </span>
                            <span className="text-gray-800">
                              {formatCurrency(item.unitCost, invoice.currency)}
                            </span>
                          </div>

                          <div className="flex items-center">
                            <span className="font-medium mr-1">
                              {t("tax", "procurement") || "Tax"}:
                            </span>
                            <span className="text-green-600">
                              {item.taxRate}%
                            </span>
                          </div>

                          <div className="flex items-center">
                            <span className="font-medium mr-1">
                              {t("subtotal", "procurement") || "Subtotal"}:
                            </span>
                            <span className="text-blue-600 font-medium">
                              {formatCurrency(item.subTotal, invoice.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4 min-w-[160px]">
                      <div className="mb-3">
                        <p className="font-extrabold text-gray-800 text-xl">
                          {formatCurrency(item.finalPrice, invoice.currency)}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {t("itemTotal", "procurement") || "Item Total"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && invoice.notes.trim() !== "" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
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
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Invoice & Supplier Information */}
        <div className="space-y-6">
          {/* Invoice Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="text-purple-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("invoiceInformation", "procurement") ||
                    "Invoice Information"}
                </h3>
                <p className="text-sm text-gray-600">
                  #{invoice.invoiceNumber}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Hash className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("invoiceId", "procurement") || "Invoice ID"}
                  </span>
                </div>
                <span className="font-mono font-medium">{invoice.id}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("invoiceDate", "procurement") || "Invoice Date"}
                  </span>
                </div>
                <span className="font-medium">{invoice.invoiceDate}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("dueDate", "procurement") || "Due Date"}
                  </span>
                </div>
                <span className="font-medium">{invoice.dueDate}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("currency", "procurement") || "Currency"}
                  </span>
                </div>
                <span className="font-medium">
                  {getCurrencyDisplay(invoice.currency)}
                </span>
              </div>

              {/* Order Information */}
              {orderDetails && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ShoppingCart className="text-blue-500 mr-2" size={18} />
                      <span className="text-gray-700">
                        {t("relatedOrder", "procurement") || "Related Order"}
                      </span>
                    </div>
                    <span className="font-medium">
                      #{orderDetails.poNumber}
                    </span>
                  </div>
                  <div className="text-sm text-blue-600">
                    {t("orderStatus", "procurement") || "Order Status"}:{" "}
                    <span className="font-medium">{orderDetails.status}</span>
                  </div>
                </div>
              )}

              {/* ✅ Change Status Section */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">
                  {t("changeInvoiceStatus", "procurement") ||
                    "Change Invoice Status"}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleChangeStatus(INVOICE_STATUSES.PAID)}
                    disabled={
                      updatingStatus || invoice.status === INVOICE_STATUSES.PAID
                    }
                    className={`py-2 px-3 rounded-lg font-medium text-sm transition flex items-center justify-center space-x-1 ${
                      invoice.status === INVOICE_STATUSES.PAID
                        ? "bg-green-200 text-green-800 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    <CheckCircle size={14} />
                    <span>{t("markAsPaid", "procurement") || "Paid"}</span>
                  </button>

                  <button
                    onClick={() => handleChangeStatus(INVOICE_STATUSES.UNPAID)}
                    disabled={
                      updatingStatus ||
                      invoice.status === INVOICE_STATUSES.UNPAID
                    }
                    className={`py-2 px-3 rounded-lg font-medium text-sm transition flex items-center justify-center space-x-1 ${
                      invoice.status === INVOICE_STATUSES.UNPAID
                        ? "bg-yellow-200 text-yellow-800 cursor-not-allowed"
                        : "bg-yellow-600 hover:bg-yellow-700 text-white"
                    }`}
                  >
                    <Clock size={14} />
                    <span>{t("markAsUnpaid", "procurement") || "Unpaid"}</span>
                  </button>

                  <button
                    onClick={() => handleChangeStatus(INVOICE_STATUSES.OVERDUE)}
                    disabled={
                      updatingStatus ||
                      invoice.status === INVOICE_STATUSES.OVERDUE
                    }
                    className={`py-2 px-3 rounded-lg font-medium text-sm transition flex items-center justify-center space-x-1 ${
                      invoice.status === INVOICE_STATUSES.OVERDUE
                        ? "bg-red-200 text-red-800 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    <AlertTriangle size={14} />
                    <span>
                      {t("markAsOverdue", "procurement") || "Overdue"}
                    </span>
                  </button>
                </div>
                {updatingStatus && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {t("updatingStatus", "procurement") || "Updating status..."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Supplier Information */}
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
                  {supplierInfo?.name ||
                    t("supplier", "procurement") ||
                    "Supplier"}
                </p>
              </div>
            </div>

            {loadingSupplier ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-blue"></div>
              </div>
            ) : supplierError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="text-red-600 mr-2" size={16} />
                  <p className="text-sm text-red-600">{supplierError}</p>
                </div>
              </div>
            ) : supplierInfo ? (
              <div className="space-y-4">
                {/* الاسم */}
                {supplierInfo.name && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="text-gray-500 mr-3" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {t("supplierName", "procurement") || "Supplier Name"}
                      </p>
                      <p className="font-medium truncate">
                        {supplierInfo.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* البريد الإلكتروني */}
                {supplierInfo.email && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Mail className="text-gray-500 mr-3" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {t("email", "procurement") || "Email"}
                      </p>
                      <p className="font-medium truncate">
                        {supplierInfo.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* الهاتف */}
                {supplierInfo.phone && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Phone className="text-gray-500 mr-3" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {t("phone", "procurement") || "Phone"}
                      </p>
                      <p className="font-medium">{supplierInfo.phone}</p>
                    </div>
                  </div>
                )}

                {/* العنوان */}
                {supplierInfo.address && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <MapPin className="text-gray-500 mr-3" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {t("address", "procurement") || "Address"}
                      </p>
                      <p className="font-medium truncate">
                        {supplierInfo.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* زر الاتصال */}
                {supplierInfo.email && (
                  <button
                    onClick={handleContactSupplier}
                    className="w-full py-3 px-4 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center space-x-2"
                  >
                    <Mail size={18} />
                    <span>
                      {t("contactSupplier", "procurement") ||
                        "Contact Supplier"}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="text-gray-400 mx-auto mb-4" size={48} />
                <p className="text-gray-600">
                  {t("noSupplierInfo", "procurement") ||
                    "No supplier information available"}
                </p>
              </div>
            )}
          </div>

          {/* Payment Information */}
          {orderDetails && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CreditCard className="text-dental-blue" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("paymentInformation", "procurement") ||
                      "Payment Information"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("fromRelatedOrder", "procurement") ||
                      "From related order"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CreditCard className="text-gray-500 mr-2" size={16} />
                      <span className="text-gray-700">
                        {t("paymentMethod", "procurement") || "Payment Method"}
                      </span>
                    </div>
                    <span className="font-medium">
                      {orderDetails.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">
                      {t("orderDate", "procurement") || "Order Date"}
                    </span>
                    <span className="font-medium">
                      {orderDetails.orderDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierInvoiceDetails;
