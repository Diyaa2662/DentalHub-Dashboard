import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Percent,
  Globe,
  Flag,
  Trash2,
  RotateCcw,
  X,
  Info,
} from "lucide-react";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // State for categories from API
  const [categories, setCategories] = useState([]);

  // حالة المنتج الأصلي (للمقارنة ولإمكانية التراجع)
  const [originalData, setOriginalData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [originalImages, setOriginalImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    s_name: "",
    sku: "", // الآن يمكن تعديله
    category: "",
    cost: "",
    price: "",
    discount_price: "",
    tax_rate: 0,
    stock_quantity: "",
    description: "",
    s_description: "",
    product_rate: 0,
    low_stock_alert_threshold: 10,
  });

  // State للصور
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [skuError, setSkuError] = useState(null); // ✅ خطأ خاص بالـSKU

  // Fetch product data and categories
  useEffect(() => {
    fetchProductData();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSkuError(null);

      const productResponse = await api.get(`/products/${id}`);
      const apiData = productResponse.data?.data;

      if (apiData) {
        const processedImages =
          apiData.images?.map((img) => ({
            ...img,
            fullUrl: img.url.startsWith("http")
              ? img.url
              : `https://dentist-production.up.railway.app${img.url}`,
          })) || [];

        const preparedData = {
          name: apiData.name || "",
          s_name: apiData.s_name || "",
          sku: apiData.sku || "", // جلب SKU
          category: apiData.category || "",
          cost: parseFloat(apiData.cost) || 0,
          price: parseFloat(apiData.price) || 0,
          discount_price: parseFloat(apiData.discount_price) || "",
          tax_rate: parseFloat(apiData.tax_rate) || 0,
          stock_quantity: parseInt(apiData.stock_quantity) || 0,
          description: apiData.description || "",
          s_description: apiData.s_description || "",
          product_rate: parseFloat(apiData.product_rate) || 0,
          low_stock_alert_threshold:
            parseInt(apiData.low_stock_alert_threshold) || 10,
        };

        setOriginalData(preparedData);
        setFormData(preparedData);
        setOriginalImages(processedImages);
        setExistingImages(processedImages);
      } else {
        setError(t("productNotFound", "editProduct") || "Product not found");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t("loadProductFailed", "editProduct") ||
          "Failed to load product data"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      const apiData = response.data?.data;

      if (Array.isArray(apiData)) {
        const activeCategories = apiData.filter((cat) => cat.enabled === true);
        setCategories(activeCategories);
      }
    } catch (err) {
      console.error(
        t("errorFetchingCategories", "editProduct") ||
          "Error fetching categories:",
        err
      );
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

  // تتبع التغييرات لمقارنة مع البيانات الأصلية
  useEffect(() => {
    if (originalData && formData) {
      const isFormChanged =
        JSON.stringify(formData) !== JSON.stringify(originalData);
      const hasImageChanges = newImages.length > 0 || imagesToDelete.length > 0;
      setHasChanges(isFormChanged || hasImageChanges);
    }
  }, [formData, originalData, newImages, imagesToDelete]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // ✅ مسح خطأ SKU عند تعديل الحقل
    if (name === "sku") {
      setSkuError(null);
    }
  };

  // معالجة الصور الجديدة
  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots =
      4 - (existingImages.length - imagesToDelete.length + newImages.length);
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length === 0) {
      alert(
        t("maxImagesAlert", "editProduct") ||
          "You can only have up to 4 images total"
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
            id: `new-${Date.now()}-${Math.random()}`,
            isNew: true,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImagePreviews).then((previews) => {
      setNewImages((prev) => [...prev, ...previews]);
    });

    e.target.value = "";
  };

  // حذف صورة حالية
  const handleDeleteExistingImage = (imageId) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  // استعادة صورة محذوفة
  const handleRestoreImage = (imageId) => {
    setImagesToDelete((prev) => prev.filter((id) => id !== imageId));
  };

  // حذف صورة جديدة
  const handleDeleteNewImage = (imageId) => {
    setNewImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // حساب هامش الربح
  const calculateProfitMargin = () => {
    if (!formData.cost || !formData.price) return 0;
    const profit = formData.price - formData.cost;
    return ((profit / formData.cost) * 100).toFixed(2);
  };

  // حساب مبلغ الربح
  const calculateProfitAmount = () => {
    if (!formData.cost || !formData.price) return 0;
    return (formData.price - formData.cost).toFixed(2);
  };

  // حساب مبلغ الخصم
  const calculateDiscountAmount = () => {
    if (
      !formData.discount_price ||
      !formData.price ||
      formData.discount_price >= formData.price
    )
      return 0;
    return (formData.price - formData.discount_price).toFixed(2);
  };

  // حساب نسبة الخصم
  const calculateDiscountPercentage = () => {
    if (
      !formData.discount_price ||
      !formData.price ||
      formData.discount_price >= formData.price
    )
      return 0;
    const discountAmount = formData.price - formData.discount_price;
    return ((discountAmount / formData.price) * 100).toFixed(1);
  };

  // حساب السعر النهائي مع الضريبة
  const calculateFinalPrice = () => {
    if (!formData.price) return 0;

    let finalPrice = parseFloat(formData.price);

    if (formData.discount_price && formData.discount_price < formData.price) {
      finalPrice = parseFloat(formData.discount_price);
    }

    const taxRatePercent = parseFloat(formData.tax_rate || 0);
    if (taxRatePercent > 0) {
      const taxAmount = finalPrice * (taxRatePercent / 100);
      finalPrice = finalPrice + taxAmount;
    }

    return finalPrice.toFixed(2);
  };

  // حساب مبلغ الضريبة
  const calculateTaxAmount = () => {
    if (!formData.price || !formData.tax_rate) return 0;

    let priceBeforeTax = parseFloat(formData.price);

    if (formData.discount_price && formData.discount_price < formData.price) {
      priceBeforeTax = parseFloat(formData.discount_price);
    }

    const taxRatePercent = parseFloat(formData.tax_rate || 0);
    return (priceBeforeTax * (taxRatePercent / 100)).toFixed(2);
  };

  const resetForm = () => {
    if (originalData) {
      setFormData(originalData);
      setNewImages([]);
      setImagesToDelete([]);
      setSkuError(null); // ✅ مسح خطأ SKU
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert(
        t("nameRequiredAlert", "editProduct") ||
          "Please enter product name in English"
      );
      return;
    }

    if (!formData.price) {
      alert(
        t("priceRequiredAlert", "editProduct") || "Please enter product price"
      );
      return;
    }

    setUpdating(true);
    setError(null);
    setSkuError(null); // ✅ مسح أي أخطاء سابقة

    try {
      // 1. تحديث بيانات المنتج الأساسية
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name.trim());

      if (formData.s_name.trim()) {
        formDataToSend.append("s_name", formData.s_name.trim());
      }

      formDataToSend.append("description", formData.description.trim() || "");

      if (formData.s_description.trim()) {
        formDataToSend.append("s_description", formData.s_description.trim());
      }

      // ✅ إرسال SKU المعدل (يمكن أن يكون فارغاً)
      if (formData.sku && formData.sku.trim()) {
        formDataToSend.append("sku", formData.sku.trim());
      } else {
        // إذا كان فارغاً، لن نرسل SKU وسيبقى كما هو في السيرفر
        // لا نرسل حقل SKU إطلاقاً
      }

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
      } else {
        formDataToSend.append("discount_price", "0.00");
      }

      formDataToSend.append(
        "low_stock_alert_threshold",
        parseInt(formData.low_stock_alert_threshold) || 10
      );

      formDataToSend.append(
        "product_rate",
        parseFloat(formData.product_rate || 0).toFixed(1)
      );

      // إرسال تحديث البيانات الأساسية
      await api.post(`/updateproduct/${id}`, formDataToSend);

      // 2. معالجة الصور المحذوفة
      for (const imageId of imagesToDelete) {
        try {
          await api.delete(`/deleteimage/${imageId}`);
        } catch (err) {
          console.error(
            t("errorDeletingImage", "editProduct") || "Error deleting image:",
            err
          );
        }
      }

      // 3. إضافة الصور الجديدة
      if (newImages.length > 0) {
        try {
          const imagesFormData = new FormData();

          newImages.forEach((image, index) => {
            imagesFormData.append(`images[${index}]`, image.file);
          });

          await api.post(`/addimages/${id}`, imagesFormData);
        } catch (err) {
          console.error(
            t("errorUploadingImages", "editProduct") ||
              "Error uploading images:",
            err
          );
          setError(
            t("imageUploadError", "editProduct", { count: newImages.length }) ||
              `Failed to upload ${newImages.length} image(s)`
          );
        }
      }

      setSuccess(true);

      // إعادة تحميل البيانات بعد التحديث
      setTimeout(() => {
        navigate(`/products/view/${id}`);
      }, 1500);
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors || err.response.data;
        let errorMessage =
          t("validationError", "editProduct") || "Validation error:\n";

        if (typeof errors === "object") {
          Object.entries(errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessage += `${field}: ${messages.join(", ")}\n`;

              // ✅ التحقق من خطأ SKU المكرر
              if (
                field.toLowerCase().includes("sku") ||
                messages.some((msg) => msg.toLowerCase().includes("sku"))
              ) {
                setSkuError(messages.join(", "));
              }
            } else {
              errorMessage += `${field}: ${messages}\n`;

              // ✅ التحقق من خطأ SKU المكرر
              if (
                field.toLowerCase().includes("sku") ||
                messages.toLowerCase().includes("sku")
              ) {
                setSkuError(messages);
              }
            }
          });
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;

          // ✅ التحقق من خطأ SKU المكرر في الرسالة العامة
          if (errorMessage.toLowerCase().includes("sku")) {
            setSkuError(errorMessage);
          }
        }

        setError(errorMessage);
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            t("updateProductError", "editProduct") ||
            "Error updating product"
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  // دالة للعودة للتفاصيل
  const goToProductDetails = () => {
    navigate(`/products/view/${id}`);
  };

  // الحصول على الصور المعروضة (بعد استبعاد المحذوفات)
  const getDisplayedImages = () => {
    const filteredExisting = existingImages.filter(
      (img) => !imagesToDelete.includes(img.id)
    );
    return [...filteredExisting, ...newImages];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue"></div>
        <span className="ml-4 text-gray-600">
          {t("loadingProductData", "editProduct") || "Loading product data..."}
        </span>
      </div>
    );
  }

  if (error && !originalData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{error}</h3>
          <div className="flex justify-center space-x-3 mt-4">
            <button
              onClick={() => navigate("/products")}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition"
            >
              {t("backToProducts", "editProduct") || "Back to Products"}
            </button>
            <button
              onClick={fetchProductData}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              {t("retry", "editProduct") || "Retry"}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              {t("editProduct", "editProduct") || "Edit Product"}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-gray-600">
                {t("editingProduct", "editProduct") || "Editing"}{" "}
                {formData.name} • {formData.sku}
              </p>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {t("id", "products") || "ID"}: {id}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={goToProductDetails}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            {t("viewDetails", "editProduct") || "View Details"}
          </button>
        </div>
      </div>

      {/* Error Message */}
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

      {/* Change Indicator */}
      {hasChanges && !success && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-yellow-600" size={20} />
              <span className="text-yellow-800 font-medium">
                {t("unsavedChanges", "editProduct") ||
                  "You have unsaved changes"}
              </span>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition flex items-center space-x-2"
            >
              <RotateCcw size={16} />
              <span>{t("resetChanges", "editProduct") || "Reset Changes"}</span>
            </button>
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
              {t("productUpdatedSuccess", "editProduct") ||
                "Product Updated Successfully!"}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("productUpdatedInventory", "editProduct") ||
                "The product has been updated in your inventory."}
            </p>
            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={goToProductDetails}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                {t("viewUpdatedProduct", "editProduct") ||
                  "View Updated Product"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="px-6 py-3 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
              >
                {t("backToProducts", "editProduct") || "Back to Products"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Form */
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
                      {t("updateProductDetails", "editProduct") ||
                        "Update product details"}
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
                        SKU
                      </label>
                      <div className="flex items-center text-xs text-gray-500">
                        <Info size={12} className="mr-1" />
                        {t("skuCanBeModified", "editProduct") ||
                          "Can be modified"}
                      </div>
                    </div>
                    <div className="relative">
                      <TextBox
                        placeholder={
                          t("skuOptionalPlaceholder", "editProduct") ||
                          "Leave empty to keep current SKU"
                        }
                        value={formData.sku}
                        onValueChange={(value) => handleChange("sku", value)}
                        width="100%"
                        // ✅ إزالة readOnly
                      />
                      <Hash
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>

                    {/* ✅ عرض خطأ SKU المكرر */}
                    {skuError && (
                      <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                        <AlertCircle size={12} className="inline mr-1" />
                        {skuError}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      {t("skuEditHint", "editProduct") ||
                        "Leave empty to keep current SKU or enter new unique SKU"}
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
                      {t("taxRate", "products")} (%)
                    </label>
                    <div className="relative">
                      <NumberBox
                        placeholder="0"
                        value={formData.tax_rate}
                        onValueChange={(value) =>
                          handleChange("tax_rate", value)
                        }
                        format="#0.00"
                        showSpinButtons={true}
                        min={0}
                        max={100}
                        step={0.1}
                        width="100%"
                      />
                      <Percent
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("taxRateExample", "editProduct") ||
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
                                {calculateDiscountPercentage()}%{" "}
                                {t("off", "products") || "OFF"}
                              </span>
                            </div>
                          </>
                        )}

                      {formData.tax_rate > 0 && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {t("taxRate", "products")} (
                              {parseFloat(formData.tax_rate || 0).toFixed(2)}%):
                            </span>
                            <span className="font-medium text-orange-600">
                              +${calculateTaxAmount()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>
                              {t("taxNote", "editProduct") ||
                                "Note: Tax is calculated on discounted price if available"}
                            </span>
                          </div>
                        </>
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
                      value={formData.low_stock_alert_threshold} // ✅ تغيير هنا
                      onValueChange={
                        (value) =>
                          handleChange("low_stock_alert_threshold", value) // ✅ تغيير هنا
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
                            : parseInt(formData.stock_quantity) <=
                              parseInt(formData.low_stock_alert_threshold) // ✅ تغيير هنا
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {parseInt(formData.stock_quantity) === 0
                          ? t("outOfStock", "products") || "Out of Stock"
                          : parseInt(formData.stock_quantity) <=
                            parseInt(formData.low_stock_alert_threshold) // ✅ تغيير هنا
                          ? t("lowStock", "products") || "Low Stock"
                          : t("inStock", "products") || "In Stock"}
                      </div>
                      <span className="text-sm text-gray-600">
                        {t("current", "common") || "Current"}:{" "}
                        {formData.stock_quantity}{" "}
                        {t("units", "addProduct") || "units"} •{" "}
                        {t("threshold", "addProduct") || "Threshold"}:{" "}
                        {formData.low_stock_alert_threshold}{" "}
                        {/* ✅ تغيير هنا */}
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
                    updating ||
                    !formData.name.trim() ||
                    !formData.price ||
                    !formData.category ||
                    parseFloat(formData.cost || 0) < 0 ||
                    !hasChanges
                  }
                  className={`
                    px-6 py-2 rounded-lg font-medium transition flex items-center justify-center
                    ${
                      updating ||
                      !formData.name.trim() ||
                      !formData.price ||
                      !formData.category ||
                      parseFloat(formData.cost || 0) < 0 ||
                      !hasChanges
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-dental-blue text-white hover:bg-blue-600"
                    }
                  `}
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t("saving", "addProduct") || "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2" />
                      {t("updateProduct", "editProduct") || "Update Product"}
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
                      "Manage product photos (max 4 total)"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getDisplayedImages().length}/4{" "}
                    {t("images", "addProduct") || "images"}
                  </p>
                </div>
              </div>

              {/* Image Grid */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  {getDisplayedImages().map((image, index) => {
                    const isDeleted = imagesToDelete.includes(image.id);
                    const isNew = image.isNew;
                    const isExisting = !isNew && !isDeleted;

                    return (
                      <div
                        key={image.id || image.preview}
                        className="relative group"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 relative">
                          <img
                            src={
                              isNew
                                ? image.preview
                                : image.fullUrl || image.preview
                            }
                            alt={`${
                              t("productPreview", "addProduct") ||
                              "Product preview"
                            } ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/300x300?text=No+Image";
                            }}
                          />
                          {isDeleted && (
                            <div className="absolute inset-0 bg-red-900 bg-opacity-50 flex items-center justify-center">
                              <Trash2 className="text-white" size={24} />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                          {isNew && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              {t("new", "common") || "New"}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isExisting && !isDeleted && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteExistingImage(image.id)
                              }
                              className="bg-red-500 text-white p-1 rounded-full"
                              title={
                                t("deleteImage", "editProduct") ||
                                "Delete image"
                              }
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                          {isExisting && isDeleted && (
                            <button
                              type="button"
                              onClick={() => handleRestoreImage(image.id)}
                              className="bg-green-500 text-white p-1 rounded-full"
                              title={
                                t("restoreImage", "editProduct") ||
                                "Restore image"
                              }
                            >
                              <RotateCcw size={12} />
                            </button>
                          )}
                          {isNew && (
                            <button
                              type="button"
                              onClick={() => handleDeleteNewImage(image.id)}
                              className="bg-red-500 text-white p-1 rounded-full"
                              title={
                                t("removeImage", "editProduct") ||
                                "Remove image"
                              }
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Slots */}
                  {Array.from({ length: 4 - getDisplayedImages().length }).map(
                    (_, index) => (
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
                    )
                  )}
                </div>
              </div>

              {/* Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  id="product-images"
                  accept="image/*"
                  onChange={handleNewImageChange}
                  className="hidden"
                  multiple
                  disabled={getDisplayedImages().length >= 4}
                />
                <label
                  htmlFor="product-images"
                  className={`
                    block w-full py-3 px-4 rounded-lg text-center cursor-pointer transition
                    ${
                      getDisplayedImages().length >= 4
                        ? "bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed"
                        : "bg-gray-50 border border-gray-300 hover:bg-gray-100"
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Upload size={18} />
                    <span className="font-medium">
                      {t("addImages", "editProduct") || "Add Images"}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({getDisplayedImages().length}/4)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("imageFormats", "addProduct") ||
                      "JPG, PNG up to 5MB each"}
                  </p>
                </label>
              </div>

              {/* Image Management Info */}
              <div className="mt-4 space-y-2">
                {imagesToDelete.length > 0 && (
                  <div className="p-2 bg-yellow-50 rounded text-sm text-yellow-700">
                    <AlertCircle className="inline mr-2" size={14} />
                    {imagesToDelete.length}{" "}
                    {t("imageMarkedForDeletion", "editProduct") ||
                      "image(s) marked for deletion"}
                  </div>
                )}
                {newImages.length > 0 && (
                  <div className="p-2 bg-green-50 rounded text-sm text-green-700">
                    <CheckCircle className="inline mr-2" size={14} />
                    {newImages.length}{" "}
                    {t("newImagesToUpload", "editProduct") ||
                      "new image(s) to upload"}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                📝 {t("editingTips", "editProduct") || "Editing Tips"}
              </h3>
              <ul className="space-y-3 text-sm text-blue-700">
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">1</span>
                  </div>
                  <span>
                    {t("tipTaxRateFix", "editProduct") ||
                      "Tax Rate: Enter as percentage (e.g., 10 for 10%)"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">2</span>
                  </div>
                  <span>
                    {t("tipImagesMax4", "editProduct") ||
                      "You can have up to 4 images total"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">3</span>
                  </div>
                  <span>
                    {t("tipImageDeleteRestore", "editProduct") ||
                      "Delete unwanted images or restore deleted ones"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">4</span>
                  </div>
                  <span>
                    {t("tipDiscountValidation", "editProduct") ||
                      "Discount price must be lower than original price"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">5</span>
                  </div>
                  <span>
                    {t("tipResetChanges", "editProduct") ||
                      "Use 'Reset Changes' to undo all modifications"}
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

export default EditProduct;
