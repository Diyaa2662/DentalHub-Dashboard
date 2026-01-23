import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
  GroupPanel,
  HeaderFilter,
} from "devextreme-react/data-grid";
import { TextBox } from "devextreme-react";
import {
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  Globe,
  Flag,
  X,
  Save,
  Info,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const Categories = () => {
  const { t } = useLanguage();

  // State for categories data from API
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for add form only (removed edit states)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name_en: "",
    name_sv: "",
  });

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/categories");
      const apiData = response.data?.data;

      if (Array.isArray(apiData)) {
        const formattedData = apiData.map((category) => ({
          id: category.id,
          name_en: category.name || "",
          name_sv: category.s_name || category.name || "",
          enabled: category.enabled === true,
          productCount: category.products_number || 0,
          originalData: category,
        }));

        setCategories(formattedData);
      } else {
        setError(
          t("noCategoriesData", "categories") || "No categories data found",
        );
        setCategories([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t("failedToLoadCategories", "categories") ||
          "Failed to load categories",
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle add new category
  const handleAddCategory = async () => {
    if (!newCategory.name_en.trim()) {
      alert(
        t("enterEnglishName", "categories") ||
          "Please enter category name in English",
      );
      return;
    }

    try {
      const categoryData = {
        name: newCategory.name_en.trim(),
        s_name: newCategory.name_sv.trim() || newCategory.name_en.trim(),
      };

      await api.post("/createcategory", categoryData);

      fetchCategories();
      setNewCategory({ name_en: "", name_sv: "" });
      setShowAddForm(false);
    } catch (err) {
      alert(
        t("addError", "categories") ||
          "Error adding category: " +
            (err.response?.data?.message || err.message || "Please try again"),
      );
    }
  };

  // ✅ Handle delete category
  const handleDeleteCategory = async (id, name) => {
    const confirmMessage = `${t("confirmDeleteCategory", "categories")} "${name}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      // eslint-disable-next-line no-unused-vars
      const categoryToDelete = categories.find((cat) => cat.id === id);

      setCategories((prev) => prev.filter((cat) => cat.id !== id));

      await api.delete(`/deletecategory/${id}`);

      setTimeout(() => {
        fetchCategories();
      }, 300);
    } catch (err) {
      fetchCategories();

      alert(
        t("deleteError", "categories") ||
          "Error deleting category: " +
            (err.response?.data?.message || err.message || "Please try again"),
      );
    }
  };

  // ✅ Handle toggle category status
  const handleToggleStatus = async (id) => {
    try {
      const currentCategory = categories.find((cat) => cat.id === id);
      if (!currentCategory) return;

      const newEnabledState = !currentCategory.enabled;

      await api.post(`/updatecategorystate/${id}`, {
        enabled: newEnabledState,
      });

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, enabled: newEnabledState } : cat,
        ),
      );
    } catch (err) {
      let errorMessage =
        t("statusUpdateError", "categories") || "Failed to update status";

      if (err.response?.status === 422) {
        const errorData = err.response.data;
        if (errorData.errors?.enabled) {
          errorMessage = errorData.errors.enabled[0];
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      alert(errorMessage);
    }
  };

  // Stats
  const stats = {
    total: categories.length,
    active: categories.filter((cat) => cat.enabled).length,
    inactive: categories.filter((cat) => !cat.enabled).length,
    totalProducts: categories.reduce((sum, cat) => sum + cat.productCount, 0),
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("categoriesManagement", "categories") ||
                "Categories Management"}
            </h1>
            <p className="text-gray-600">
              {t("manageCategories", "categories") ||
                "Manage product categories and subcategories"}
            </p>
          </div>
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium flex items-center space-x-2 mt-4 md:mt-0 cursor-not-allowed"
          >
            <Plus size={20} />
            <span>{t("addCategory", "categories") || "Add Category"}</span>
          </button>
        </div>

        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto mb-4"></div>
            <p className="text-gray-600">
              {t("loadingCategories", "categories") || "Loading categories..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("categoriesManagement", "categories") ||
                "Categories Management"}
            </h1>
            <p className="text-gray-600">
              {t("manageCategories", "categories") ||
                "Manage product categories and subcategories"}
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={fetchCategories}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
            >
              <RefreshCw size={18} />
              <span>{t("retry", "common") || "Retry"}</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>{t("addCategory", "categories") || "Add Category"}</span>
            </button>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoading", "categories") || "Error Loading Categories"}
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>

          <button
            onClick={fetchCategories}
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("categoriesManagement", "categories") || "Categories Management"}
          </h1>
          <p className="text-gray-600">
            {t("manageCategories", "categories") ||
              "Manage product categories and subcategories"}
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={fetchCategories}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
            title={t("refresh", "common") || "Refresh"}
          >
            <RefreshCw size={18} />
            <span>{t("refresh", "common") || "Refresh"}</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t("addCategory", "categories") || "Add Category"}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            {t("totalCategories", "categories") || "Total Categories"}
          </p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("activeCategories", "categories") || "Active Categories"}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={20} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("inactiveCategories", "categories") || "Inactive Categories"}
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.inactive}
              </p>
            </div>
            <XCircle className="text-yellow-500" size={20} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalProducts", "categories") || "Total Products"}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalProducts}
              </p>
            </div>
            <Package className="text-blue-500" size={20} />
          </div>
        </div>
      </div>

      {/* Form to Add New Category */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              {t("addCategory", "categories") || "Add New Category"}
            </h3>
            <button
              onClick={() => {
                setNewCategory({ name_en: "", name_sv: "" });
                setShowAddForm(false);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* English Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Globe className="mr-2 text-blue-500" size={16} />
                {t("categoryName", "categories") || "Category Name"} (English) *
              </label>
              <TextBox
                placeholder="e.g., Orthodontic Supplies"
                value={newCategory.name_en}
                onValueChange={(value) =>
                  setNewCategory({ ...newCategory, name_en: value })
                }
                width="100%"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("requiredField", "categories") || "Required field"}
              </p>
            </div>

            {/* Swedish Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Flag className="mr-2 text-yellow-500" size={16} />
                {t("categoryName", "categories") || "Category Name"} (Swedish)
              </label>
              <TextBox
                placeholder="e.g., Ortodontiska tillbehör"
                value={newCategory.name_sv}
                onValueChange={(value) =>
                  setNewCategory({ ...newCategory, name_sv: value })
                }
                width="100%"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t(
                  "Optional - will use English name if left empty",
                  "categories",
                ) || "Optional - will use English name if left empty"}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setNewCategory({ name_en: "", name_sv: "" });
                setShowAddForm(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              {t("cancel", "common") || "Cancel"}
            </button>
            <button
              onClick={handleAddCategory}
              disabled={!newCategory.name_en.trim()}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                !newCategory.name_en.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-dental-blue text-white hover:bg-blue-600"
              }`}
            >
              <Save size={18} />
              <span>{t("addCategory", "categories") || "Add Category"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Categories Table with DevExtreme DataGrid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {t("noCategoriesYet", "categories") || "No Categories Yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("startByAddingCategories", "categories") ||
                "Start by adding categories to organize your products"}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition inline-flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>
                {t("addFirstCategory", "categories") || "Add First Category"}
              </span>
            </button>
          </div>
        ) : (
          <DataGrid
            dataSource={categories}
            showBorders={true}
            columnAutoWidth={true}
            allowColumnResizing={true}
            columnMinWidth={100}
            height={500}
            allowColumnReordering={true}
            wordWrapEnabled={true}
            showColumnLines={true}
            showRowLines={true}
            rowAlternationEnabled={true}
          >
            <HeaderFilter visible={true} />
            <SearchPanel
              visible={true}
              placeholder={
                t("searchCategories", "categories") || "Search categories..."
              }
            />

            <GroupPanel
              visible={true}
              emptyPanelText={
                t("dragColumnToGroup", "categories") ||
                "Drag column here to group"
              }
            />

            <Paging defaultPageSize={10} />
            <Pager
              showPageSizeSelector={true}
              allowedPageSizes={[5, 10, 20]}
              showInfo={true}
            />

            {/* ID */}
            <Column
              dataField="id"
              caption="ID"
              width={70}
              alignment="left"
              allowGrouping={false}
            />

            {/* Category Name - English */}
            <Column
              dataField="name_en"
              caption={`${
                t("categoryName", "categories") || "Category Name"
              } (English)`}
              minWidth={170}
              alignment="left"
              allowGrouping={false}
              cellRender={({ data }) => (
                <div className="flex items-center">
                  <Globe className="text-blue-400 mr-2" size={14} />
                  <span>{data.name_en}</span>
                </div>
              )}
            />

            {/* Category Name - Swedish */}
            <Column
              dataField="name_sv"
              caption={`${
                t("categoryName", "categories") || "Category Name"
              } (Swedish)`}
              minWidth={170}
              alignment="left"
              allowGrouping={false}
              cellRender={({ data }) => (
                <div className="flex items-center">
                  <Flag className="text-yellow-400 mr-2" size={14} />
                  <span>{data.name_sv}</span>
                </div>
              )}
            />

            {/* Product Count */}
            <Column
              dataField="productCount"
              caption={t("totalProducts", "categories") || "Products"}
              width={140}
              alignment="left"
              allowGrouping={false}
              cellRender={({ data }) => (
                <div className="flex items-center">
                  <Package className="text-gray-400 mr-2" size={14} />
                  <span className="font-medium">{data.productCount}</span>
                </div>
              )}
            />

            {/* Status */}
            <Column
              dataField="enabled"
              caption={t("status", "categories") || "Status"}
              width={120}
              alignment="left"
              allowGrouping={true}
              cellRender={({ data }) => (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    data.enabled
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {data.enabled ? (
                    <>
                      <CheckCircle size={12} className="mr-1" />
                      {t("active", "categories") || "Active"}
                    </>
                  ) : (
                    <>
                      <XCircle size={12} className="mr-1" />
                      {t("inactive", "categories") || "Inactive"}
                    </>
                  )}
                </span>
              )}
            />

            {/* Actions */}
            <Column
              caption={t("actions", "products") || "Actions"}
              width={140}
              alignment="left"
              allowGrouping={false}
              cellRender={({ data }) => (
                <div className="flex space-x-2 justify-start">
                  {/* تمت إزالة زر التعديل Edit */}
                  <button
                    className={`p-1.5 rounded transition ${
                      data.enabled
                        ? "text-yellow-600 hover:bg-yellow-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={
                      data.enabled
                        ? t("disableCategory", "categories") ||
                          "Disable Category"
                        : t("enableCategory", "categories") || "Enable Category"
                    }
                    onClick={() => handleToggleStatus(data.id)}
                  >
                    {data.enabled ? (
                      <XCircle size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                  </button>
                  <button
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                    title={
                      t("deleteCategory", "categories") || "Delete Category"
                    }
                    onClick={() => handleDeleteCategory(data.id, data.name_en)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            />
          </DataGrid>
        )}
      </div>
    </div>
  );
};

export default Categories;
