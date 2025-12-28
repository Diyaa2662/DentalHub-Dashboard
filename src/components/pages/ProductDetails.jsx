import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Warehouse,
  Hash,
  Layers,
  Info,
  FileText,
  Box,
  Star,
  Percent,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // بيانات وهمية للمنتج (مع إضافة الحقول الجديدة)
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
        unit: "piece",
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
        sales: 45,
        revenue: "$202,500",
        lastRestock: "2024-01-10",
        image:
          "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop",
        // ✅ الحقول الجديدة
        taxRate: 15,
        rate: 4.8,
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

  // دالة لعرض التقييم بالنجوم
  const renderRating = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        <span className="font-semibold text-gray-800">{rating}</span>
        <Star size={16} className="fill-yellow-400 text-yellow-400" />
      </div>
    );
  };

  const handleDelete = () => {
    if (
      window.confirm(`${t("confirmDelete", "products")} "${product?.name}"?`)
    ) {
      alert(`${t("deleteSuccess", "products")}: ${product?.name}`);
      navigate("/products");
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

                {/* ✅ إضافة Low Stock Threshold تحت product unit */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      <AlertCircle
                        size={14}
                        className="inline mr-1 text-yellow-500"
                      />
                      {t("lowStockThreshold", "productDetails")}
                    </span>
                    <span className="font-medium text-gray-800">
                      {product.lowStockAlert} {getUnitTranslation(product.unit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ✅ Pricing Information المعدل */}
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
                  {t("costPrice", "productDetails")},{" "}
                  {t("originalPrice", "productDetails")},{" "}
                  {t("finalPrice", "productDetails")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Original Price */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t("originalPrice", "productDetails")}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {product.price}
                </p>
              </div>

              {/* Price After Discount - بدل Discount */}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t("priceAfterDiscount", "products") ||
                    "Price After Discount"}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {product.priceAfterDiscount}
                </p>
              </div>

              {/* Cost Price - الجديد */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t("costPrice", "productDetails")}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {product.cost}
                </p>
              </div>

              {/* Tax Rate */}
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t("taxRate", "products") || "Tax Rate"}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {product.taxRate}%
                </p>
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

        {/* Right Column */}
        <div className="space-y-6">
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

              {/* ✅ Product Rating */}
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-500 mr-2" />
                  <span className="text-gray-700">
                    {t("productRating", "productDetails") || "Product Rating"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {renderRating(product.rate)}
                </div>
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
