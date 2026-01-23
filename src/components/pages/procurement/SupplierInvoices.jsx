import React, { useState, useEffect } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
  HeaderFilter,
  GroupPanel,
  LoadPanel,
} from "devextreme-react/data-grid";
import {
  FileText,
  Plus,
  Eye,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Hash,
  AlertTriangle,
} from "lucide-react";

const SupplierInvoices = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [supplierInvoices, setSupplierInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supplierNames, setSupplierNames] = useState({});
  const [loadingSuppliers, setLoadingSuppliers] = useState({});
  const [deleting, setDeleting] = useState(false); // ✅ حالة جديدة للحذف
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    unpaidInvoices: 0,
  });

  useEffect(() => {
    fetchSupplierInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSupplierName = async (supplierId) => {
    if (!supplierId || supplierNames[supplierId]) return;

    try {
      setLoadingSuppliers((prev) => ({ ...prev, [supplierId]: true }));

      const response = await api.get(`/suppliers/${supplierId}`);
      const supplierData = response.data?.data;

      if (supplierData?.name) {
        setSupplierNames((prev) => ({
          ...prev,
          [supplierId]: supplierData.name,
        }));
      }
    } catch (err) {
      console.error(`Error fetching supplier ${supplierId}:`, err);
      setSupplierNames((prev) => ({
        ...prev,
        [supplierId]: `Supplier #${supplierId}`,
      }));
    } finally {
      setLoadingSuppliers((prev) => ({ ...prev, [supplierId]: false }));
    }
  };

  const fetchSupplierInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      setSupplierNames({});

      const response = await api.get("/supplierinvoices");
      const invoices = response.data?.data || [];

      const formattedInvoices = invoices.map((invoice) => {
        let status = "unpaid";

        if (invoice.payment_status) {
          const statusLower = invoice.payment_status.toLowerCase();
          if (
            statusLower === "paid" ||
            statusLower === "unpaid" ||
            statusLower === "overdue"
          ) {
            status = statusLower;
          }
        }

        const supplierId = invoice.supplier_id;
        if (supplierId) {
          fetchSupplierName(supplierId);
        }

        return {
          id: invoice.id,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoice_number || `INV-${invoice.id}`,
          referenceId:
            invoice.supplier_order_id || `ORD-${invoice.supplier_order_id}`,
          supplierId: supplierId,
          date: invoice.invoice_date || "N/A",
          dueDate: invoice.due_date || "N/A",
          subtotal: parseFloat(invoice.subtotal) || 0,
          taxAmount: parseFloat(invoice.tax_amount) || 0,
          amount: parseFloat(invoice.total_amount) || 0,
          status: status,
          originalStatus: invoice.payment_status,
          currency: invoice.currency || "USD",
          notes: invoice.notes || "",
          orderId: invoice.supplier_order_id,
          createdDate: invoice.created_at?.split("T")[0] || "N/A",
          originalData: invoice,
        };
      });

      setSupplierInvoices(formattedInvoices);
      calculateStats(formattedInvoices);
    } catch (err) {
      console.error("Error fetching supplier invoices:", err);
      setError(
        t("failedToLoadInvoices", "procurement") ||
          "Failed to load supplier invoices",
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (invoices) => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidInvoices = invoices.filter((i) => i.status === "paid").length;
    const overdueInvoices = invoices.filter(
      (i) => i.status === "overdue",
    ).length;
    const unpaidInvoices = invoices.filter((i) => i.status === "unpaid").length;

    setStats({
      totalInvoices,
      totalAmount,
      paidInvoices,
      overdueInvoices,
      unpaidInvoices,
    });
  };

  const handleRefresh = () => {
    fetchSupplierInvoices();
  };

  const handleAddInvoice = () => {
    navigate("/procurement/supplier-invoices/add");
  };

  const handleViewInvoice = (id) => {
    navigate(`/procurement/supplier-invoices/${id}`);
  };

  // ✅ دالة حذف الفاتورة المعدلة
  const handleDeleteInvoice = async (id, invoiceNumber) => {
    if (
      window.confirm(
        `${t("confirmDeleteInvoice", "procurement") || "Are you sure you want to delete invoice"} #${invoiceNumber}?`,
      )
    ) {
      setDeleting(true);
      try {
        // ✅ استخدام endpoint الصحيح: POST بدلاً من DELETE
        const response = await api.post(`/deletesupplierinvoice/${id}`);

        if (response.status === 200 || response.status === 201) {
          // تحديث البيانات المحلية
          setSupplierInvoices((prev) =>
            prev.filter((invoice) => invoice.id !== id),
          );
          calculateStats(
            supplierInvoices.filter((invoice) => invoice.id !== id),
          );

          alert(
            `${t("invoiceDeletedSuccess", "procurement") || "Invoice deleted successfully"}: ${invoiceNumber}`,
          );
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (err) {
        console.error("Error deleting invoice:", err);

        let errorMessage =
          t("deleteInvoiceError", "procurement") || "Failed to delete invoice";

        if (err.response) {
          errorMessage += `: ${err.response.data?.message || err.response.statusText}`;
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
        } else if (err.request) {
          errorMessage += ": No response from server";
        } else {
          errorMessage += `: ${err.message}`;
        }

        alert(errorMessage);
      } finally {
        setDeleting(false);
      }
    }
  };

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={16} className="text-green-600" />;
      case "unpaid":
        return <Clock size={16} className="text-yellow-600" />;
      case "overdue":
        return <AlertTriangle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border border-green-200";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "paid":
        return t("paid", "procurement") || "Paid";
      case "unpaid":
        return t("unpaid", "procurement") || "Unpaid";
      case "overdue":
        return t("overdue", "procurement") || "Overdue";
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown";
    }
  };

  const idCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <Hash size={14} className="text-gray-400" />
        <span className="font-mono font-medium">{data.data.id}</span>
      </div>
    );
  };

  const supplierCellRender = (data) => {
    const supplierId = data.data.supplierId;
    const supplierName = supplierNames[supplierId];

    if (loadingSuppliers[supplierId]) {
      return (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          <span className="text-gray-500">Loading...</span>
        </div>
      );
    }

    return (
      <div className="font-medium text-gray-900">
        {supplierName || `Supplier #${supplierId}`}
      </div>
    );
  };

  const statusCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon(data.data.status)}
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            data.data.status,
          )}`}
        >
          {getStatusText(data.data.status)}
        </span>
      </div>
    );
  };

  const amountCellRender = (data) => {
    return (
      <div className="font-medium text-gray-900">
        {formatCurrency(data.data.amount, data.data.currency)}
      </div>
    );
  };

  const dateCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <Calendar size={14} className="text-gray-400" />
        <span>{data.data.date}</span>
      </div>
    );
  };

  const dueDateCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <Calendar size={14} className="text-gray-400" />
        <span>{data.data.dueDate}</span>
      </div>
    );
  };

  const invoiceCellRender = (data) => {
    return (
      <div>
        <div className="font-medium text-gray-900">
          {data.data.invoiceNumber}
        </div>
        <div className="text-sm text-gray-500">
          {t("order", "procurement") || "Order"}: {data.data.orderId}
        </div>
      </div>
    );
  };

  const currencyCellRender = (data) => {
    return (
      <div className="flex items-center space-x-1">
        <DollarSign size={14} className="text-gray-500" />
        <span className="font-medium">{data.data.currency}</span>
      </div>
    );
  };

  // ✅ خلية الإجراءات المعدلة (فقط العين والسلة)
  const actionCellRender = (data) => {
    return (
      <div className="flex items-center space-x-3">
        <button
          onClick={() => handleViewInvoice(data.data.id)}
          className="text-blue-600 hover:text-blue-800 transition"
          title={t("viewSupplierInvoice", "procurement") || "View Invoice"}
        >
          <Eye size={18} />
        </button>
        <button
          onClick={() =>
            handleDeleteInvoice(data.data.id, data.data.invoiceNumber)
          }
          disabled={deleting}
          className={`text-red-600 hover:text-red-800 transition ${deleting ? "opacity-50 cursor-not-allowed" : ""}`}
          title={t("delete", "common") || "Delete"}
        >
          {deleting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          ) : (
            <Trash2 size={18} />
          )}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {t("supplierInvoices", "navigation") || "Supplier Invoices"}
            </h1>
            <p className="text-gray-600">
              {t("loadingInvoices", "procurement") || "Loading invoices..."}
            </p>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-blue"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {t("supplierInvoices", "navigation") || "Supplier Invoices"}
            </h1>
            <p className="text-gray-600">
              {t("manageSupplierInvoices", "procurement") ||
                "Manage and track supplier invoices"}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>{t("refresh", "common") || "Refresh"}</span>
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoadingInvoices", "procurement") ||
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
    <div className="p-6 space-y-6">
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {t("supplierInvoices", "navigation") || "Supplier Invoices"}
            </h1>
            <p className="text-gray-600">
              {t("manageSupplierInvoices", "procurement") ||
                "Manage and track supplier invoices"}
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center space-x-2"
            >
              <RefreshCw size={20} />
              <span>{t("refresh", "common") || "Refresh"}</span>
            </button>
            <button
              onClick={handleAddInvoice}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>
                {t("addSupplierInvoice", "procurement") || "Add Invoice"}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {t("totalInvoices", "common") || "Total Invoices"}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalInvoices}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {t("totalAmount", "procurement") || "Total Amount"}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(stats.totalAmount, "USD")}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {t("paidInvoices", "common") || "Paid Invoices"}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.paidInvoices}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {t("overdueInvoices", "common") || "Overdue Invoices"}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.overdueInvoices}
                </p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {supplierInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {t("noInvoices", "procurement") || "No Invoices"}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("noInvoicesDescription", "procurement") ||
                "No supplier invoices found. Create your first invoice."}
            </p>
            <button
              onClick={handleAddInvoice}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2 mx-auto"
            >
              <Plus size={20} />
              <span>
                {t("createFirstInvoice", "procurement") ||
                  "Create First Invoice"}
              </span>
            </button>
          </div>
        ) : (
          <DataGrid
            dataSource={supplierInvoices}
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
            <LoadPanel enabled={false} />
            <HeaderFilter visible={true} />
            <SearchPanel
              visible={true}
              placeholder={
                t("searchInvoices", "procurement") || "Search invoices..."
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
            />

            <Column
              dataField="id"
              caption={t("id", "common") || "ID"}
              width="auto"
              alignment="left"
              allowGrouping={false}
              cellRender={idCellRender}
            />

            <Column
              dataField="invoiceNumber"
              caption={t("invoiceNumber", "procurement") || "Invoice No."}
              width="auto"
              alignment="left"
              allowGrouping={false}
              cellRender={invoiceCellRender}
            />

            <Column
              dataField="supplierId"
              caption={t("supplier", "procurement") || "Supplier"}
              width="auto"
              alignment="left"
              cellRender={supplierCellRender}
            />

            <Column
              dataField="date"
              caption={t("invoiceDate", "procurement") || "Invoice Date"}
              width="auto"
              alignment="left"
              cellRender={dateCellRender}
            />

            <Column
              dataField="dueDate"
              caption={t("dueDate", "procurement") || "Due Date"}
              width="auto"
              alignment="left"
              cellRender={dueDateCellRender}
            />

            <Column
              dataField="amount"
              caption={t("invoiceAmount", "procurement") || "Amount"}
              width="auto"
              alignment="left"
              allowGrouping={false}
              cellRender={amountCellRender}
            />

            <Column
              dataField="currency"
              caption={t("currency", "procurement") || "Currency"}
              width="auto"
              alignment="left"
              cellRender={currencyCellRender}
            />

            <Column
              dataField="status"
              caption={t("invoiceStatus", "procurement") || "Status"}
              width="auto"
              alignment="left"
              cellRender={statusCellRender}
            />

            <Column
              caption={t("actions", "common") || "Actions"}
              width="auto"
              alignment="left"
              cellRender={actionCellRender}
            />
          </DataGrid>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">
              {t("createNewInvoice", "procurement") || "Create New Invoice"}
            </h3>
            <p className="text-sm text-gray-600">
              {t("quicklyCreateNewInvoice", "procurement") ||
                "Quickly create a new supplier invoice"}
            </p>
          </div>
          <button
            onClick={handleAddInvoice}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Receipt size={18} />
            <span>
              {t("createNewInvoice", "procurement") || "Create Invoice"}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800">
            {t("invoiceStatistics", "procurement") || "Invoice Statistics"}
          </h3>
          <TrendingUp className="text-gray-500" size={20} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalInvoices}
            </div>
            <div className="text-sm text-gray-600">
              {t("total", "common") || "Total"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.paidInvoices}
            </div>
            <div className="text-sm text-gray-600">
              {t("paid", "procurement") || "Paid"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.unpaidInvoices}
            </div>
            <div className="text-sm text-gray-600">
              {t("unpaid", "procurement") || "Unpaid"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.overdueInvoices}
            </div>
            <div className="text-sm text-gray-600">
              {t("overdue", "procurement") || "Overdue"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {formatCurrency(stats.totalAmount, "USD")}
            </div>
            <div className="text-sm text-gray-600">
              {t("totalValue", "procurement") || "Total Value"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierInvoices;
