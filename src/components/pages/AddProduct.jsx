import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
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
  Star,
  Globe,
  Flag,
  X,
  PlusCircle,
  Loader2,
} from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // State for categories from API
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // State للـ Popup
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryNameSv, setNewCategoryNameSv] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  // البيانات الرئيسية للمنتج
  const [formData, setFormData] = useState({
    name: "",
    s_name: "",
    sku: "", // الآن يمكن أن يكون فارغاً
    category: "",
    price: "",
    cost: "",
    stock_quantity: "",
    low_stock_alert_threshold: 10,
    tax_rate: 0,
    discount_price: "",
    description: "",
    s_description: "",
    product_rate: 0,
  });

  // State للصور
  const [images, setImages] = useState([]);

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      const apiData = response.data?.data;

      if (Array.isArray(apiData)) {
        const activeCategories = apiData.filter((cat) => cat.enabled === true);
        setCategories(activeCategories);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getCategoryDisplayName = (category) => {
    const currentLang = localStorage.getItem("language") || "en";
    if (currentLang === "sv" && category.s_name) {
      return category.s_name;
    }
    return category.name || category.name_en;
  };

  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    name: getCategoryDisplayName(cat),
    value: cat.name || cat.name_en,
  }));

  // دالة إضافة فئة جديدة
  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      alert(
        t("categoryNameRequired", "addProduct") ||
          "Please enter category name in English"
      );
      return;
    }

    setAddingCategory(true);

    try {
      const formData = new FormData();
      formData.append("name", newCategoryName.trim());

      if (newCategoryNameSv.trim()) {
        formData.append("s_name", newCategoryNameSv.trim());
      }

      const response = await api.post("/createcategory", formData);

      if (
        response.data?.success ||
        response.status === 200 ||
        response.status === 201
      ) {
        // إغلاق الـ popup وإعادة تعيين الحقول
        setShowCategoryPopup(false);
        setNewCategoryName("");
        setNewCategoryNameSv("");

        // إعادة تحميل الفئات
        await fetchCategories();

        // تعيين الفئة المضافة تلقائياً
        const addedCategoryName = newCategoryName.trim();
        setFormData((prev) => ({
          ...prev,
          category: addedCategoryName,
        }));

        alert(
          t("categoryAddedSuccess", "addProduct") ||
            "Category added successfully!"
        );
      } else {
        throw new Error(response.data?.message || "Failed to add category");
      }
    } catch (err) {
      console.error("Error adding category:", err);
      alert(
        t("categoryAddError", "addProduct") ||
          "Error adding category: " +
            (err.response?.data?.message || err.message)
      );
    } finally {
      setAddingCategory(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 4 - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length === 0) {
      alert(
        t("maxImagesAlert", "addProduct") ||
          "You can only upload up to 4 images. You already have 4 images."
      );
      return;
    }

    const newImagePreviews = filesToAdd.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => {
          resolve({
            file,
            preview: reader.result,
            id: Date.now() + Math.random(),
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImagePreviews).then((previews) => {
      setImages((prev) => [...prev, ...previews]);
    });

    e.target.value = "";
  };

  const handleRemoveImage = (imageId) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("imageIndex", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = e.dataTransfer.getData("imageIndex");
    const newImages = [...images];
    const [draggedImage] = newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    setImages(newImages);
  };

  // ✅ إزالة دالة generateSKU تماماً

  const calculateProfitMargin = () => {
    if (!formData.cost || !formData.price) return 0;

    const cost = parseFloat(formData.cost);
    const price = parseFloat(formData.price);

    if (cost === 0 || price <= cost) return 0;

    const profit = price - cost;
    const margin = (profit / cost) * 100;
    return margin.toFixed(2);
  };

  const calculateProfitAmount = () => {
    if (!formData.cost || !formData.price) return 0;

    const cost = parseFloat(formData.cost);
    const price = parseFloat(formData.price);

    if (price <= cost) return 0;

    return (price - cost).toFixed(2);
  };

  const calculateDiscountAmount = () => {
    if (
      !formData.price ||
      !formData.discount_price ||
      formData.discount_price >= formData.price
    )
      return 0;

    const price = parseFloat(formData.price);
    const discountPrice = parseFloat(formData.discount_price);

    return (price - discountPrice).toFixed(2);
  };

  const calculateDiscountPercentage = () => {
    if (
      !formData.price ||
      !formData.discount_price ||
      formData.discount_price >= formData.price
    )
      return 0;

    const price = parseFloat(formData.price);
    const discountPrice = parseFloat(formData.discount_price);
    const discountAmount = price - discountPrice;

    return ((discountAmount / price) * 100).toFixed(1);
  };

  const calculateFinalPrice = () => {
    if (!formData.price) return 0;

    let finalPrice = parseFloat(formData.price);

    if (formData.discount_price && formData.discount_price < formData.price) {
      finalPrice = parseFloat(formData.discount_price);
    }

    const taxRate = parseFloat(formData.tax_rate || 0) / 100;

    if (taxRate > 0) {
      finalPrice = finalPrice * (1 + taxRate);
    }

    return finalPrice.toFixed(2);
  };

  const calculateTaxAmount = () => {
    if (!formData.price || !formData.tax_rate) return 0;

    let priceBeforeTax = parseFloat(formData.price);

    if (formData.discount_price && formData.discount_price < formData.price) {
      priceBeforeTax = parseFloat(formData.discount_price);
    }

    const taxRate = parseFloat(formData.tax_rate || 0) / 100;
    return (priceBeforeTax * taxRate).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert(
        t("nameRequiredAlert", "addProduct") ||
          "Please enter product name in English"
      );
      return;
    }

    if (!formData.price) {
      alert(
        t("priceRequiredAlert", "addProduct") || "Please enter product price"
      );
      return;
    }

    if (!formData.category) {
      alert(
        t("categoryRequiredAlert", "addProduct") || "Please select a category"
      );
      return;
    }

    // ✅ إزالة التحقق من SKU - الآن أصبح اختياري

    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name.trim());

      if (formData.s_name.trim()) {
        formDataToSend.append("s_name", formData.s_name.trim());
      }

      formDataToSend.append("description", formData.description.trim() || "");

      if (formData.s_description.trim()) {
        formDataToSend.append("s_description", formData.s_description.trim());
      }

      // ✅ إرسال SKU فقط إذا كان له قيمة
      if (formData.sku && formData.sku.trim()) {
        formDataToSend.append("sku", formData.sku.trim());
      }
      // إذا كان فارغاً، لن نرسل حقل SKU وسيولده الباكند تلقائياً

      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", parseFloat(formData.price).toFixed(2));
      formDataToSend.append(
        "cost",
        formData.cost ? parseFloat(formData.cost).toFixed(2) : "0.00"
      );
      formDataToSend.append(
        "stock_quantity",
        parseInt(formData.stock_quantity) || 0
      );

      formDataToSend.append(
        "tax_rate",
        parseFloat(formData.tax_rate || 0).toFixed(2)
      );

      if (formData.discount_price && formData.discount_price < formData.price) {
        formDataToSend.append(
          "discount_price",
          parseFloat(formData.discount_price).toFixed(2)
        );
      }

      formDataToSend.append(
        "low_stock_alert_threshold",
        parseInt(formData.low_stock_alert_threshold) || 10
      );

      formDataToSend.append(
        "product_rate",
        parseFloat(formData.product_rate || 0).toFixed(1)
      );

      images.forEach((image, index) => {
        formDataToSend.append(`images[${index + 1}]`, image.file);
      });

      const response = await api.post("/createproduct", formDataToSend);

      if (response.status === 200 || response.status === 201) {
        if (
          response.data.success === true ||
          response.data.message?.toLowerCase().includes("success") ||
          response.data.message?.toLowerCase().includes("created")
        ) {
          setSuccess(true);
          setError(null);
          setTimeout(() => {
            navigate("/products");
          }, 2000);
        } else {
          setError(
            response.data.message ||
              t("apiSuccessFalse", "addProduct") ||
              "Operation completed but API returned success: false"
          );
        }
      } else {
        setError(
          response.data.message ||
            t("createProductFailed", "addProduct") ||
            "Failed to create product"
        );
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors || err.response.data;
        let errorMessage =
          t("validationError", "addProduct") || "Validation error:\n";

        if (typeof errors === "object") {
          Object.entries(errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessage += `${field}: ${messages.join(", ")}\n`;
            } else {
              errorMessage += `${field}: ${messages}\n`;
            }
          });
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }

        setError(errorMessage);
      } else {
        setError(
          err.message ||
            t("createProductError", "addProduct") ||
            "Error creating product"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Popup Modal */}
      {showCategoryPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <PlusCircle className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {t("addNewCategory", "addProduct") || "Add New Category"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {t("addCategoryDescription", "addProduct") ||
                        "Add a new category to organize your products"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCategoryPopup(false);
                    setNewCategoryName("");
                    setNewCategoryNameSv("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* English Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("categoryName", "addProduct") || "Category Name"} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={
                      t("categoryNamePlaceholder", "addProduct") ||
                      "e.g., Dental Equipment"
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                    autoFocus
                  />
                  <Globe
                    className="absolute right-3 top-3.5 text-gray-400"
                    size={18}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t("englishRequired", "addProduct") ||
                    "English name is required"}
                </p>
              </div>

              {/* Swedish Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("categoryNameSwedish", "addProduct") ||
                    "Swedish Name (Optional)"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newCategoryNameSv}
                    onChange={(e) => setNewCategoryNameSv(e.target.value)}
                    placeholder={
                      t("categoryNameSvPlaceholder", "addProduct") ||
                      "e.g., Tandläkarutrustning"
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dental-blue focus:border-transparent"
                  />
                  <Flag
                    className="absolute right-3 top-3.5 text-gray-400"
                    size={18}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t("swedishOptional", "addProduct") ||
                    "Swedish name is optional"}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCategoryPopup(false);
                    setNewCategoryName("");
                    setNewCategoryNameSv("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                  disabled={addingCategory}
                >
                  {t("cancel", "common") || "Cancel"}
                </button>
                <button
                  onClick={handleAddNewCategory}
                  disabled={!newCategoryName.trim() || addingCategory}
                  className={`px-6 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                    !newCategoryName.trim() || addingCategory
                      ? "bg-gray-300 cursor-not-allowed text-gray-500"
                      : "bg-dental-blue text-white hover:bg-blue-600"
                  }`}
                >
                  {addingCategory ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>{t("adding", "addProduct") || "Adding..."}</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      <span>
                        {t("addCategory", "addProduct") || "Add Category"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {t("addNewProduct", "addProduct") || "Add New Product"}
            </h1>
            <p className="text-gray-600">
              {t("addDentalEquipment", "addProduct") ||
                "Add new dental equipment to inventory"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/products")}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          {t("cancel", "common") || "Cancel"}
        </button>
      </div>

      {/* Error/Success Message */}
      {error && !success && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("error", "common") || "Error"}
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success ? (
        /* Success Message */
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t("productAddedSuccess", "addProduct") ||
                "Product Added Successfully!"}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("productAddedInventory", "addProduct") ||
                "The product has been added to your inventory."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
            >
              {t("goBackProducts", "addProduct") || "Back to Products"}
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
                      {t("basicInformation", "addProduct") ||
                        "Basic Information"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("enterProductDetails", "addProduct") ||
                        "Enter product basic details"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name - English */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Globe className="mr-2 text-blue-500" size={16} />
                      {t("productName", "products")} (
                      {t("english", "common") || "English"}) *
                    </label>
                    <TextBox
                      placeholder={
                        t("productNamePlaceholder", "addProduct") ||
                        "e.g., Advanced Dental Chair"
                      }
                      value={formData.name}
                      onValueChange={(value) => handleChange("name", value)}
                      width="100%"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t("requiredField", "addProduct") || "Required field"}
                    </p>
                  </div>

                  {/* Product Name - Swedish */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Flag className="mr-2 text-yellow-500" size={16} />
                      {t("productName", "products")} (
                      {t("swedish", "common") || "Swedish"})
                    </label>
                    <TextBox
                      placeholder={
                        t("productNameSvPlaceholder", "addProduct") ||
                        "e.g., Avancerad Tandstol"
                      }
                      value={formData.s_name}
                      onValueChange={(value) => handleChange("s_name", value)}
                      width="100%"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t("optionalField", "addProduct") ||
                        "Optional - will use English name if left empty"}
                    </p>
                  </div>

                  {/* SKU */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        SKU {/* ✅ إزالة النجمة */}
                      </label>
                    </div>
                    <div className="relative">
                      <TextBox
                        placeholder={
                          t("skuOptionalPlaceholder", "addProduct") ||
                          "SKU-202412001 (Leave empty for auto-generation)"
                        }
                        value={formData.sku}
                        onValueChange={(value) => handleChange("sku", value)}
                        width="100%"
                      />
                      <Hash
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("skuOptionalHint", "addProduct") ||
                        "Optional - leave empty to generate automatically"}
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t("category", "products")} *
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate("/categories")}
                        className="text-sm text-dental-blue hover:text-blue-600 hover:underline flex items-center"
                      >
                        <Package size={14} className="mr-1" />
                        {t("manageCategories", "addProduct") ||
                          "Manage Categories"}
                      </button>
                    </div>
                    <SelectBox
                      items={categoryOptions}
                      value={formData.category}
                      onValueChange={(value) => handleChange("category", value)}
                      displayExpr="name"
                      valueExpr="value"
                      placeholder={
                        t("selectCategory", "addProduct") || "Select category"
                      }
                      searchEnabled={true}
                      width="100%"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t("categoryNotListed", "addProduct") ||
                        "Can't find your category?"}{" "}
                      <button
                        type="button"
                        onClick={() => setShowCategoryPopup(true)}
                        className="text-dental-blue hover:underline font-medium"
                      >
                        {t("addNewCategory", "addProduct") ||
                          "Add new category"}
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="text-green-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("pricing", "addProduct") || "Pricing"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("setProductPricing", "addProduct") ||
                        "Set product pricing details"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Cost Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("costPrice", "addProduct") || "Cost Price"} *
                    </label>
                    <div className="relative">
                      <NumberBox
                        placeholder="0.00"
                        value={formData.cost}
                        onValueChange={(value) => handleChange("cost", value)}
                        format="$ #,##0.##"
                        width="100%"
                        min={0}
                      />
                      <DollarSign
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("price", "products")} *
                    </label>
                    <div className="relative">
                      <NumberBox
                        placeholder="0.00"
                        value={formData.price}
                        onValueChange={(value) => handleChange("price", value)}
                        format="$ #,##0.##"
                        width="100%"
                        min={0}
                      />
                      <DollarSign
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>

                  {/* Discount Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("priceAfterDiscount", "products")}
                    </label>
                    <div className="relative">
                      <NumberBox
                        placeholder="0.00"
                        value={formData.discount_price}
                        onValueChange={(value) =>
                          handleChange("discount_price", value)
                        }
                        format="$ #,##0.##"
                        width="100%"
                        min={0}
                      />
                      <DollarSign
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>

                  {/* Tax Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("taxRate", "products")}
                    </label>
                    <div className="relative">
                      <NumberBox
                        placeholder="0"
                        value={formData.tax_rate}
                        onValueChange={(value) =>
                          handleChange("tax_rate", value)
                        }
                        format="#0.00" // ✅ تغيير من "#0 %" إلى "#0.00"
                        showSpinButtons={true}
                        min={0}
                        max={100}
                        step={0.01} // ✅ تغيير الخطوة إلى 0.01
                        width="100%"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("taxRateExample", "addProduct") ||
                        "Enter 10 for 10% tax"}
                    </p>
                  </div>

                  {/* Product Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("productRating", "addProduct") || "Product Rating"}{" "}
                      (0.0 - 5.0)
                    </label>
                    <div className="relative">
                      <NumberBox
                        placeholder="0.0"
                        value={formData.product_rate}
                        onValueChange={(value) =>
                          handleChange("product_rate", value)
                        }
                        format="#0.0"
                        showSpinButtons={true}
                        min={0}
                        max={5}
                        step={0.1}
                        width="100%"
                      />
                      <Star
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 text-yellow-400"
                        size={18}
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Summary */}
                {(formData.cost ||
                  formData.discount_price ||
                  formData.tax_rate > 0) && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-3">
                      {t("pricingSummary", "addProduct") || "Pricing Summary"}
                    </h4>
                    <div className="space-y-2">
                      {formData.cost && formData.price && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {t("costPrice", "addProduct") || "Cost Price"}:
                            </span>
                            <span className="font-medium">
                              ${parseFloat(formData.cost || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {t("sellingPrice", "addProduct") ||
                                "Selling Price"}
                              :
                            </span>
                            <span className="font-medium">
                              ${parseFloat(formData.price || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {t("profitAmount", "addProduct") ||
                                "Profit Amount"}
                              :
                            </span>
                            <span className="font-medium text-green-600">
                              ${calculateProfitAmount()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {t("profitMargin", "addProduct") ||
                                "Profit Margin"}
                              :
                            </span>
                            <span className="font-medium text-green-600">
                              {calculateProfitMargin()}%
                            </span>
                          </div>
                        </>
                      )}

                      {formData.discount_price &&
                        formData.discount_price < formData.price && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {t("discountPrice", "addProduct") ||
                                  "Discount Price"}
                                :
                              </span>
                              <span className="font-medium text-blue-600">
                                $
                                {parseFloat(formData.discount_price).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {t("discountAmount", "addProduct") ||
                                  "Discount Amount"}
                                :
                              </span>
                              <span className="font-medium text-red-600">
                                -${calculateDiscountAmount()}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {t("discountPercentage", "addProduct") ||
                                  "Discount Percentage"}
                                :
                              </span>
                              <span className="font-medium text-red-600">
                                {calculateDiscountPercentage()}% OFF
                              </span>
                            </div>
                          </>
                        )}

                      {formData.tax_rate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {t("tax", "addProduct") || "Tax"} (
                            {parseFloat(formData.tax_rate || 0).toFixed(1)}%):{" "}
                            {/* ✅ تصحيح */}
                          </span>
                          <span className="font-medium text-orange-600">
                            +${calculateTaxAmount()}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                        <span className="font-medium text-blue-800">
                          {t("finalPrice", "addProduct") || "Final Price"}:
                        </span>
                        <span className="font-bold text-blue-900 text-lg">
                          ${calculateFinalPrice()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stock & Inventory Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Package className="text-yellow-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("stockInventory", "addProduct") || "Stock & Inventory"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("setStockDetails", "addProduct") ||
                        "Set inventory and stock alert details"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("stock", "products")} *
                    </label>
                    <NumberBox
                      placeholder="0"
                      value={formData.stock_quantity}
                      onValueChange={(value) =>
                        handleChange("stock_quantity", value)
                      }
                      showSpinButtons={true}
                      min={0}
                      width="100%"
                    />
                  </div>

                  {/* Low Stock Alert Threshold */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("lowStockAlert", "addProduct") ||
                        "Low Stock Alert Threshold"}{" "}
                      *
                    </label>
                    <NumberBox
                      placeholder="10"
                      value={formData.low_stock_alert_threshold}
                      onValueChange={(value) =>
                        handleChange("low_stock_alert_threshold", value)
                      }
                      showSpinButtons={true}
                      min={0}
                      width="100%"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t("lowStockDescription", "addProduct") ||
                        "Product will be marked as 'Low Stock' when quantity ≤ this threshold"}
                    </p>
                  </div>
                </div>

                {/* Stock Status Preview */}
                {formData.stock_quantity !== "" && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">
                      {t("stockStatusPreview", "addProduct") ||
                        "Stock Status Preview"}
                      :
                    </h4>
                    <div className="flex items-center space-x-4">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          parseInt(formData.stock_quantity) === 0
                            ? "bg-red-100 text-red-800"
                            : parseInt(formData.stock_quantity) <
                              parseInt(formData.low_stock_alert_threshold)
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {parseInt(formData.stock_quantity) === 0
                          ? t("outOfStock", "products") || "Out of Stock"
                          : parseInt(formData.stock_quantity) <
                            parseInt(formData.low_stock_alert_threshold)
                          ? t("lowStock", "products") || "Low Stock"
                          : t("inStock", "products") || "In Stock"}
                      </div>
                      <span className="text-sm text-gray-600">
                        {t("current", "common") || "Current"}:{" "}
                        {formData.stock_quantity}{" "}
                        {t("units", "addProduct") || "units"} •{" "}
                        {t("threshold", "addProduct") || "Threshold"}:{" "}
                        {formData.low_stock_alert_threshold}{" "}
                        {t("units", "addProduct") || "units"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <AlertCircle className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("descriptionDetails", "addProduct") ||
                        "Description & Details"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("addProductDescription", "addProduct") ||
                        "Add product description and specifications"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Description - English */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Globe className="mr-2 text-blue-500" size={16} />
                      {t("description", "products")} (
                      {t("english", "common") || "English"})
                    </label>
                    <TextArea
                      placeholder={
                        t("descriptionEnPlaceholder", "addProduct") ||
                        "Describe the product features, specifications, and benefits in English..."
                      }
                      value={formData.description}
                      onValueChange={(value) =>
                        handleChange("description", value)
                      }
                      height={150}
                      width="100%"
                    />
                  </div>

                  {/* Description - Swedish */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Flag className="mr-2 text-yellow-500" size={16} />
                      {t("description", "products")} (
                      {t("swedish", "common") || "Swedish"})
                    </label>
                    <TextArea
                      placeholder={
                        t("descriptionSvPlaceholder", "addProduct") ||
                        "Beskriv produktfunktioner, specifikationer och fördelar på svenska..."
                      }
                      value={formData.s_description}
                      onValueChange={(value) =>
                        handleChange("s_description", value)
                      }
                      height={150}
                      width="100%"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  {t("cancel", "common") || "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.name.trim() ||
                    !formData.price ||
                    !formData.category ||
                    parseFloat(formData.cost || 0) < 0
                  }
                  className={`
      px-6 py-2 rounded-lg font-medium transition flex items-center justify-center
      ${
        loading ||
        !formData.name.trim() ||
        !formData.price ||
        !formData.category ||
        parseFloat(formData.cost || 0) < 0
          ? "bg-gray-400 cursor-not-allowed text-white"
          : "bg-dental-blue text-white hover:bg-blue-600"
      }
    `}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t("saving", "addProduct") || "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2" />
                      {t("saveProduct", "addProduct") || "Save Product"}
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
                    {t("productImages", "addProduct") || "Product Images"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("uploadUpTo4Photos", "addProduct") ||
                      "Upload up to 4 product photos"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {images.length}/4 {t("images", "addProduct") || "images"}
                  </p>
                </div>
              </div>

              {/* Image Grid */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative group"
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={image.preview}
                          alt={`${
                            t("productPreview", "addProduct") ||
                            "Product preview"
                          } ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}

                  {/* Empty Slots */}
                  {Array.from({ length: 4 - images.length }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                    >
                      <div className="text-center p-4">
                        <Upload
                          className="text-gray-400 mx-auto mb-2"
                          size={24}
                        />
                        <p className="text-xs text-gray-500">
                          {t("emptySlot", "addProduct") || "Empty Slot"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  id="product-images"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  multiple
                  disabled={images.length >= 4}
                />
                <label
                  htmlFor="product-images"
                  className={`
                    block w-full py-3 px-4 rounded-lg text-center cursor-pointer transition
                    ${
                      images.length >= 4
                        ? "bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed"
                        : "bg-gray-50 border border-gray-300 hover:bg-gray-100"
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Upload size={18} />
                    <span className="font-medium">
                      {t("chooseImages", "addProduct") || "Choose Images"}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({images.length}/4)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("imageFormats", "addProduct") ||
                      "JPG, PNG up to 5MB each"}
                  </p>
                </label>
              </div>

              {/* Drag & Drop Hint */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  {t("dragDropHint", "addProduct") ||
                    "Drag images to reorder • First image is main product image"}
                </p>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                📝 {t("quickTips", "addProduct") || "Quick Tips"}
              </h3>
              <ul className="space-y-3 text-sm text-blue-700">
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">1</span>
                  </div>
                  <span>
                    {t("tipSku", "addProduct") ||
                      "SKU is required and must be unique"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">2</span>
                  </div>
                  <span>
                    {t("tipLowStock", "addProduct") ||
                      "Low Stock Threshold: Product marked 'Low Stock' when quantity ≤ this value"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">3</span>
                  </div>
                  <span>
                    {t("tipImages", "addProduct") ||
                      "Upload up to 4 images. First image is the main product image"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">4</span>
                  </div>
                  <span>
                    {t("tipTax", "addProduct") ||
                      "Tax Rate: Enter 10 for 10% (will be stored as 10 internally)"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">5</span>
                  </div>
                  <span>
                    {t("tipDiscount", "addProduct") ||
                      "Discount price must be lower than original price"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">6</span>
                  </div>
                  <span>
                    {t("tipRequired", "addProduct") ||
                      "All fields marked with * are required"}
                  </span>
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
