import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { TextBox, TextArea } from "devextreme-react";
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
  User,
} from "lucide-react";

const EditSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // حالة البيانات الأصلية للمقارنة
  const [originalData, setOriginalData] = useState(null);

  // حالة بيانات المزود للتعديل
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    productType: "",
    status: "active",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // قائمة أنواع المنتجات (يمكن جلبها من API)
  const productTypes = [
    "Equipment",
    "Disposables",
    "Oral Hygiene",
    "Surgical Tools",
    "Clinic Furniture",
    "Imaging",
    "Orthodontic",
    "Sterilization",
    "Digital",
    "Restorative",
  ];

  // ✅ محاكاة جلب بيانات المزود من API
  useEffect(() => {
    const fetchSupplier = () => {
      setLoading(true);

      // بيانات وهمية للمزود (بديل لـ API)
      setTimeout(() => {
        const mockSupplier = {
          id: parseInt(id),
          name: "Dental Equipment Co.",
          email: "john@dentalequip.com",
          phone: "+1-555-123-4567",
          address: "123 Equipment St, New York, NY 10001",
          productType: "Equipment",
          status: "active",
          notes: "Reliable supplier, fast delivery",
        };

        setOriginalData(mockSupplier);
        setFormData(mockSupplier);
        setLoading(false);
      }, 800);
    };

    fetchSupplier();
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

  // معالجة تغيير الحقول النصية
  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ إعادة تعيين النموذج للبيانات الأصلية
  const resetForm = () => {
    if (originalData) {
      setFormData(originalData);
    }
  };

  // ✅ حفظ التعديلات
  const handleSave = (e) => {
    e.preventDefault();

    // التحقق من البيانات المطلوبة
    if (!formData.name.trim()) {
      alert("Supplier name is required");
      return;
    }

    if (!formData.email.trim()) {
      alert("Email is required");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Phone number is required");
      return;
    }

    setUpdating(true);

    // محاكاة إرسال البيانات إلى الخادم للتحديث
    setTimeout(() => {
      console.log("Updated supplier data:", formData);
      setUpdating(false);
      setSuccess(true);

      // تحديث البيانات الأصلية بعد التعديل الناجح
      setOriginalData(formData);
      setHasChanges(false);
    }, 1500);
  };

  // ✅ إلغاء والعودة
  const handleCancel = () => {
    navigate("/procurement/suppliers");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue"></div>
        <span className="ml-4 text-gray-600">Loading supplier data...</span>
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
      </div>

      {/* Change Indicator */}
      {hasChanges && (
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
                "The supplier has been updated in your system."}
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => navigate("/procurement/suppliers")}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                {t("backToSuppliers", "procurement") || "Back to Suppliers"}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
              >
                {t("editMoreDetails", "procurement") || "Edit More Details"}
              </button>
            </div>
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
                    <div className="relative">
                      {/* <div className="absolute left-3 top-2.5 text-gray-500">
                        <Building size={18} />
                      </div> */}
                      <TextBox
                        placeholder="e.g., Dental Equipment Co."
                        value={formData.name}
                        onValueChange={(value) => handleChange("name", value)}
                        width="100%"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("email", "procurement") || "Email"} *
                      </label>
                      <div className="relative">
                        <TextBox
                          placeholder="contact@supplier.com"
                          value={formData.email}
                          onValueChange={(value) =>
                            handleChange("email", value)
                          }
                          width="100%"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("phone", "procurement") || "Phone"} *
                      </label>
                      <div className="relative">
                        <TextBox
                          placeholder="+1-555-123-4567"
                          value={formData.phone}
                          onValueChange={(value) =>
                            handleChange("phone", value)
                          }
                          width="100%"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("address", "procurement") || "Address"} *
                    </label>
                    <div className="relative">
                      <TextBox
                        placeholder="123 Street, City, Country"
                        value={formData.address}
                        onValueChange={(value) =>
                          handleChange("address", value)
                        }
                        width="100%"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Type & Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Package className="text-green-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("productTypeStatus", "procurement") ||
                        "Product Type & Status"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("updateProductTypeStatus", "procurement") ||
                        "Update product type and supplier status"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("productType", "procurement") || "Product Type"} *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-gray-500">
                        <Package size={18} />
                      </div>
                      <select
                        value={formData.productType}
                        onChange={(e) =>
                          handleChange("productType", e.target.value)
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="">Select Product Type</option>
                        {productTypes.map((type, index) => (
                          <option key={index} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("status", "procurement") || "Status"} *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-gray-500">
                        {formData.status === "active" ? (
                          <CheckCircle className="text-green-500" size={18} />
                        ) : (
                          <XCircle className="text-red-500" size={18} />
                        )}
                      </div>
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {t("statusDescription", "procurement") ||
                        "Inactive suppliers won't appear in dropdowns"}
                    </p>
                  </div>
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
                  disabled={
                    updating ||
                    !formData.name.trim() ||
                    !formData.email.trim() ||
                    !formData.phone.trim() ||
                    !formData.address.trim() ||
                    !formData.productType.trim()
                  }
                  className={`
                    px-6 py-2 rounded-lg font-medium transition flex items-center justify-center
                    ${
                      updating ||
                      !formData.name.trim() ||
                      !formData.email.trim() ||
                      !formData.phone.trim() ||
                      !formData.address.trim() ||
                      !formData.productType.trim()
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
                  <p className="text-sm text-gray-600">Current Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {formData.status === "active" ? (
                      <>
                        <CheckCircle className="text-green-500" size={16} />
                        <span className="text-green-600 font-medium">
                          Active
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-red-500" size={16} />
                        <span className="text-red-600 font-medium">
                          Inactive
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product Type</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Package className="text-gray-500" size={16} />
                    <span className="font-medium">{formData.productType}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Editing Tips */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                💡 {t("editingTips", "procurement") || "Editing Tips"}
              </h3>
              <ul className="space-y-3 text-sm text-green-700">
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600">✓</span>
                  </div>
                  <span>
                    {t("updateAllFields", "procurement") ||
                      "Update all fields to keep supplier information current"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600">✓</span>
                  </div>
                  <span>
                    {t("setInactiveTemporarily", "procurement") ||
                      "Set to 'Inactive' if supplier is temporarily unavailable"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600">✓</span>
                  </div>
                  <span>
                    {t("addDetailedNotes", "procurement") ||
                      "Add detailed notes for internal reference"}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600">✓</span>
                  </div>
                  <span>
                    {t("verifyContactInfo", "procurement") ||
                      "Verify contact information before saving"}
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

export default EditSupplier;
