import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  ArrowLeft,
  Printer,
  Mail,
  Truck,
  Package,
  DollarSign,
  CreditCard,
  User,
  MapPin,
  Calendar,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Tag,
  ShoppingCart,
  Box,
  ChevronRight,
} from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // بيانات وهمية للطلب (ستأتي من API لاحقاً)
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة جلب بيانات الطلب من API
    setTimeout(() => {
      const mockOrder = {
        id: parseInt(id),
        customerName: "Dr. Sarah Johnson",
        customerEmail: "sarah@dentalclinic.com",
        customerPhone: "(555) 123-4567",
        orderDate: "2024-01-15",
        estimatedDelivery: "2024-01-22",

        // تفاصيل المبلغ
        subtotal: 450,
        tax: 45, // 10% ضريبة
        discount: 22.5, // 5% خصم
        shippingFee: 15,
        totalAmount: 487.5,
        currency: "USD", // يمكن أن يكون: USD, EUR, GBP, SAR, AED

        // طريقة الدفع
        paymentMethod: "credit_card",
        transactionId: "TXN-7890123456",
        paymentStatus: "paid",

        // معلومات الشحن
        shippingAddress: "123 Dental Street, Suite 456, New York, NY 10001",
        billingAddress: "123 Dental Street, Suite 456, New York, NY 10001",
        shippingMethod: "Express Delivery",
        trackingNumber: "TRK-7894561230",
        orderStatus: "completed",

        // ملاحظات العميل
        customerNotes:
          "Please deliver between 9 AM - 5 PM. Call before delivery.",

        // عناصر الطلب
        items: [
          {
            id: 1,
            product: "Advanced Dental Chair",
            quantity: 1,
            unitPrice: 450,
            totalPrice: 450,
            image:
              "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w-400&auto=format&fit=crop",
          },
          {
            id: 2,
            product: "Surgical Gloves (Box of 100)",
            quantity: 2,
            unitPrice: 25,
            totalPrice: 50,
            image:
              "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w-400&auto=format&fit=crop",
          },
          {
            id: 3,
            product: "Dental Mirror Set",
            quantity: 3,
            unitPrice: 15,
            totalPrice: 45,
            image:
              "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w-400&auto=format&fit=crop",
          },
        ],
      };
      setOrder(mockOrder);
      setLoading(false);
    }, 500);
  }, [id]);

  // ترجمة العملة
  const getCurrencyDisplay = (currencyCode) => {
    const currencies = {
      USD: t("USD", "orderDetails"),
      EUR: t("EUR", "orderDetails"),
      GBP: t("GBP", "orderDetails"),
      SAR: t("SAR", "orderDetails"),
      AED: t("AED", "orderDetails"),
    };
    return currencies[currencyCode] || currencyCode;
  };

  // ترجمة حالة الطلب
  const getOrderStatusDisplay = (status) => {
    const statuses = {
      pending: {
        text: t("pending", "common"),
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock size={16} />,
      },
      processing: {
        text: t("processing", "common"),
        color: "bg-blue-100 text-blue-800",
        icon: <Filter size={16} />,
      },
      completed: {
        text: t("completed", "common"),
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle size={16} />,
      },
      shipped: {
        text: t("shipped", "orders"),
        color: "bg-purple-100 text-purple-800",
        icon: <Truck size={16} />,
      },
      cancelled: {
        text: t("cancelled", "common"),
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
        text: "Paid",
        color: "bg-green-100 text-green-800",
      },
      pending: {
        text: "Pending",
        color: "bg-yellow-100 text-yellow-800",
      },
      refunded: {
        text: "Refunded",
        color: "bg-red-100 text-red-800",
      },
      failed: {
        text: "Failed",
        color: "bg-red-100 text-red-800",
      },
    };
    return (
      statuses[status] || { text: status, color: "bg-gray-100 text-gray-800" }
    );
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleSendTracking = () => {
    alert(
      `${t("sendTracking", "orderDetails")} ${order.trackingNumber} to ${
        order.customerEmail
      }`
    );
  };

  const handleContactCustomer = () => {
    window.location.href = `mailto:${order.customerEmail}`;
  };

  const handleUpdateStatus = () => {
    const newStatus = prompt(
      "Enter new status (pending/processing/completed/shipped/cancelled):"
    );
    if (newStatus) {
      alert(`${t("orderStatus", "orderDetails")} updated to ${newStatus}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-semibold text-gray-800">
            Order not found
          </h3>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition"
          >
            {t("backToOrders", "orderDetails")}
          </button>
        </div>
      </div>
    );
  }

  const orderStatus = getOrderStatusDisplay(order.orderStatus);
  const paymentMethod = getPaymentMethodDisplay(order.paymentMethod);
  const paymentStatus = getPaymentStatusDisplay(order.paymentStatus);

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
                Order #{order.id} • {order.customerName}
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
            onClick={handlePrintInvoice}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <Printer size={20} />
            <span>{t("printInvoice", "orderDetails")}</span>
          </button>
          <button
            onClick={handleUpdateStatus}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center space-x-2"
          >
            <CheckCircle size={20} />
            <span>{t("updateStatus", "orderDetails")}</span>
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
                  {t("orderItems", "orderDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  {order.items.length} {t("items", "orderDetails")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.product}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.product}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t("quantity", "orderDetails")}: {item.quantity} × $
                        {item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      ${item.totalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {t("items", "orderDetails")}
                    </p>
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
                  {t("orderSummary", "orderDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("subtotal", "orderDetails")}, {t("tax", "orderDetails")},{" "}
                  {t("discount", "orderDetails")},{" "}
                  {t("totalAmount", "orderDetails")}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-700">
                  {t("subtotal", "orderDetails")}
                </span>
                <span className="font-medium">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>

              {/* Tax */}
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <span className="text-gray-700">
                    {t("tax", "orderDetails")}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">(10%)</span>
                </div>
                <span className="font-medium text-red-600">
                  +${order.tax.toFixed(2)}
                </span>
              </div>

              {/* Discount */}
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <Tag className="text-green-500 mr-2" size={16} />
                  <span className="text-gray-700">
                    {t("discount", "orderDetails")}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">(5%)</span>
                </div>
                <span className="font-medium text-green-600">
                  -${order.discount.toFixed(2)}
                </span>
              </div>

              {/* Shipping Fee */}
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <Truck className="text-blue-500 mr-2" size={16} />
                  <span className="text-gray-700">
                    {t("shippingFee", "orderDetails")}
                  </span>
                </div>
                <span className="font-medium">
                  +${order.shippingFee.toFixed(2)}
                </span>
              </div>

              {/* Total Amount */}
              <div className="flex justify-between items-center py-4">
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {t("totalAmount", "orderDetails")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("currency", "orderDetails")}:{" "}
                    {getCurrencyDisplay(order.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("grandTotal", "orderDetails")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
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
                  #{order.id} • {t("orderStatus", "orderDetails")}
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
                  <Truck className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("estimatedDelivery", "orderDetails")}
                  </span>
                </div>
                <span className="font-medium">{order.estimatedDelivery}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <ChevronRight className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("shippingMethod", "orderDetails")}
                  </span>
                </div>
                <span className="font-medium">{order.shippingMethod}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Box className="text-gray-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("trackingNumber", "orderDetails")}
                  </span>
                </div>
                <span className="font-medium text-blue-600">
                  {order.trackingNumber}
                </span>
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
                <p className="text-sm text-gray-600">{order.customerName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Mail className="text-gray-500 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-600">
                    {t("email", "orderDetails")}
                  </p>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Phone className="text-gray-500 mr-3" size={18} />
                <div>
                  <p className="text-sm text-gray-600">
                    {t("phoneNumber", "orderDetails")}
                  </p>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
              </div>

              <button
                onClick={handleContactCustomer}
                className="w-full py-3 px-4 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center space-x-2"
              >
                <Mail size={18} />
                <span>{t("contactCustomer", "orderDetails")}</span>
              </button>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-50 rounded-lg">
                <MapPin className="text-orange-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("shippingInformation", "orderDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("shippingAddress", "orderDetails")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  {t("shippingAddress", "orderDetails")}
                </p>
                <p className="font-medium">{order.shippingAddress}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  {t("billingAddress", "orderDetails")}
                </p>
                <p className="font-medium">{order.billingAddress}</p>
              </div>

              <button
                onClick={handleSendTracking}
                className="w-full py-3 px-4 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition flex items-center justify-center space-x-2"
              >
                <Truck size={18} />
                <span>{t("sendTracking", "orderDetails")}</span>
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
                  {t("paymentDetails", "orderDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("paymentMethod", "orderDetails")} •{" "}
                  {t("paymentStatus", "orderDetails")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {paymentMethod.icon}
                    <span className="ml-2 text-gray-700">
                      {t("paymentMethod", "orderDetails")}
                    </span>
                  </div>
                  <span className="font-medium">{paymentMethod.text}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t("transactionId", "orderDetails")}
                  </span>
                  <span className="text-sm font-medium">
                    {order.transactionId}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    {t("paymentStatus", "orderDetails")}
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
                    {t("currency", "orderDetails")}
                  </span>
                  <div className="flex items-center">
                    <DollarSign className="text-green-500 mr-1" size={16} />
                    <span className="font-medium">
                      {getCurrencyDisplay(order.currency)}
                    </span>
                    <span className="ml-1 text-sm text-gray-600">
                      ({order.currency})
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
          onClick={() => navigate("/orders")}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition flex items-center space-x-2"
        >
          <ArrowLeft size={20} />
          <span>{t("backToOrders", "orderDetails")}</span>
        </button>

        <div className="flex space-x-3">
          <button
            onClick={handlePrintInvoice}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <Printer size={20} />
            <span>{t("printInvoice", "orderDetails")}</span>
          </button>
          <button
            onClick={handleUpdateStatus}
            className="px-6 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <CheckCircle size={20} />
            <span>{t("updateStatus", "orderDetails")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
