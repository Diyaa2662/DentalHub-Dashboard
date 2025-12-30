import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  Download,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Tag,
  Percent,
  FileEdit,
} from "lucide-react";

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // بيانات وهمية للفاتورة (عندما يكون الباك إند جاهزاً سيتم جلب البيانات من API)
  const invoiceData = {
    id: id || "INV-CUST-002",
    customer: "Dr. Michael Chen",
    customerEmail: "michael.chen@dentalclinic.com",
    customerPhone: "+1 (555) 123-4567",
    customerAddress: "123 Medical Street, Suite 405\nNew York, NY 10001",
    amount: "$2,800.00",
    subtotal: "$2,800.00",
    tax: "$280.00",
    discount: "$0.00",
    discountPercent: "0%",
    total: "$3,080.00",
    currency: "USD",
    date: "2024-01-14",
    dueDate: "2024-02-14",
    issueDate: "2024-01-14",
    status: "Pending",
    notes:
      "Dental equipment order for new clinic setup. Delivery scheduled for next week.",
    items: [
      {
        id: 1,
        name: "Advanced Dental Chair",
        description: "Ergonomic dental chair with hydraulic system",
        quantity: 1,
        unitPrice: "$1,800.00",
        total: "$1,800.00",
      },
      {
        id: 2,
        name: "Portable X-Ray Unit",
        description: "Digital portable X-ray machine with sensor",
        quantity: 1,
        unitPrice: "$850.00",
        total: "$850.00",
      },
      {
        id: 3,
        name: "Dental Loupes 3.5x",
        description: "Surgical loupes with LED headlight",
        quantity: 1,
        unitPrice: "$150.00",
        total: "$150.00",
      },
    ],
    paymentHistory: [
      {
        id: 1,
        date: "2024-01-15",
        amount: "$1,000.00",
        method: "Bank Transfer",
        status: "Completed",
      },
      {
        id: 2,
        date: "2024-01-20",
        amount: "$1,000.00",
        method: "Credit Card",
        status: "Scheduled",
      },
    ],
  };

  const getStatusConfig = (status) => {
    const configs = {
      Paid: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle size={16} />,
        text: t("paid", "invoices") || "Paid",
      },
      Pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock size={16} />,
        text: t("pending", "common") || "Pending",
      },
      Overdue: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertCircle size={16} />,
        text: t("overdue", "invoices") || "Overdue",
      },
    };
    return configs[status] || configs.Pending;
  };

  const statusConfig = getStatusConfig(invoiceData.status);

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    alert(`${t("downloadingInvoice", "invoices")} ${invoiceData.id}`);
  };

  const handleEditInvoice = () => {
    navigate(`/invoices/edit/${invoiceData.id}`);
  };

  const handleBack = () => {
    navigate("/invoices");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
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
              {t("invoice", "invoices")} #{invoiceData.id}
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
            onClick={handleEditInvoice}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <FileEdit size={20} />
            <span>{t("edit", "common") || "Edit"}</span>
          </button>

          <button
            onClick={handlePrintInvoice}
            className="px-4 py-2 bg-blue-50 text-dental-blue rounded-lg font-medium hover:bg-blue-100 transition flex items-center space-x-2"
          >
            <Printer size={20} />
            <span>{t("print", "common") || "Print"}</span>
          </button>

          <button
            onClick={handleDownloadInvoice}
            className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition flex items-center space-x-2"
          >
            <Download size={20} />
            <span>{t("download", "common") || "Download"}</span>
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
                    <span>{invoiceData.id}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span>{formatDate(invoiceData.date)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">
                  {invoiceData.total}
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
                <div className="flex items-start mb-3">
                  <User size={20} className="text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">
                      {invoiceData.customer}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("customer", "navigation")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Mail size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {invoiceData.customerEmail}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Phone size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {invoiceData.customerPhone}
                    </span>
                  </div>

                  <div className="md:col-span-2 flex items-start">
                    <MapPin size={16} className="text-gray-400 mr-2 mt-1" />
                    <span className="text-sm text-gray-600 whitespace-pre-line">
                      {invoiceData.customerAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {t("items", "products") || "Items"}
              </h3>
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
                    {invoiceData.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.description}
                            </p>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="font-medium">{item.quantity}</span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className="font-medium">{item.unitPrice}</span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className="font-bold text-gray-800">
                            {item.total}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

          {/* Payment History (Optional - يمكن إزالته إذا لا تريده) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("paymentHistory", "invoices") || "Payment History"}
            </h3>
            <div className="space-y-3">
              {invoiceData.paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-green-500" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {payment.amount} • {payment.method}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(payment.date)} • {payment.status}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payment.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Summary and Dates */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("summary", "common") || "Summary"}
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {t("subtotal", "invoices") || "Subtotal"}
                </span>
                <span className="font-medium">{invoiceData.subtotal}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Tag size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {t("discount", "invoices") || "Discount"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{invoiceData.discount}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({invoiceData.discountPercent})
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Percent size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {t("tax", "products") || "Tax"}
                  </span>
                </div>
                <span className="font-medium">{invoiceData.tax}</span>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">
                  {t("total", "customers") || "Total"}
                </span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {invoiceData.total}
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
              {t("dates", "common") || "Dates"}
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Calendar size={16} className="mr-2" />
                  <span>{t("issueDate", "invoices") || "Issue Date"}</span>
                </div>
                <p className="font-medium text-gray-800">
                  {formatDate(invoiceData.issueDate)}
                </p>
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Calendar size={16} className="mr-2" />
                  <span>{t("dueDate", "invoices") || "Due Date"}</span>
                </div>
                <p
                  className={`font-medium ${
                    invoiceData.status === "Overdue"
                      ? "text-red-600"
                      : "text-gray-800"
                  }`}
                >
                  {formatDate(invoiceData.dueDate)}
                </p>
                {invoiceData.status === "Overdue" && (
                  <p className="text-sm text-red-600 mt-1">
                    {t("overdueBy", "invoices") || "Overdue by"} 5{" "}
                    {t("days", "common") || "days"}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <DollarSign size={16} className="mr-2" />
                  <span>{t("amount", "common") || "Amount"}</span>
                </div>
                <p className="font-medium text-gray-800">
                  {invoiceData.amount}
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

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("quickActions", "invoices") || "Quick Actions"}
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => alert("Send reminder email")}
                className="w-full px-4 py-3 bg-blue-50 text-dental-blue rounded-lg font-medium hover:bg-blue-100 transition flex items-center justify-center space-x-2"
              >
                <Mail size={20} />
                <span>{t("sendReminder", "invoices") || "Send Reminder"}</span>
              </button>

              <button
                onClick={() => alert("Mark as paid")}
                className="w-full px-4 py-3 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition flex items-center justify-center space-x-2"
              >
                <CheckCircle size={20} />
                <span>{t("markAsPaid", "invoices") || "Mark as Paid"}</span>
              </button>

              <button
                onClick={() => alert("Add payment")}
                className="w-full px-4 py-3 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition flex items-center justify-center space-x-2"
              >
                <DollarSign size={20} />
                <span>{t("addPayment", "invoices") || "Add Payment"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles (مخفي في العرض العادي) */}
      <style jsx="true">{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .print-only {
            display: block !important;
          }
        }

        .print-only {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default InvoiceDetails;
