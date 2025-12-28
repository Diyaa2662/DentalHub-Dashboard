import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Star,
  Percent,
  Globe,
  Flag,
  Trash2,
  RotateCcw,
} from "lucide-react";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // بيانات وهمية للفئات
  const categories = [
    { id: 1, name_en: "Equipment", name_sv: "Utrustning" },
    { id: 2, name_en: "Imaging", name_sv: "Bildbehandling" },
    { id: 3, name_en: "Surgical", name_sv: "Kirurgisk" },
    { id: 4, name_en: "Restorative", name_sv: "Restaurativ" },
    { id: 5, name_en: "Hygiene", name_sv: "Hygien" },
    { id: 6, name_en: "Digital", name_sv: "Digital" },
    { id: 7, name_en: "Sterilization", name_sv: "Sterilisering" },
    { id: 8, name_en: "Magnification", name_sv: "Förstoring" },
    { id: 9, name_en: "Orthodontic", name_sv: "Ortodontisk" },
  ];

  // حالة المنتج الأصلي (للمقارنة ولإمكانية التراجع)
  const [originalData, setOriginalData] = useState(null);

  const [formData, setFormData] = useState({
    name_en: "",
    name_sv: "",
    sku: "",
    category: "",
    costPrice: "",
    price: "",
    discountPrice: "",
    taxRate: 0,
    stock: "",
    description_en: "",
    description_sv: "",
    image: null,
    imageUrl: "", // رابط الصورة الحالية من الخادم
    status: "active",
    featured: false,
    trackInventory: true,
    lowStockAlert: 10,
    unit: "Piece",
    rate: 0,
  });

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // قائمة الوحدات
  const units = [
    t("piece", "common"),
    t("set", "common"),
    t("box", "common"),
    t("kit", "common"),
    t("pack", "common"),
  ];

  // ✅ محاكاة جلب بيانات المنتج من API
  useEffect(() => {
    const fetchProduct = () => {
      setLoading(true);

      // بيانات وهمية للمنتج (بديل لـ API)
      setTimeout(() => {
        const mockProduct = {
          id: parseInt(id),
          name_en: "Advanced Dental Chair",
          name_sv: "Avancerad Tandstol",
          sku: "DENT-5678",
          category: 1, // ID of Equipment category
          costPrice: 3800,
          price: 4500,
          discountPrice: 4200,
          taxRate: 15,
          stock: 12,
          description_en:
            "High-end dental chair with ergonomic design, adjustable positions, and advanced features for patient comfort and dentist efficiency.",
          description_sv:
            "Högkvalitativ tandstol med ergonomisk design, justerbara positioner och avancerade funktioner för patientkomfort och tandläkareffektivitet.",
          imageUrl:
            "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&auto=format&fit=crop",
          status: "active",
          featured: true,
          trackInventory: true,
          lowStockAlert: 5,
          unit: "Piece",
          rate: 4.7,
        };

        setOriginalData(mockProduct);
        setFormData(mockProduct);
        setImagePreview(mockProduct.imageUrl);
        setLoading(false);
      }, 800);
    };

    fetchProduct();
  }, [id]);

  // ✅ تتبع التغييرات لمقارنة مع البيانات الأصلية
  useEffect(() => {
    if (originalData && formData) {
      const isChanged =
        JSON.stringify(formData) !== JSON.stringify(originalData);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasChanges(isChanged);
    }
  }, [formData, originalData]);

  // دالة للحصول على اسم الفئة المناسب للغة الحالية
  const getCategoryDisplayName = (category) => {
    const currentLang = localStorage.getItem("language") || "en";
    return currentLang === "sv" ? category.name_sv : category.name_en;
  };

  // تحويل الفئات لخيارات الـ SelectBox
  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    name: getCategoryDisplayName(cat),
  }));

  // دالة لحساب مبلغ التوفير
  const calculateSavingsAmount = (price, discountPrice) => {
    if (!price || !discountPrice || discountPrice >= price) return "";
    const original = parseFloat(price);
    const discounted = parseFloat(discountPrice);
    const savings = original - discounted;
    return `$${savings.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // دالة لحساب الضريبة
  const calculateTaxAmount = (price, discountPrice, taxRate) => {
    if (!price || taxRate === 0) return "";

    let finalPrice = parseFloat(price);

    // استخدام سعر الخصم إذا كان أقل من السعر الأصلي
    if (discountPrice && discountPrice < price) {
      finalPrice = parseFloat(discountPrice);
    }

    const taxAmount = finalPrice * (taxRate / 100);
    return `$${taxAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // دالة لحساب السعر النهائي مع الضريبة
  const calculateFinalPrice = (price, discountPrice, taxRate) => {
    if (!price) return "";

    let finalPrice = parseFloat(price);

    // استخدام سعر الخصم إذا كان موجوداً
    if (discountPrice && discountPrice < price) {
      finalPrice = parseFloat(discountPrice);
    }

    // تطبيق الضريبة إذا كانت موجودة
    if (taxRate && taxRate > 0) {
      finalPrice = finalPrice * (1 + taxRate / 100);
    }

    return `$${finalPrice.toLocaleString(undefined, {
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
      setFormData((prev) => ({ ...prev, image: file, imageUrl: "" }));

      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null, imageUrl: "" }));
    setImagePreview(null);
  };

  const resetForm = () => {
    if (originalData) {
      setFormData(originalData);
      setImagePreview(originalData.imageUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUpdating(true);

    // محاكاة إرسال البيانات إلى الخادم للتحديث
    setTimeout(() => {
      console.log("Updated product data:", formData);
      setUpdating(false);
      setSuccess(true);

      // تحديث البيانات الأصلية بعد التعديل الناجح
      setOriginalData(formData);
      setHasChanges(false);

      // إعادة التوجيه بعد 2 ثانية
      setTimeout(() => {
        navigate("/products");
      }, 2000);
    }, 1500);
  };

  // دالة للعودة للتفاصيل
  const goToProductDetails = () => {
    navigate(`/products/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue"></div>
        <span className="ml-4 text-gray-600">Loading product data...</span>
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
                {formData.name_en} • {formData.sku}
              </p>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                ID: {id}
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

      {/* Change Indicator */}
      {hasChanges && (
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Package className="text-dental-blue" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {t("basicInformation", "addProduct")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t("updateProductDetails", "editProduct") ||
                          "Update product details"}
                      </p>
                    </div>
                  </div>

                  {/* Product Status */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          formData.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm font-medium capitalize">
                        {formData.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name - English */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Globe className="mr-2 text-blue-500" size={16} />
                      {t("productName", "addProduct")} (English) *
                    </label>
                    <TextBox
                      placeholder="e.g., Advanced Dental Chair"
                      value={formData.name_en}
                      onValueChange={(value) => handleChange("name_en", value)}
                      width="100%"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t("requiredField", "addProduct")}
                    </p>
                  </div>

                  {/* Product Name - Swedish */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Flag className="mr-2 text-yellow-500" size={16} />
                      {t("productName", "addProduct")} (Swedish)
                    </label>
                    <TextBox
                      placeholder="e.g., Avancerad Tandstol"
                      value={formData.name_sv}
                      onValueChange={(value) => handleChange("name_sv", value)}
                      width="100%"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t(
                        "Optional - will use English name if left empty",
                        "addProduct"
                      )}
                    </p>
                  </div>

                  {/* SKU (غير قابل للتعديل) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("skuStockKeeping", "addProduct")}
                    </label>
                    <div className="relative">
                      <TextBox
                        value={formData.sku}
                        readOnly
                        width="100%"
                        className="bg-gray-50"
                      />
                      <Hash
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("skuCannotBeChanged", "editProduct") ||
                        "SKU cannot be changed"}
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("category", "products")} *
                    </label>
                    <SelectBox
                      items={categoryOptions}
                      value={formData.category}
                      onValueChange={(value) => handleChange("category", value)}
                      displayExpr="name"
                      valueExpr="id"
                      placeholder={
                        t("selectCategory", "addProduct") || "Select category"
                      }
                      searchEnabled={true}
                      width="100%"
                    />
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

                {/* Product Status & Featured */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.trackInventory}
                        onChange={(e) =>
                          handleChange("trackInventory", e.target.checked)
                        }
                        className="h-5 w-5 text-dental-blue rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {t("trackInventory", "editProduct") ||
                          "Track inventory for this product"}
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) =>
                          handleChange("featured", e.target.checked)
                        }
                        className="h-5 w-5 text-dental-blue rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {t("featuredProduct", "editProduct") ||
                          "Mark as featured product"}
                      </span>
                    </label>
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
                      {t("updatePricingInventory", "editProduct") ||
                        "Update pricing and inventory"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Cost Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("costPrice", "productDetails") || "Cost Price"} *
                    </label>
                    <div className="relative">
                      <NumberBox
                        placeholder="0.00"
                        value={formData.costPrice || ""}
                        onValueChange={(value) =>
                          handleChange("costPrice", value)
                        }
                        format="$ #,##0.##"
                        width="100%"
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

                  {/* Discount Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("discountPrice", "addProduct") || "Discount Price"}
                    </label>
                    <div className="relative">
                      <NumberBox
                        placeholder="0.00"
                        value={formData.discountPrice || ""}
                        onValueChange={(value) =>
                          handleChange("discountPrice", value)
                        }
                        format="$ #,##0.##"
                        width="100%"
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
                      {t("taxRate", "products") || "Tax Rate"} *
                    </label>
                    <div className="relative">
                      <NumberBox
                        placeholder="0"
                        value={formData.taxRate}
                        onValueChange={(value) =>
                          handleChange("taxRate", value)
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
                </div>

                {/* Current Stock */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("currentStock", "editProduct") || "Current Stock"}
                  </label>
                  <div className="relative">
                    <NumberBox
                      placeholder="0"
                      value={formData.stock}
                      onValueChange={(value) => handleChange("stock", value)}
                      showSpinButtons={true}
                      min={0}
                      width="100%"
                    />
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {formData.unit}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        formData.stock > (formData.lowStockAlert || 10)
                          ? "bg-green-500"
                          : formData.stock > 0
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-gray-600">
                      {formData.stock > (formData.lowStockAlert || 10)
                        ? "In Stock"
                        : formData.stock > 0
                        ? "Low Stock"
                        : "Out of Stock"}
                    </span>
                  </div>
                </div>

                {/* Product Rating */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("productRating", "addProduct") || "Product Rating"}
                    </label>
                    <div className="relative">
                      <NumberBox
                        placeholder="0.0"
                        value={formData.rate}
                        onValueChange={(value) => handleChange("rate", value)}
                        showSpinButtons={true}
                        min={0}
                        max={5}
                        step={0.1}
                        format="#0.0"
                        width="100%"
                      />
                      <Star
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 text-yellow-400"
                        size={18}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {t("enterRatingBetween", "addProduct") ||
                        "Enter rating between 0.0 and 5.0"}
                    </p>
                  </div>

                  {/* Low Stock Alert */}
                  <div>
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

                {/* Display Price Summary */}
                {(formData.discountPrice || formData.taxRate > 0) &&
                  formData.price && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 mb-3">
                        {t("priceSummary", "addProduct") || "Price Summary"}
                      </h4>
                      <div className="space-y-2">
                        {/* Cost Price */}
                        {formData.costPrice && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {t("costPrice", "productDetails") || "Cost Price"}
                              :
                            </span>
                            <span className="font-medium">
                              ${parseFloat(formData.costPrice).toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {t("originalPrice", "addProduct") ||
                              "Original Price"}
                            :
                          </span>
                          <span className="font-medium">
                            ${parseFloat(formData.price).toFixed(2)}
                          </span>
                        </div>

                        {formData.discountPrice &&
                          formData.discountPrice < formData.price && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {t("discountPrice", "addProduct") ||
                                    "Discount Price"}
                                  :
                                </span>
                                <span className="font-medium text-green-600">
                                  $
                                  {parseFloat(formData.discountPrice).toFixed(
                                    2
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {t("savings", "addProduct") || "You Save"}:
                                </span>
                                <span className="font-medium text-red-600">
                                  -
                                  {calculateSavingsAmount(
                                    formData.price,
                                    formData.discountPrice
                                  )}
                                </span>
                              </div>
                            </>
                          )}

                        {formData.taxRate > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {t("taxRate", "products")} ({formData.taxRate}%):
                            </span>
                            <span className="font-medium text-blue-600">
                              +
                              {calculateTaxAmount(
                                formData.price,
                                formData.discountPrice,
                                formData.taxRate
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                          <span className="font-medium text-blue-800">
                            {t("finalPrice", "addProduct") || "Final Price"}:
                          </span>
                          <span className="font-bold text-blue-900 text-lg">
                            {calculateFinalPrice(
                              formData.price,
                              formData.discountPrice,
                              formData.taxRate
                            )}
                          </span>
                        </div>
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
                      {t("descriptionDetails", "addProduct")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("updateProductDescription", "editProduct") ||
                        "Update product description"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Description - English */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Globe className="mr-2 text-blue-500" size={16} />
                      {t("productDescription", "addProduct")} (English)
                    </label>
                    <TextArea
                      placeholder="Describe the product features, specifications, and benefits in English..."
                      value={formData.description_en}
                      onValueChange={(value) =>
                        handleChange("description_en", value)
                      }
                      height={150}
                      width="100%"
                    />
                  </div>

                  {/* Description - Swedish */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Flag className="mr-2 text-yellow-500" size={16} />
                      {t("productDescription", "addProduct")} (Swedish)
                    </label>
                    <TextArea
                      placeholder="Beskriv produktfunktioner, specifikationer och fördelar på svenska..."
                      value={formData.description_sv}
                      onValueChange={(value) =>
                        handleChange("description_sv", value)
                      }
                      height={150}
                      width="100%"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-between items-center pt-6">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate("/products")}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    {t("cancel", "common")}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={!hasChanges}
                    className={`
                      px-4 py-2 border border-gray-300 rounded-lg font-medium transition flex items-center space-x-2
                      ${
                        hasChanges
                          ? "text-gray-700 hover:bg-gray-50"
                          : "text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    <RotateCcw size={18} />
                    <span>{t("reset", "common")}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={updating || !formData.name_en.trim() || !hasChanges}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition flex items-center justify-center
                    ${
                      updating || !formData.name_en.trim() || !hasChanges
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-dental-blue text-white hover:bg-blue-600"
                    }
                  `}
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t("updating", "editProduct") || "Updating..."}
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <ImageIcon className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("productImage", "addProduct")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("updateProductPhoto", "editProduct") ||
                        "Update product photo"}
                    </p>
                  </div>
                </div>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
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
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                          {formData.image ? "New" : "Current"}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formData.image
                          ? t("newImagePreview", "editProduct") ||
                            "New image preview"
                          : t("currentImage", "editProduct") ||
                            "Current product image"}
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
                      {imagePreview
                        ? t("changeImage", "editProduct") || "Change Image"
                        : t("uploadImage", "editProduct") || "Upload Image"}
                    </span>
                  </div>
                </label>
              </div>

              {/* Image Info */}
              {formData.imageUrl && !formData.image && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {t("currentImageStored", "editProduct") ||
                      "Current image is stored on the server."}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("uploadNewReplace", "editProduct") ||
                      "Upload a new image to replace it."}
                  </p>
                </div>
              )}
            </div>

            {/* Product Information Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ℹ️{" "}
                {t("productInformation", "editProduct") ||
                  "Product Information"}
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Product ID</p>
                  <p className="font-medium">{id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created On</p>
                  <p className="font-medium">2024-01-15</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Inventory Status</p>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        formData.stock > 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <p className="font-medium">
                      {formData.stock > 0
                        ? `${formData.stock} in stock`
                        : "Out of stock"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips for Editing */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                ✏️ {t("editingTips", "editProduct") || "Editing Tips"}
              </h3>
              <ul className="space-y-3 text-sm text-blue-700">
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">1</span>
                  </div>
                  <span>
                    {t("updatePricingAccurately", "editProduct") ||
                      "Update pricing accurately to reflect current costs"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">2</span>
                  </div>
                  <span>
                    {t("maintainStockLevels", "editProduct") ||
                      "Maintain accurate stock levels for inventory management"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">3</span>
                  </div>
                  <span>
                    {t("updateDescriptionsBoth", "editProduct") ||
                      "Update descriptions in both languages for better reach"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">4</span>
                  </div>
                  <span>
                    {t("useResetToUndo", "editProduct") ||
                      "Use 'Reset' to undo all changes if needed"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">5</span>
                  </div>
                  <span>
                    {t("saveBeforeLeaving", "editProduct") ||
                      "Remember to save changes before leaving the page"}
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
