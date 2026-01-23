import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
import {
  ArrowLeft,
  Mail,
  Package,
  DollarSign,
  CreditCard,
  User,
  Calendar,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingCart,
  Box,
  PackageIcon,
  AlertCircle,
  RefreshCw,
  Check,
  X,
  Image as ImageIcon,
  HelpCircle,
} from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // ✅ تعريف الحالات الثابتة
  const STATUSES = {
    UNCHECKED: "unchecked",
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CANCELED: "canceled",
  };

  const [order, setOrder] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [error, setError] = useState(null);
  const [customerError, setCustomerError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
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

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setCustomerInfo(null);
      setCustomerError(null);

      const response = await api.get(`/customerorders/${id}`);
      const data = response.data;

      if (data.order) {
        // ✅ معالجة حالة الطلب من API
        let orderStatus = STATUSES.UNCHECKED;

        if (data.order.status) {
          const statusLower = data.order.status.toLowerCase();
          if (statusLower === STATUSES.CONFIRMED) {
            orderStatus = STATUSES.CONFIRMED;
          } else if (statusLower === STATUSES.CANCELED) {
            orderStatus = STATUSES.CANCELED;
          } else if (statusLower === STATUSES.PENDING) {
            orderStatus = STATUSES.PENDING;
          } else if (statusLower === STATUSES.UNCHECKED) {
            orderStatus = STATUSES.UNCHECKED;
          }
        }

        // ✅ تحويل بيانات الطلب الكلي من API
        const formattedOrder = {
          id: data.order.id,
          orderNumber: data.order.order_number,
          userId: data.order.user_id,
          customerName:
            data.order.user_name || `Customer #${data.order.user_id}`,
          orderDate:
            data.order.order_date || data.order.created_at?.split("T")[0],
          subtotal: parseFloat(data.order.subtotal) || 0,
          tax: parseFloat(data.order.tax_amount) || 0,
          discount: parseFloat(data.order.discount_amount) || 0,
          totalAmount: parseFloat(data.order.total_amount) || 0,
          currency: data.order.currency || "USD",
          paymentMethod: data.order.payment_method || "not_specified",
          orderStatus: orderStatus,
          originalStatus: data.order.status,
          customerNotes: data.order.notes || "",
          // ✅ بيانات الطلب الكلي الإضافية
          numberOfItems: data.order.number_of_items || 0,
          createdAt: data.order.created_at,
          updatedAt: data.order.updated_at,
        };

        // ✅ تحويل بيانات المنتجات من API بنفس الطريقة الحالية مع إضافة البيانات الجديدة
        const formattedItems = data.products
          ? await Promise.all(
              data.products.map(async (product) => {
                const pivot = product.pivot;
                const subtotal = parseFloat(pivot.subtotal) || 0;
                const discountAmount = parseFloat(pivot.discount_amount) || 0;
                const taxAmount = parseFloat(pivot.tax_amount) || 0;
                const finalPrice = subtotal - discountAmount + taxAmount;

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
                  product: product.name || `Product ${product.id}`,
                  sku: product.sku || `SKU-${product.id}`,
                  quantity: pivot.quantity || 1,
                  unitPrice:
                    parseFloat(pivot.unit_price) ||
                    parseFloat(product.price) ||
                    0,
                  subTotal: subtotal,
                  discountAmount: discountAmount,
                  taxAmount: taxAmount,
                  finalPrice: finalPrice,
                  currentStock: product.stock_quantity || 0,
                  status: product.status || "instock",
                  image: productImage,
                  hasImage: hasValidImage,
                  allImages: product.images
                    ? product.images.map((img) => ({
                        ...img,
                        fullUrl: getFullImageUrl(img.url),
                      }))
                    : [],
                  // ✅ إضافة البيانات الجديدة من الـ API
                  discountPrice: parseFloat(product.discount_price) || 0,
                  taxRate: parseFloat(pivot.tax_rate) || 0, // هذه هي النسبة المئوية
                  productPrice: parseFloat(product.price) || 0,
                  cost: parseFloat(product.cost) || 0,
                  productRate: parseFloat(product.product_rate) || 0,
                  categoryId: product.category_id,
                  description: product.description || "",
                  sDescription: product.s_description || "",
                };
              }),
            )
          : [];

        // ✅ إضافة المنتجات إلى بيانات الطلب
        formattedOrder.items = formattedItems;

        setOrder(formattedOrder);

        if (data.order.user_id) {
          fetchCustomerInfo(data.order.user_id);
        } else {
          setLoading(false);
        }
      } else {
        setError(t("orderNotFound", "orderDetails") || "Order not found");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("failedToLoadOrder", "orderDetails") ||
          "Failed to load order details",
      );
      setLoading(false);
    }
  };

  // ✅ جلب معلومات الزبون من API منفصل
  const fetchCustomerInfo = async (userId) => {
    try {
      setLoadingCustomer(true);
      setCustomerError(null);

      const response = await api.get(`/users/${userId}`);
      const customerData =
        response.data?.user || response.data?.data || response.data;

      if (customerData) {
        setCustomerInfo({
          name: customerData.name || "",
          email: customerData.email || "",
          phone: customerData.phone || "",
        });
      }
    } catch (err) {
      console.error("Error fetching customer info:", err);
      setCustomerError(
        err.response?.data?.message ||
          err.message ||
          t("failedToLoadCustomer", "orderDetails") ||
          "Failed to load customer information",
      );
    } finally {
      setLoadingCustomer(false);
      setLoading(false);
    }
  };

  // ✅ الحصول على أيقونة الحالة
  const getStatusIcon = (status) => {
    switch (status) {
      case STATUSES.CONFIRMED:
        return <CheckCircle size={16} className="text-green-600" />;
      case STATUSES.PENDING:
        return <Clock size={16} className="text-yellow-600" />;
      case STATUSES.CANCELED:
        return <XCircle size={16} className="text-red-600" />;
      case STATUSES.UNCHECKED:
        return <HelpCircle size={16} className="text-gray-600" />;
      default:
        return <Package size={16} className="text-gray-600" />;
    }
  };

  // ✅ الحصول على لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case STATUSES.CONFIRMED:
        return "bg-green-100 text-green-800 border border-green-200";
      case STATUSES.PENDING:
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case STATUSES.CANCELED:
        return "bg-red-100 text-red-800 border border-red-200";
      case STATUSES.UNCHECKED:
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // ✅ الحصول على نص الحالة
  const getStatusText = (status) => {
    switch (status) {
      case STATUSES.CONFIRMED:
        return t("confirmed", "common") || "Confirmed";
      case STATUSES.PENDING:
        return t("pending", "common") || "Pending";
      case STATUSES.CANCELED:
        return t("canceled", "common") || "Canceled";
      case STATUSES.UNCHECKED:
        return t("unchecked", "orders") || "Unchecked";
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown";
    }
  };

  // ✅ دالة إعادة التحميل
  const handleRefresh = () => {
    fetchOrderDetails();
  };

  // ✅ دالة تغيير حالة الطلب
  const updateOrderStatus = async (newStatus) => {
    if (!order) return;

    if (order.orderStatus === STATUSES.UNCHECKED) {
      alert(
        t("cannotChangeUnchecked", "orderDetails") ||
          "Cannot change status of unchecked orders",
      );
      return;
    }

    setUpdatingStatus(true);
    try {
      let endpoint;

      if (newStatus === STATUSES.CONFIRMED) {
        endpoint = `/confirmcustomerorder/${order.id}`;
      } else if (newStatus === STATUSES.CANCELED) {
        endpoint = `/cancelcustomerorder/${order.id}`;
      } else {
        alert(t("invalidStatus", "orderDetails") || "Invalid status");
        setUpdatingStatus(false);
        return;
      }

      const response = await api.post(endpoint);

      if (response.status === 200 || response.status === 201) {
        const updatedOrder = {
          ...order,
          orderStatus: newStatus,
          originalStatus: newStatus,
        };

        setOrder(updatedOrder);

        setTimeout(() => {
          fetchOrderDetails();
        }, 500);

        alert(
          t("orderStatusUpdated", "orderDetails") ||
            `Order status successfully updated to ${getStatusText(newStatus)}`,
        );
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      let errorMessage =
        t("failedToUpdateStatus", "orderDetails") ||
        "Failed to update order status";

      if (err.response) {
        errorMessage += `: ${err.response.data?.message || err.response.statusText}`;
      } else if (err.request) {
        errorMessage += ": No response from server";
      } else {
        errorMessage += `: ${err.message}`;
      }

      alert(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ✅ زر تأكيد الطلب
  const handleConfirmOrder = () => {
    const canConfirm = [STATUSES.PENDING, STATUSES.CANCELED].includes(
      order.orderStatus,
    );

    if (!canConfirm) {
      alert(
        t("cannotConfirmCurrentStatus", "orderDetails") ||
          `Cannot confirm order with status: ${getStatusText(order.orderStatus)}`,
      );
      return;
    }

    if (order.orderStatus === STATUSES.CONFIRMED) {
      alert(
        t("orderAlreadyConfirmed", "orderDetails") ||
          "Order is already confirmed",
      );
      return;
    }

    if (window.confirm(t("confirmOrderConfirmation", "orderDetails"))) {
      updateOrderStatus(STATUSES.CONFIRMED);
    }
  };

  // ✅ زر إلغاء الطلب
  const handleCancelOrder = () => {
    const canCancel = order.orderStatus === STATUSES.CONFIRMED;

    if (!canCancel) {
      alert(
        t("cannotCancelCurrentStatus", "orderDetails") ||
          `Cannot cancel order with status: ${getStatusText(order.orderStatus)}`,
      );
      return;
    }

    if (order.orderStatus === STATUSES.CANCELED) {
      alert(
        t("orderAlreadyCanceled", "orderDetails") ||
          "Order is already canceled",
      );
      return;
    }

    if (
      window.confirm(
        t("cancelOrderConfirmation", "orderDetails") ||
          `Are you sure you want to cancel order #${order.orderNumber}?\n\nThis action will change the order status to "Canceled".`,
      )
    ) {
      updateOrderStatus(STATUSES.CANCELED);
    }
  };

  // ✅ دالة إنشاء الفاتورة
  const handleGenerateInvoice = async () => {
    if (!order) return;

    if (order.orderStatus !== STATUSES.CONFIRMED) {
      alert(
        t("invoiceOnlyConfirmed", "orderDetails") ||
          "Invoice can only be generated for confirmed orders",
      );
      return;
    }

    if (window.confirm(t("generateInvoiceConfirmation", "orderDetails"))) {
      setGeneratingInvoice(true);
      try {
        const invoiceData = {
          order_id: order.id,
          invoice_number: `INV-${Date.now()}`,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          notes:
            order.customerNotes ||
            "Thank you for your purchase. Please make payment before the due date.",
        };

        const response = await api.post("/generateinvoice", invoiceData);

        if (response.status === 200 || response.status === 201) {
          alert(
            t("invoiceGenerated", "orderDetails") ||
              "Invoice generated successfully!",
          );
        }
      } catch (err) {
        console.error("Error generating invoice:", err);
        alert(
          t("failedToGenerateInvoice", "orderDetails") ||
            "Failed to generate invoice: " +
              (err.response?.data?.message || err.message),
        );
      } finally {
        setGeneratingInvoice(false);
      }
    }
  };

  // ✅ ترجمة طريقة الدفع
  const getPaymentMethodDisplay = (method) => {
    const methods = {
      credit_card: {
        text: t("creditCard", "orders") || "Credit Card",
        icon: <CreditCard size={16} />,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      bank_transfer: {
        text: t("bankTransfer", "orders") || "Bank Transfer",
        icon: <Box size={16} />,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      cash: {
        text: t("cash", "orders") || "Cash",
        icon: <DollarSign size={16} />,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      mobile_payment: {
        text: t("mobilePayment", "orders") || "Mobile Payment",
        icon: <Phone size={16} />,
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
      paypal: {
        text: "PayPal",
        icon: <CreditCard size={16} />,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      not_specified: {
        text: t("notSpecified", "orderDetails") || "Not Specified",
        icon: <CreditCard size={16} />,
        color: "text-gray-600",
        bg: "bg-gray-50",
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

  // ✅ تنسيق المبلغ
  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handleContactCustomer = () => {
    if (customerInfo?.email) {
      window.location.href = `mailto:${customerInfo.email}`;
    } else {
      alert(
        t("emailNotAvailable", "orderDetails") ||
          "Customer email not available",
      );
    }
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/orders")}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {t("orderDetails", "orderDetails")}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-gray-600">
                  {t("loadingOrderDetails", "orderDetails") ||
                    "Loading order details..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto mb-4"></div>
            <p className="text-gray-600">
              {t("loadingOrder", "orderDetails") || "Loading order details..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error || !order) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/orders")}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {t("orderDetails", "orderDetails")}
              </h1>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoadingOrder", "orderDetails") ||
                  "Error Loading Order"}
              </h3>
              <p className="text-red-600">
                {error || t("orderNotFound", "orderDetails")}
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/orders")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              {t("backToOrders", "orderDetails")}
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition flex items-center space-x-2"
            >
              <RefreshCw size={18} />
              <span>{t("tryAgain", "common") || "Try Again"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const paymentMethod = getPaymentMethodDisplay(order.paymentMethod);
  const canShowConfirmButton = [STATUSES.PENDING, STATUSES.CANCELED].includes(
    order.orderStatus,
  );
  const canShowCancelButton = order.orderStatus === STATUSES.CONFIRMED;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("orderDetails", "orderDetails")}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-gray-600">
                {t("order", "orderDetails")} #{order.id} • {order.orderNumber}
              </p>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center space-x-1 ${getStatusColor(
                  order.orderStatus,
                )}`}
              >
                {getStatusIcon(order.orderStatus)}
                <span>{getStatusText(order.orderStatus)}</span>
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
            <RefreshCw size={18} />
            <span>{t("refresh", "common") || "Refresh"}</span>
          </button>

          {order.orderStatus === STATUSES.CONFIRMED && (
            <button
              onClick={handleGenerateInvoice}
              disabled={generatingInvoice}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {generatingInvoice ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileText size={20} />
                  <span>Generate Invoice</span>
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
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingCart className="text-dental-blue" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("orderItems", "orderDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  {order.items.length} {t("items", "orderDetails")}
                </p>
              </div>
            </div>

            {order.items.length === 0 ? (
              <div className="text-center py-8">
                <Package className="text-gray-400 mx-auto mb-4" size={48} />
                <p className="text-gray-600">
                  {t("noItemsInOrder", "orderDetails") ||
                    "No items in this order"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {order.items.map((item) => (
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
                              {t("noImage", "common") || "No Image"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-lg mb-2 truncate">
                          {item.product}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          SKU: {item.sku}
                        </p>

                        <div className="text-sm text-gray-700 flex flex-wrap items-center gap-3 mb-2">
                          <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                            <span className="font-medium mr-1">
                              {t("quantity", "orderDetails")}:
                            </span>
                            <span className="font-medium text-gray-800">
                              {item.quantity}
                            </span>
                          </div>

                          <div className="flex items-center bg-blue-50 px-2 py-1 rounded">
                            <span className="font-medium mr-1">
                              {t("unitPrice", "orderDetails")}:
                            </span>
                            <span className="font-medium text-blue-700">
                              {formatCurrency(item.unitPrice, order.currency)}
                            </span>
                          </div>

                          <div className="flex items-center bg-blue-50 px-2 py-1 rounded">
                            <span className="font-medium mr-1">
                              {t("subtotal", "orderDetails")}:
                            </span>
                            <span className="font-medium text-blue-700">
                              {formatCurrency(item.subTotal, order.currency)}
                            </span>
                          </div>
                        </div>

                        {/* ✅ عرض البيانات الإضافية */}
                        <div className="text-sm text-gray-600 flex flex-wrap items-center gap-3">
                          {/* عرض tax rate كرقم */}
                          {item.taxRate > 0 && (
                            <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                              <span className="font-medium mr-1">
                                {t("taxRate", "orderDetails") || "Tax Rate"}:
                              </span>
                              <span className="font-medium text-green-700">
                                {item.taxRate}%
                              </span>
                            </div>
                          )}

                          {/* عرض discount price */}
                          {item.discountPrice > 0 && (
                            <div className="flex items-center bg-red-50 px-2 py-1 rounded">
                              <span className="font-medium mr-1">
                                {t("discountPrice", "orderDetails") ||
                                  "Discount Price"}
                                :
                              </span>
                              <span className="font-medium text-red-700">
                                {formatCurrency(
                                  item.discountPrice,
                                  order.currency,
                                )}
                              </span>
                            </div>
                          )}

                          {/* عرض tax amount */}
                          {item.taxAmount > 0 && (
                            <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                              <span className="font-medium mr-1">
                                {t("tax", "orderDetails")}:
                              </span>
                              <span className="font-medium text-green-700">
                                +
                                {formatCurrency(item.taxAmount, order.currency)}
                              </span>
                            </div>
                          )}

                          {/* عرض discount amount */}
                          {item.discountAmount > 0 && (
                            <div className="flex items-center bg-red-50 px-2 py-1 rounded">
                              <span className="font-medium mr-1">
                                {t("discount", "orderDetails")}:
                              </span>
                              <span className="font-medium text-red-600">
                                -
                                {formatCurrency(
                                  item.discountAmount,
                                  order.currency,
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4 min-w-[140px] flex flex-col items-end">
                      <div className="mb-1">
                        <p className="font-extrabold text-gray-800 text-xl">
                          {formatCurrency(item.finalPrice, order.currency)}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {t("total", "orderDetails")}
                        </p>
                      </div>

                      <div className="mt-auto pt-2">
                        <div
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg border ${
                            item.currentStock > 10
                              ? "bg-green-100 border-green-200"
                              : item.currentStock > 0
                                ? "bg-yellow-100 border-yellow-200"
                                : "bg-red-100 border-red-200"
                          }`}
                        >
                          <PackageIcon
                            size={14}
                            className={`mr-2 ${
                              item.currentStock > 10
                                ? "text-green-600"
                                : item.currentStock > 0
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          />
                          <span
                            className={`text-sm font-bold ${
                              item.currentStock > 10
                                ? "text-green-800"
                                : item.currentStock > 0
                                  ? "text-yellow-800"
                                  : "text-red-800"
                            }`}
                          >
                            {t("stock", "orderDetails")}: {item.currentStock}
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
                  {t("orderSummary", "orderDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("totalAmount", "orderDetails")}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">
                  {t("subtotal", "orderDetails")}
                </span>
                <span className="font-medium">
                  {formatCurrency(order.subtotal, order.currency)}
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">
                    {t("discount", "orderDetails")}
                  </span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(order.discount, order.currency)}
                  </span>
                </div>
              )}

              {order.tax > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">
                    {t("tax", "orderDetails")}
                  </span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(order.tax, order.currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-4 border-t border-gray-200">
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {t("totalAmount", "orderDetails")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("currency", "orderDetails")}: {order.currency}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("grandTotal", "orderDetails")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {order.customerNotes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <FileText className="text-yellow-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("customerNotes", "orderDetails")}
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 bg-yellow-50 p-4 rounded-lg">
                {order.customerNotes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Order & Customer Information */}
        <div className="space-y-6">
          {/* Order Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Package className="text-purple-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("orderInformation", "orderDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  #{order.id} • {order.orderNumber}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("orderDate", "orderDetails")}
                  </span>
                </div>
                <span className="font-medium">{order.orderDate}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <ShoppingCart className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("items", "orderDetails")}
                  </span>
                </div>
                <span className="font-medium">{order.items.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">{t("status", "orders")}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center space-x-1 ${getStatusColor(
                    order.orderStatus,
                  )}`}
                >
                  {getStatusIcon(order.orderStatus)}
                  <span>{getStatusText(order.orderStatus)}</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {paymentMethod.icon}
                  <span className="ml-2 text-gray-700">
                    {t("paymentMethod", "orderDetails")}
                  </span>
                </div>
                <span className="font-medium">{paymentMethod.text}</span>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                {canShowConfirmButton && (
                  <button
                    onClick={handleConfirmOrder}
                    disabled={
                      updatingStatus || order.orderStatus === STATUSES.UNCHECKED
                    }
                    className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${
                      updatingStatus || order.orderStatus === STATUSES.UNCHECKED
                        ? "bg-green-200 text-green-800 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {updatingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>
                          {t("confirming", "orderDetails") || "Confirming..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        <span>
                          {t("confirmOrder", "orderDetails") || "Confirm Order"}
                        </span>
                      </>
                    )}
                  </button>
                )}

                {canShowCancelButton && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={updatingStatus}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${
                      updatingStatus
                        ? "bg-red-200 text-red-800 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {updatingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>
                          {t("cancelling", "orderDetails") || "Cancelling..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <X size={18} />
                        <span>
                          {t("cancelOrder", "orderDetails") || "Cancel Order"}
                        </span>
                      </>
                    )}
                  </button>
                )}

                <div className="text-center">
                  {order.orderStatus === STATUSES.UNCHECKED && (
                    <p className="text-xs text-gray-500">
                      {t("uncheckedOrderHelp", "orderDetails") ||
                        "This order is unchecked and cannot be modified."}
                    </p>
                  )}

                  {order.orderStatus === STATUSES.PENDING && (
                    <p className="text-xs text-gray-500">
                      {t("pendingOrderHelp", "orderDetails") ||
                        "This order is awaiting confirmation. Click 'Confirm Order' to proceed."}
                    </p>
                  )}

                  {order.orderStatus === STATUSES.CONFIRMED && (
                    <p className="text-xs text-gray-500">
                      {t("confirmedOrderHelp", "orderDetails") ||
                        "Order confirmed. You can cancel it if needed or generate an invoice."}
                    </p>
                  )}

                  {order.orderStatus === STATUSES.CANCELED && (
                    <p className="text-xs text-gray-500">
                      {t("canceledOrderHelp", "orderDetails") ||
                        "This order has been canceled. You can confirm it again if needed."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <User className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("customerInformation", "orderDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  {customerInfo?.name || order.customerName}
                </p>
              </div>
            </div>

            {loadingCustomer ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-blue"></div>
              </div>
            ) : customerError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="text-red-600 mr-2" size={16} />
                  <p className="text-sm text-red-600">{customerError}</p>
                </div>
              </div>
            ) : customerInfo ? (
              <div className="space-y-4">
                {customerInfo.name && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="text-gray-500 mr-3" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {t("customerName", "orderDetails")}
                      </p>
                      <p className="font-medium truncate">
                        {customerInfo.name}
                      </p>
                    </div>
                  </div>
                )}

                {customerInfo.email && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Mail className="text-gray-500 mr-3" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {t("email", "orderDetails")}
                      </p>
                      <p className="font-medium truncate">
                        {customerInfo.email}
                      </p>
                    </div>
                  </div>
                )}

                {customerInfo.phone && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Phone className="text-gray-500 mr-3" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {t("phoneNumber", "orderDetails")}
                      </p>
                      <p className="font-medium">{customerInfo.phone}</p>
                    </div>
                  </div>
                )}

                {customerInfo.email && (
                  <button
                    onClick={handleContactCustomer}
                    className="w-full py-3 px-4 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center space-x-2"
                  >
                    <Mail size={18} />
                    <span>{t("contactCustomer", "orderDetails")}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="text-gray-400 mx-auto mb-4" size={48} />
                <p className="text-gray-600">
                  {t("noCustomerInfo", "orderDetails") ||
                    "No customer information available"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={() => navigate("/orders")}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition flex items-center space-x-2"
        >
          <ArrowLeft size={20} />
          <span>{t("backToOrders", "orderDetails")}</span>
        </button>

        <div className="flex space-x-3">
          {order.orderStatus === STATUSES.CONFIRMED && (
            <button
              onClick={handleGenerateInvoice}
              disabled={generatingInvoice}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {generatingInvoice ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileText size={20} />
                  <span>Generate Invoice</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
