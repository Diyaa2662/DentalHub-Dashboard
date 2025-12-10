import React, { useState } from "react";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react/button";
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
} from "lucide-react";

const Invoices = () => {
  const [activeTab, setActiveTab] = useState("all"); // all, income, outcome
  const [selectedRows, setSelectedRows] = useState([]);

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
    alert(`Printing invoice: ${invoiceId}`);
    // هنا يمكنك إضافة منطق الطباعة الفعلي
  };

  const handleDownloadInvoice = (invoiceId) => {
    alert(`Downloading invoice: ${invoiceId}`);
    // هنا يمكنك إضافة منطق التحميل الفعلي
  };

  const handleViewInvoice = (invoiceId) => {
    alert(`Viewing invoice: ${invoiceId}`);
    // هنا يمكنك إضافة منطق عرض الفاتورة
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Invoices Management
          </h1>
          <p className="text-gray-600">Manage income and outcome invoices</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button
            text="Print Selected"
            icon="print"
            type="default"
            stylingMode="contained"
            className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200"
            disabled={selectedRows.length === 0}
          />
          <Button
            text="Create Invoice"
            icon="plus"
            type="default"
            stylingMode="contained"
            className="!bg-dental-blue !text-white hover:!bg-blue-600"
          />
        </div>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-800">
                {invoiceStats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="text-dental-blue" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
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
          <p className="text-sm text-green-600 mt-2">+18% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Invoices</p>
              <p className="text-2xl font-bold text-yellow-600">
                {invoiceStats.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Filter className="text-yellow-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">Requires attention</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue Invoices</p>
              <p className="text-2xl font-bold text-red-600">
                {invoiceStats.overdue}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <FileText className="text-red-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">Immediate action needed</p>
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
            All Invoices ({allInvoices.length})
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
            <span>Income ({incomeInvoices.length})</span>
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
            <span>Outcome ({outcomeInvoices.length})</span>
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
                    Income Invoices
                  </h3>
                  <p className="text-sm text-gray-600">
                    Purchases from suppliers
                  </p>
                </div>
              </div>
              <Building className="text-green-600" size={20} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount</span>
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
                <span className="text-gray-600">Pending</span>
                <span className="font-medium text-yellow-600">
                  {
                    incomeInvoices.filter((inv) => inv.status === "Pending")
                      .length
                  }{" "}
                  invoices
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overdue</span>
                <span className="font-medium text-red-600">
                  {
                    incomeInvoices.filter((inv) => inv.status === "Overdue")
                      .length
                  }{" "}
                  invoices
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
                    Outcome Invoices
                  </h3>
                  <p className="text-sm text-gray-600">Sales to customers</p>
                </div>
              </div>
              <User className="text-blue-600" size={20} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount</span>
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
                <span className="text-gray-600">Pending</span>
                <span className="font-medium text-yellow-600">
                  {
                    outcomeInvoices.filter((inv) => inv.status === "Pending")
                      .length
                  }{" "}
                  invoices
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipped</span>
                <span className="font-medium text-purple-600">
                  {
                    outcomeInvoices.filter((inv) => inv.status === "Shipped")
                      .length
                  }{" "}
                  invoices
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
            <SearchPanel visible={true} placeholder="Search invoices..." />
            <Paging defaultPageSize={10} />
            <Pager
              showPageSizeSelector={true}
              allowedPageSizes={[5, 10, 20]}
              showInfo={true}
            />

            <Column dataField="id" caption="Invoice ID" width={120} />
            <Column
              dataField="type"
              caption="Type"
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
                  {data.type}
                </span>
              )}
            />
            <Column
              dataField={activeTab === "income" ? "supplier" : "customer"}
              caption={activeTab === "income" ? "Supplier" : "Customer"}
            />
            <Column dataField="amount" caption="Amount" />
            <Column dataField="tax" caption="Tax" />
            <Column dataField="total" caption="Total" />
            <Column dataField="date" caption="Date" width={100} />
            <Column dataField="dueDate" caption="Due Date" width={100} />
            <Column
              dataField="status"
              caption="Status"
              cellRender={({ data }) => (
                <span
                  className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${
                    data.status === "Paid"
                      ? "bg-green-100 text-green-800"
                      : data.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : data.status === "Shipped"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-red-100 text-red-800"
                  }
                `}
                >
                  {data.status}
                </span>
              )}
            />
            <Column
              caption="Actions"
              width={140}
              cellRender={({ data }) => (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewInvoice(data.id)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="View Invoice"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handlePrintInvoice(data.id)}
                    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded"
                    title="Print Invoice"
                  >
                    <Printer size={16} />
                  </button>
                  <button
                    onClick={() => handleDownloadInvoice(data.id)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    title="Download Invoice"
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
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition flex items-center justify-center space-x-3">
            <ArrowDownCircle className="text-green-600" size={24} />
            <div className="text-left">
              <p className="font-medium text-gray-800">Create Income Invoice</p>
              <p className="text-sm text-gray-600">Record supplier purchase</p>
            </div>
          </button>

          <button className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center justify-center space-x-3">
            <ArrowUpCircle className="text-blue-600" size={24} />
            <div className="text-left">
              <p className="font-medium text-gray-800">
                Create Outcome Invoice
              </p>
              <p className="text-sm text-gray-600">Record customer sale</p>
            </div>
          </button>

          <button className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition flex items-center justify-center space-x-3">
            <FileText className="text-purple-600" size={24} />
            <div className="text-left">
              <p className="font-medium text-gray-800">Generate Reports</p>
              <p className="text-sm text-gray-600">Monthly invoice reports</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
