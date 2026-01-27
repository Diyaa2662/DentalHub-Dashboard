import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Tag,
  Percent,
  RefreshCw,
  Package,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [invoiceData, setInvoiceData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false); // ✅ حالة جديدة لتغيير الحالة
  const [error, setError] = useState(null);

  // ✅ جلب بيانات الفاتورة
  useEffect(() => {
    fetchInvoiceDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setInvoiceData(null);
      setOrderItems([]);
      setCustomerInfo(null);

      // 1. جلب معلومات الفاتورة
      const invoiceResponse = await api.get(`/invoices/${id}`);
      const invoice = invoiceResponse.data?.data || invoiceResponse.data;

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // ✅ تحليل حالة الدفع
      const today = new Date();
      const dueDate = new Date(invoice.due_date);
      const isOverdue = dueDate < today && invoice.payment_status === "unpaid";

      let paymentStatus = "pending";
      let statusText = "Pending";

      if (invoice.payment_status === "paid") {
        paymentStatus = "paid";
        statusText = "Paid";
      } else if (isOverdue) {
        paymentStatus = "overdue";
        statusText = "Overdue";
      } else if (invoice.payment_status === "unpaid") {
        paymentStatus = "pending";
        statusText = "Pending";
      }

      const formattedInvoice = {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number || `INV-${invoice.id}`,
        userId: invoice.user_id,
        orderId: invoice.order_id,
        subtotal: parseFloat(invoice.subtotal) || 0,
        taxAmount: parseFloat(invoice.tax_amount) || 0,
        discountAmount: parseFloat(invoice.discount_amount) || 0,
        totalAmount: parseFloat(invoice.total_amount) || 0,
        currency: invoice.currency || "USD",
        invoiceDate:
          invoice.invoice_date || invoice.created_at?.split("T")[0] || "",
        dueDate: invoice.due_date || "",
        paymentStatus: paymentStatus,
        statusText: statusText,
        originalPaymentStatus: invoice.payment_status,
        notes: invoice.notes || "",
        isOverdue: isOverdue,
        isPaid: paymentStatus === "paid",
        isPending: paymentStatus === "pending",
        // للعرض
        amount: parseFloat(invoice.total_amount) || 0,
        date: invoice.invoice_date || invoice.created_at?.split("T")[0] || "",
        status: statusText,
      };

      setInvoiceData(formattedInvoice);

      // 2. إذا كان هناك order_id، جلب المنتجات
      if (invoice.order_id) {
        fetchOrderItems(invoice.order_id);
      } else {
        setOrderItems([]);
      }

      // 3. جلب معلومات الزبون
      if (invoice.user_id) {
        fetchCustomerInfo(invoice.user_id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching invoice details:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load invoice details",
      );
      setLoading(false);
    }
  };

  // ✅ جلب منتجات الطلب
  const fetchOrderItems = async (orderId) => {
    try {
      setLoadingOrder(true);

      const response = await api.get(`/customerorders/${orderId}`);
      const orderData = response.data;

      if (orderData.products && Array.isArray(orderData.products)) {
        const items = orderData.products.map((product) => {
          const pivot = product.pivot || {};
          const subtotal = parseFloat(pivot.subtotal) || 0;
          const discountAmount = parseFloat(pivot.discount_amount) || 0;
          const taxAmount = parseFloat(pivot.tax_amount) || 0;
          const finalPrice = subtotal - discountAmount + taxAmount;

          return {
            id: product.id,
            name: product.name || `Product ${product.id}`,
            description: product.description || "",
            sku: product.sku || `SKU-${product.id}`,
            quantity: pivot.quantity || 1,
            unitPrice:
              parseFloat(pivot.unit_price) || parseFloat(product.price) || 0,
            total: finalPrice,
            subtotal: subtotal,
            discountAmount: discountAmount,
            taxAmount: taxAmount,
          };
        });

        setOrderItems(items);
      } else {
        setOrderItems([]);
      }
    } catch (err) {
      console.error("Error fetching order items:", err);
      setOrderItems([]);
    } finally {
      setLoadingOrder(false);
    }
  };

  // ✅ جلب معلومات الزبون
  const fetchCustomerInfo = async (userId) => {
    try {
      setLoadingCustomer(true);

      const response = await api.get(`/users/${userId}`);
      const customerData =
        response.data?.user || response.data?.data || response.data;

      if (customerData) {
        setCustomerInfo({
          name: customerData.name || `Customer #${userId}`,
          email: customerData.email || "",
          phone: customerData.phone || "",
          address: customerData.address || "",
        });
      } else {
        setCustomerInfo({
          name: `Customer #${userId}`,
          email: "",
          phone: "",
          address: "",
        });
      }
    } catch (err) {
      console.error("Error fetching customer info:", err);
      setCustomerInfo({
        name: `Customer #${userId}`,
        email: "",
        phone: "",
        address: "",
      });
    } finally {
      setLoadingCustomer(false);
      setLoading(false);
    }
  };

  // ✅ دالة تغيير حالة الفاتورة
  const handleChangeInvoiceStatus = async (newStatus) => {
    if (!invoiceData || changingStatus) return;

    if (
      window.confirm(
        `${t("changeInvoiceStatusConfirmation", "invoices") || "Are you sure you want to change invoice status to"} ${newStatus}?`,
      )
    ) {
      setChangingStatus(true);
      try {
        const response = await api.post(
          `/changestatusinvoice/${invoiceData.id}`,
          {
            payment_status: newStatus,
          },
        );

        if (response.status === 200 || response.status === 201) {
          // تحديث حالة الفاتورة محلياً
          const updatedInvoice = {
            ...invoiceData,
            paymentStatus: newStatus === "paid" ? "paid" : "unpaid",
            statusText: newStatus === "paid" ? "Paid" : "Pending",
            originalPaymentStatus: newStatus,
            isPaid: newStatus === "paid",
            isPending: newStatus === "unpaid",
          };

          setInvoiceData(updatedInvoice);

          // إعادة تحميل البيانات من الخادم
          setTimeout(() => {
            fetchInvoiceDetails();
          }, 500);

          alert(
            t("invoiceStatusUpdated", "invoices") ||
              `Invoice status successfully updated to ${newStatus === "paid" ? "Paid" : "Pending"}`,
          );
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (err) {
        console.error("Error changing invoice status:", err);

        let errorMessage =
          t("failedToChangeInvoiceStatus", "invoices") ||
          "Failed to change invoice status";

        if (err.response) {
          errorMessage += `: ${err.response.data?.message || err.response.statusText}`;
        } else if (err.request) {
          errorMessage += ": No response from server";
        } else {
          errorMessage += `: ${err.message}`;
        }

        alert(errorMessage);
      } finally {
        setChangingStatus(false);
      }
    }
  };

  // ✅ الحصول على إعدادات الحالة
  const getStatusConfig = (status) => {
    const configs = {
      paid: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle size={16} />,
        text: t("paid", "invoices") || "Paid",
        buttonColor: "bg-green-600 hover:bg-green-700",
        buttonText: t("paid", "invoices") || "Paid",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock size={16} />,
        text: t("pending", "common") || "Pending",
        buttonColor: "bg-yellow-600 hover:bg-yellow-700",
        buttonText: t("pending", "common") || "Pending",
      },
      overdue: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertCircle size={16} />,
        text: t("overdue", "invoices") || "Overdue",
        buttonColor: "bg-red-600 hover:bg-red-700",
        buttonText: t("overdue", "invoices") || "Overdue",
      },
    };
    return configs[status] || configs.pending;
  };

  const handleBack = () => {
    navigate("/invoices");
  };

  const handleRefresh = () => {
    fetchInvoiceDetails();
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

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
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
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("invoiceDetails", "invoices") || "Invoice Details"}
            </h1>
            <p className="text-gray-600">
              {t("loading", "common") || "Loading..."}
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto mb-4"></div>
            <p className="text-gray-600">
              {t("loadingInvoice", "invoices") || "Loading invoice details..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error || !invoiceData) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("invoiceDetails", "invoices") || "Invoice Details"}
            </h1>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoadingInvoice", "invoices") ||
                  "Error Loading Invoice"}
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              {t("backToInvoices", "invoices") || "Back to Invoices"}
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

  const statusConfig = getStatusConfig(invoiceData.paymentStatus);

  return (
    <div className="space-y-6 p-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title={t("back", "common") || "Back"}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("invoiceDetails", "invoices") || "Invoice Details"}
            </h1>
            <p className="text-gray-600">
              {t("invoice", "invoices")} #{invoiceData.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="flex space-x-3 mt-4 md:mt-0">
          <div
            className={`flex items-center px-4 py-2 rounded-full border ${statusConfig.color}`}
          >
            {statusConfig.icon}
            <span className="ml-2 font-medium">{statusConfig.text}</span>
          </div>

          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
            title={t("refresh", "common") || "Refresh"}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {t("invoiceInformation", "invoices") || "Invoice Information"}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FileText size={16} className="mr-2" />
                    <span>{invoiceData.invoiceNumber}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span>{formatDate(invoiceData.date)}</span>
                  </div>
                  {invoiceData.orderId && (
                    <div className="flex items-center">
                      <ShoppingCart size={16} className="mr-2" />
                      <span>Order: {invoiceData.orderId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">
                  {formatCurrency(
                    invoiceData.totalAmount,
                    invoiceData.currency,
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {invoiceData.currency}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {t("customerInformation", "invoices") || "Customer Information"}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {loadingCustomer ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-dental-blue"></div>
                  </div>
                ) : customerInfo ? (
                  <>
                    <div className="flex items-start mb-3">
                      <User size={20} className="text-gray-400 mr-3 mt-1" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {customerInfo.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t("customer", "invoices") || "Customer"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customerInfo.email && (
                        <div className="flex items-center">
                          <Mail size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {customerInfo.email}
                          </span>
                        </div>
                      )}

                      {customerInfo.phone && (
                        <div className="flex items-center">
                          <Phone size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {customerInfo.phone}
                          </span>
                        </div>
                      )}

                      {customerInfo.address && (
                        <div className="md:col-span-2 flex items-start">
                          <MapPin
                            size={16}
                            className="text-gray-400 mr-2 mt-1"
                          />
                          <span className="text-sm text-gray-600 whitespace-pre-line">
                            {customerInfo.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <User size={24} className="mx-auto mb-2" />
                    <p>
                      {t("noCustomerInfo", "invoices") ||
                        "No customer information available"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  {t("items", "products") || "Items"}
                </h3>
                {invoiceData.orderId && (
                  <span className="text-xs text-gray-500">
                    From Order #{invoiceData.orderId}
                  </span>
                )}
              </div>

              {loadingOrder ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-blue"></div>
                </div>
              ) : orderItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          {t("description", "products") || "Description"}
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                          {t("quantity", "inventory") || "Quantity"}
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                          {t("unitPrice", "invoices") || "Unit Price"}
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                          {t("total", "customers") || "Total"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-800">
                                {item.name}
                              </p>
                              {item.description && (
                                <p className="text-sm text-gray-600">
                                  {item.description}
                                </p>
                              )}
                              {item.sku && (
                                <p className="text-xs text-gray-500">
                                  SKU: {item.sku}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="font-medium">{item.quantity}</span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="font-medium">
                              {formatCurrency(
                                item.unitPrice,
                                invoiceData.currency,
                              )}
                            </span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="font-bold text-gray-800">
                              {formatCurrency(item.total, invoiceData.currency)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                  <Package className="text-gray-400 mx-auto mb-4" size={48} />
                  <p className="text-gray-600">
                    {invoiceData.orderId
                      ? t("noItemsInOrder", "orders") ||
                        "No items found in this order"
                      : t("noOrderAssociated", "invoices") ||
                        "No order associated with this invoice"}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            {invoiceData.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  {t("notes", "common") || "Notes"}
                </h3>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">
                    {invoiceData.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary and Dates */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("summary", "invoices") || "invoices"}
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {t("subtotal", "invoices") || "Subtotal"}
                </span>
                <span className="font-medium">
                  {formatCurrency(invoiceData.subtotal, invoiceData.currency)}
                </span>
              </div>

              {invoiceData.discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Tag size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {t("discount", "invoices") || "Discount"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-red-600">
                      -
                      {formatCurrency(
                        invoiceData.discountAmount,
                        invoiceData.currency,
                      )}
                    </span>
                  </div>
                </div>
              )}

              {invoiceData.taxAmount > 0 && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Percent size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {t("tax", "products") || "Tax"}
                    </span>
                  </div>
                  <span className="font-medium text-green-600">
                    +
                    {formatCurrency(
                      invoiceData.taxAmount,
                      invoiceData.currency,
                    )}
                  </span>
                </div>
              )}

              <hr className="my-4" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">
                  {t("total", "customers") || "Total"}
                </span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {formatCurrency(
                      invoiceData.totalAmount,
                      invoiceData.currency,
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {invoiceData.currency}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dates Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("dates", "invoices") || "Dates"}
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Calendar size={16} className="mr-2" />
                  <span>{t("invoiceDate", "invoices") || "Invoice Date"}</span>
                </div>
                <p className="font-medium text-gray-800">
                  {formatDate(invoiceData.invoiceDate)}
                </p>
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Calendar size={16} className="mr-2" />
                  <span>{t("dueDate", "invoices") || "Due Date"}</span>
                </div>
                <p
                  className={`font-medium ${
                    invoiceData.isOverdue ? "text-red-600" : "text-gray-800"
                  }`}
                >
                  {formatDate(invoiceData.dueDate)}
                </p>
                {invoiceData.isOverdue && (
                  <div className="flex items-center mt-1">
                    <AlertTriangle size={14} className="text-red-500 mr-1" />
                    <p className="text-sm text-red-600">
                      {t("overdue", "invoices") || "Overdue"}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <DollarSign size={16} className="mr-2" />
                  <span>{t("amount", "common") || "Amount"}</span>
                </div>
                <p className="font-medium text-gray-800">
                  {formatCurrency(
                    invoiceData.totalAmount,
                    invoiceData.currency,
                  )}
                </p>
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <FileText size={16} className="mr-2" />
                  <span>{t("currency", "invoices") || "Currency"}</span>
                </div>
                <p className="font-medium text-gray-800">
                  {invoiceData.currency}
                </p>
              </div>
            </div>
          </div>

          {/* ✅ تغيير حالة الفاتورة - بدلاً من Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("changeInvoiceStatus", "invoices") || "Change Invoice Status"}
            </h3>

            <div className="space-y-3">
              {/* زر Mark as Paid - يظهر فقط إذا لم تكن الحالة Paid */}
              {!invoiceData.isPaid && (
                <button
                  onClick={() => handleChangeInvoiceStatus("paid")}
                  disabled={changingStatus}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${
                    changingStatus
                      ? "bg-green-200 text-green-800 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {changingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>
                        {t("changingStatus", "invoices") ||
                          "Changing status..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>
                        {t("markAsPaid", "invoices") || "Mark as Paid"}
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* زر Mark as Unpaid - يظهر فقط إذا كانت الحالة Paid */}
              {invoiceData.isPaid && (
                <button
                  onClick={() => handleChangeInvoiceStatus("unpaid")}
                  disabled={changingStatus}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${
                    changingStatus
                      ? "bg-yellow-200 text-yellow-800 cursor-not-allowed"
                      : "bg-yellow-600 text-white hover:bg-yellow-700"
                  }`}
                >
                  {changingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>
                        {t("changingStatus", "invoices") ||
                          "Changing status..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock size={20} />
                      <span>
                        {t("markAsUnpaid", "invoices") || "Mark as Unpaid"}
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* رسالة مساعدة */}
              <p className="text-xs text-gray-500 text-center">
                {invoiceData.isPaid
                  ? t("invoicePaidHelp", "invoices") ||
                    "Invoice is marked as paid. You can change it to unpaid if needed."
                  : t("invoiceUnpaidHelp", "invoices") ||
                    "Invoice is currently unpaid. Mark it as paid when payment is received."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
