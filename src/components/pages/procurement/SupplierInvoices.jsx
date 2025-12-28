import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
  FilterRow,
} from "devextreme-react/data-grid";
import {
  FileText,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  TrendingUp,
} from "lucide-react";

const SupplierInvoices = () => {
  const { t } = useLanguage();

  // بيانات وهمية لفواتير الموردين
  const supplierInvoices = [
    {
      id: 1,
      invoiceNumber: "DS-00123",
      referenceId: "INV-2023-001",
      supplier: "Dental Supplies Co.",
      date: "2023-10-15",
      dueDate: "2023-11-15",
      amount: 2450.75,
      status: "paid",
      items: 12,
      contactPerson: "John Smith",
      phone: "+1-555-0123",
    },
    {
      id: 2,
      invoiceNumber: "MD-00456",
      referenceId: "INV-2023-002",
      supplier: "MediDent Equipment",
      date: "2023-10-20",
      dueDate: "2023-11-20",
      amount: 1850.5,
      status: "pending",
      items: 8,
      contactPerson: "Sarah Johnson",
      phone: "+1-555-0124",
    },
    {
      id: 3,
      invoiceNumber: "OC-00789",
      referenceId: "INV-2023-003",
      supplier: "Oral Care Supplies",
      date: "2023-10-25",
      dueDate: "2023-11-25",
      amount: 3200.0,
      status: "overdue",
      items: 15,
      contactPerson: "Mike Wilson",
      phone: "+1-555-0125",
    },
    {
      id: 4,
      invoiceNumber: "DT-00987",
      referenceId: "INV-2023-004",
      supplier: "Dental Tools Ltd.",
      date: "2023-11-01",
      dueDate: "2023-12-01",
      amount: 1560.25,
      status: "paid",
      items: 6,
      contactPerson: "Emma Brown",
      phone: "+1-555-0126",
    },
    {
      id: 5,
      invoiceNumber: "CE-00555",
      referenceId: "INV-2023-005",
      supplier: "Clinic Essentials",
      date: "2023-11-05",
      dueDate: "2023-12-05",
      amount: 2780.9,
      status: "pending",
      items: 11,
      contactPerson: "David Lee",
      phone: "+1-555-0127",
    },
    {
      id: 6,
      invoiceNumber: "DS-00234",
      referenceId: "INV-2023-006",
      supplier: "Dental Supplies Co.",
      date: "2023-11-10",
      dueDate: "2023-12-10",
      amount: 1890.0,
      status: "paid",
      items: 9,
      contactPerson: "John Smith",
      phone: "+1-555-0123",
    },
    {
      id: 7,
      invoiceNumber: "MD-00567",
      referenceId: "INV-2023-007",
      supplier: "MediDent Equipment",
      date: "2023-11-15",
      dueDate: "2023-12-15",
      amount: 4250.25,
      status: "overdue",
      items: 18,
      contactPerson: "Sarah Johnson",
      phone: "+1-555-0124",
    },
    {
      id: 8,
      invoiceNumber: "OC-00890",
      referenceId: "INV-2023-008",
      supplier: "Oral Care Supplies",
      date: "2023-11-20",
      dueDate: "2023-12-20",
      amount: 3100.5,
      status: "pending",
      items: 14,
      contactPerson: "Mike Wilson",
      phone: "+1-555-0125",
    },
  ];

  // تنسيق الرقم
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={16} className="text-green-600" />;
      case "pending":
        return <Clock size={16} className="text-yellow-600" />;
      case "overdue":
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <CheckCircle size={16} className="text-gray-600" />;
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status) => {
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

  // الحصول على نص الحالة
  const getStatusText = (status) => {
    switch (status) {
      case "paid":
        return t("paid", "procurement") || "Paid";
      case "pending":
        return t("pending", "procurement") || "Pending";
      case "overdue":
        return t("overdue", "procurement") || "Overdue";
      default:
        return status;
    }
  };

  // عرض خلية الحالة
  const statusCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon(data.data.status)}
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            data.data.status
          )}`}
        >
          {getStatusText(data.data.status)}
        </span>
      </div>
    );
  };

  // عرض خلية المبلغ
  const amountCellRender = (data) => {
    return (
      <div className="font-medium text-gray-900">
        {formatCurrency(data.data.amount)}
      </div>
    );
  };

  // عرض خلية التاريخ
  const dateCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <Calendar size={14} className="text-gray-400" />
        <span>{data.data.date}</span>
      </div>
    );
  };

  // عرض خلية تاريخ الاستحقاق
  const dueDateCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <Calendar size={14} className="text-gray-400" />
        <span>{data.data.dueDate}</span>
      </div>
    );
  };

  // عرض خلية الفاتورة
  const invoiceCellRender = (data) => {
    return (
      <div>
        <div className="font-medium text-gray-900">
          {data.data.invoiceNumber}
        </div>
        <div className="text-sm text-gray-500">{data.data.referenceId}</div>
      </div>
    );
  };

  // عرض خلية الإجراءات
  const actionCellRender = () => {
    return (
      <div className="flex items-center space-x-3">
        <button
          className="text-blue-600 hover:text-blue-800 transition"
          title={t("viewSupplierInvoice", "procurement") || "View Invoice"}
        >
          <Eye size={18} />
        </button>
        <button
          className="text-green-600 hover:text-green-800 transition"
          title={t("editSupplier", "procurement") || "Edit"}
        >
          <Edit size={18} />
        </button>
        <button
          className="text-red-600 hover:text-red-800 transition"
          title={t("delete", "common") || "Delete"}
        >
          <Trash2 size={18} />
        </button>
      </div>
    );
  };

  // حساب الإحصائيات
  const totalInvoices = supplierInvoices.length;
  const totalAmount = supplierInvoices.reduce(
    (sum, inv) => sum + inv.amount,
    0
  );
  const paidInvoices = supplierInvoices.filter(
    (i) => i.status === "paid"
  ).length;
  const overdueInvoices = supplierInvoices.filter(
    (i) => i.status === "overdue"
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* العنوان والإحصائيات */}
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
              onClick={() => alert("Export functionality")}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center space-x-2"
            >
              <Download size={20} />
              <span>
                {t("exportSupplierInvoices", "procurement") || "Export"}
              </span>
            </button>
            <button
              onClick={() => alert("Add invoice functionality")}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>
                {t("addSupplierInvoice", "procurement") || "Add Invoice"}
              </span>
            </button>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {t("totalInvoices", "common") || "Total Invoices"}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {totalInvoices}
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
                  {formatCurrency(totalAmount)}
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
                  {paidInvoices}
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
                  {overdueInvoices}
                </p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <XCircle className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* جدول الفواتير باستخدام DevExtreme DataGrid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataGrid
          dataSource={supplierInvoices}
          showBorders={true}
          columnAutoWidth={true}
          height={500}
          allowColumnResizing={true}
          columnResizingMode="widget"
          showColumnLines={true}
          showRowLines={true}
          rowAlternationEnabled={true}
        >
          <SearchPanel
            visible={true}
            placeholder={
              t("searchInvoices", "procurement") || "Search invoices..."
            }
          />
          <Paging defaultPageSize={10} />
          <Pager
            showPageSizeSelector={true}
            allowedPageSizes={[5, 10, 20]}
            showInfo={true}
          />

          <Column
            dataField="invoiceNumber"
            caption={t("invoiceNumber", "procurement") || "Invoice No."}
            width="auto"
            alignment="left"
            cellRender={invoiceCellRender}
          />
          <Column
            dataField="supplier"
            caption={t("supplier", "procurement") || "Supplier"}
            width="auto"
            alignment="left"
          />
          <Column
            dataField="contactPerson"
            caption={t("contactPerson", "procurement") || "Contact Person"}
            width="auto"
            alignment="left"
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
            cellRender={amountCellRender}
          />
          <Column
            dataField="items"
            caption={t("itemsCount", "procurement") || "Items"}
            width="auto"
            alignment="left"
          />
          <Column
            dataField="status"
            caption={t("invoiceStatus", "procurement") || "Status"}
            width="auto"
            alignment="left"
            cellRender={statusCellRender}
          />
          <Column
            dataField="phone"
            caption={t("phone", "procurement") || "Phone"}
            width="auto"
            alignment="left"
          />
          <Column
            caption={t("actions", "common") || "Actions"}
            width="auto"
            alignment="left"
            cellRender={actionCellRender}
          />
        </DataGrid>
      </div>

      {/* قسم فاتورة جديدة */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">
              {t("createNewInvoice", "procurement") || "Create New Invoice"}
            </h3>
            <p className="text-sm text-gray-600">
              {t("quicklyCreateNewInvoice", "common") ||
                "Quickly create a new supplier invoice"}
            </p>
          </div>
          <button
            onClick={() => alert("Quick create invoice")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
          >
            <Receipt size={18} />
            <span>
              {t("createNewInvoice", "procurement") || "Create Invoice"}
            </span>
          </button>
        </div>
      </div>

      {/* إحصائيات إضافية */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800">
            {t("invoiceStatistics", "common") || "Invoice Statistics"}
          </h3>
          <TrendingUp className="text-gray-500" size={20} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalInvoices}
            </div>
            <div className="text-sm text-gray-600">
              {t("totalInvoices", "common") || "Total"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {paidInvoices}
            </div>
            <div className="text-sm text-gray-600">
              {t("paid", "procurement") || "Paid"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {supplierInvoices.filter((i) => i.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600">
              {t("pending", "procurement") || "Pending"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {overdueInvoices}
            </div>
            <div className="text-sm text-gray-600">
              {t("overdue", "procurement") || "Overdue"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierInvoices;
