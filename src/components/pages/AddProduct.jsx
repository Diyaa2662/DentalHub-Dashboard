import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { TextBox, TextArea } from "devextreme-react";
import { SelectBox } from "devextreme-react/select-box";
import { NumberBox } from "devextreme-react/number-box";
import {
  ArrowLeft,
  Save,
  Upload,
  Package,
  DollarSign,
  Tag,
  Hash,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Plus,
  Check,
  X,
} from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    cost: "",
    stock: "",
    description: "",
    image: null,
    status: "active",
    featured: false,
    trackInventory: true,
    lowStockAlert: 10,
    unit: "Piece",
    discount: 0, // حقل الخصم الجديد
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [showPassword, setShowPassword] = useState(false);

  // قائمة الفئات الافتراضية (يتم تحميلها أول مرة فقط)
  const defaultCategories = [
    { id: 1, name: t("equipment", "products"), enabled: true },
    { id: 2, name: t("imaging", "products"), enabled: true },
    { id: 3, name: t("surgical", "products"), enabled: true },
    { id: 4, name: t("restorative", "products"), enabled: true },
    { id: 5, name: t("hygiene", "products"), enabled: true },
    { id: 6, name: t("digital", "products"), enabled: true },
    { id: 7, name: t("sterilization", "products"), enabled: true },
    { id: 8, name: t("magnification", "products"), enabled: true },
    { id: 9, name: t("orthodontic", "products"), enabled: true },
  ];

  // قائمة الوحدات
  const units = [
    t("piece", "common"),
    t("set", "common"),
    t("box", "common"),
    t("kit", "common"),
    t("pack", "common"),
  ];

  // حالة خاصة باختيار الفئة - استخدام lazy initializer
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem("productCategories");
    if (savedCategories) {
      return JSON.parse(savedCategories);
    } else {
      localStorage.setItem(
        "productCategories",
        JSON.stringify(defaultCategories)
      );
      return defaultCategories;
    }
  });
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // حفظ الفئات عند التغيير
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem("productCategories", JSON.stringify(categories));
    }
  }, [categories]);

  // دالة لحساب السعر بعد الخصم
  const calculateDiscountedPrice = (price, discount) => {
    if (!price || discount === 0) return "";
    const original = parseFloat(price.replace(/[^0-9.-]+/g, ""));
    const discounted = original * (1 - discount / 100);
    return `$${discounted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // دالة لحساب مبلغ التوفير
  const calculateSavingsAmount = (price, discount) => {
    if (!price || discount === 0) return "";
    const original = parseFloat(price.replace(/[^0-9.-]+/g, ""));
    const savings = original * (discount / 100);
    return `$${savings.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));

      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSKU = () => {
    const prefix = "DENT";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const sku = `${prefix}-${randomNum}`;
    setFormData((prev) => ({ ...prev, sku }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // محاكاة إرسال البيانات إلى الخادم
    setTimeout(() => {
      console.log("Product data:", formData);
      setLoading(false);
      setSuccess(true);

      // إعادة التوجيه بعد 2 ثانية
      setTimeout(() => {
        navigate("/products");
      }, 2000);
    }, 1500);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // إضافة فئة جديدة
  const handleAddCategory = () => {
    if (newCategory.trim() === "") return;

    const newCat = {
      id: Date.now(), // استخدام timestamp كمعرف فريد
      name: newCategory.trim(),
      enabled: true,
    };

    setCategories((prev) => [...prev, newCat]);
    setFormData((prev) => ({ ...prev, category: newCat.name }));
    setNewCategory("");
    setIsAddingCategory(false);
  };

  // تفعيل/تعطيل فئة
  const toggleCategoryStatus = (id) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  // حذف فئة
  const handleDeleteCategory = (id) => {
    if (
      window.confirm(
        t("deleteCategoryConfirm", "addProduct") ||
          "Are you sure you want to delete this category?"
      )
    ) {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));

      // إذا كان المنتج يستخدم هذه الفئة، امسحها
      if (formData.category === categories.find((c) => c.id === id)?.name) {
        setFormData((prev) => ({ ...prev, category: "" }));
      }
    }
  };

  // الفعالة فقط لعرضها في القائمة المنسدلة
  const enabledCategories = categories
    .filter((cat) => cat.enabled)
    .map((cat) => cat.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("addNewProduct", "addProduct")}
            </h1>
            <p className="text-gray-600">
              {t("addDentalEquipment", "addProduct")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/products")}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          {t("cancel", "common")}
        </button>
      </div>

      {success ? (
        /* Success Message */
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t("productAddedSuccess", "addProduct")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("productAddedInventory", "addProduct")}
            </p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
            >
              {t("goBackProducts", "addProduct")}
            </button>
          </div>
        </div>
      ) : (
        /* Product Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package className="text-dental-blue" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("basicInformation", "addProduct")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("enterProductDetails", "addProduct")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("productName", "addProduct")} *
                    </label>
                    <TextBox
                      placeholder="e.g., Advanced Dental Chair"
                      value={formData.name}
                      onValueChange={(value) => handleChange("name", value)}
                      width="100%"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("skuStockKeeping", "addProduct")}
                      </label>
                      <button
                        type="button"
                        onClick={generateSKU}
                        className="text-sm text-dental-blue hover:text-blue-600"
                      >
                        {t("generateSku", "addProduct")}
                      </button>
                    </div>
                    <div className="relative">
                      <TextBox
                        placeholder="DENT-1234"
                        value={formData.sku}
                        onValueChange={(value) => handleChange("sku", value)}
                        width="100%"
                      />
                      <Hash
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>

                  {/* Category - الجزء المعدل */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("category", "products")} *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(true)}
                        className="text-sm text-dental-blue hover:text-blue-600 flex items-center"
                      >
                        <Plus size={14} className="mr-1" />
                        {t("addNewCategory", "addProduct") || "Add New"}
                      </button>
                    </div>

                    {isAddingCategory ? (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <TextBox
                            placeholder={
                              t("enterNewCategory", "addProduct") ||
                              "Enter new category"
                            }
                            value={newCategory}
                            onValueChange={setNewCategory}
                            width="100%"
                          />
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            disabled={!newCategory.trim()}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingCategory(false);
                              setNewCategory("");
                            }}
                            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          {t("categoryWillBeSaved", "addProduct") ||
                            "Category will be saved for future use"}
                        </p>
                      </div>
                    ) : (
                      <SelectBox
                        items={enabledCategories}
                        value={formData.category}
                        onValueChange={(value) =>
                          handleChange("category", value)
                        }
                        placeholder={
                          t("selectCategory", "addProduct") || "Select category"
                        }
                        searchEnabled={true}
                        width="100%"
                      />
                    )}
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("unit", "addProduct")}
                    </label>
                    <SelectBox
                      items={units}
                      value={formData.unit}
                      onValueChange={(value) => handleChange("unit", value)}
                      placeholder={
                        t("selectUnit", "addProduct") || "Select unit"
                      }
                      width="100%"
                    />
                  </div>
                </div>

                {/* Category Management - عرض وإدارة الفئات */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {t("manageCategories", "addProduct") || "Manage Categories"}
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <span
                            className={`text-sm ${
                              category.enabled
                                ? "text-gray-800"
                                : "text-gray-400 line-through"
                            }`}
                          >
                            {category.name}
                          </span>
                          <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-200">
                            {
                              categories.filter((c) => c.name === category.name)
                                .length
                            }{" "}
                            {t("products", "addProduct").toLowerCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => toggleCategoryStatus(category.id)}
                            className={`text-xs px-2 py-1 rounded ${
                              category.enabled
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {category.enabled
                              ? t("disable", "common") || "Disable"
                              : t("enable", "common") || "Enable"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            {t("delete", "common")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & Stock Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="text-green-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("pricingStock", "addProduct")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("setPricingInventory", "addProduct")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Selling Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("sellingPrice", "addProduct")} *
                    </label>
                    <div className="relative">
                      <NumberBox
                        placeholder="0.00"
                        value={formData.price}
                        onValueChange={(value) => handleChange("price", value)}
                        format="$ #,##0.##"
                        width="100%"
                      />
                      <DollarSign
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>

                  {/* Cost Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("costPrice", "addProduct")}
                    </label>
                    <div className="relative">
                      <NumberBox
                        placeholder="0.00"
                        value={formData.cost}
                        onValueChange={(value) => handleChange("cost", value)}
                        format="$ #,##0.##"
                        width="100%"
                      />
                      <Tag
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>

                  {/* Discount Percentage - الجديد */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("discountPercentage", "addProduct")}
                    </label>
                    <div className="relative">
                      <NumberBox
                        placeholder="0"
                        value={formData.discount}
                        onValueChange={(value) =>
                          handleChange("discount", value)
                        }
                        format="#0 %"
                        showSpinButtons={true}
                        min={0}
                        max={100}
                        step={0.1}
                        width="100%"
                      />
                    </div>
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("stockQuantity", "addProduct")} *
                    </label>
                    <NumberBox
                      placeholder="0"
                      value={formData.stock}
                      onValueChange={(value) => handleChange("stock", value)}
                      showSpinButtons={true}
                      min={0}
                      width="100%"
                    />
                  </div>
                </div>

                {/* Display Final Price After Discount - الجديد */}
                {formData.discount > 0 && formData.price && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-800 font-medium">
                          {t("priceAfterDiscount", "addProduct") ||
                            "Price After Discount"}
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {calculateDiscountedPrice(
                            formData.price,
                            formData.discount
                          )}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          {t("saveAmount", "addProduct") || "Save"}:{" "}
                          {calculateSavingsAmount(
                            formData.price,
                            formData.discount
                          )}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Tag className="text-blue-600" size={24} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Low Stock Alert */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("lowStockAlert", "addProduct")}
                  </label>
                  <NumberBox
                    placeholder="10"
                    value={formData.lowStockAlert}
                    onValueChange={(value) =>
                      handleChange("lowStockAlert", value)
                    }
                    showSpinButtons={true}
                    min={0}
                    width="100%"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {t("getNotifiedWhenStock", "addProduct")}
                  </p>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <AlertCircle className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("descriptionDetails", "addProduct")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("addProductDescription", "addProduct")}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("productDescription", "addProduct")}
                  </label>
                  <TextArea
                    placeholder={
                      t("describeProductFeatures", "addProduct") ||
                      "Describe the product features, specifications, and benefits..."
                    }
                    value={formData.description}
                    onValueChange={(value) =>
                      handleChange("description", value)
                    }
                    height={150}
                    width="100%"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  {t("cancel", "common")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition flex items-center justify-center
                    ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-dental-blue text-white hover:bg-blue-600"
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t("saving", "addProduct")}
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2" />
                      {t("saveProduct", "addProduct")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Image Upload & Preview */}
          <div className="space-y-6">
            {/* Image Upload Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <ImageIcon className="text-orange-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("productImage", "addProduct")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("uploadProductPhotos", "addProduct")}
                  </p>
                </div>
              </div>

              {/* Image Preview */}
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative mx-auto w-48 h-48">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData((prev) => ({ ...prev, image: null }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        {t("imagePreview", "addProduct") || "Image preview"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Upload className="text-gray-400" size={24} />
                      </div>
                      <div>
                        <p className="text-gray-600 mb-2">
                          {t("dragDropClick", "addProduct")}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t("supportsJpgPng", "addProduct")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  id="product-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="product-image"
                  className="block w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Upload size={18} />
                    <span className="font-medium">
                      {t("chooseImage", "addProduct")}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Product Status Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t("productStatus", "addProduct")}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{t("status", "common")}</span>
                  <select
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1"
                    name={t("status", "common") || "Status"}
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">{t("active", "common")}</option>
                    <option value="inactive">{t("inactive", "common")}</option>
                    <option value="draft">{t("draft", "common")}</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    {t("featuredProduct", "addProduct")}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    {t("trackInventory", "addProduct")}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      name="trackInventory"
                      checked={formData.trackInventory}
                      onChange={handleInputChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                📝 {t("quickTips", "addProduct")}
              </h3>
              <ul className="space-y-3 text-sm text-blue-700">
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">1</span>
                  </div>
                  <span>{t("useClearDescriptive", "addProduct")}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">2</span>
                  </div>
                  <span>{t("setRealisticStock", "addProduct")}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">3</span>
                  </div>
                  <span>{t("highQualityImages", "addProduct")}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">4</span>
                  </div>
                  <span>{t("accuratePricing", "addProduct")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
