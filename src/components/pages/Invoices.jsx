import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
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
  Download,
  Eye,
  Printer,
  Plus,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";

const Invoices = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const { t } = useLanguage();
  const navigate = useNavigate();

  // بيانات وهمية لفواتير الزبائن فقط
  const customerInvoices = [
    {
      id: "INV-CUST-001",
      customer: "Dr. Sarah Johnson",
      amount: "$850.00",
      total: "$935.00",
      date: "2024-01-16",
      dueDate: "2024-02-16",
      status: "Paid",
    },
    {
      id: "INV-CUST-002",
      customer: "Dr. Michael Chen",
      amount: "$2,800.00",
      total: "$3,080.00",
      date: "2024-01-14",
      dueDate: "2024-02-14",
      status: "Pending",
    },
    {
      id: "INV-CUST-003",
      customer: "Dr. Emily Williams",
      amount: "$320.00",
      total: "$352.00",
      date: "2024-01-14",
      dueDate: "2024-02-14",
      status: "Paid",
    },
    {
      id: "INV-CUST-004",
      customer: "Dr. Robert Kim",
      amount: "$1,250.00",
      total: "$1,375.00",
      date: "2024-01-12",
      dueDate: "2024-02-12",
      status: "Pending",
    },
    {
      id: "INV-CUST-005",
      customer: "Dr. Lisa Martinez",
      amount: "$3,450.00",
      total: "$3,795.00",
      date: "2024-01-11",
      dueDate: "2024-02-11",
      status: "Overdue",
    },
    {
      id: "INV-CUST-006",
      customer: "Dr. Ahmed Hassan",
      amount: "$1,800.00",
      total: "$1,980.00",
      date: "2024-01-10",
      dueDate: "2024-02-10",
      status: "Paid",
    },
    {
      id: "INV-CUST-007",
      customer: "Dr. Maria Garcia",
      amount: "$920.00",
      total: "$1,012.00",
      date: "2024-01-09",
      dueDate: "2024-02-09",
      status: "Pending",
    },
    {
      id: "INV-CUST-008",
      customer: "Dr. James Wilson",
      amount: "$2,150.00",
      total: "$2,365.00",
      date: "2024-01-08",
      dueDate: "2024-02-08",
      status: "Paid",
    },
  ];

  // إحصائيات الفواتير
  const invoiceStats = {
    total: customerInvoices.length,
    totalAmount: customerInvoices.reduce(
      (sum, inv) =>
        sum + parseFloat(inv.amount.replace("$", "").replace(",", "")),
      0
    ),
    pending: customerInvoices.filter((inv) => inv.status === "Pending").length,
    overdue: customerInvoices.filter((inv) => inv.status === "Overdue").length,
    paid: customerInvoices.filter((inv) => inv.status === "Paid").length,
  };

  const handlePrintInvoice = (invoiceId) => {
    alert(`${t("printingInvoice", "invoices")} ${invoiceId}`);
  };

  // eslint-disable-next-line no-unused-vars
  const handleDownloadInvoice = (invoiceId) => {
    alert(`${t("downloadingInvoice", "invoices")} ${invoiceId}`);
  };

  const handleViewInvoice = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId) => {
    alert(`${t("editingInvoice", "invoices")} ${invoiceId}`);
  };

  const handleDeleteInvoice = (invoiceId) => {
    if (
      window.confirm(`${t("confirmDeleteInvoice", "invoices")} ${invoiceId}?`)
    ) {
      alert(`${t("deletingInvoice", "invoices")} ${invoiceId}`);
    }
  };

  const handleCreateInvoice = () => {
    alert(t("createInvoiceMessage", "invoices"));
  };

  const handlePrintSelected = () => {
    if (selectedRows.length === 0) {
      alert(t("noInvoicesSelected", "invoices"));
      return;
    }
    alert(
      `${t("printingSelected", "invoices")} ${selectedRows.length} ${t(
        "invoices",
        "navigation"
      ).toLowerCase()}`
    );
  };

  return (
    <div className="space-y-6">
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
            onClick={handlePrintSelected}
            disabled={selectedRows.length === 0}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
              selectedRows.length === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Printer size={20} />
            <span>{t("printSelected", "invoices")}</span>
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

      {/* Invoice Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalInvoices", "invoices")}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {invoiceStats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="text-dental-blue" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            +12% {t("fromLastMonth", "orders")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalAmount", "invoices")}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                $
                {invoiceStats.totalAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            +18% {t("fromLastMonth", "orders")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("pendingInvoices", "invoices")}
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {invoiceStats.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">
            {t("requiresAttention", "orders")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("paidInvoices", "invoices")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {invoiceStats.paid}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            {t("collected", "invoices") || "Successfully collected"}
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <DataGrid
            dataSource={customerInvoices}
            showBorders={true}
            columnAutoWidth={true}
            height={500}
            selection={{ mode: "multiple" }}
            onSelectionChanged={(e) => setSelectedRows(e.selectedRowsData)}
            allowColumnResizing={true}
            allowColumnReordering={true}
            columnResizingMode="widget"
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
            />

            {/* Invoice Number */}
            <Column
              dataField="id"
              caption={t("invoiceNumber", "invoices") || "Invoice #"}
              width={"auto"}
              alignment="left"
              allowGrouping={false}
            />

            {/* Customer */}
            <Column
              dataField="customer"
              caption={t("customer", "invoices") || "Customer"}
              width={"auto"}
              alignment="left"
            />

            {/* Total Amount */}
            <Column
              dataField="total"
              caption={t("totalAmount", "invoices") || "Total Amount"}
              width={"auto"}
              alignment="left"
              allowGrouping={false}
              cellRender={({ data }) => (
                <div className="font-bold text-gray-800">{data.total}</div>
              )}
            />

            {/* Date */}
            <Column
              dataField="date"
              caption={t("date", "orders") || "Date"}
              width={"auto"}
              alignment="left"
            />

            {/* Due Date */}
            <Column
              dataField="dueDate"
              caption={t("dueDate", "invoices") || "Due Date"}
              width={"auto"}
              alignment="left"
              cellRender={({ data }) => (
                <div
                  className={`${
                    data.status === "Overdue" ? "text-red-600 font-medium" : ""
                  }`}
                >
                  {data.dueDate}
                </div>
              )}
            />

            {/* Payment Status */}
            <Column
              dataField="status"
              caption={t("paymentStatus", "invoices") || "Payment Status"}
              width={"auto"}
              alignment="left"
              cellRender={({ data }) => {
                const statusConfig = {
                  Paid: {
                    color: "bg-green-100 text-green-800",
                    icon: <CheckCircle size={12} />,
                    text: t("paid", "invoices") || "Paid",
                  },
                  Pending: {
                    color: "bg-yellow-100 text-yellow-800",
                    icon: <Clock size={12} />,
                    text: t("pending", "common") || "Pending",
                  },
                  Overdue: {
                    color: "bg-red-100 text-red-800",
                    icon: <AlertCircle size={12} />,
                    text: t("overdue", "invoices") || "Overdue",
                  },
                };

                const config = statusConfig[data.status] || {
                  color: "bg-gray-100 text-gray-800",
                  text: data.status,
                };

                return (
                  <div
                    className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
                  >
                    {config.icon}
                    <span className="ml-1">{config.text}</span>
                  </div>
                );
              }}
            />

            {/* Actions */}
            <Column
              caption={t("actions", "products") || "Actions"}
              width={"auto"}
              alignment="left"
              cellRender={({ data }) => (
                <div className="flex space-x-2 justify-center">
                  <button
                    onClick={() => handleViewInvoice(data.id)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                    title={t("view", "common") || "View"}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEditInvoice(data.id)}
                    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition"
                    title={t("edit", "common") || "Edit"}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handlePrintInvoice(data.id)}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition"
                    title={t("print", "common") || "Print"}
                  >
                    <Printer size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteInvoice(data.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                    title={t("delete", "common") || "Delete"}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            />
          </DataGrid>
        </div>
      </div>

      {/* Upcoming Due Dates */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("upcomingDueDates", "invoices") || "Upcoming Due Dates"}
            </h3>
            <p className="text-sm text-gray-600">
              {t("invoicesDueSoon", "invoices") ||
                "Invoices due in the next 30 days"}
            </p>
          </div>
          <Calendar className="text-dental-teal" size={24} />
        </div>

        <div className="space-y-3">
          {customerInvoices
            .filter(
              (invoice) =>
                invoice.status === "Pending" || invoice.status === "Overdue"
            )
            .slice(0, 5)
            .map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      invoice.status === "Overdue"
                        ? "bg-red-100"
                        : "bg-yellow-100"
                    }`}
                  >
                    <User
                      className={
                        invoice.status === "Overdue"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }
                      size={20}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {invoice.id} - {invoice.customer}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("due", "invoices") || "Due"}: {invoice.dueDate} •{" "}
                      {invoice.total}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-medium ${
                      invoice.status === "Overdue"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {invoice.status === "Overdue"
                      ? t("overdue", "invoices") || "Overdue"
                      : t("dueSoon", "invoices") || "Due Soon"}
                  </div>
                  <button
                    onClick={() => handleViewInvoice(invoice.id)}
                    className="mt-2 text-sm text-dental-blue hover:text-blue-700 font-medium"
                  >
                    {t("viewDetails", "invoices") || "View Details"}
                  </button>
                </div>
              </div>
            ))}

          {customerInvoices.filter(
            (invoice) =>
              invoice.status === "Pending" || invoice.status === "Overdue"
          ).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
              <p>
                {t("noPendingInvoices", "invoices") ||
                  "No pending or overdue invoices"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Invoices;
