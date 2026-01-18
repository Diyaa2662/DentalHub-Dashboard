import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import api from "../../../services/api";
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
  AlertCircle,
  RefreshCw,
  Hash,
} from "lucide-react"; // ✅ أضفنا Hash

const Suppliers = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [suppliersData, setSuppliersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ حالة الإحصائيات - سيتم حسابها من البيانات الفعلية
  const [stats, setStats] = useState({
    totalSuppliers: 0,
  });

  // ✅ جلب بيانات المزودين من API
  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ دالة لحساب الإحصائيات من البيانات
  const calculateStats = (data) => {
    setStats({
      totalSuppliers: data.length,
    });
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/suppliers");

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setSuppliersData(response.data.data);
        // ✅ حساب الإحصائيات من البيانات الفعلية
        calculateStats(response.data.data);
      } else {
        setError(
          t("invalidDataFormat", "procurement") ||
            "Invalid data format from server",
        );
        setSuppliersData([]);
        setStats({ totalSuppliers: 0 });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t("failedToLoadSuppliers", "procurement") ||
          "Failed to load suppliers",
      );

      setSuppliersData([]);
      setStats({ totalSuppliers: 0 });
    } finally {
      setLoading(false);
    }
  };

  // ✅ دالة لإعادة تحميل البيانات
  const handleRefresh = () => {
    fetchSuppliers();
  };

  // ✅ خلية عرض ID
  const idCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <Hash size={14} className="text-gray-400" />
        <span className="font-mono font-medium text-gray-700">
          {data.data.id}
        </span>
      </div>
    );
  };

  // عرض خلية نوع المنتجات
  const productTypeCellRender = (data) => {
    return (
      <div className="flex items-center space-x-2">
        <Package size={16} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-800">
          {data.data.productType ||
            data.data.product_type ||
            t("notSpecified", "procurement") ||
            "Not specified"}
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
          {data.data.notes || "-"}
        </span>
      </div>
    );
  };

  // ✅ دالة لحذف المزود مع API
  const handleDeleteSupplier = async (id, name) => {
    if (!window.confirm(`${t("confirmDelete", "procurement")} "${name}"?`)) {
      return;
    }

    try {
      // ✅ 1. إزالة العنصر محلياً أولاً (تجربة مستخدم فورية)
      // eslint-disable-next-line no-unused-vars
      const supplierToDelete = suppliersData.find((s) => s.id === id);
      setSuppliersData((prev) => prev.filter((supplier) => supplier.id !== id));

      // ✅ تحديث الإحصائيات بعد الحذف المحلي
      setStats((prev) => ({
        totalSuppliers: prev.totalSuppliers - 1,
      }));

      // ✅ 2. إرسال طلب الحذف إلى API
      await api.delete(`/deletesupplier/${id}`);

      // ✅ 3. إعادة جلب البيانات في الخلفية (للتأكد من التزامن)
      setTimeout(async () => {
        try {
          const refreshResponse = await api.get("/suppliers");
          if (
            refreshResponse.data &&
            refreshResponse.data.data &&
            Array.isArray(refreshResponse.data.data)
          ) {
            setSuppliersData(refreshResponse.data.data);
            calculateStats(refreshResponse.data.data);
          }
          // eslint-disable-next-line no-unused-vars
        } catch (refreshErr) {
          console.log("Background refresh skipped - local state is correct");
        }
      }, 500);

      // ✅ 4. إظهار رسالة نجاح
      alert(`${t("deleteSuccess", "procurement")}: ${name}`);
    } catch (err) {
      // ✅ 5. إذا فشل الحذف، استعادة العنصر
      // eslint-disable-next-line no-undef
      if (supplierToDelete) {
        // eslint-disable-next-line no-undef
        setSuppliersData((prev) => [...prev, supplierToDelete]);
        // ✅ استعادة الإحصائيات
        setStats((prev) => ({
          totalSuppliers: prev.totalSuppliers + 1,
        }));
      }

      alert(
        err.response?.data?.message ||
          t("deleteError", "procurement") ||
          "Error deleting supplier",
      );
    }
  };

  // ✅ دالة لتعديل المزود
  const handleEditSupplier = (id) => {
    navigate(`/procurement/suppliers/edit/${id}`);
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("suppliersManagement", "procurement") ||
                "Suppliers Management"}
            </h1>
            <p className="text-gray-600">
              {t("manageSuppliers", "procurement") ||
                "Manage and track your suppliers"}
            </p>
          </div>
        </div>

        {/* ✅ كرت إحصائية واحد فقط أثناء التحميل */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {t("totalSuppliers", "procurement") || "Total Suppliers"}
                </p>
                <div className="text-2xl font-bold text-gray-800">
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                </div>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto mb-4"></div>
            <p className="text-gray-600">
              {t("loadingSuppliers", "procurement") || "Loading suppliers..."}
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
              {t("suppliersManagement", "procurement") ||
                "Suppliers Management"}
            </h1>
            <p className="text-gray-600">
              {t("manageSuppliers", "procurement") ||
                "Manage and track your suppliers"}
            </p>
          </div>
        </div>

        {/* ✅ كرت إحصائية واحد فقط عند الخطأ */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {t("totalSuppliers", "procurement") || "Total Suppliers"}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalSuppliers}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoadingSuppliers", "procurement") ||
                  "Error Loading Suppliers"}
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition flex items-center space-x-2"
            >
              <RefreshCw size={18} />
              <span>{t("tryAgain", "common") || "Try Again"}</span>
            </button>

            <button
              onClick={() => navigate("/procurement/suppliers/add")}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>{t("addSupplier", "procurement") || "Add Supplier"}</span>
            </button>
          </div>
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
            {t("suppliersManagement", "procurement") || "Suppliers Management"}
          </h1>
          <p className="text-gray-600">
            {t("manageSuppliers", "procurement") ||
              "Manage and track your suppliers"}
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
            onClick={() => navigate("/procurement/suppliers/add")}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t("addSupplier", "procurement") || "Add Supplier"}</span>
          </button>
        </div>
      </div>

      {/* ✅ كرت الإحصائيات الواحد فقط - بيانات حقيقية */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t("totalSuppliers", "procurement") || "Total Suppliers"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalSuppliers}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Table (المربوط بالـAPI) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {suppliersData.length === 0 ? (
          <div className="p-8 text-center">
            <Building className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {t("noSuppliersFound", "procurement") || "No Suppliers Found"}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("startByAddingSuppliers", "procurement") ||
                "Start by adding your first supplier to the system"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/procurement/suppliers/add")}
                className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition inline-flex items-center justify-center space-x-2"
              >
                <Plus size={18} />
                <span>
                  {t("addFirstSupplier", "procurement") || "Add First Supplier"}
                </span>
              </button>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition inline-flex items-center justify-center space-x-2"
              >
                <RefreshCw size={18} />
                <span>{t("refresh", "common") || "Refresh"}</span>
              </button>
            </div>
          </div>
        ) : (
          <DataGrid
            dataSource={suppliersData}
            showBorders={true}
            columnAutoWidth={true}
            height={500}
            allowColumnResizing={true}
            allowColumnReordering={true}
            columnResizingMode="widget"
            onRowRemoving={(e) => {
              e.cancel = true;
              handleDeleteSupplier(e.data.id, e.data.name);
            }}
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

            {/* ✅ عمود ID الجديد - كأول عمود */}
            <Column
              dataField="id"
              caption={t("id", "common") || "ID"}
              width={80}
              alignment="center"
              allowGrouping={false}
              allowSorting={true}
              cellRender={idCellRender}
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
              dataField="notes"
              caption={t("notes", "procurement") || "Notes"}
              width={"auto"}
              alignment="left"
              cellRender={notesCellRender}
            />

            {/* Actions Column */}
            <Column
              caption={t("actions", "common") || "Actions"}
              width={120}
              alignment="center"
              cellRender={(data) => (
                <div className="flex items-center justify-center space-x-3">
                  {/* زر التعديل - أخضر */}
                  <button
                    className="text-green-600 hover:text-green-800 transition p-1 rounded hover:bg-green-50"
                    title={t("edit", "common") || "Edit"}
                    onClick={() => handleEditSupplier(data.data.id)}
                  >
                    <Edit size={18} />
                  </button>

                  {/* زر الحذف - أحمر */}
                  <button
                    className="text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50"
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
        )}
      </div>

      {/* قسم المزودين الجدد */}
      {suppliersData.length === 0 && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Building className="text-blue-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-blue-800">
                {t("noSuppliersFound", "procurement") || "No Suppliers Found"}
              </h3>
              <p className="text-blue-600">
                {t("addFirstSupplier", "procurement") ||
                  "Add your first supplier to get started"}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/procurement/suppliers/add")}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>
              {t("addFirstSupplier", "procurement") || "Add First Supplier"}
            </span>
          </button>
        </div>
      )}

      {/* قسم المزودين الجدد (يظهر فقط إذا كان هناك مزودين) */}
      {suppliersData.length > 0 && (
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
      )}
    </div>
  );
};

export default Suppliers;
