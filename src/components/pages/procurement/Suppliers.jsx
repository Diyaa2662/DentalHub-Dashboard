import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
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
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  User,
  Building,
  FileText,
} from "lucide-react";

const Suppliers = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // ✅ بيانات المزودين - فقط البيانات المعروضة
  const suppliersData = [
    {
      id: 1,
      name: "Dental Equipment Co.",
      email: "john@dentalequip.com",
      phone: "+1-555-123-4567",
      address: "123 Equipment St, New York, NY 10001",
      productType: "Equipment",
      status: "active",
      notes: "Reliable supplier, fast delivery",
    },
    {
      id: 2,
      name: "MediDent Supplies",
      email: "sarah@medident.com",
      phone: "+1-555-987-6543",
      address: "456 Medical Blvd, Los Angeles, CA 90001",
      productType: "Disposables",
      status: "active",
      notes: "Good for bulk orders",
    },
    {
      id: 3,
      name: "Oral Care Experts",
      email: "mike@oralcare.com",
      phone: "+1-555-456-7890",
      address: "789 Dental Ave, Chicago, IL 60007",
      productType: "Oral Hygiene",
      status: "inactive",
      notes: "Temporarily suspended",
    },
    {
      id: 4,
      name: "Dental Tools Ltd",
      email: "emma@dentaltools.com",
      phone: "+1-555-321-6547",
      address: "321 Tool St, Houston, TX 77001",
      productType: "Surgical Tools",
      status: "active",
      notes: "High quality instruments",
    },
    {
      id: 5,
      name: "Clinic Essentials",
      email: "david@clinicsupply.com",
      phone: "+1-555-654-3210",
      address: "654 Supply Rd, Miami, FL 33101",
      productType: "Clinic Furniture",
      status: "active",
      notes: "Good for clinic setup",
    },
  ];

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle size={16} className="text-green-600" />;
      case "inactive":
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <CheckCircle size={16} className="text-gray-600" />;
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // الحصول على نص الحالة
  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return t("active", "procurement") || "Active";
      case "inactive":
        return t("inactive", "procurement") || "Inactive";
      default:
        return status;
    }
  };

  // عرض خلية نوع المنتجات
  const productTypeCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <Package size={16} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-800">
          {data.data.productType}
        </span>
      </div>
    );
  };

  // عرض خلية الملاحظات
  const notesCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <FileText size={16} className="text-gray-500" />
        <span className="text-sm text-gray-700 truncate max-w-[150px]">
          {data.data.notes}
        </span>
      </div>
    );
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

  // ✅ دالة لحذف المزود
  const handleDeleteSupplier = (id, name) => {
    if (window.confirm(`${t("confirmDelete", "procurement")} "${name}"?`)) {
      alert(`${t("deleteSuccess", "procurement")}: ${name}`);
    }
  };

  // ✅ دالة لتعديل المزود
  const handleEditSupplier = (id) => {
    navigate(`/procurement/suppliers/edit/${id}`);
    // يمكنك ربط هذا بزر التعديل في المستقبل
    // navigate(`/procurement/suppliers/edit/${id}`);
  };

  // حساب عدد المزودين النشطين وغير النشطين
  const activeSuppliers = suppliersData.filter(
    (s) => s.status === "active"
  ).length;
  const inactiveSuppliers = suppliersData.filter(
    (s) => s.status === "inactive"
  ).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("suppliersManagement", "procurement") || "Suppliers Management"}
          </h1>
          <p className="text-gray-600">
            {t("manageSuppliers", "procurement") ||
              "Manage and track your suppliers"}
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => navigate("/procurement/suppliers/add")}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t("addSupplier", "procurement") || "Add Supplier"}</span>
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* إجمالي المزودين */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t("totalSuppliers", "procurement") || "Total Suppliers"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {suppliersData.length}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* المزودون النشطون */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t("activeSuppliers", "procurement") || "Active Suppliers"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {activeSuppliers}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* المزودون غير النشطين */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t("inactiveSuppliers", "procurement") || "Inactive Suppliers"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {inactiveSuppliers}
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <DataGrid
          dataSource={suppliersData}
          showBorders={true}
          columnAutoWidth={true}
          height={500}
          allowColumnResizing={true}
          allowColumnReordering={true}
          columnResizingMode="widget"
        >
          <HeaderFilter visible={true} />
          <SearchPanel
            visible={true}
            placeholder={
              t("searchSuppliers", "procurement") || "Search suppliers..."
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
            dataField="name"
            caption={t("supplierName", "procurement") || "Supplier Name"}
            width={"auto"}
            alignment="left"
            allowGrouping={false}
          />

          <Column
            dataField="phone"
            caption={t("phone", "procurement") || "Phone"}
            width={"auto"}
            alignment="left"
            allowGrouping={false}
          />

          <Column
            dataField="email"
            caption={t("email", "procurement") || "Email"}
            width={"auto"}
            alignment="left"
            allowGrouping={false}
          />

          <Column
            dataField="address"
            caption={t("address", "procurement") || "Address"}
            width={"auto"}
            alignment="left"
            allowGrouping={false}
          />

          <Column
            dataField="productType"
            caption={t("productType", "procurement") || "Product Type"}
            width={"auto"}
            alignment="center"
            cellRender={productTypeCellRender}
            allowGrouping={true}
          />

          <Column
            dataField="status"
            caption={t("status", "procurement") || "Status"}
            width={"auto"}
            alignment="center"
            cellRender={statusCellRender}
            allowGrouping={true}
          />

          <Column
            dataField="notes"
            caption={t("notes", "procurement") || "Notes"}
            width={"auto"}
            alignment="left"
            cellRender={notesCellRender}
          />

          {/* Actions Column */}
          <Column
            caption={t("actions", "common") || "Actions"}
            width={"auto"}
            alignment="center"
            cellRender={(data) => (
              <div className="flex items-center space-x-3">
                <button
                  className="text-green-600 hover:text-green-800 transition"
                  title={t("editSupplier", "procurement") || "Edit Supplier"}
                  onClick={() => handleEditSupplier(data.data.id)}
                >
                  <Edit size={18} />
                </button>
                <button
                  className="text-red-600 hover:text-red-800 transition"
                  title={t("delete", "common") || "Delete"}
                  onClick={() =>
                    handleDeleteSupplier(data.data.id, data.data.name)
                  }
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          />
        </DataGrid>
      </div>

      {/* قسم المزودين الجدد */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">
              {t("createNewSupplier", "procurement") || "Add New Supplier"}
            </h3>
            <p className="text-sm text-gray-600">
              {t("quicklyAddNewSupplier", "procurement") ||
                "Quickly add a new supplier to your procurement system"}
            </p>
          </div>
          <button
            onClick={() => navigate("/procurement/suppliers/add")}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <User size={18} />
            <span>
              {t("createNewSupplier", "procurement") || "Add Supplier"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
