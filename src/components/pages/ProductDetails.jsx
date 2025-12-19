import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  Share2,
  Package,
  DollarSign,
  Tag,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Warehouse,
  Hash,
  Layers,
  Info,
  FileText,
  Box,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // بيانات وهمية للمنتج (ستأتي من API لاحقاً)
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة جلب بيانات المنتج من API
    setTimeout(() => {
      const mockProduct = {
        id: parseInt(id),
        name: "Advanced Dental Chair",
        sku: "DENT-4501",
        category: "Equipment",
        unit: "piece", // يمكن أن يكون: piece, set, box, kit, pack
        price: "$4,500",
        discount: 10,
        priceAfterDiscount: "$4,050",
        cost: "$3,200",
        stock: 12,
        lowStockAlert: 5,
        description:
          "This advanced dental chair features ergonomic design, adjustable height, integrated lighting system, and multiple positioning options for maximum patient comfort and dentist convenience. Made with high-quality materials for durability and easy maintenance.",
        specifications: [
          "Material: Leather & Stainless Steel",
          "Weight Capacity: 300kg",
          "Power: Electric, 110-240V",
          "Dimensions: 180x80x120 cm",
          "Warranty: 3 years",
        ],
        status: "active",
        featured: true,
        trackInventory: true,
        sales: 45,
        revenue: "$202,500",
        lastRestock: "2024-01-10",
        image:
          "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop",
      };
      setProduct(mockProduct);
      setLoading(false);
    }, 500);
  }, [id]);

  // ترجمة الوحدة
  const getUnitTranslation = (unit) => {
    const units = {
      piece: t("piece", "productDetails"),
      set: t("set", "productDetails"),
      box: t("box", "productDetails"),
      kit: t("kit", "productDetails"),
      pack: t("pack", "productDetails"),
    };
    return units[unit] || unit;
  };

  // ترجمة الحالة
  const getStatusTranslation = (status) => {
    const statuses = {
      active: t("active", "productDetails"),
      inactive: t("inactive", "productDetails"),
      draft: t("draft", "productDetails"),
    };
    return statuses[status] || status;
  };

  // حساب التوفير
  const calculateSavings = () => {
    if (!product || !product.discount) return "$0";
    const original = parseFloat(product.price.replace(/[^0-9.-]+/g, ""));
    const savings = original * (product.discount / 100);
    return `$${savings.toLocaleString()}`;
  };

  // حالة المخزون
  const getStockStatus = (stock, threshold) => {
    if (stock === 0) {
      return {
        text: t("outOfStock", "products"),
        color: "text-red-600",
        bg: "bg-red-100",
      };
    } else if (stock <= threshold) {
      return {
        text: t("lowStock", "products"),
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    } else {
      return {
        text: t("inStock", "products"),
        color: "text-green-600",
        bg: "bg-green-100",
      };
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(`${t("confirmDelete", "products")} "${product?.name}"?`)
    ) {
      alert(`${t("deleteSuccess", "products")}: ${product?.name}`);
      navigate("/products");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      alert(t("shareProduct", "productDetails"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-semibold text-gray-800">
            Product not found
          </h3>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition"
          >
            {t("backToProducts", "productDetails")}
          </button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock, product.lowStockAlert);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/products")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("productDetails", "productDetails")}
            </h1>
            <p className="text-gray-600">{product.name}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <Printer size={20} />
            <span>{t("printDetails", "productDetails")}</span>
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center space-x-2"
          >
            <Share2 size={20} />
            <span>{t("shareProduct", "productDetails")}</span>
          </button>
          <button
            onClick={() => navigate(`/products/edit/${product.id}`)}
            className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition flex items-center space-x-2"
          >
            <Edit size={20} />
            <span>{t("editProduct", "productDetails")}</span>
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition flex items-center space-x-2"
          >
            <Trash2 size={20} />
            <span>{t("deleteProduct", "productDetails")}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Image & Basic Info */}
        <div className="lg:col-span-2">
          {/* Product Image */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="text-dental-blue" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("productInformation", "productDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("basicDetails", "productDetails")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {product.name}
                  </h2>
                  <div
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}
                  >
                    {stockStatus.text}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <Hash size={14} className="inline mr-1" />
                      {t("skuNumber", "productDetails")}
                    </p>
                    <p className="font-medium">{product.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <Layers size={14} className="inline mr-1" />
                      {t("productCategory", "productDetails")}
                    </p>
                    <p className="font-medium">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <Box size={14} className="inline mr-1" />
                      {t("productUnit", "productDetails")}
                    </p>
                    <p className="font-medium">
                      {getUnitTranslation(product.unit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <Warehouse size={14} className="inline mr-1" />
                      {t("currentStock", "productDetails")}
                    </p>
                    <p className="font-medium">
                      {product.stock} {getUnitTranslation(product.unit)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("pricingInformation", "productDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("originalPrice", "productDetails")},{" "}
                  {t("discountApplied", "productDetails")},{" "}
                  {t("finalPrice", "productDetails")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  {t("originalPrice", "productDetails")}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {product.price}
                </p>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  {t("discountApplied", "productDetails")}
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {product.discount}%
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {t("youSave", "productDetails")}: {calculateSavings()}
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  {t("finalPrice", "productDetails")}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {product.priceAfterDiscount}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Inclusive of all taxes
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Tag className="text-blue-500 mr-3" size={20} />
                <div>
                  <p className="text-sm text-blue-800">
                    Cost Price:{" "}
                    <span className="font-medium">{product.cost}</span> | Profit
                    Margin: <span className="font-medium">40.6%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="text-purple-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("productDescription", "productDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("specifications", "productDetails")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Specifications
                </h4>
                <ul className="space-y-2">
                  {product.specifications.map((spec, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle
                        className="text-green-500 mr-2 mt-0.5"
                        size={16}
                      />
                      <span className="text-gray-600">{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Additional Information */}
        <div className="space-y-6">
          {/* Product Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Info className="text-orange-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("additionalInformation", "productDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("productStatus", "productDetails")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">
                  {t("productStatus", "productDetails")}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.status === "active"
                      ? "bg-green-100 text-green-800"
                      : product.status === "inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {getStatusTranslation(product.status)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">
                  {t("isFeatured", "productDetails")}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.featured
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.featured
                    ? t("yes", "productDetails")
                    : t("no", "productDetails")}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">
                  {t("trackInventory", "productDetails")}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.trackInventory
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.trackInventory
                    ? t("yes", "productDetails")
                    : t("no", "productDetails")}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">
                  {t("lowStockThreshold", "productDetails")}
                </span>
                <span className="font-medium">
                  {product.lowStockAlert} {getUnitTranslation(product.unit)}
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Management */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Warehouse className="text-dental-blue" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("inventoryManagement", "productDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("lastRestockDate", "productDetails")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="text-blue-500 mr-2" size={18} />
                  <span className="text-gray-700">
                    {t("lastRestockDate", "productDetails")}
                  </span>
                </div>
                <span className="font-medium">{product.lastRestock}</span>
              </div>

              <button className="w-full py-3 px-4 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center space-x-2">
                <Warehouse size={18} />
                <span>{t("viewInWarehouse", "productDetails")}</span>
              </button>
            </div>
          </div>

          {/* Sales Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <BarChart3 className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("salesPerformance", "productDetails")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("totalUnitsSold", "productDetails")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">
                  {t("totalUnitsSold", "productDetails")}
                </span>
                <span className="text-xl font-bold text-green-600">
                  {product.sales}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">
                  {t("revenueGenerated", "productDetails")}
                </span>
                <span className="text-xl font-bold text-purple-600">
                  {product.revenue}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 text-center">
                  Avg. Monthly Sales:{" "}
                  <span className="font-medium">15 units</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-end space-x-3 pt-6">
        <button
          onClick={() => navigate("/products")}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          {t("backToProducts", "productDetails")}
        </button>
        <button
          onClick={() => navigate(`/products/edit/${product.id}`)}
          className="px-6 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
        >
          <Edit size={20} />
          <span>{t("editProduct", "productDetails")}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
