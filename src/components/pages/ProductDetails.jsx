import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
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
  X,
  Eye,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/products/${id}`);
      const apiData = response.data?.data;

      if (apiData) {
        // معالجة الصور لإنشاء روابط كاملة
        const processedImages =
          apiData.images?.map((img) => ({
            ...img,
            fullUrl: img.url.startsWith("http")
              ? img.url
              : `https://dentist-production.up.railway.app${img.url}`,
          })) || [];

        // الحصول على قيم الخصم وتحويلها لأرقام
        const price = parseFloat(apiData.price) || 0;
        const discountPrice = parseFloat(apiData.discount_price) || null;

        // حساب ما إذا كان هناك خصم فعلي
        const hasActualDiscount =
          discountPrice !== null && discountPrice < price && discountPrice > 0;

        // حساب نسبة الخصم فقط إذا كان هناك خصم فعلي
        const discountPercentage =
          hasActualDiscount && price > 0
            ? Math.round(((price - discountPrice) / price) * 100)
            : 0;

        const processedProduct = {
          id: apiData.id,
          name: apiData.name || "",
          s_name: apiData.s_name || "",
          description: apiData.description || "",
          s_description: apiData.s_description || "",
          sku: apiData.sku || "",
          price: price,
          stock_alert: parseInt(apiData.stock_alert) || 10,
          cost: parseFloat(apiData.cost) || 0,
          stock_quantity: parseInt(apiData.stock_quantity) || 0,
          category: apiData.category || "",
          tax_rate: parseFloat(apiData.tax_rate) || 0,
          discount_price: discountPrice,
          images: processedImages,
          product_rate: parseFloat(apiData.product_rate) || 0,
          status: apiData.status || "instock",
          created_at: apiData.created_at || "",

          // حقول محسوبة
          hasDiscount: hasActualDiscount,
          discountPercentage: discountPercentage,
          finalPrice: hasActualDiscount ? discountPrice : price,
        };

        setProduct(processedProduct);
      } else {
        setError(
          t("noProductData", "productDetails") || "No product data found"
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t("loadProductFailed", "productDetails") ||
          "Failed to load product details"
      );
    } finally {
      setLoading(false);
    }
  };

  // دالة للحصول على اسم المنتج بناءً على اللغة
  const getProductName = () => {
    if (!product) return "";
    const currentLang = localStorage.getItem("language") || "en";
    if (currentLang === "sv" && product.s_name && product.s_name.trim()) {
      return product.s_name;
    }
    return product.name;
  };

  // دالة للحصول على وصف المنتج بناءً على اللغة
  const getProductDescription = () => {
    if (!product) return "";
    const currentLang = localStorage.getItem("language") || "en";
    if (
      currentLang === "sv" &&
      product.s_description &&
      product.s_description.trim()
    ) {
      return product.s_description;
    }
    return product.description;
  };

  // حالة المخزون
  const getStockStatus = () => {
    if (!product) return { text: "", color: "", bg: "" };

    if (product.stock_quantity === 0) {
      return {
        text: t("outOfStock", "products"),
        color: "text-red-600",
        bg: "bg-red-100",
      };
    } else if (product.stock_quantity <= product.stock_alert) {
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
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
        );
      } else {
        stars.push(<Star key={i} size={16} className="text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center space-x-2">
        <div className="flex">{stars}</div>
        <span className="font-semibold text-gray-800">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // حساب هامش الربح
  const calculateProfitMargin = () => {
    if (!product || !product.cost || !product.price) return 0;
    const profit = product.price - product.cost;
    return ((profit / product.cost) * 100).toFixed(2);
  };

  // حساب مبلغ الربح
  const calculateProfitAmount = () => {
    if (!product || !product.cost || !product.price) return 0;
    return (product.price - product.cost).toFixed(2);
  };

  // حساب مبلغ الخصم
  const calculateDiscountAmount = () => {
    if (
      !product ||
      !product.hasDiscount ||
      !product.discount_price ||
      !product.price
    )
      return 0;
    return (product.price - product.discount_price).toFixed(2);
  };

  const handleDelete = async () => {
    const productName = getProductName();
    if (
      window.confirm(
        t("confirmDelete", "products", { name: productName }) ||
          `Are you sure you want to delete product "${productName}"?`
      )
    ) {
      try {
        await api.delete(`/deleteproduct/${id}`);
        alert(t("deleteSuccess", "products") || "Product deleted successfully");
        navigate("/products");
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        alert(t("deleteError", "products") || "Error deleting product");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {error ||
              t("productNotFound", "productDetails") ||
              "Product not found"}
          </h3>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition"
          >
            {t("backToProducts", "productDetails") || "Back to Products"}
          </button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();

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
              {t("productDetails", "productDetails") || "Product Details"}
            </h1>
            <p className="text-gray-600">{getProductName()}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/products/edit/${product.id}`)}
            className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition flex items-center space-x-2"
          >
            <Edit size={20} />
            <span>{t("editProduct", "productDetails") || "Edit Product"}</span>
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition flex items-center space-x-2"
          >
            <Trash2 size={20} />
            <span>
              {t("deleteProduct", "productDetails") || "Delete Product"}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Image & Basic Info */}
        <div className="lg:col-span-2">
          {/* Product Image & Gallery */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="text-dental-blue" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("productImages", "productDetails") || "Product Images"}
                </h3>
                <p className="text-sm text-gray-600">
                  {product.images.length} {t("images", "products") || "images"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Image */}
              <div className="md:col-span-2">
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  {product.images.length > 0 ? (
                    <>
                      <img
                        src={product.images[selectedImageIndex]?.fullUrl}
                        alt={`${getProductName()} - Image ${
                          selectedImageIndex + 1
                        }`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/600x600?text=No+Image";
                        }}
                      />
                      {product.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {selectedImageIndex + 1} / {product.images.length}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Package className="text-gray-400" size={48} />
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {t("gallery", "products") || "Gallery"}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {product.images.slice(0, 4).map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-dental-blue ring-2 ring-blue-100"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image.fullUrl}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/150x150?text=No+Image";
                        }}
                      />
                    </button>
                  ))}

                  {/* Empty slots if less than 4 images */}
                  {Array.from({
                    length: Math.max(0, 4 - product.images.length),
                  }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                    >
                      <div className="text-center p-2">
                        <Eye className="text-gray-400 mx-auto mb-1" size={20} />
                        <p className="text-xs text-gray-500">
                          {t("emptySlot", "productDetails") || "Empty"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Info className="text-dental-blue" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("productInformation", "productDetails") ||
                    "Product Information"}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("basicDetails", "productDetails") ||
                    "Basic product details"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {getProductName()}
                </h2>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}
                >
                  {stockStatus.text}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    <Hash size={14} className="inline mr-2" />
                    {t("sku", "products") || "SKU"}
                  </p>
                  <p className="font-medium text-gray-800">{product.sku}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    <Layers size={14} className="inline mr-2" />
                    {t("category", "products") || "Category"}
                  </p>
                  <p className="font-medium text-gray-800 capitalize">
                    {product.category}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    <Warehouse size={14} className="inline mr-2" />
                    {t("stock", "products") || "Stock Quantity"}
                  </p>
                  <p className="font-medium text-gray-800">
                    {product.stock_quantity} {t("units", "products") || "units"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    <AlertCircle size={14} className="inline mr-2" />
                    {t("lowStockAlert", "productDetails") || "Low Stock Alert"}
                  </p>
                  <p className="font-medium text-gray-800">
                    {product.stock_alert} {t("units", "products") || "units"}
                  </p>
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
                  {t("pricingInformation", "productDetails") ||
                    "Pricing Information"}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("pricingSummary", "productDetails") ||
                    "Cost, price, discount, and tax details"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Cost Price */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t("costPrice", "products") || "Cost Price"}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  ${parseFloat(product.cost).toFixed(2)}
                </p>
              </div>

              {/* Selling Price */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t("price", "products") || "Selling Price"}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  ${parseFloat(product.price).toFixed(2)}
                </p>
              </div>

              {/* Discount Price - عرض فقط إذا كان هناك خصم فعلي */}
              {product.hasDiscount && product.discount_price !== null && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("priceAfterDiscount", "products") || "Discount Price"}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    ${parseFloat(product.discount_price).toFixed(2)}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {product.discountPercentage > 0 &&
                      `${product.discountPercentage}% `}
                    {t("off", "products") || "OFF"}
                  </p>
                </div>
              )}

              {/* Tax Rate */}
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t("taxRate", "products") || "Tax Rate"}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {product.tax_rate}%
                </p>
              </div>
            </div>

            {/* Pricing Summary */}
            {(product.cost > 0 ||
              product.hasDiscount ||
              product.tax_rate > 0) && (
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 mb-3">
                  {t("pricingSummary", "productDetails") || "Pricing Summary"}
                </h4>
                <div className="space-y-2">
                  {product.cost > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {t("costPrice", "products") || "Cost Price"}:
                        </span>
                        <span className="font-medium">
                          ${parseFloat(product.cost).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {t("sellingPrice", "productDetails") ||
                            "Selling Price"}
                          :
                        </span>
                        <span className="font-medium">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {t("profitAmount", "productDetails") ||
                            "Profit Amount"}
                          :
                        </span>
                        <span className="font-medium text-green-600">
                          ${calculateProfitAmount()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {t("profitMargin", "products") || "Profit Margin"}:
                        </span>
                        <span className="font-medium text-green-600">
                          {calculateProfitMargin()}%
                        </span>
                      </div>
                    </>
                  )}

                  {product.hasDiscount && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {t("discountAmount", "productDetails") ||
                            "Discount Amount"}
                          :
                        </span>
                        <span className="font-medium text-red-600">
                          -${calculateDiscountAmount()}
                        </span>
                      </div>
                      {product.discountPercentage > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {t("discountPercentage", "productDetails") ||
                              "Discount Percentage"}
                            :
                          </span>
                          <span className="font-medium text-red-600">
                            {product.discountPercentage}% OFF
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {product.tax_rate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {t("tax", "products") || "Tax"} ({product.tax_rate}%):
                      </span>
                      <span className="font-medium text-orange-600">
                        +$
                        {(
                          parseFloat(product.finalPrice) *
                          (product.tax_rate / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-800">
                      {t("finalPrice", "products") || "Final Price"}:
                    </span>
                    <span className="font-bold text-gray-900">
                      $
                      {(
                        parseFloat(product.finalPrice) *
                        (1 + product.tax_rate / 100)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="text-purple-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("description", "products") || "Description"}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("productDescription", "productDetails") ||
                    "Product description and details"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  {t("description", "products") || "Description"}
                </h4>
                <p className="text-gray-600 whitespace-pre-line">
                  {getProductDescription() ||
                    t("noDescription", "productDetails") ||
                    "No description available."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Product Rating */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="text-yellow-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("productRating", "productDetails") || "Product Rating"}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("customerRating", "productDetails") ||
                    "Customer rating and reviews"}
                </p>
              </div>
            </div>

            <div className="text-center py-4">
              <div className="mb-4">{renderRating(product.product_rate)}</div>
              <p className="text-sm text-gray-600">
                {product.product_rate.toFixed(1)}{" "}
                {t("outOf", "productDetails") || "out of"} 5.0
              </p>
            </div>
          </div>

          {/* Product Status & Dates */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("productStatus", "productDetails") || "Product Status"}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("statusAndDates", "productDetails") ||
                    "Current status and important dates"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  {t("status", "products") || "Status"}
                </p>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}
                >
                  {stockStatus.text}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  {t("createdAt", "products") || "Created Date"}
                </p>
                <p className="font-medium text-gray-800">
                  {new Date(product.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(product.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Info className="text-dental-blue" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {t("quickActions", "productDetails") || "Quick Actions"}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("manageProduct", "productDetails") ||
                    "Manage this product"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate(`/products/edit/${product.id}`)}
                className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition flex items-center justify-center space-x-2"
              >
                <Edit size={20} />
                <span>
                  {t("editProduct", "productDetails") || "Edit Product"}
                </span>
              </button>

              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition flex items-center justify-center space-x-2"
              >
                <Trash2 size={20} />
                <span>
                  {t("deleteProduct", "productDetails") || "Delete Product"}
                </span>
              </button>

              <button
                onClick={() => navigate("/products")}
                className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center justify-center space-x-2"
              >
                <ArrowLeft size={20} />
                <span>
                  {t("backToProducts", "productDetails") || "Back to Products"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
