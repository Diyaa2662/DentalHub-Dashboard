import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// إزالة استيراد Button من devextreme واستخدام button عادي
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
} from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    cost: "",
    stock: "",
    description: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // قائمة الفئات
  const categories = [
    "Equipment",
    "Imaging",
    "Surgical",
    "Restorative",
    "Hygiene",
    "Digital",
    "Sterilization",
    "Magnification",
    "Orthodontic",
  ];

  // قائمة الوحدات
  const units = ["Piece", "Set", "Box", "Kit", "Pack"];

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
              Add New Product
            </h1>
            <p className="text-gray-600">
              Add new dental equipment to your inventory
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/products")}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
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
              Product Added Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              The new product has been added to your inventory.
            </p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
            >
              Go Back to Products
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
                      Basic Information
                    </h3>
                    <p className="text-sm text-gray-600">
                      Enter product details
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
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
                        SKU (Stock Keeping Unit)
                      </label>
                      <button
                        type="button"
                        onClick={generateSKU}
                        className="text-sm text-dental-blue hover:text-blue-600"
                      >
                        Generate SKU
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

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <SelectBox
                      items={categories}
                      value={formData.category}
                      onValueChange={(value) => handleChange("category", value)}
                      placeholder="Select category"
                      width="100%"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <SelectBox
                      items={units}
                      value={formData.unit}
                      onValueChange={(value) => handleChange("unit", value)}
                      placeholder="Select unit"
                      width="100%"
                    />
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
                      Pricing & Stock
                    </h3>
                    <p className="text-sm text-gray-600">
                      Set pricing and inventory details
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Selling Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price *
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
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>

                  {/* Cost Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Price
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
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
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

                {/* Low Stock Alert */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Stock Alert Threshold
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
                    Get notified when stock falls below this number
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
                      Description & Details
                    </h3>
                    <p className="text-sm text-gray-600">
                      Add product description and specifications
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description
                  </label>
                  <TextArea
                    placeholder="Describe the product features, specifications, and benefits..."
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
                  Cancel
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2" />
                      Save Product
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
                    Product Image
                  </h3>
                  <p className="text-sm text-gray-600">Upload product photos</p>
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
                      <p className="text-sm text-gray-600">Image preview</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Upload className="text-gray-400" size={24} />
                      </div>
                      <div>
                        <p className="text-gray-600 mb-2">
                          Drag & drop or click to upload
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports JPG, PNG up to 5MB
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
                    <span className="font-medium">Choose Image</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Product Status Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Product Status
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Status</span>
                  <select
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1"
                    value={formData.status || "active"}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Featured Product</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.featured || false}
                      onChange={(e) =>
                        handleChange("featured", e.target.checked)
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Track Inventory</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.trackInventory !== false}
                      onChange={(e) =>
                        handleChange("trackInventory", e.target.checked)
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                📝 Quick Tips
              </h3>
              <ul className="space-y-3 text-sm text-blue-700">
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">1</span>
                  </div>
                  <span>Use clear, descriptive product names</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">2</span>
                  </div>
                  <span>Set realistic stock levels and alerts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">3</span>
                  </div>
                  <span>High-quality images increase sales</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">4</span>
                  </div>
                  <span>Accurate pricing ensures profitability</span>
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
