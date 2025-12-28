import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  ArrowLeft,
  Printer,
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
  FileText as FileTextIcon,
} from "lucide-react";

const PurchaseOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const mockPurchaseOrder = {
        id: parseInt(id),
        poNumber: "PO-2024-001",
        supplierName: "Dental Equipment Co.",
        supplierEmail: "john@dentalequip.com",
        supplierPhone: "+1-555-123-4567",
        orderDate: "2024-01-15",
        expectedDelivery: "2024-01-22",

        // ✅ فقط totalAmount يظهر في العرض
        totalAmount: 5325,
        currency: "USD",

        paymentMethod: "credit_card",
        paymentStatus: "pending",
        paymentTerms: "Net 30",

        shippingMethod: "Express Delivery",
        trackingNumber: "TRK-7894561230",
        orderStatus: "confirmed",

        notes: "Urgent order for new clinic setup",

        items: [
          {
            id: 1,
            product: "Advanced Dental Chair",
            quantity: 1,
            subTotal: 4500, // ✅ يظهر في العرض
            taxAmount: 675, // ✅ يظهر في العرض
            finalPrice: 5175, // ✅ يظهر في العرض
            currentStock: 12, // ✅ يظهر في العرض
            image:
              "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w-400&auto=format&fit=crop",
          },
          {
            id: 2,
            product: "Dental X-Ray Unit",
            quantity: 1,
            subTotal: 3200,
            taxAmount: 480,
            finalPrice: 3680,
            currentStock: 8,
            image:
              "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w-400&auto=format&fit=crop",
          },
          {
            id: 3,
            product: "Sterilization Equipment",
            quantity: 2,
            subTotal: 1900,
            taxAmount: 285,
            finalPrice: 2185,
            currentStock: 15,
            image:
              "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w-400&auto=format&fit=crop",
          },
        ],
      };
      setPurchaseOrder(mockPurchaseOrder);
      setLoading(false);
    }, 500);
  }, [id]);

  // ترجمة العملة
  const getCurrencyDisplay = (currencyCode) => {
    const currencies = {
      USD: t("USD", "procurement") || "US Dollar",
      EUR: t("EUR", "procurement") || "Euro",
      GBP: t("GBP", "procurement") || "British Pound",
    };
    return currencies[currencyCode] || currencyCode;
  };

  // ترجمة حالة الطلب
  const getOrderStatusDisplay = (status) => {
    const statuses = {
      pending: {
        text: t("pending", "procurement") || "Pending",
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock size={16} />,
      },
      confirmed: {
        text: t("confirmed", "procurement") || "Confirmed",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle size={16} />,
      },
      shipped: {
        text: t("shipped", "procurement") || "Shipped",
        color: "bg-blue-100 text-blue-800",
        icon: <Truck size={16} />,
      },
      delivered: {
        text: t("delivered", "procurement") || "Delivered",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle size={16} />,
      },
      cancelled: {
        text: t("cancelled", "procurement") || "Cancelled",
        color: "bg-red-100 text-red-800",
        icon: <XCircle size={16} />,
      },
    };
    return (
      statuses[status] || {
        text: status,
        color: "bg-gray-100 text-gray-800",
        icon: <Clock size={16} />,
      }
    );
  };

  // ترجمة طريقة الدفع
  const getPaymentMethodDisplay = (method) => {
    const methods = {
      credit_card: {
        text: t("creditCard", "procurement") || "Credit Card",
        icon: <CreditCard size={16} />,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      bank_transfer: {
        text: t("bankTransfer", "procurement") || "Bank Transfer",
        icon: <Building size={16} />,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      cash: {
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

  // ترجمة حالة الدفع
  const getPaymentStatusDisplay = (status) => {
    const statuses = {
      paid: {
        text: t("paid", "procurement") || "Paid",
        color: "bg-green-100 text-green-800",
      },
      pending: {
        text: t("pending", "procurement") || "Pending",
        color: "bg-yellow-100 text-yellow-800",
      },
      overdue: {
        text: t("overdue", "procurement") || "Overdue",
        color: "bg-red-100 text-red-800",
      },
    };
    return (
      statuses[status] || {
        text: status,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  const handlePrintPO = () => {
    window.print();
  };

  const handleContactSupplier = () => {
    window.location.href = `mailto:${purchaseOrder.supplierEmail}`;
  };

  const handleUpdateStatus = () => {
    const newStatus = prompt(
      `${t("enterNewStatus", "procurement") || "Enter new status"} (${
        t("pending", "procurement") || "Pending"
      }/${t("confirmed", "procurement") || "Confirmed"}/${
        t("shipped", "orderDetails") || "Shipped"
      }/${t("delivered", "procurement") || "Delivered"}/${
        t("cancelled", "procurement") || "Cancelled"
      }):`
    );
    if (newStatus) {
      alert(
        `${t("poStatus", "procurement") || "PO Status"} ${
          t("updatedTo", "procurement") || "updated to"
        } ${newStatus}`
      );
    }
  };

  const handleMarkAsDelivered = () => {
    alert(
      `✅ ${t("purchaseOrder", "procurement") || "Purchase Order"} #${
        purchaseOrder.poNumber
      } ${t("markedDelivered", "procurement") || "marked as delivered"}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue"></div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileTextIcon className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-semibold text-gray-800">
            {t("purchaseOrderNotFound", "procurement") ||
              "Purchase Order not found"}
          </h3>
          <button
            onClick={() => navigate("/procurement/purchase-orders")}
            className="mt-4 px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition"
          >
            {t("backToPurchaseOrders", "procurement") ||
              "Back to Purchase Orders"}
          </button>
        </div>
      </div>
    );
  }

  const orderStatus = getOrderStatusDisplay(purchaseOrder.orderStatus);
  const paymentMethod = getPaymentMethodDisplay(purchaseOrder.paymentMethod);
  const paymentStatus = getPaymentStatusDisplay(purchaseOrder.paymentStatus);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

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
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-gray-600">
                {t("purchaseOrder", "procurement") || "PO"} #
                {purchaseOrder.poNumber} • {purchaseOrder.supplierName}
              </p>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center space-x-1 ${orderStatus.color}`}
              >
                {orderStatus.icon}
                <span>{orderStatus.text}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handlePrintPO}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <Printer size={20} />
            <span>{t("printPO", "procurement") || "Print PO"}</span>
          </button>
          <button
            onClick={handleUpdateStatus}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center space-x-2"
          >
            <CheckCircle size={20} />
            <span>{t("updateStatus", "procurement") || "Update Status"}</span>
          </button>
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
                  {t("orderedItems", "procurement") || "Ordered Items"}
                </h3>
                <p className="text-sm text-gray-600">
                  {purchaseOrder.items.length}{" "}
                  {t("items", "procurement") || "items"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {purchaseOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.product}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/80x80";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-lg mb-6 truncate">
                        {item.product}
                      </p>

                      <div className="text-sm text-gray-700 flex flex-wrap items-center gap-4">
                        <div className="flex items-center bg-gray-50 px-1 py-1 rounded">
                          <span className="font-medium mr-1">
                            {t("quantity", "orderDetails") || "Qty"}:
                          </span>
                          <span className="text-gray-800">{item.quantity}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">
                            {t("subtotal", "orderDetails") || "Subtotal"}:
                          </span>
                          <span className="text-blue-600">
                            {formatCurrency(item.subTotal)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">
                            {t("tax", "orderDetails") || "Tax"}:
                          </span>
                          <span className="text-green-600">
                            {formatCurrency(item.taxAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4 min-w-[140px] flex flex-col items-end">
                    <div className="mb-2">
                      <p className="font-extrabold text-gray-800 text-xl">
                        {formatCurrency(item.finalPrice)}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {t("total", "orderDetails") || "Total"}
                      </p>
                    </div>

                    <div className="mt-auto pt-2">
                      <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 rounded-lg border border-blue-200">
                        <PackageIcon size={14} className="text-blue-600 mr-2" />
                        <span className="text-sm font-bold text-blue-800">
                          {t("stock", "orderDetails") || "Stock"}:{" "}
                          {item.currentStock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                  {t("totalAmount", "procurement") || "Total Amount"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-4 border-t border-gray-200">
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {t("totalAmount", "procurement") || "Total Amount"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("currency", "procurement") || "Currency"}:{" "}
                    {getCurrencyDisplay(purchaseOrder.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
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
          {purchaseOrder.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <FileText className="text-yellow-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("notes", "procurement") || "Notes"}
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 bg-yellow-50 p-4 rounded-lg">
                {purchaseOrder.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Supplier & Order Information */}
        <div className="space-y-6">
          {/* Order Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileTextIcon className="text-purple-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("purchaseOrderInformation", "procurement") ||
                    "PO Information"}
                </h3>
                <p className="text-sm text-gray-600">
                  #{purchaseOrder.poNumber} •{" "}
                  {t("poStatus", "procurement") || "PO Status"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
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
                    {t("expectedDelivery", "procurement") ||
                      "Expected Delivery"}
                  </span>
                </div>
                <span className="font-medium">
                  {purchaseOrder.expectedDelivery}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <ChevronRight className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("shippingMethod", "orderDetails") || "Shipping Method"}
                  </span>
                </div>
                <span className="font-medium">
                  {purchaseOrder.shippingMethod}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Box className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("trackingNumber", "orderDetails") || "Tracking Number"}
                  </span>
                </div>
                <span className="font-medium text-blue-600">
                  {purchaseOrder.trackingNumber}
                </span>
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

            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Mail className="text-gray-500 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-600">
                    {t("email", "procurement") || "Email"}
                  </p>
                  <p className="font-medium">{purchaseOrder.supplierEmail}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Phone className="text-gray-500 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-600">
                    {t("phone", "procurement") || "Phone"}
                  </p>
                  <p className="font-medium">{purchaseOrder.supplierPhone}</p>
                </div>
              </div>

              <button
                onClick={handleContactSupplier}
                className="w-full py-3 px-4 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center space-x-2"
              >
                <Mail size={18} />
                <span>
                  {t("contactSupplier", "procurement") || "Contact Supplier"}
                </span>
              </button>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CreditCard className="text-dental-blue" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("paymentDetails", "orderDetails") || "Payment Details"}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("paymentMethod", "procurement") || "Payment Method"} •{" "}
                  {t("paymentStatus", "procurement") || "Payment Status"}
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t("paymentTerms", "procurement") || "Payment Terms"}
                  </span>
                  <span className="text-sm font-medium">
                    {purchaseOrder.paymentTerms}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    {t("paymentStatus", "procurement") || "Payment Status"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatus.color}`}
                  >
                    {paymentStatus.text}
                  </span>
                </div>
              </div>

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

      {/* Bottom Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={() => navigate("/procurement/purchase-orders")}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition flex items-center space-x-2"
        >
          <ArrowLeft size={20} />
          <span>
            {t("backToPurchaseOrders", "procurement") ||
              "Back to Purchase Orders"}
          </span>
        </button>

        <div className="flex space-x-3">
          <button
            onClick={handlePrintPO}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <Printer size={20} />
            <span>{t("printPO", "procurement") || "Print PO"}</span>
          </button>

          <button
            onClick={handleMarkAsDelivered}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center space-x-2"
          >
            <CheckCircle size={20} />
            <span>
              {t("markAsDelivered", "procurement") || "Mark as Delivered"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetails;
