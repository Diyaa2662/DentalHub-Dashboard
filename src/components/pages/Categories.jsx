import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
  Grouping,
  GroupPanel,
  HeaderFilter,
} from "devextreme-react/data-grid";
import { TextBox } from "devextreme-react";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  Globe,
  Flag,
  Check,
  X,
  Save,
  Info,
} from "lucide-react";

const Categories = () => {
  const { t } = useLanguage();

  // بيانات وهمية للفئات للعرض فقط
  const [categories, setCategories] = useState([
    {
      id: 1,
      name_en: "Equipment",
      name_sv: "Utrustning",
      enabled: true,
      productCount: 24,
    },
    {
      id: 2,
      name_en: "Imaging",
      name_sv: "Bildbehandling",
      enabled: true,
      productCount: 18,
    },
    {
      id: 3,
      name_en: "Surgical",
      name_sv: "Kirurgisk",
      enabled: true,
      productCount: 32,
    },
    {
      id: 4,
      name_en: "Restorative",
      name_sv: "Restaurativ",
      enabled: false,
      productCount: 15,
    },
    {
      id: 5,
      name_en: "Hygiene",
      name_sv: "Hygien",
      enabled: true,
      productCount: 27,
    },
    {
      id: 6,
      name_en: "Digital",
      name_sv: "Digital",
      enabled: true,
      productCount: 12,
    },
    {
      id: 7,
      name_en: "Sterilization",
      name_sv: "Sterilisering",
      enabled: true,
      productCount: 8,
    },
    {
      id: 8,
      name_en: "Magnification",
      name_sv: "Förstoring",
      enabled: false,
      productCount: 6,
    },
    {
      id: 9,
      name_en: "Orthodontic",
      name_sv: "Ortodontisk",
      enabled: true,
      productCount: 21,
    },
  ]);

  // حالة لعرض/إخفاء نموذج إضافة فئة
  const [showAddForm, setShowAddForm] = useState(false);

  // حالة لعرض/إخفاء Popup تعديل الفئة
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // حالة بيانات الفئة الجديدة
  const [newCategory, setNewCategory] = useState({
    name_en: "",
    name_sv: "",
  });

  // إحصائيات وهمية
  const stats = {
    total: categories.length,
    active: categories.filter((cat) => cat.enabled).length,
    inactive: categories.filter((cat) => !cat.enabled).length,
    totalProducts: categories.reduce((sum, cat) => sum + cat.productCount, 0),
  };

  // دالة إضافة فئة جديدة (وهمية)
  const handleAddCategory = () => {
    if (!newCategory.name_en.trim()) {
      alert("Please enter category name in English");
      return;
    }

    const newCat = {
      id: categories.length + 1,
      name_en: newCategory.name_en.trim(),
      name_sv: newCategory.name_sv.trim() || newCategory.name_en.trim(),
      enabled: true,
      productCount: 0,
    };

    // إضافة الفئة الجديدة للقائمة
    setCategories([...categories, newCat]);

    // إعادة تعيين الحقول وإخفاء النموذج
    setNewCategory({ name_en: "", name_sv: "" });
    setShowAddForm(false);

    // رسالة تأكيد (يمكن إزالتها لاحقاً)
    alert("Category added successfully!");
  };

  // دالة لإلغاء الإضافة
  const handleCancelAdd = () => {
    setNewCategory({ name_en: "", name_sv: "" });
    setShowAddForm(false);
  };

  // دالة لحذف فئة (وهمية)
  const handleDeleteCategory = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter((cat) => cat.id !== id));
      alert("Category deleted successfully!");
    }
  };

  // دالة لتعديل حالة الفئة (تفعيل/تعطيل)
  const handleToggleStatus = (id) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  // دالة فتح Popup التعديل
  const handleEditCategory = (category) => {
    setEditingCategory({ ...category });
    setShowEditPopup(true);
  };

  // دالة حفظ التعديلات
  const handleSaveEdit = () => {
    if (!editingCategory.name_en.trim()) {
      alert("Please enter category name in English");
      return;
    }

    // تحديث الفئة في القائمة
    setCategories(
      categories.map((cat) =>
        cat.id === editingCategory.id ? editingCategory : cat
      )
    );

    // إغلاق البوب أب وعرض رسالة نجاح
    setShowEditPopup(false);
    setEditingCategory(null);
    alert("Category updated successfully!");
  };

  // دالة إلغاء التعديل
  const handleCancelEdit = () => {
    setShowEditPopup(false);
    setEditingCategory(null);
  };

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
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2 mt-4 md:mt-0"
        >
          <Plus size={20} />
          <span>{t("addCategory", "categories") || "Add Category"}</span>
        </button>
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
              onClick={handleCancelAdd}
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
                  "categories"
                ) || "Optional - will use English name if left empty"}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancelAdd}
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

      {/* Edit Category Popup */}
      {showEditPopup && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {t("editCategory", "categories") || "Edit Category"}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Category Information */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Info className="text-blue-500" size={18} />
                  <span className="text-sm font-medium text-blue-800">
                    Category Information
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">ID:</span>
                    <span className="font-medium ml-2">
                      {editingCategory.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Products:</span>
                    <span className="font-medium ml-2">
                      {editingCategory.productCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`ml-2 font-medium ${
                        editingCategory.enabled
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {editingCategory.enabled ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* English Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Globe className="mr-2 text-blue-500" size={16} />
                  {t("categoryName", "categories") || "Category Name"} (English)
                  *
                </label>
                <TextBox
                  placeholder="e.g., Orthodontic Supplies"
                  value={editingCategory.name_en}
                  onValueChange={(value) =>
                    setEditingCategory({ ...editingCategory, name_en: value })
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
                  value={editingCategory.name_sv}
                  onValueChange={(value) =>
                    setEditingCategory({ ...editingCategory, name_sv: value })
                  }
                  width="100%"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t(
                    "Optional - will use English name if left empty",
                    "categories"
                  ) || "Optional - will use English name if left empty"}
                </p>
              </div>

              {/* Status Toggle */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  id="category-status"
                  checked={editingCategory.enabled}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      enabled: e.target.checked,
                    })
                  }
                  className="h-5 w-5 text-dental-blue rounded mt-0.5"
                />
                <div>
                  <label
                    htmlFor="category-status"
                    className="text-sm font-medium text-gray-700"
                  >
                    {t("enableCategory", "categories") || "Enable Category"}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("categoryStatusDescription", "categories") ||
                      "Disabled categories won't appear in product selection"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                {t("cancel", "common") || "Cancel"}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editingCategory.name_en.trim()}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                  !editingCategory.name_en.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-dental-blue text-white hover:bg-blue-600"
                }`}
              >
                <Save size={18} />
                <span>{t("saveChanges", "categories") || "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Table with DevExtreme DataGrid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataGrid
          dataSource={categories}
          showBorders={true}
          columnAutoWidth={true}
          allowColumnResizing={true}
          columnMinWidth={100}
          height={500}
          selection={{ mode: "multiple" }}
          allowColumnReordering={true}
          wordWrapEnabled={true}
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
            emptyPanelText="Drag column here to group"
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
            minWidth={180}
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
            minWidth={180}
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
            width={120}
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
                <button
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                  title={t("editCategory", "categories") || "Edit Category"}
                  onClick={() => handleEditCategory(data)}
                >
                  <Edit size={16} />
                </button>
                <button
                  className={`p-1.5 rounded transition ${
                    data.enabled
                      ? "text-yellow-600 hover:bg-yellow-50"
                      : "text-green-600 hover:bg-green-50"
                  }`}
                  title={
                    data.enabled
                      ? t("disableCategory", "categories") || "Disable Category"
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
                  title={t("deleteCategory", "categories") || "Delete Category"}
                  onClick={() => handleDeleteCategory(data.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        </DataGrid>
      </div>
    </div>
  );
};

export default Categories;
