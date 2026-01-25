import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import api from "../../../services/api";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  DollarSign,
  CreditCard,
  FileText,
  Building,
  ShoppingCart,
  ChevronDown,
  Percent,
  Globe,
  CheckCircle,
  AlertCircle,
} from "lucide-react"; // ✅ أضفنا CheckCircle و AlertCircle

const AddPurchaseOrder = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showProductSuggestions, setShowProductSuggestions] = useState({});

  // حالة النموذج الرئيسي
  const [formData, setFormData] = useState({
    supplier_id: "",
    currency: "USD",
    payment_method: "Bank Transfer",
    notes: "",
  });

  // حالة عناصر الطلب
  const [orderItems, setOrderItems] = useState([
    {
      id: 1,
      product: "",
      product_id: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 15,
    },
  ]);

  // قائمة الموردين
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  // قائمة المنتجات
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ✅ حالة جديدة لرسالة النجاح والخطأ
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // جلب الموردين والمنتجات من API
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await api.get("/suppliers");
      const apiData = response.data?.data;

      if (Array.isArray(apiData)) {
        setSuppliers(apiData);
      } else {
        console.error("Invalid suppliers data format:", apiData);
        setSuppliers([]);
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await api.get("/products");

      const apiData = response.data?.data;

      if (Array.isArray(apiData)) {
        const processedProducts = apiData.map((product) => ({
          id: product.id,
          name: product.name || "",
          cost: parseFloat(product.cost) || 0,
          stock_quantity: parseInt(product.stock_quantity) || 0,
          sku: product.sku || "",
        }));

        setProducts(processedProducts);
      } else {
        console.error("Invalid products data format:", apiData);
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // ✅ دالة التحقق من صحة النموذج
  const validateForm = () => {
    const errors = {};

    if (!formData.supplier_id) {
      errors.supplier_id =
        t("supplierRequired", "procurement") || "Please select a supplier";
    }

    if (orderItems.some((item) => !item.product_id || item.unitPrice <= 0)) {
      errors.orderItems =
        t("validItemsRequired", "procurement") ||
        "Please add valid items with prices";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // ✅ مسح أخطاء التحقق عند التغيير
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleItemChange = (id, field, value) => {
    setOrderItems(
      orderItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (
            field === "quantity" ||
            field === "unitPrice" ||
            field === "taxRate"
          ) {
            const subtotal = updatedItem.quantity * updatedItem.unitPrice;
            const taxAmount = subtotal * (updatedItem.taxRate / 100);
            updatedItem.subTotal = subtotal;
            updatedItem.taxAmount = taxAmount;
          }

          return updatedItem;
        }
        return item;
      }),
    );

    if (field === "product" && value) {
      setShowProductSuggestions((prev) => ({
        ...prev,
        [id]: true,
      }));
    } else if (field === "product" && !value) {
      setShowProductSuggestions((prev) => ({
        ...prev,
        [id]: false,
      }));
    }

    // ✅ مسح أخطاء العناصر عند التغيير
    if (validationErrors.orderItems) {
      setValidationErrors((prev) => ({
        ...prev,
        orderItems: null,
      }));
    }
  };

  const addOrderItem = () => {
    const newId =
      orderItems.length > 0
        ? Math.max(...orderItems.map((item) => item.id)) + 1
        : 1;
    setOrderItems([
      {
        id: newId,
        product: "",
        product_id: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 15,
        subTotal: 0,
        taxAmount: 0,
      },
      ...orderItems, // ✅ العناصر القديمة تبقى بعد العنصر الجديد
    ]);

    setShowProductSuggestions((prev) => ({
      ...prev,
      [newId]: false,
    }));
  };

  const removeOrderItem = (id) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((item) => item.id !== id));
    }
  };

  const selectSupplier = (supplier) => {
    setFormData({
      ...formData,
      supplier_id: supplier.id,
    });

    // ✅ مسح خطأ المورد عند الاختيار
    if (validationErrors.supplier_id) {
      setValidationErrors((prev) => ({
        ...prev,
        supplier_id: null,
      }));
    }
  };

  const selectProduct = (itemId, product) => {
    setOrderItems(
      orderItems.map((item) => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            product: product.name,
            product_id: product.id,
            unitPrice: product.cost || 0,
          };

          const subtotal = updatedItem.quantity * updatedItem.unitPrice;
          const taxAmount = subtotal * (updatedItem.taxRate / 100);
          updatedItem.subTotal = subtotal;
          updatedItem.taxAmount = taxAmount;

          return updatedItem;
        }
        return item;
      }),
    );

    setShowProductSuggestions((prev) => ({
      ...prev,
      [itemId]: false,
    }));
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce(
      (sum, item) => sum + (item.subTotal || 0),
      0,
    );
    const tax = orderItems.reduce(
      (sum, item) => sum + (item.taxAmount || 0),
      0,
    );
    const totalAmount = subtotal + tax;

    return {
      subtotal,
      tax,
      totalAmount,
    };
  };

  const totals = calculateTotals();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: formData.currency || "USD",
    }).format(amount);
  };

  // ✅ تقديم النموذج المعدل
  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من صحة النموذج
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const requestData = {
      supplier_id: parseInt(formData.supplier_id),
      currency: formData.currency,
      payment_method: formData.payment_method,
      notes: formData.notes,
      products: orderItems.map((item) => ({
        id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
        tax_rate: parseFloat(item.taxRate) || 0,
      })),
    };

    try {
      const response = await api.post("/createsupplierorder", requestData);

      if (response.status === 200 || response.status === 201) {
        // ✅ النجاح
        setSuccess(true);

        // ✅ الانتقال بعد 2 ثانية
        setTimeout(() => {
          navigate("/procurement/purchase-orders");
        }, 2000);
      } else {
        setError(
          t("createOrderError", "procurement") ||
            "Error creating purchase order",
        );
      }
    } catch (err) {
      console.error("Error creating order:", err);

      // ✅ إذا كان هناك رسالة نجاح في الخطأ
      if (
        err.response?.data?.message?.includes("success") ||
        err.response?.data?.message?.includes("created")
      ) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/procurement/purchase-orders");
        }, 2000);
        return;
      }

      // ✅ معالجة الأخطاء العادية
      setError(
        err.response?.data?.message ||
          err.message ||
          t("createOrderError", "procurement") ||
          "Error creating purchase order",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedSupplierName = () => {
    if (!formData.supplier_id) return "";
    const supplier = suppliers.find((s) => s.id == formData.supplier_id);
    return supplier ? supplier.name : "";
  };

  // ✅ عرض رسالة النجاح
  if (success) {
    return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/procurement/purchase-orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("addPurchaseOrder", "procurement") || "Add New Purchase Order"}
            </h1>
            <p className="text-gray-600">
              {t("createNewPurchaseOrder", "procurement") ||
                "Create a new purchase order for dental supplies"}
            </p>
          </div>
        </div>

        {/* ✅ رسالة النجاح */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t("purchaseOrderCreated", "procurement") ||
                "Purchase Order Created Successfully!"}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("purchaseOrderAddedSystem", "procurement") ||
                "The purchase order has been created successfully. Redirecting to purchase orders list..."}
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{t("supplier", "procurement") || "Supplier"}:</strong>{" "}
                  {getSelectedSupplierName()}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>
                    {t("totalAmount", "procurement") || "Total Amount"}:
                  </strong>{" "}
                  {formatCurrency(totals.totalAmount)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>{t("itemsCount", "procurement") || "Items"}:</strong>{" "}
                  {orderItems.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/procurement/purchase-orders")}
                className="px-6 py-3 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
              >
                {t("goBackPurchaseOrders", "procurement") ||
                  "Go Back to Purchase Orders"}
              </button>
            </div>
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
            onClick={() => navigate("/procurement/purchase-orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("addPurchaseOrder", "procurement") || "Add New Purchase Order"}
            </h1>
            <p className="text-gray-600">
              {t("createNewPurchaseOrder", "procurement") ||
                "Create a new purchase order for dental supplies"}
            </p>
          </div>
        </div>
      </div>

      {/* ✅ رسالة الخطأ العامة */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
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

      {/* ✅ رسائل التحقق */}
      {validationErrors.supplier_id && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="text-yellow-600 mr-3" size={20} />
            <div>
              <p className="text-yellow-700 text-sm">
                {validationErrors.supplier_id}
              </p>
            </div>
          </div>
        </div>
      )}

      {validationErrors.orderItems && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="text-yellow-600 mr-3" size={20} />
            <div>
              <p className="text-yellow-700 text-sm">
                {validationErrors.orderItems}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <ShoppingCart className="text-dental-blue" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t("orderItems", "orderDetails") || "Order Items"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("addItemsToPurchase", "procurement") ||
                        "Add items to purchase order"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="px-4 py-2 bg-blue-50 text-dental-blue rounded-lg hover:bg-blue-100 transition flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>{t("addItem", "procurement") || "Add Item"}</span>
                </button>
              </div>

              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-800">
                        {t("item", "procurement") || "Item"} #{item.id}
                      </h4>
                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOrderItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Product Selection */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("product", "orderDetails") || "Product"} *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={item.product}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "product",
                                e.target.value,
                              )
                            }
                            onFocus={() => {
                              if (item.product) {
                                setShowProductSuggestions((prev) => ({
                                  ...prev,
                                  [item.id]: true,
                                }));
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={
                              t("selectProduct", "procurement") ||
                              "Select product"
                            }
                            required
                          />
                          <div className="absolute right-3 top-2.5">
                            <ChevronDown size={20} className="text-gray-400" />
                          </div>
                        </div>

                        {/* Product Suggestions */}
                        {showProductSuggestions[item.id] && item.product && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {loadingProducts ? (
                              <div className="px-4 py-3 text-center text-gray-500">
                                {t("loadingProducts", "procurement") ||
                                  "Loading products..."}
                              </div>
                            ) : products.length === 0 ? (
                              <div className="px-4 py-3 text-center text-gray-500">
                                {t("noProductsFound", "procurement") ||
                                  "No products found"}
                              </div>
                            ) : (
                              products
                                .filter((p) =>
                                  p.name
                                    .toLowerCase()
                                    .includes(item.product.toLowerCase()),
                                )
                                .map((product) => (
                                  <div
                                    key={product.id}
                                    onClick={() =>
                                      selectProduct(item.id, product)
                                    }
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium">
                                        {product.name}
                                      </span>
                                      <span className="text-blue-600 font-bold">
                                        {formatCurrency(product.cost || 0)}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      <span>
                                        {t("stock", "procurement") || "Stock"}:{" "}
                                        {product.stock_quantity || 0}
                                      </span>
                                      {product.sku && (
                                        <span className="ml-2">
                                          SKU: {product.sku}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("quantity", "orderDetails") || "Quantity"} *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "quantity",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      {/* Unit Price - Display Only */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("unitPrice", "procurement") || "Unit Price"} *
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-2.5 text-gray-500">
                            <DollarSign size={18} />
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            readOnly
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                          />
                          <div className="absolute right-3 top-2.5 text-gray-500 text-xs">
                            (Auto)
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {t("costPriceAuto", "procurement") ||
                            "Cost price from product"}
                        </p>
                      </div>

                      {/* Tax Rate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("taxRate", "procurement") || "Tax Rate"} %
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-2.5 text-gray-500">
                            <Percent size={18} />
                          </div>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={item.taxRate}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "taxRate",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Item Summary */}
                    {item.product && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <p className="font-medium text-gray-800">
                              {item.product}
                            </p>
                            <div className="flex space-x-4 text-sm text-gray-600">
                              <span>
                                {t("quantity", "procurement") || "Qty"}:{" "}
                                {item.quantity}
                              </span>
                              <span>× {formatCurrency(item.unitPrice)}</span>
                              <span>
                                {t("taxRate", "procurement") || "Tax Rate"}:{" "}
                                {item.taxRate}%
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {t("subtotal", "procurement") || "Subtotal"}
                            </p>
                            <p className="font-bold text-lg text-blue-600">
                              {formatCurrency(item.subTotal || 0)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t("tax", "procurement") || "Tax"}:{" "}
                              {formatCurrency(item.taxAmount || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <FileText className="text-yellow-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("notes", "procurement") || "Notes"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("addAdditionalNotes", "procurement") ||
                      "Add any additional notes for this order"}
                  </p>
                </div>
              </div>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={
                  t("enterNotesHere", "procurement") ||
                  "Enter any special instructions or notes here..."
                }
              />
            </div>
          </div>

          {/* Right Column - Order Information */}
          <div className="space-y-6">
            {/* Supplier Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Building className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("supplierInformation", "procurement") ||
                      "Supplier Information"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("selectOrEnterSupplier", "procurement") ||
                      "Select or enter supplier details"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Supplier Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("selectSupplier", "procurement") || "Select Supplier"}{" "}
                      *
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate("/procurement/suppliers/add")}
                      className="text-sm text-dental-blue hover:text-blue-600 hover:underline flex items-center"
                    >
                      <Plus size={14} className="mr-1" />
                      {t("addSupplier", "procurement") || "Add Supplier"}
                    </button>
                  </div>

                  {loadingSuppliers ? (
                    <div className="text-center py-4 text-gray-500">
                      {t("loadingSuppliers", "procurement") ||
                        "Loading suppliers..."}
                    </div>
                  ) : suppliers.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      {t("noSuppliersFound", "procurement") ||
                        "No suppliers found"}
                      <button
                        type="button"
                        onClick={() => navigate("/procurement/suppliers/add")}
                        className="block mx-auto mt-2 px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        {t("addFirstSupplier", "procurement") ||
                          "Add First Supplier"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {suppliers.map((supplier) => (
                        <div
                          key={supplier.id}
                          onClick={() => selectSupplier(supplier)}
                          className={`p-3 border rounded-lg cursor-pointer transition ${
                            formData.supplier_id == supplier.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800">
                                {supplier.name}
                              </p>
                              {supplier.email && (
                                <p className="text-sm text-gray-600">
                                  {supplier.email}
                                </p>
                              )}
                              {supplier.phone && (
                                <p className="text-sm text-gray-600">
                                  {supplier.phone}
                                </p>
                              )}
                            </div>
                            {formData.supplier_id == supplier.id && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Supplier Info */}
                {formData.supplier_id && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      {t("selectedSupplier", "procurement") ||
                        "Selected Supplier"}
                    </h4>
                    <p className="text-sm text-gray-800">
                      {getSelectedSupplierName()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {t("supplierId", "procurement") || "Supplier ID"}:{" "}
                      {formData.supplier_id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CreditCard className="text-dental-blue" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("paymentDetails", "procurement") || "Payment Details"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("paymentMethodTerms", "procurement") ||
                      "Payment method and terms"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("paymentMethod", "procurement") || "Payment Method"} *
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Bank Transfer">
                      {t("bankTransfer", "procurement") || "Bank Transfer"}
                    </option>
                    <option value="Credit Card">
                      {t("creditCard", "procurement") || "Credit Card"}
                    </option>
                    <option value="Cash">
                      {t("cash", "procurement") || "Cash"}
                    </option>
                    <option value="Check">
                      {t("check", "procurement") || "Check"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("currency", "procurement") || "Currency"} *
                  </label>
                  <div className="relative">
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="SEK">SEK (kr)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                    <Globe
                      className="absolute right-6 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t("orderSummary", "procurement") || "Order Summary"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("totalAmount", "procurement") || "Total Amount"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-800">
                    {t("totalAmount", "procurement") || "Total Amount"}
                  </span>
                  <span className="text-xl font-bold text-gray-800">
                    {formatCurrency(totals.totalAmount)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full mt-6 py-3 rounded-lg font-medium transition flex items-center justify-center space-x-2 ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-dental-blue text-white hover:bg-blue-600"
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span>
                      {t("creatingOrder", "procurement") || "Creating Order..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>
                      {t("createPurchaseOrder", "procurement") ||
                        "Create Purchase Order"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPurchaseOrder;
