import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import api from "../../../services/api";
import { TextBox, TextArea } from "devextreme-react";
import { SelectBox } from "devextreme-react/select-box"; // ⬅️ أضف هذا الاستيراد
import {
  ArrowLeft,
  Save,
  Building,
  Phone,
  Mail,
  MapPin,
  Package,
  FileText,
  CheckCircle,
  XCircle,
  RotateCcw,
  Info,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";

const EditSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage(); // ⬅️ أضف currentLanguage

  // حالة البيانات الأصلية للمقارنة
  const [originalData, setOriginalData] = useState(null);

  // حالة بيانات المزود للتعديل
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    product_type: "", // ✅ snake_case للـAPI
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // State للفئات من API
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  // ✅ جلب الفئات من API
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);

      const response = await api.get("/categories");
      const apiData = response.data?.data;

      if (Array.isArray(apiData)) {
        // تصفية الفئات النشطة فقط
        const activeCategories = apiData.filter((cat) => cat.enabled === true);
        setCategories(activeCategories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      setCategoriesError(
        err.response?.data?.message ||
          err.message ||
          t("failedToLoadCategories", "procurement") ||
          "Failed to load categories"
      );
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // ✅ جلب بيانات المزود من API
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        setError(null);

        // جلب الفئات أولاً
        await fetchCategories();

        // ثم جلب بيانات المزود
        const response = await api.get(`/suppliers/${id}`);

        if (response.data && response.data.data) {
          const supplierData = response.data.data;
          const formattedData = {
            name: supplierData.name || "",
            email: supplierData.email || "",
            phone: supplierData.phone || "",
            address: supplierData.address || "",
            product_type:
              supplierData.product_type || supplierData.productType || "",
            notes: supplierData.notes || "",
          };

          setOriginalData(formattedData);
          setFormData(formattedData);
        } else {
          setError(
            t("supplierNotFound", "procurement") || "Supplier not found"
          );
        }
      } catch (err) {
        console.error("Error fetching supplier:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            t("failedToLoadSupplier", "procurement") ||
            "Failed to load supplier data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, t]);

  // ✅ تتبع التغييرات لمقارنة مع البيانات الأصلية
  useEffect(() => {
    if (originalData && formData) {
      const isChanged =
        JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(isChanged);
    }
  }, [formData, originalData]);

  // تحويل الفئات لخيارات SelectBox بناءً على اللغة
  const getCategoryDisplayName = (category) => {
    // إذا كانت اللغة سويدي وكان هناك اسم سويدي، استخدمه
    if (currentLanguage === "sv" && category.s_name && category.s_name.trim()) {
      return category.s_name;
    }
    // وإلا استخدم الاسم الإنجليزي
    return category.name || category.name_en || "Unnamed Category";
  };

  // تحضير خيارات الفئات للـ SelectBox
  const categoryOptions = categories.map((category) => ({
    id: category.id,
    value: category.name || category.name_en, // القيمة المرسلة للـ API
    label: getCategoryDisplayName(category), // الاسم المعروض بناءً على اللغة
  }));

  // إضافة خيار "Other" كخيار احتياطي
  const allOptions = [
    ...categoryOptions,
    {
      id: "other",
      value: "Other",
      label: t("other", "procurement") || "Other",
    },
  ];

  // معالجة تغيير الحقول النصية
  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // مسح خطأ التحقق عند التغيير
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
    setError(null);
  };

  // ✅ التحقق من صحة البيانات
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name =
        t("supplierNameRequired", "procurement") || "Supplier name is required";
    }

    if (!formData.email.trim()) {
      errors.email = t("emailRequired", "procurement") || "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t("invalidEmail", "procurement") || "Invalid email format";
    }

    if (!formData.phone.trim()) {
      errors.phone = t("phoneRequired", "procurement") || "Phone is required";
    }

    if (!formData.address.trim()) {
      errors.address =
        t("addressRequired", "procurement") || "Address is required";
    }

    if (!formData.product_type) {
      errors.product_type =
        t("productTypeRequired", "procurement") || "Product type is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ إعادة تعيين النموذج للبيانات الأصلية
  const resetForm = () => {
    if (originalData) {
      setFormData(originalData);
      setValidationErrors({});
      setError(null);
    }
  };

  // ✅ حفظ التعديلات
  const handleSave = async (e) => {
    e.preventDefault();

    // التحقق من صحة البيانات
    if (!validateForm()) {
      return;
    }

    setUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      // ✅ إرسال البيانات إلى API للتحديث
      // eslint-disable-next-line no-unused-vars
      const response = await api.post(`/updatesupplier/${id}`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        product_type: formData.product_type,
        notes: formData.notes.trim() || null,
      });

      // ✅ إذا وصلنا هنا بدون catch، الطلب نجح
      setSuccess(true);

      // ✅ تحديث البيانات الأصلية
      setOriginalData(formData);
      setHasChanges(false);

      // ✅ الانتقال بعد 2 ثانية
      setTimeout(() => {
        navigate("/procurement/suppliers");
      }, 2000);
    } catch (err) {
      // ✅ معالجة أخطاء API
      if (err.response) {
        const { status, data } = err.response;

        // إذا كانت الاستجابة تحتوي على message نجاح
        if (
          data?.message?.includes("success") ||
          data?.message?.includes("Success")
        ) {
          setSuccess(true);
          setOriginalData(formData);
          setHasChanges(false);
          setTimeout(() => {
            navigate("/procurement/suppliers");
          }, 2000);
          return;
        }

        switch (status) {
          case 400:
            if (data.errors) {
              const apiErrors = {};
              Object.keys(data.errors).forEach((key) => {
                apiErrors[key] = data.errors[key][0];
              });
              setValidationErrors(apiErrors);
            } else {
              setError(
                data.message ||
                  t("validationError", "procurement") ||
                  "Validation error"
              );
            }
            break;
          case 401:
            setError(
              t("unauthorized", "procurement") ||
                "Unauthorized. Please login again."
            );
            break;
          case 404:
            setError(
              t("supplierNotFound", "procurement") || "Supplier not found"
            );
            break;
          case 422:
            if (data.errors) {
              const apiErrors = {};
              Object.keys(data.errors).forEach((key) => {
                apiErrors[key] = data.errors[key][0];
              });
              setValidationErrors(apiErrors);
            }
            break;
          case 500:
            setError(
              t("serverError", "procurement") ||
                "Server error. Please try again later."
            );
            break;
          default:
            setError(
              data?.message ||
                err.message ||
                t("updateSupplierError", "procurement") ||
                "Error updating supplier"
            );
        }
      } else if (err.request) {
        setError(
          t("noResponse", "procurement") ||
            "No response from server. Check your connection."
        );
      } else {
        setError(
          err.message ||
            t("requestError", "procurement") ||
            "Error setting up request"
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  // ✅ إلغاء والعودة
  const handleCancel = () => {
    navigate("/procurement/suppliers");
  };

  // ✅ دالة لإعادة تحميل البيانات
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);

      // إعادة تحميل الفئات
      await fetchCategories();

      // إعادة تحميل بيانات المزود
      const response = await api.get(`/supplier/${id}`);

      if (response.data && response.data.data) {
        const supplierData = response.data.data;
        const formattedData = {
          name: supplierData.name || "",
          email: supplierData.email || "",
          phone: supplierData.phone || "",
          address: supplierData.address || "",
          product_type:
            supplierData.product_type || supplierData.productType || "",
          notes: supplierData.notes || "",
        };

        setOriginalData(formattedData);
        setFormData(formattedData);
        setValidationErrors({});
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t("failedToLoadSupplier", "procurement") ||
          "Failed to load supplier data"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ إعادة تحميل الفئات فقط
  const handleRefreshCategories = async () => {
    await fetchCategories();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto mb-4"></div>
          <span className="text-gray-600">
            {t("loadingSupplier", "procurement") || "Loading supplier data..."}
          </span>
        </div>
      </div>
    );
  }

  if (error && !originalData) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {t("editSupplier", "procurement") || "Edit Supplier"}
              </h1>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoadingSupplier", "procurement") ||
                  "Error Loading Supplier"}
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
              onClick={handleCancel}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
            >
              {t("backToSuppliers", "procurement") || "Back to Suppliers"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("editSupplier", "procurement") || "Edit Supplier"}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-gray-600">
                {t("editingSupplier", "procurement") || "Editing"}{" "}
                {formData.name}
              </p>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                ID: {id}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
            title={t("refresh", "common") || "Refresh"}
          >
            <RefreshCw size={18} />
            <span>{t("refresh", "common") || "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ✅ رسالة الخطأ العامة */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-600 mr-3" size={20} />
            <div>
              <h3 className="font-medium text-red-800">
                {t("error", "common") || "Error"}
              </h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ رسالة تحذير تحميل الفئات */}
      {categoriesError && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="text-yellow-600 mr-3" size={20} />
            <div>
              <h3 className="font-medium text-yellow-800">
                {t("categoriesLoadWarning", "procurement") || "Warning"}
              </h3>
              <p className="text-yellow-600 text-sm">
                {categoriesError} -{" "}
                {t("usingDefaultOptions", "procurement") ||
                  "Using default options"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Change Indicator */}
      {hasChanges && !success && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Info className="text-yellow-600" size={20} />
              <span className="text-yellow-800 font-medium">
                {t("unsavedChanges", "procurement") ||
                  "You have unsaved changes"}
              </span>
            </div>
            <button
              onClick={resetForm}
              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition flex items-center space-x-2"
            >
              <RotateCcw size={16} />
              <span>{t("resetChanges", "procurement") || "Reset Changes"}</span>
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
              {t("supplierUpdatedSuccess", "procurement") ||
                "Supplier Updated Successfully!"}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("supplierUpdatedSystem", "procurement") ||
                "The supplier has been updated in your system. Redirecting..."}
            </p>
            <button
              onClick={() => navigate("/procurement/suppliers")}
              className="px-6 py-3 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
            >
              {t("goBackSuppliers", "procurement") || "Go Back to Suppliers"}
            </button>
          </div>
        </div>
      ) : (
        /* Edit Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Building className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("basicInformation", "procurement") ||
                        "Basic Information"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("updateSupplierDetails", "procurement") ||
                        "Update supplier details"}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Supplier Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("supplierName", "procurement") || "Supplier Name"} *
                    </label>
                    <TextBox
                      placeholder="e.g., Dental Equipment Co."
                      value={formData.name}
                      onValueChange={(value) => handleChange("name", value)}
                      width="100%"
                      isValid={!validationErrors.name}
                    />
                    {validationErrors.name && (
                      <p className="text-red-600 text-xs mt-1">
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("email", "procurement") || "Email"} *
                      </label>
                      <TextBox
                        placeholder="contact@supplier.com"
                        value={formData.email}
                        onValueChange={(value) => handleChange("email", value)}
                        width="100%"
                        isValid={!validationErrors.email}
                      />
                      {validationErrors.email && (
                        <p className="text-red-600 text-xs mt-1">
                          {validationErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("phone", "procurement") || "Phone"} *
                      </label>
                      <TextBox
                        placeholder="+1-555-123-4567"
                        value={formData.phone}
                        onValueChange={(value) => handleChange("phone", value)}
                        width="100%"
                        isValid={!validationErrors.phone}
                      />
                      {validationErrors.phone && (
                        <p className="text-red-600 text-xs mt-1">
                          {validationErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("address", "procurement") || "Address"} *
                    </label>
                    <TextBox
                      placeholder="123 Street, City, Country"
                      value={formData.address}
                      onValueChange={(value) => handleChange("address", value)}
                      width="100%"
                      isValid={!validationErrors.address}
                    />
                    {validationErrors.address && (
                      <p className="text-red-600 text-xs mt-1">
                        {validationErrors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Type */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Package className="text-green-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("productType", "procurement") || "Product Type"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("updateProductType", "procurement") ||
                        "Update product type"}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Package className="mr-2 text-gray-500" size={16} />
                      {t("productType", "procurement") || "Product Type"} *
                    </label>
                    <button
                      type="button"
                      onClick={handleRefreshCategories}
                      disabled={categoriesLoading}
                      className="text-xs text-dental-blue hover:text-blue-600 hover:underline flex items-center"
                      title={
                        t("refreshCategories", "procurement") ||
                        "Refresh categories"
                      }
                    >
                      {categoriesLoading ? (
                        <Loader2 size={12} className="mr-1 animate-spin" />
                      ) : (
                        <Package size={12} className="mr-1" />
                      )}
                      {t("refreshCategories", "procurement") || "Refresh"}
                    </button>
                  </div>

                  {categoriesLoading ? (
                    <div className="flex items-center justify-center py-4 border border-gray-300 rounded-lg">
                      <Loader2
                        className="animate-spin text-dental-blue mr-2"
                        size={20}
                      />
                      <span className="text-gray-600">
                        {t("loadingCategories", "procurement") ||
                          "Loading categories..."}
                      </span>
                    </div>
                  ) : (
                    <SelectBox
                      items={allOptions}
                      value={formData.product_type}
                      onValueChange={(value) =>
                        handleChange("product_type", value)
                      }
                      displayExpr="label"
                      valueExpr="value"
                      placeholder={
                        categories.length === 0
                          ? t("noCategoriesAvailable", "procurement") ||
                            "No categories available"
                          : t("selectProductType", "procurement") ||
                            "Select product type"
                      }
                      searchEnabled={true}
                      width="100%"
                      isValid={!validationErrors.product_type}
                      noDataText={
                        t("noCategoriesFound", "procurement") ||
                        "No categories found"
                      }
                    />
                  )}

                  {validationErrors.product_type && (
                    <p className="text-red-600 text-xs mt-1">
                      {validationErrors.product_type}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <FileText className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("notes", "procurement") || "Notes"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("updateSupplierNotes", "procurement") ||
                        "Update notes about this supplier"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("supplierNotes", "procurement") || "Supplier Notes"}
                  </label>
                  <TextArea
                    placeholder="Add any notes about this supplier..."
                    value={formData.notes}
                    onValueChange={(value) => handleChange("notes", value)}
                    height={120}
                    width="100%"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t("notesDescription", "procurement") ||
                      "These notes are visible in the suppliers table"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    {t("cancel", "common") || "Cancel"}
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
                    <span>{t("reset", "common") || "Reset"}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={updating || categoriesLoading}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition flex items-center justify-center
                    ${
                      updating || categoriesLoading
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-dental-blue text-white hover:bg-blue-600"
                    }
                  `}
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t("updating", "procurement") || "Updating..."}
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2" />
                      {t("updateSupplier", "procurement") || "Update Supplier"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Information & Tips */}
          <div className="space-y-6">
            {/* Supplier Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Info className="text-blue-500" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("supplierInformation", "procurement") ||
                    "Supplier Information"}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Supplier ID</p>
                  <p className="font-medium text-gray-800">{id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product Type</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Package className="text-gray-500" size={16} />
                    <span className="font-medium">
                      {formData.product_type ||
                        t("notSpecified", "procurement") ||
                        "Not specified"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categories Available</p>
                  <p className="font-medium text-gray-800">
                    {categories.length}{" "}
                    {t("activeCategories", "procurement") ||
                      "active categories"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditSupplier;
