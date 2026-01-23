import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
  HeaderFilter,
  GroupPanel,
} from "devextreme-react/data-grid";
import {
  FileText,
  Eye,
  Plus,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

const Invoices = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [invoicesData, setInvoicesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
  });

  // ✅ جلب بيانات الفواتير من API
  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/invoices");
      const apiData = response.data?.data;


      if (Array.isArray(apiData)) {
        if (apiData.length === 0) {
          // لا يوجد فواتير
          setInvoicesData([]);
          setStats({
            total: 0,
            totalAmount: 0,
            paid: 0,
            pending: 0,
            overdue: 0,
          });
        } else {
          // تحويل البيانات للتنسيق المناسب
          const formattedData = await Promise.all(
            apiData.map(async (invoice) => {
              // ✅ محاولة جلب اسم الزبون إذا كان user_id موجود
              let customerName = `Customer #${invoice.user_id}`;

              if (invoice.user_id) {
                try {
                  const customerResponse = await api.get(
                    `/users/${invoice.user_id}`,
                  );
                  const customerData =
                    customerResponse.data?.user ||
                    customerResponse.data?.data ||
                    customerResponse.data;
                  if (customerData?.name) {
                    customerName = customerData.name;
                  }
                } catch (err) {
                  console.warn(
                    `⚠️ Could not fetch customer name for user ${invoice.user_id}:`,
                    err.message,
                  );
                }
              }

              // ✅ حساب التواريخ
              const today = new Date();
              const dueDate = new Date(invoice.due_date);
              const isOverdue =
                dueDate < today && invoice.payment_status === "unpaid";

              // ✅ تحديد حالة الدفع
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

              return {
                id: invoice.id,
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoice_number || `INV-${invoice.id}`,
                orderId: invoice.order_id,
                customerId: invoice.user_id,
                customer: customerName,
                subtotal: parseFloat(invoice.subtotal) || 0,
                taxAmount: parseFloat(invoice.tax_amount) || 0,
                discountAmount: parseFloat(invoice.discount_amount) || 0,
                totalAmount: parseFloat(invoice.total_amount) || 0,
                currency: invoice.currency || "USD",
                invoiceDate:
                  invoice.invoice_date ||
                  invoice.created_at?.split("T")[0] ||
                  "",
                dueDate: invoice.due_date || "",
                paymentStatus: paymentStatus,
                statusText: statusText,
                originalPaymentStatus: invoice.payment_status,
                notes: invoice.notes || "",
                isOverdue: isOverdue,
                isPaid: paymentStatus === "paid",
                isPending: paymentStatus === "pending",
                // ✅ إضافة للعرض
                amount: parseFloat(invoice.total_amount) || 0,
                date:
                  invoice.invoice_date ||
                  invoice.created_at?.split("T")[0] ||
                  "",
                status: statusText,
              };
            }),
          );

          setInvoicesData(formattedData);
          calculateStats(formattedData);
        }
      } else {
        setError(
          t("invalidDataFormat", "invoices") ||
            "No invoice data found or invalid data format",
        );
        setInvoicesData([]);
        setStats({
          total: 0,
          totalAmount: 0,
          paid: 0,
          pending: 0,
          overdue: 0,
        });
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("failedToLoadInvoices", "invoices") ||
          "Failed to load invoices",
      );
      setInvoicesData([]);
      setStats({
        total: 0,
        totalAmount: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ حساب الإحصائيات من البيانات الحقيقية
  const calculateStats = (data) => {
    const total = data.length;
    const totalAmount = data.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paid = data.filter((inv) => inv.paymentStatus === "paid").length;
    const pending = data.filter(
      (inv) => inv.paymentStatus === "pending",
    ).length;
    const overdue = data.filter(
      (inv) => inv.paymentStatus === "overdue",
    ).length;

    setStats({
      total,
      totalAmount,
      paid,
      pending,
      overdue,
    });
  };

  const handleRefresh = () => {
    fetchInvoices();
  };

  const handleViewInvoice = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleDeleteInvoice = async (invoiceId, invoiceNumber) => {
    if (
      window.confirm(
        `${t("confirmDeleteInvoice", "invoices") || "Delete invoice"} #${invoiceNumber}?`,
      )
    ) {
      try {
        await api.post(`/deleteinvoice/${invoiceId}`);

        // تحديث البيانات المحلية
        setInvoicesData((prev) =>
          prev.filter((invoice) => invoice.id !== invoiceId),
        );
        calculateStats(
          invoicesData.filter((invoice) => invoice.id !== invoiceId),
        );

        alert(
          `${t("invoiceDeleted", "invoices") || "Invoice deleted"}: ${invoiceNumber}`,
        );
      } catch (err) {
        console.error("Error deleting invoice:", err);
        alert(
          t("failedToDeleteInvoice", "invoices") ||
            "Failed to delete invoice: " +
              (err.response?.data?.message || err.message),
        );
      }
    }
  };

  const handleCreateInvoice = () => {
    // سيتم ربطه لاحقاً
    alert(
      t("createInvoiceMessage", "invoices") || "Create invoice functionality",
    );
  };

  // ✅ تنسيق المبلغ
  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // ✅ الحصول على لون حالة الدفع
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // ✅ الحصول على أيقونة حالة الدفع
  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={12} />;
      case "pending":
        return <Clock size={12} />;
      case "overdue":
        return <AlertTriangle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  // ✅ الحصول على نص حالة الدفع
  const getPaymentStatusText = (status) => {
    switch (status) {
      case "paid":
        return t("paid", "invoices") || "Paid";
      case "pending":
        return t("pending", "common") || "Pending";
      case "overdue":
        return t("overdue", "invoices") || "Overdue";
      default:
        return status;
    }
  };

  // ✅ عرض خلية المبلغ
  const amountCellRender = (data) => {
    return (
      <div className="font-medium text-gray-800">
        {formatCurrency(data.data.totalAmount, data.data.currency)}
      </div>
    );
  };

  // ✅ عرض خلية رقم الفاتورة
  const invoiceNumberCellRender = (data) => {
    return (
      <div className="font-medium text-gray-900">{data.data.invoiceNumber}</div>
    );
  };

  // ✅ عرض خلية حالة الدفع
  const statusCellRender = (data) => {
    return (
      <div
        className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
          data.data.paymentStatus,
        )}`}
      >
        {getPaymentStatusIcon(data.data.paymentStatus)}
        <span className="ml-1">
          {getPaymentStatusText(data.data.paymentStatus)}
        </span>
      </div>
    );
  };

  // ✅ عرض خلية تاريخ الاستحقاق
  const dueDateCellRender = (data) => {
    const isOverdue = data.data.paymentStatus === "overdue";
    return (
      <div className={`${isOverdue ? "text-red-600 font-medium" : ""}`}>
        {data.data.dueDate}
        {isOverdue && (
          <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
            Overdue
          </span>
        )}
      </div>
    );
  };

  // ✅ عرض خلية الإجراءات (فقط العين والسلة)
  const actionCellRender = (data) => {
    return (
      <div className="flex space-x-2 justify-center">
        <button
          onClick={() => handleViewInvoice(data.data.id)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
          title={t("view", "common") || "View"}
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() =>
            handleDeleteInvoice(data.data.id, data.data.invoiceNumber)
          }
          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
          title={t("delete", "common") || "Delete"}
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("invoicesManagement", "invoices")}
            </h1>
            <p className="text-gray-600">
              {t("customerInvoices", "invoices") || "Manage Customer Invoices"}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2 mt-4 md:mt-0"
            disabled
          >
            <RefreshCw size={18} className="animate-spin" />
            <span>{t("loading", "common") || "Loading..."}</span>
          </button>
        </div>

        {/* كروت الإحصائيات أثناء التحميل */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto mb-4"></div>
            <p className="text-gray-600">
              {t("loadingInvoices", "invoices") || "Loading invoices..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("invoicesManagement", "invoices")}
            </h1>
            <p className="text-gray-600">
              {t("customerInvoices", "invoices") || "Manage Customer Invoices"}
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoadingInvoices", "invoices") ||
                  "Error Loading Invoices"}
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition flex items-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>{t("tryAgain", "common") || "Try Again"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("invoicesManagement", "invoices")}
          </h1>
          <p className="text-gray-600">
            {t("customerInvoices", "invoices") || "Manage Customer Invoices"}
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
            title={t("refresh", "common") || "Refresh"}
          >
            <RefreshCw size={20} />
            <span>{t("refresh", "common") || "Refresh"}</span>
          </button>
          <button
            onClick={handleCreateInvoice}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t("createInvoice", "invoices")}</span>
          </button>
        </div>
      </div>

      {/* Invoice Stats Cards - إحصائيات حقيقية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Invoices */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalInvoices", "invoices")}
              </p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="text-dental-blue" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {t("allInvoices", "invoices") || "All invoices"}
          </p>
        </div>

        {/* Total Amount */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalAmount", "invoices")}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(stats.totalAmount, "USD")}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {t("totalRevenue", "invoices") || "Total revenue"}
          </p>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("pendingInvoices", "invoices")}
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {t("requiresAttention", "orders") || "Requires attention"}
          </p>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("paidInvoices", "invoices")}
              </p>
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {t("collected", "invoices") || "Successfully collected"}
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {invoicesData.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {t("noInvoicesYet", "invoices") || "No Invoices Yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("startByCreatingInvoices", "invoices") ||
                  "Start by creating invoices for your customers"}
              </p>
              <button
                onClick={handleCreateInvoice}
                className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
              >
                {t("createFirstInvoice", "invoices") || "Create First Invoice"}
              </button>
            </div>
          ) : (
            <DataGrid
              dataSource={invoicesData}
              showBorders={true}
              columnAutoWidth={true}
              height={500}
              allowColumnResizing={true}
              allowColumnReordering={true}
              columnResizingMode="widget"
              showColumnLines={true}
              showRowLines={true}
              rowAlternationEnabled={true}
            >
              <HeaderFilter visible={true} />
              <SearchPanel
                visible={true}
                placeholder={
                  t("searchInvoices", "invoices") || "Search invoices..."
                }
              />
              <GroupPanel
                visible={true}
                emptyPanelText={
                  t("dragColumnHereToGroup", "products") ||
                  "Drag a column header here to group by that column"
                }
                allowColumnDragging={true}
              />
              <Paging defaultPageSize={10} />
              <Pager
                showPageSizeSelector={true}
                allowedPageSizes={[5, 10, 20]}
                showInfo={true}
                showNavigationButtons={true}
              />

              {/* ✅ عمود ID - أضيف أولاً */}
              <Column
                dataField="id"
                caption={t("id", "orders") || "ID"}
                width={70}
                alignment="left"
                allowHeaderFiltering={true}
                allowFiltering={true}
                sortOrder="asc"
                cellRender={({ data }) => (
                  <div className="font-mono font-medium text-gray-800">
                    {data.id}
                  </div>
                )}
              />

              {/* Invoice Number */}
              <Column
                dataField="invoiceNumber"
                caption={t("invoiceNumber", "invoices") || "Invoice #"}
                width={"auto"}
                alignment="left"
                allowHeaderFiltering={true}
                allowFiltering={true}
                cellRender={invoiceNumberCellRender}
              />

              {/* Customer */}
              <Column
                dataField="customer"
                caption={t("customer", "invoices") || "Customer"}
                width={"auto"}
                alignment="left"
                allowHeaderFiltering={true}
                allowFiltering={true}
              />

              {/* Order ID */}
              <Column
                dataField="orderId"
                caption={t("orderId", "invoices") || "Order ID"}
                width={"auto"}
                alignment="left"
                allowHeaderFiltering={true}
                allowFiltering={true}
              />

              {/* Total Amount */}
              <Column
                dataField="totalAmount"
                caption={t("totalAmount", "invoices") || "Total Amount"}
                width={"auto"}
                alignment="left"
                dataType="number"
                format="currency"
                allowHeaderFiltering={true}
                allowFiltering={true}
                filterOperations={["=", "<", ">", "<=", ">=", "between"]}
                cellRender={amountCellRender}
              />

              {/* Invoice Date */}
              <Column
                dataField="invoiceDate"
                caption={t("invoiceDate", "invoices") || "Invoice Date"}
                width={"auto"}
                alignment="left"
                dataType="date"
                format="yyyy-MM-dd"
                allowHeaderFiltering={true}
                allowFiltering={true}
                filterOperations={["=", "<", ">", "<=", ">=", "between"]}
              />

              {/* Due Date */}
              <Column
                dataField="dueDate"
                caption={t("dueDate", "invoices") || "Due Date"}
                width={"auto"}
                alignment="left"
                dataType="date"
                format="yyyy-MM-dd"
                allowHeaderFiltering={true}
                allowFiltering={true}
                filterOperations={["=", "<", ">", "<=", ">=", "between"]}
                cellRender={dueDateCellRender}
              />

              {/* Payment Status */}
              <Column
                dataField="paymentStatus"
                caption={t("paymentStatus", "invoices") || "Payment Status"}
                width={"auto"}
                alignment="left"
                allowHeaderFiltering={true}
                allowFiltering={true}
                allowGrouping={true}
                cellRender={statusCellRender}
              />

              {/* Actions */}
              <Column
                caption={t("actions", "products") || "Actions"}
                width={"auto"}
                alignment="left"
                allowFiltering={false}
                allowHeaderFiltering={false}
                cellRender={actionCellRender}
              />
            </DataGrid>
          )}
        </div>
      </div>

      {/* ✅ ملاحظة: تم حذف قسم Upcoming Due Dates كما طلبت */}
    </div>
  );
};

export default Invoices;
