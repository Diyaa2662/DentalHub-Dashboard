import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import api from "../../../services/api";
import { TextBox, TextArea } from "devextreme-react";
import { SelectBox } from "devextreme-react/select-box";
import {
  ArrowLeft,
  Save,
  Building,
  Phone,
  Mail,
  MapPin,
  Package,
  FileText,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const AddSupplier = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    product_type: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // خيارات نوع المنتجات
  const productTypeOptions = [
    { value: "Equipment", label: t("equipment", "procurement") || "Equipment" },
    {
      value: "Disposables",
      label: t("disposables", "procurement") || "Disposables",
    },
    {
      value: "Oral Hygiene",
      label: t("oralHygiene", "procurement") || "Oral Hygiene",
    },
    {
      value: "Surgical Tools",
      label: t("surgicalTools", "procurement") || "Surgical Tools",
    },
    {
      value: "Clinic Furniture",
      label: t("clinicFurniture", "procurement") || "Clinic Furniture",
    },
    {
      value: "Digital Equipment",
      label: t("digitalEquipment", "procurement") || "Digital Equipment",
    },
    {
      value: "Sterilization",
      label: t("sterilization", "procurement") || "Sterilization",
    },
    {
      value: "Medications",
      label: t("medications", "procurement") || "Medications",
    },
    { value: "Other", label: t("other", "procurement") || "Other" },
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // eslint-disable-next-line no-unused-vars
      const response = await api.post("/createsupplier", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        product_type: formData.product_type,
        notes: formData.notes.trim() || null,
      });

      // ✅ النجاح - سواء كان success: true أو message
      setSuccess(true);

      // ✅ الانتقال مباشرة بعد النجاح
      setTimeout(() => {
        navigate("/procurement/suppliers");
      }, 2000);
    } catch (err) {
      // ✅ إذا كان هناك رسالة نجاح في الخطأ
      if (
        err.response?.data?.message?.includes("success") ||
        err.response?.data?.message?.includes("created")
      ) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/procurement/suppliers");
        }, 2000);
        return;
      }

      // ✅ معالجة الأخطاء العادية
      if (err.response) {
        const { status, data } = err.response;

        if (status === 400 || status === 422) {
          if (data.errors) {
            const apiErrors = {};
            Object.keys(data.errors).forEach((key) => {
              apiErrors[key] = data.errors[key][0];
            });
            setValidationErrors(apiErrors);
          } else {
            setError(data.message || "Validation error");
          }
        } else {
          setError(data?.message || err.message || "Error adding supplier");
        }
      } else if (err.request) {
        setError("No response from server. Check your connection.");
      } else {
        setError(err.message || "Error setting up request");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => navigate("/procurement/suppliers")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("addNewSupplier", "procurement") || "Add New Supplier"}
            </h1>
            <p className="text-gray-600">
              {t("addSupplierDescription", "procurement") ||
                "Add a new supplier to your procurement system"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/procurement/suppliers")}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          {t("cancel", "common")}
        </button>
      </div>

      {/* ✅ رسالة النجاح */}
      {success ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t("supplierAddedSuccess", "procurement") ||
                "Supplier Added Successfully!"}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("supplierAddedSystem", "procurement") ||
                "The supplier has been added to your system. Redirecting to suppliers list..."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/procurement/suppliers")}
              className="px-6 py-3 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
            >
              {t("goBackSuppliers", "procurement") || "Go Back to Suppliers"}
            </button>
          </div>
        </div>
      ) : (
        /* ✅ نموذج إضافة المزود */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {/* ✅ رسالة الخطأ العامة */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Building className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("basicInformation", "procurement") ||
                        "Basic Information"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("enterSupplierDetails", "procurement") ||
                        "Enter supplier's basic details"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Mail className="mr-2 text-gray-500" size={16} />
                      {t("email", "procurement") || "Email"} *
                    </label>
                    <TextBox
                      placeholder="e.g., contact@supplier.com"
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
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Phone className="mr-2 text-gray-500" size={16} />
                      {t("phone", "procurement") || "Phone"} *
                    </label>
                    <TextBox
                      placeholder="e.g., +1-555-123-4567"
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
              </div>

              {/* Address & Product Type Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <MapPin className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("locationProducts", "procurement") ||
                        "Location & Products"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("supplierLocationProducts", "procurement") ||
                        "Supplier's address and product types"}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Address */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <MapPin className="mr-2 text-gray-500" size={16} />
                      {t("address", "procurement") || "Address"} *
                    </label>
                    <TextArea
                      placeholder="e.g., 123 Equipment St, New York, NY 10001"
                      value={formData.address}
                      onValueChange={(value) => handleChange("address", value)}
                      height={100}
                      width="100%"
                      isValid={!validationErrors.address}
                    />
                    {validationErrors.address && (
                      <p className="text-red-600 text-xs mt-1">
                        {validationErrors.address}
                      </p>
                    )}
                  </div>

                  {/* Product Type */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Package className="mr-2 text-gray-500" size={16} />
                      {t("productType", "procurement") || "Product Type"} *
                    </label>
                    <SelectBox
                      items={productTypeOptions}
                      value={formData.product_type}
                      onValueChange={(value) =>
                        handleChange("product_type", value)
                      }
                      displayExpr="label"
                      valueExpr="value"
                      placeholder={
                        t("selectProductType", "procurement") ||
                        "Select product type"
                      }
                      searchEnabled={true}
                      width="100%"
                      isValid={!validationErrors.product_type}
                    />
                    {validationErrors.product_type && (
                      <p className="text-red-600 text-xs mt-1">
                        {validationErrors.product_type}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <FileText className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("additionalNotes", "procurement") ||
                        "Additional Notes"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("additionalInfoSupplier", "procurement") ||
                        "Additional information about the supplier"}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FileText className="mr-2 text-gray-500" size={16} />
                    {t("notes", "procurement") || "Notes"}
                  </label>
                  <TextArea
                    placeholder="e.g., Reliable supplier, fast delivery, good for bulk orders..."
                    value={formData.notes}
                    onValueChange={(value) => handleChange("notes", value)}
                    height={120}
                    width="100%"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {t("addNotesDescription", "procurement") ||
                      "Add any additional notes or comments about this supplier"}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/procurement/suppliers")}
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
                      {t("saving", "procurement") || "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2" />
                      {t("saveSupplier", "procurement") || "Save Supplier"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Quick Tips */}
          <div className="space-y-6">
            {/* Required Fields Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                📋 {t("requiredFields", "procurement") || "Required Fields"}
              </h3>
              <ul className="space-y-3 text-sm text-blue-700">
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">*</span>
                  <span>
                    {t("supplierNameRequired", "procurement") ||
                      "Supplier Name is required"}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">*</span>
                  <span>
                    {t("emailRequired", "procurement") || "Email is required"}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">*</span>
                  <span>
                    {t("phoneRequired", "procurement") || "Phone is required"}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">*</span>
                  <span>
                    {t("addressRequired", "procurement") ||
                      "Address is required"}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 font-bold mr-2">*</span>
                  <span>
                    {t("productTypeRequired", "procurement") ||
                      "Product Type is required"}
                  </span>
                </li>
              </ul>
            </div>

            {/* Quick Tips */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                💡 {t("quickTips", "procurement") || "Quick Tips"}
              </h3>
              <ul className="space-y-3 text-sm text-green-700">
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">1</span>
                  </div>
                  <span>
                    {t("useFullCompanyName", "procurement") ||
                      "Use the full company name for better identification"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">2</span>
                  </div>
                  <span>
                    {t("provideValidContactInfo", "procurement") ||
                      "Provide valid contact information for easy communication"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">3</span>
                  </div>
                  <span>
                    {t("specificProductTypes", "procurement") ||
                      "Be specific about product types for better categorization"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">4</span>
                  </div>
                  <span>
                    {t("addHelpfulNotes", "procurement") ||
                      "Add helpful notes for future reference"}
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

export default AddSupplier;
