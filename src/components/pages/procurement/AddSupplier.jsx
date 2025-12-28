import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
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
} from "lucide-react";

const AddSupplier = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    productType: "",
    status: "active",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  // خيارات الحالة
  const statusOptions = [
    {
      value: "active",
      label: t("active", "procurement") || "Active",
      icon: <CheckCircle size={16} className="text-green-600 mr-2" />,
    },
    {
      value: "inactive",
      label: t("inactive", "procurement") || "Inactive",
      icon: <XCircle size={16} className="text-red-600 mr-2" />,
    },
  ];

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // محاكاة إرسال البيانات إلى الخادم
    setTimeout(() => {
      console.log("Supplier data:", formData);
      setLoading(false);
      setSuccess(true);

      // إعادة التوجيه بعد 2 ثانية
      setTimeout(() => {
        navigate("/procurement/suppliers");
      }, 2000);
    }, 1500);
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

      {success ? (
        /* Success Message */
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
                "The supplier has been added to your system."}
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
        /* Supplier Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
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
                    />
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
                    />
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
                    />
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
                    />
                  </div>

                  {/* Product Type */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Package className="mr-2 text-gray-500" size={16} />
                      {t("productType", "procurement") || "Product Type"} *
                    </label>
                    <SelectBox
                      items={productTypeOptions}
                      value={formData.productType}
                      onValueChange={(value) =>
                        handleChange("productType", value)
                      }
                      displayExpr="label"
                      valueExpr="value"
                      placeholder={
                        t("selectProductType", "procurement") ||
                        "Select product type"
                      }
                      searchEnabled={true}
                      width="100%"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Notes Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <FileText className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("statusNotes", "procurement") || "Status & Notes"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("setStatusAdditionalInfo", "procurement") ||
                        "Set supplier status and additional information"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("status", "procurement") || "Status"} *
                    </label>
                    <SelectBox
                      items={statusOptions}
                      value={formData.status}
                      onValueChange={(value) => handleChange("status", value)}
                      displayExpr="label"
                      valueExpr="value"
                      placeholder={
                        t("selectStatus", "procurement") || "Select status"
                      }
                      itemRender={(item) => (
                        <div className="flex items-center">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                      )}
                      width="100%"
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
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
                  disabled={
                    loading || !formData.name.trim() || !formData.email.trim()
                  }
                  className={`
                    px-6 py-2 rounded-lg font-medium transition flex items-center justify-center
                    ${
                      loading || !formData.name.trim() || !formData.email.trim()
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
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">5</span>
                  </div>
                  <span>
                    {t("setActiveStatusNew", "procurement") ||
                      "Set status to 'Active' for new suppliers"}
                  </span>
                </li>
              </ul>
            </div>

            {/* Data Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                👁️ {t("dataPreview", "procurement") || "Data Preview"}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  {t("fieldsWillAppear", "procurement") ||
                    "All fields will appear in the suppliers table exactly as entered here."}
                </p>
                <p className="mt-2">
                  {t("editLater", "procurement") ||
                    "You can edit this information later from the suppliers management page."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSupplier;
