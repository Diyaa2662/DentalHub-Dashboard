import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import api from "../../../services/api";
import {
  ArrowLeft,
  Mail,
  Truck,
  DollarSign,
  CreditCard,
  Calendar,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingCart,
  Box,
  ChevronRight,
  PackageIcon,
  Building,
  AlertCircle,
  RefreshCw,
  Hash,
  Layers,
  Percent,
  Check,
  X,
  MapPin,
  User,
  Image as ImageIcon,
} from "lucide-react";

const PurchaseOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // ✅ تعريف الحالات الثابتة
  const STATUSES = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
  };

  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false); // ✅ حالة جديدة لتوليد الفاتورة

  // ✅ حالة جديدة لمعلومات المزود
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [loadingSupplier, setLoadingSupplier] = useState(false);
  const [supplierError, setSupplierError] = useState(null);

  useEffect(() => {
    fetchPurchaseOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ دالة لتحويل حالة الـ API إلى حالة داخلية موحدة
  const normalizeStatus = (apiStatus) => {
    if (!apiStatus) return STATUSES.PENDING;

    const statusLower = apiStatus.toLowerCase();

    if (statusLower.includes("confirm")) {
      return STATUSES.CONFIRMED;
    } else if (statusLower.includes("cancel")) {
      return STATUSES.CANCELLED;
    } else if (statusLower.includes("ship")) {
      return STATUSES.SHIPPED;
    } else if (statusLower.includes("deliver")) {
      return STATUSES.DELIVERED;
    } else if (statusLower.includes("pending")) {
      return STATUSES.PENDING;
    }

    return STATUSES.PENDING;
  };

  // ✅ دالة لإنشاء رابط الصورة الكامل (نفس منطق صفحة الزبائن)
  const getFullImageUrl = (url) => {
    if (!url) return null; // ✅ رجع null بدل رابط افتراضي
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

  // ✅ توليد صورة افتراضية للمنتج من Unsplash - بس للاختبار فقط
  // eslint-disable-next-line no-unused-vars
  const getProductImage = (productId) => {
    return null; // ✅ ما نرجع أي صورة افتراضية
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

  const fetchPurchaseOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setSupplierInfo(null);
      setSupplierError(null);

      const response = await api.get(`/supplierorders/${id}`);

      const orderData = response.data?.order;
      const relatedProducts = response.data?.related_products || [];

      if (!orderData) {
        throw new Error("Order data not found");
      }

      // ✅ معالجة حالة الطلب من API باستخدام دالة normalizeStatus
      let orderStatus = normalizeStatus(orderData.status);

      // ✅ تنسيق بيانات الطلب من الـ API فقط
      const formattedOrder = {
        id: orderData.id,
        poNumber: orderData.supplier_order_number || `S_ORD-${orderData.id}`,
        supplierName: orderData.supplier || "Unknown Supplier",
        supplierId: orderData.supplier_id, // ✅ حفظ supplier_id
        orderDate:
          orderData.order_date || orderData.created_at?.split("T")[0] || "N/A",

        // ✅ المبالغ المالية
        totalAmount: parseFloat(orderData.total_amount) || 0,
        subtotal: parseFloat(orderData.subtotal) || 0,
        taxAmount: parseFloat(orderData.tax_amount) || 0,
        currency: orderData.currency || "USD",

        // ✅ معلومات الدفع
        paymentMethod: orderData.payment_method || "Bank Transfer",
        status: orderStatus, // استخدام الحالة المعالجة
        originalStatus: orderData.status, // حفظ الحالة الأصلية

        // ✅ الملاحظات من الـ API
        notes: orderData.notes || "",

        // ✅ معلومات أخرى
        numberOfItems: orderData.number_of_items || 0,

        // ✅ معلومات غير موجودة في الـ API - تم إزالة الحقول غير المستخدمة
        trackingNumber: "N/A",
        expectedDelivery: "N/A",
        shippingMethod: "Standard Delivery", // قيمة افتراضية
      };

      // ✅ تنسيق المنتجات المرتبطة مع معالجة الصور
      const formattedItems = await Promise.all(
        relatedProducts.map(async (product, index) => {
          const pivot = product.pivot || {};

          // ✅ التحقق من وجود الصور في API
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
            productRate: product.product_rate || "0.0",
            image: productImage, // ✅ null إذا مافي صورة
            hasImage: hasValidImage, // ✅ حالة جديدة للتحقق من وجود الصورة
            originalProduct: product,
          };
        }),
      );

      setPurchaseOrder(formattedOrder);
      setOrderItems(formattedItems);

      // ✅ جلب معلومات المزود إذا كان هناك supplier_id
      if (orderData.supplier_id) {
        await fetchSupplierInfo(orderData.supplier_id);
      }
    } catch (err) {
      console.error("Error fetching purchase order details:", err);
      setError(
        t("fetchOrderDetailsError", "procurement") ||
          "Failed to load purchase order details",
      );
      setPurchaseOrder(null);
      setOrderItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ دالة توليد الفاتورة
  const handleGenerateInvoice = async () => {
    if (!purchaseOrder || purchaseOrder.status !== STATUSES.CONFIRMED) return;

    if (
      window.confirm(
        t("generateInvoiceConfirmation", "procurement") ||
          "Are you sure you want to generate an invoice for this order?",
      )
    ) {
      setGeneratingInvoice(true);
      try {
        // ✅ حساب due_date (مثلاً 30 يوم من تاريخ اليوم)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        const formattedDueDate = dueDate.toISOString().split("T")[0];

        // ✅ إنشاء invoice_number (مثلاً INV- + رقم الطلب + تاريخ)
        const invoiceNumber = `INV-${purchaseOrder.id}-${new Date()
          .getTime()
          .toString()
          .slice(-6)}`;

        const invoiceData = {
          invoice_number: invoiceNumber,
          order_id: purchaseOrder.id,
          due_date: formattedDueDate,
          notes: `Invoice for purchase order #${purchaseOrder.poNumber}`,
        };

        await api.post("/generatesupplierinvoice", invoiceData);

        alert(
          t("invoiceGeneratedSuccess", "procurement") ||
            "Invoice generated successfully!",
        );
      } catch (err) {
        console.error("Error generating invoice:", err);
        alert(
          err.response?.data?.message ||
            t("generateInvoiceError", "procurement") ||
            "Failed to generate invoice",
        );
      } finally {
        setGeneratingInvoice(false);
      }
    }
  };

  // ✅ الحصول على أيقونة الحالة
  const getStatusIcon = (status) => {
    switch (status) {
      case STATUSES.CONFIRMED:
        return <CheckCircle size={16} className="text-green-600" />;
      case STATUSES.PENDING:
        return <Clock size={16} className="text-yellow-600" />;
      case STATUSES.CANCELLED:
        return <XCircle size={16} className="text-red-600" />;
      case STATUSES.SHIPPED:
        return <Truck size={16} className="text-blue-600" />;
      case STATUSES.DELIVERED:
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  // ✅ الحصول على لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case STATUSES.CONFIRMED:
        return "bg-green-100 text-green-800 border border-green-200";
      case STATUSES.PENDING:
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case STATUSES.CANCELLED:
        return "bg-red-100 text-red-800 border border-red-200";
      case STATUSES.SHIPPED:
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case STATUSES.DELIVERED:
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // ✅ الحصول على نص الحالة
  const getStatusText = (status) => {
    switch (status) {
      case STATUSES.CONFIRMED:
        return t("confirmed", "procurement") || "Confirmed";
      case STATUSES.PENDING:
        return t("pending", "procurement") || "Pending";
      case STATUSES.CANCELLED:
        return t("cancelled", "procurement") || "Cancelled";
      case STATUSES.SHIPPED:
        return t("shipped", "procurement") || "Shipped";
      case STATUSES.DELIVERED:
        return t("delivered", "procurement") || "Delivered";
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown";
    }
  };

  // ترجمة العملة
  const getCurrencyDisplay = (currencyCode) => {
    const currencies = {
      USD: t("USD", "procurement") || "US Dollar",
      EUR: t("EUR", "procurement") || "Euro",
      GBP: t("GBP", "procurement") || "British Pound",
    };
    return currencies[currencyCode] || currencyCode;
  };

  // ترجمة طريقة الدفع
  const getPaymentMethodDisplay = (method) => {
    const methods = {
      "Credit Card": {
        text: t("creditCard", "procurement") || "Credit Card",
        icon: <CreditCard size={16} />,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      "Bank Transfer": {
        text: t("bankTransfer", "procurement") || "Bank Transfer",
        icon: <Building size={16} />,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      Cash: {
        text: t("cash", "procurement") || "Cash",
        icon: <DollarSign size={16} />,
        color: "text-green-600",
        bg: "bg-green-50",
      },
    };
    return (
      methods[method] || {
        text: method,
        icon: <CreditCard size={16} />,
        color: "text-gray-600",
        bg: "bg-gray-50",
      }
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: purchaseOrder?.currency || "USD",
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

  // ✅ دالة تأكيد الطلب
  const handleConfirmOrder = async () => {
    if (
      purchaseOrder?.status !== STATUSES.PENDING &&
      purchaseOrder?.status !== STATUSES.CANCELLED
    )
      return;

    if (
      window.confirm(
        t("confirmOrderConfirmation", "procurement") ||
          "Are you sure you want to confirm this order?",
      )
    ) {
      setUpdatingStatus(true);
      try {
        await api.post(`/confirmsupplierorder/${id}`);

        alert(
          t("orderConfirmedSuccess", "procurement") ||
            "Order confirmed successfully!",
        );
        fetchPurchaseOrderDetails();
      } catch (err) {
        console.error("Error confirming order:", err);
        alert(
          t("confirmOrderError", "procurement") || "Failed to confirm order",
        );
      } finally {
        setUpdatingStatus(false);
      }
    }
  };

  // ✅ دالة إلغاء الطلب
  const handleCancelOrder = async () => {
    if (purchaseOrder?.status !== STATUSES.CONFIRMED) return;

    if (
      window.confirm(
        t("cancelOrderConfirmation", "procurement") ||
          "Are you sure you want to cancel this order?",
      )
    ) {
      setUpdatingStatus(true);
      try {
        await api.post(`/cancelsupplierorder/${id}`);

        alert(
          t("orderCancelledSuccess", "procurement") ||
            "Order cancelled successfully!",
        );
        fetchPurchaseOrderDetails();
      } catch (err) {
        console.error("Error cancelling order:", err);
        alert(t("cancelOrderError", "procurement") || "Failed to cancel order");
      } finally {
        setUpdatingStatus(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchPurchaseOrderDetails();
  };

  const handleEditOrder = () => {
    navigate(`/procurement/purchase-orders/edit/${id}`);
  };

  // ✅ دالة التحقق من حالة الطلب لعرض الزر المناسب
  // ✅ دالة التحقق من حالة الطلب لعرض الزر المناسب
  const renderStatusActionButton = () => {
    if (!purchaseOrder) return null;

    const currentStatus = purchaseOrder.status;

    if (currentStatus === STATUSES.PENDING) {
      return (
        <button
          onClick={handleConfirmOrder}
          disabled={updatingStatus}
          className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${
            updatingStatus
              ? "bg-green-200 text-green-800 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {updatingStatus ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{t("confirming", "procurement") || "Confirming..."}</span>
            </>
          ) : (
            <>
              <Check size={18} />
              <span>{t("confirmOrder", "procurement") || "Confirm Order"}</span>
            </>
          )}
        </button>
      );
    } else if (currentStatus === STATUSES.CONFIRMED) {
      return (
        <button
          onClick={handleCancelOrder}
          disabled={updatingStatus}
          className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${
            updatingStatus
              ? "bg-red-200 text-red-800 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {updatingStatus ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{t("cancelling", "procurement") || "Cancelling..."}</span>
            </>
          ) : (
            <>
              <X size={18} />
              <span>{t("cancelOrder", "procurement") || "Cancel Order"}</span>
            </>
          )}
        </button>
      );
    } else if (currentStatus === STATUSES.CANCELLED) {
      // ✅ إضافة زر Confirm للحالة CANCELLED
      return (
        <button
          onClick={handleConfirmOrder}
          disabled={updatingStatus}
          className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${
            updatingStatus
              ? "bg-green-200 text-green-800 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {updatingStatus ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{t("confirming", "procurement") || "Confirming..."}</span>
            </>
          ) : (
            <>
              <Check size={18} />
              <span>{t("confirmOrder", "procurement") || "Confirm Order"}</span>
            </>
          )}
        </button>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/procurement/purchase-orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("purchaseOrderDetails", "procurement") ||
              "Purchase Order Details"}
          </h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {t("loadingOrderDetails", "procurement") ||
                "Loading order details..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !purchaseOrder) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/procurement/purchase-orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("purchaseOrderDetails", "procurement") ||
              "Purchase Order Details"}
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
            {t("errorLoadingOrder", "procurement") || "Error Loading Order"}
          </h3>
          <p className="text-red-600 mb-4">
            {error || t("orderNotFound", "procurement") || "Order not found"}
          </p>
          <button
            onClick={() => navigate("/procurement/purchase-orders")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition mr-2"
          >
            {t("backToOrders", "procurement") || "Back to Orders"}
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

  const paymentMethod = getPaymentMethodDisplay(purchaseOrder.paymentMethod);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/procurement/purchase-orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("purchaseOrderDetails", "procurement") ||
                "Purchase Order Details"}
            </h1>
            <div className="flex items-center space-x-4 mt-1 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Hash size={14} className="text-gray-400" />
                <p className="text-gray-600 font-medium">
                  {t("purchaseOrder", "procurement") || "PO"} #
                  {purchaseOrder.poNumber}
                </p>
              </div>
              <span className="text-gray-500">•</span>
              <p className="text-gray-600">{purchaseOrder.supplierName}</p>
              <span className="text-gray-500">•</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center space-x-1 ${getStatusColor(
                  purchaseOrder.status,
                )}`}
              >
                {getStatusIcon(purchaseOrder.status)}
                <span>{getStatusText(purchaseOrder.status)}</span>
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
            onClick={handleEditOrder}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <CheckCircle size={20} />
            <span>{t("editOrder", "procurement") || "Edit Order"}</span>
          </button>

          {/* ✅ زر توليد الفاتورة - يظهر فقط إذا كانت الحالة confirmed */}
          {purchaseOrder.status === STATUSES.CONFIRMED && (
            <button
              onClick={handleGenerateInvoice}
              disabled={generatingInvoice}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                generatingInvoice
                  ? "bg-green-200 text-green-800 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {generatingInvoice ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>
                    {t("generating", "procurement") || "Generating..."}
                  </span>
                </>
              ) : (
                <>
                  <FileText size={20} />
                  <span>
                    {t("generateInvoice", "procurement") || "Generate Invoice"}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Summary & Items */}
        <div className="lg:col-span-2">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ShoppingCart className="text-dental-blue" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("orderedItems", "procurement") || "Ordered Items"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {purchaseOrder.numberOfItems || orderItems.length}{" "}
                    {t("items", "procurement") || "items"}
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

            {orderItems.length === 0 ? (
              <div className="text-center py-8">
                <PackageIcon className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">
                  {t("noItemsInOrder", "procurement") ||
                    "No items in this order"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {/* ✅ عرض صورة المنتج أو أيقونة */}
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
                              {t("quantity", "procurement") || "Qty"}:
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
                              {formatCurrency(item.unitCost)}
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
                              {formatCurrency(item.subTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4 min-w-[160px] flex flex-col items-end">
                      <div className="mb-3">
                        <p className="font-extrabold text-gray-800 text-xl">
                          {formatCurrency(item.finalPrice)}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {t("itemTotal", "procurement") || "Item Total"}
                        </p>
                      </div>

                      <div className="mt-auto">
                        <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 rounded-lg border border-blue-200">
                          <PackageIcon
                            size={14}
                            className="text-blue-600 mr-2"
                          />
                          <span className="text-sm font-bold text-blue-800">
                            {t("stock", "procurement") || "Stock"}:{" "}
                            {item.currentStock}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("orderSummary", "procurement") || "Order Summary"}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("financialSummary", "procurement") ||
                    "Financial summary of this order"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-3">
                <p className="text-gray-700">
                  {t("subtotal", "procurement") || "Subtotal"}
                </p>
                <p className="font-medium text-gray-800">
                  {formatCurrency(purchaseOrder.subtotal)}
                </p>
              </div>

              <div className="flex justify-between items-center py-3 border-t border-gray-200">
                <p className="text-gray-700">
                  {t("taxAmount", "procurement") || "Tax Amount"}
                </p>
                <p className="font-medium text-red-600">
                  {formatCurrency(purchaseOrder.taxAmount)}
                </p>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-gray-200 font-bold">
                <div>
                  <p className="text-lg text-gray-800">
                    {t("totalAmount", "procurement") || "Total Amount"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("currency", "procurement") || "Currency"}:{" "}
                    {getCurrencyDisplay(purchaseOrder.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl text-gray-800">
                    {formatCurrency(purchaseOrder.totalAmount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("grandTotal", "procurement") || "Grand Total"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {purchaseOrder.notes && purchaseOrder.notes.trim() !== "" && (
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
                    {t("additionalInstructions", "procurement") ||
                      "Additional instructions or comments from the order"}
                  </p>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {purchaseOrder.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Supplier & Order Information */}
        <div className="space-y-6">
          {/* Order Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="text-purple-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("purchaseOrderInformation", "procurement") ||
                    "PO Information"}
                </h3>
                <p className="text-sm text-gray-600">
                  #{purchaseOrder.poNumber} •{" "}
                  {t("orderDetails", "procurement") || "Order Details"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Hash className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("orderId", "procurement") || "Order ID"}
                  </span>
                </div>
                <span className="font-mono font-medium">
                  {purchaseOrder.id}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("orderDate", "procurement") || "Order Date"}
                  </span>
                </div>
                <span className="font-medium">{purchaseOrder.orderDate}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Truck className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("orderStatus", "procurement") || "Order Status"}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center space-x-1 ${getStatusColor(
                    purchaseOrder.status,
                  )}`}
                >
                  {getStatusIcon(purchaseOrder.status)}
                  <span>{getStatusText(purchaseOrder.status)}</span>
                </span>
              </div>

              {/* ✅ أزرار تغيير الحالة */}
              <div className="pt-4 border-t border-gray-200">
                {renderStatusActionButton()}

                {/* رسائل مساعدة */}
                {purchaseOrder.status === STATUSES.PENDING && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {t("pendingOrderHelp", "procurement") ||
                      "This order is awaiting confirmation"}
                  </p>
                )}

                {purchaseOrder.status === STATUSES.CONFIRMED && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {t("confirmedOrderHelp", "procurement") ||
                      "This order has been confirmed and can be canceled if needed"}
                  </p>
                )}

                {purchaseOrder.status === STATUSES.CANCELLED && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {t("cancelledOrderHelp", "procurement") ||
                      "This order has been cancelled"}
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
                  {purchaseOrder.supplierName}
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

                {/* نوع المنتج */}
                {supplierInfo.productType && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <PackageIcon className="text-gray-500 mr-3" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {t("productType", "procurement") || "Product Type"}
                      </p>
                      <p className="font-medium truncate">
                        {supplierInfo.productType}
                      </p>
                    </div>
                  </div>
                )}

                {/* زر الاتصال - فقط إذا كان هناك إيميل */}
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

          {/* Payment Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CreditCard className="text-dental-blue" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("paymentDetails", "procurement") || "Payment Details"}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("paymentInformation", "procurement") ||
                    "Payment information"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {paymentMethod.icon}
                    <span className="ml-2 text-gray-700">
                      {t("paymentMethod", "procurement") || "Payment Method"}
                    </span>
                  </div>
                  <span className="font-medium">{paymentMethod.text}</span>
                </div>
                {/* ✅ تم إزالة Payment Terms لأنها غير موجودة في الـ API */}
              </div>

              {/* ❌ حذفت قسم Payment Status */}

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    {t("currency", "procurement") || "Currency"}
                  </span>
                  <div className="flex items-center">
                    <DollarSign className="text-green-500 mr-1" size={16} />
                    <span className="font-medium">
                      {getCurrencyDisplay(purchaseOrder.currency)}
                    </span>
                    <span className="ml-1 text-sm text-gray-600">
                      ({purchaseOrder.currency})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetails;
