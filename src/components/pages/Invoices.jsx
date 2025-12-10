import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
} from "devextreme-react/data-grid";
import {
  FileText,
  Download,
  Eye,
  Printer,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
  DollarSign,
  Building,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
} from "lucide-react";

const Invoices = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRows, setSelectedRows] = useState([]);
  const { t } = useLanguage();

  // بيانات وهمية لفواتير الدخل (مشتريات من الموردين)
  const incomeInvoices = [
    {
      id: "INV-IN-001",
      type: "Income",
      supplier: "Dental Supplies Inc.",
      amount: "$4,500.00",
      date: "2024-01-15",
      dueDate: "2024-02-15",
      status: "Paid",
      items: 12,
      tax: "$450.00",
      total: "$4,950.00",
    },
    {
      id: "INV-IN-002",
      type: "Income",
      supplier: "Medical Equipment Co.",
      amount: "$8,200.00",
      date: "2024-01-10",
      dueDate: "2024-02-10",
      status: "Paid",
      items: 8,
      tax: "$820.00",
      total: "$9,020.00",
    },
    {
      id: "INV-IN-003",
      type: "Income",
      supplier: "Surgical Tools Ltd.",
      amount: "$2,300.00",
      date: "2024-01-05",
      dueDate: "2024-02-05",
      status: "Pending",
      items: 25,
      tax: "$230.00",
      total: "$2,530.00",
    },
    {
      id: "INV-IN-004",
      type: "Income",
      supplier: "Dental Materials Corp.",
      amount: "$1,800.00",
      date: "2024-01-03",
      dueDate: "2024-02-03",
      status: "Overdue",
      items: 15,
      tax: "$180.00",
      total: "$1,980.00",
    },
  ];

  // بيانات وهمية لفواتير الخرج (مبيعات للعملاء)
  const outcomeInvoices = [
    {
      id: "INV-OUT-001",
      type: "Outcome",
      customer: "Dr. Sarah Johnson",
      amount: "$850.00",
      date: "2024-01-16",
      dueDate: "2024-02-16",
      status: "Paid",
      items: 3,
      tax: "$85.00",
      total: "$935.00",
    },
    {
      id: "INV-OUT-002",
      type: "Outcome",
      customer: "Dr. Michael Chen",
      amount: "$2,800.00",
      date: "2024-01-14",
      dueDate: "2024-02-14",
      status: "Pending",
      items: 1,
      tax: "$280.00",
      total: "$3,080.00",
    },
    {
      id: "INV-OUT-003",
      type: "Outcome",
      customer: "Dr. Emily Williams",
      amount: "$320.00",
      date: "2024-01-14",
      dueDate: "2024-02-14",
      status: "Paid",
      items: 5,
      tax: "$32.00",
      total: "$352.00",
    },
    {
      id: "INV-OUT-004",
      type: "Outcome",
      customer: "Dr. Robert Kim",
      amount: "$1,250.00",
      date: "2024-01-12",
      dueDate: "2024-02-12",
      status: "Shipped",
      items: 4,
      tax: "$125.00",
      total: "$1,375.00",
    },
    {
      id: "INV-OUT-005",
      type: "Outcome",
      customer: "Dr. Lisa Martinez",
      amount: "$3,450.00",
      date: "2024-01-11",
      dueDate: "2024-02-11",
      status: "Paid",
      items: 7,
      tax: "$345.00",
      total: "$3,795.00",
    },
  ];

  // دمج الفواتير
  const allInvoices = [...incomeInvoices, ...outcomeInvoices];

  // فلترة الفواتير حسب النوع المحدد
  const filteredInvoices =
    activeTab === "all"
      ? allInvoices
      : activeTab === "income"
      ? incomeInvoices
      : outcomeInvoices;

  // إحصائيات الفواتير
  const invoiceStats = {
    total: allInvoices.length,
    income: incomeInvoices.length,
    outcome: outcomeInvoices.length,
    totalAmount: allInvoices.reduce(
      (sum, inv) =>
        sum + parseFloat(inv.amount.replace("$", "").replace(",", "")),
      0
    ),
    pending: allInvoices.filter((inv) => inv.status === "Pending").length,
    overdue: allInvoices.filter((inv) => inv.status === "Overdue").length,
  };

  const handlePrintInvoice = (invoiceId) => {
    alert(`${t("printingInvoice", "invoices")} ${invoiceId}`);
  };

  const handleDownloadInvoice = (invoiceId) => {
    alert(`${t("downloadingInvoice", "invoices")} ${invoiceId}`);
  };

  const handleViewInvoice = (invoiceId) => {
    alert(`${t("viewingInvoice", "invoices")} ${invoiceId}`);
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
            {t("manageIncomeOutcome", "invoices")}
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

      {/* Invoice Stats */}
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
                {t("overdueInvoices", "invoices")}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {invoiceStats.overdue}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="text-red-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">
            {t("immediateAction", "invoices")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === "all"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t("allInvoices", "invoices")} ({allInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={`px-6 py-3 rounded-lg font-medium transition flex items-center space-x-2 ${
              activeTab === "income"
                ? "bg-green-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ArrowDownCircle size={18} />
            <span>
              {t("income", "invoices")} ({incomeInvoices.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("outcome")}
            className={`px-6 py-3 rounded-lg font-medium transition flex items-center space-x-2 ${
              activeTab === "outcome"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ArrowUpCircle size={18} />
            <span>
              {t("outcome", "invoices")} ({outcomeInvoices.length})
            </span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Income Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowDownCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {t("incomeInvoices", "invoices")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("purchasesFromSuppliers", "invoices")}
                  </p>
                </div>
              </div>
              <Building className="text-green-600" size={20} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {t("totalAmount", "invoices")}
                </span>
                <span className="font-bold text-green-700">
                  $
                  {incomeInvoices
                    .reduce(
                      (sum, inv) =>
                        sum +
                        parseFloat(
                          inv.amount.replace("$", "").replace(",", "")
                        ),
                      0
                    )
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t("pending", "common")}</span>
                <span className="font-medium text-yellow-600">
                  {
                    incomeInvoices.filter((inv) => inv.status === "Pending")
                      .length
                  }{" "}
                  {t("invoices", "navigation").toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {t("overdue", "invoices")}
                </span>
                <span className="font-medium text-red-600">
                  {
                    incomeInvoices.filter((inv) => inv.status === "Overdue")
                      .length
                  }{" "}
                  {t("invoices", "navigation").toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Outcome Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ArrowUpCircle className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {t("outcomeInvoices", "invoices")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("salesToCustomers", "invoices")}
                  </p>
                </div>
              </div>
              <User className="text-blue-600" size={20} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {t("totalAmount", "invoices")}
                </span>
                <span className="font-bold text-blue-700">
                  $
                  {outcomeInvoices
                    .reduce(
                      (sum, inv) =>
                        sum +
                        parseFloat(
                          inv.amount.replace("$", "").replace(",", "")
                        ),
                      0
                    )
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t("pending", "common")}</span>
                <span className="font-medium text-yellow-600">
                  {
                    outcomeInvoices.filter((inv) => inv.status === "Pending")
                      .length
                  }{" "}
                  {t("invoices", "navigation").toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t("shipped", "orders")}</span>
                <span className="font-medium text-purple-600">
                  {
                    outcomeInvoices.filter((inv) => inv.status === "Shipped")
                      .length
                  }{" "}
                  {t("invoices", "navigation").toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <DataGrid
            dataSource={filteredInvoices}
            showBorders={true}
            columnAutoWidth={true}
            height={500}
            selection={{ mode: "multiple" }}
            onSelectionChanged={(e) => setSelectedRows(e.selectedRowsData)}
          >
            <SearchPanel
              visible={true}
              placeholder={t("searchInvoices", "invoices")}
            />
            <Paging defaultPageSize={10} />
            <Pager
              showPageSizeSelector={true}
              allowedPageSizes={[5, 10, 20]}
              showInfo={true}
            />

            <Column
              dataField="id"
              caption={t("invoiceId", "invoices")}
              width={120}
            />
            <Column
              dataField="type"
              caption={t("type", "products")}
              cellRender={({ data }) => (
                <span
                  className={`
                  px-3 py-1 rounded-full text-xs font-medium inline-flex items-center
                  ${
                    data.type === "Income"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }
                `}
                >
                  {data.type === "Income" ? (
                    <ArrowDownCircle size={12} className="mr-1" />
                  ) : (
                    <ArrowUpCircle size={12} className="mr-1" />
                  )}
                  {data.type === "Income"
                    ? t("income", "invoices")
                    : t("outcome", "invoices")}
                </span>
              )}
            />
            <Column
              dataField={activeTab === "income" ? "supplier" : "customer"}
              caption={
                activeTab === "income"
                  ? t("supplier", "products")
                  : t("customer", "navigation")
              }
            />
            <Column dataField="amount" caption={t("amount", "common")} />
            <Column dataField="tax" caption={t("tax", "products")} />
            <Column dataField="total" caption={t("total", "customers")} />
            <Column
              dataField="date"
              caption={t("date", "orders")}
              width={100}
            />
            <Column
              dataField="dueDate"
              caption={t("dueDate", "invoices")}
              width={100}
            />
            <Column
              dataField="status"
              caption={t("status", "common")}
              cellRender={({ data }) => {
                const statusConfig = {
                  Paid: {
                    color: "bg-green-100 text-green-800",
                    icon: <CheckCircle size={12} />,
                  },
                  Pending: {
                    color: "bg-yellow-100 text-yellow-800",
                    icon: <Clock size={12} />,
                  },
                  Shipped: {
                    color: "bg-purple-100 text-purple-800",
                    icon: <ArrowUpCircle size={12} />,
                  },
                  Overdue: {
                    color: "bg-red-100 text-red-800",
                    icon: <AlertCircle size={12} />,
                  },
                };

                const config = statusConfig[data.status] || {
                  color: "bg-gray-100 text-gray-800",
                };

                return (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${config.color}`}
                  >
                    {config.icon && <>{config.icon}</>}
                    <span className="ml-1">
                      {data.status === "Paid"
                        ? t("paid", "invoices")
                        : data.status === "Pending"
                        ? t("pending", "common")
                        : data.status === "Shipped"
                        ? t("shipped", "orders")
                        : t("overdue", "invoices")}
                    </span>
                  </span>
                );
              }}
            />
            <Column
              caption={t("actions", "products")}
              width={140}
              cellRender={({ data }) => (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewInvoice(data.id)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                    title={t("view", "common")}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handlePrintInvoice(data.id)}
                    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition"
                    title={t("print", "common")}
                  >
                    <Printer size={16} />
                  </button>
                  <button
                    onClick={() => handleDownloadInvoice(data.id)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                    title={t("download", "common")}
                  >
                    <Download size={16} />
                  </button>
                </div>
              )}
            />
          </DataGrid>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t("quickActions", "invoices")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setActiveTab("income");
              handleCreateInvoice();
            }}
            className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition flex items-center justify-center space-x-3"
          >
            <ArrowDownCircle className="text-green-600" size={24} />
            <div className="text-left">
              <p className="font-medium text-gray-800">
                {t("createIncomeInvoice", "invoices")}
              </p>
              <p className="text-sm text-gray-600">
                {t("recordSupplierPurchase", "invoices")}
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("outcome");
              handleCreateInvoice();
            }}
            className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center justify-center space-x-3"
          >
            <ArrowUpCircle className="text-blue-600" size={24} />
            <div className="text-left">
              <p className="font-medium text-gray-800">
                {t("createOutcomeInvoice", "invoices")}
              </p>
              <p className="text-sm text-gray-600">
                {t("recordCustomerSale", "invoices")}
              </p>
            </div>
          </button>

          <button
            onClick={handlePrintSelected}
            className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition flex items-center justify-center space-x-3"
          >
            <FileText className="text-purple-600" size={24} />
            <div className="text-left">
              <p className="font-medium text-gray-800">
                {t("generateReports", "invoices")}
              </p>
              <p className="text-sm text-gray-600">
                {t("monthlyInvoiceReports", "invoices")}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Upcoming Due Dates */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("upcomingDueDates", "invoices")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("invoicesDueSoon", "invoices")}
            </p>
          </div>
          <Calendar className="text-dental-teal" size={24} />
        </div>

        <div className="space-y-3">
          {[
            {
              id: "INV-IN-003",
              type: "Income",
              to: "Surgical Tools Ltd.",
              amount: "$2,530",
              dueDate: "2024-02-05",
              status: "pending",
            },
            {
              id: "INV-OUT-002",
              type: "Outcome",
              to: "Dr. Michael Chen",
              amount: "$3,080",
              dueDate: "2024-02-14",
              status: "pending",
            },
            {
              id: "INV-IN-004",
              type: "Income",
              to: "Dental Materials Corp.",
              amount: "$1,980",
              dueDate: "2024-02-03",
              status: "overdue",
            },
            {
              id: "INV-OUT-001",
              type: "Outcome",
              to: "Dr. Sarah Johnson",
              amount: "$935",
              dueDate: "2024-02-16",
              status: "pending",
            },
          ].map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    invoice.status === "overdue"
                      ? "bg-red-100"
                      : "bg-yellow-100"
                  }`}
                >
                  {invoice.type === "Income" ? (
                    <ArrowDownCircle
                      className={
                        invoice.status === "overdue"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }
                      size={20}
                    />
                  ) : (
                    <ArrowUpCircle
                      className={
                        invoice.status === "overdue"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }
                      size={20}
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {invoice.id} - {invoice.to}
                  </p>
                  <p className="text-sm text-gray-600">
                    {invoice.type === "Income"
                      ? t("income", "invoices")
                      : t("outcome", "invoices")}{" "}
                    • {t("due", "invoices")}: {invoice.dueDate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">{invoice.amount}</p>
                <p
                  className={`text-sm font-medium ${
                    invoice.status === "overdue"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {invoice.status === "overdue"
                    ? t("overdue", "invoices")
                    : t("dueSoon", "invoices")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Invoices;
