import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Percent,
  RotateCcw,
  Info,
  CheckCircle,
  PackageIcon,
  AlertCircle,
  RefreshCw,
  Hash,
  Lock,
  AlertTriangle,
  Ban,
} from "lucide-react";

const EditPurchaseOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // حالة البيانات الأصلية
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [orderLocked, setOrderLocked] = useState(false);

  // بيانات الطلب
  const [purchaseOrder, setPurchaseOrder] = useState({
    supplier_id: "",
    notes: "",
    payment_method: "Bank Transfer",
    currency: "USD",
  });

  // عناصر الطلب
  const [orderItems, setOrderItems] = useState([]);

  // المنتجات المتاحة
  const [products, setProducts] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loadingProducts, setLoadingProducts] = useState(false);

  // الموردون المتاحون
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // جلب بيانات الطلب الحالية
  useEffect(() => {
    fetchPurchaseOrderDetails();
    fetchProducts();
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // جلب بيانات الطلب
  const fetchPurchaseOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/supplierorders/${id}`);
      const orderData = response.data?.order;
      const relatedProducts = response.data?.related_products || [];

      if (!orderData) {
        throw new Error("Order data not found");
      }

      // ✅ التحقق من حالة الطلب
      const status = orderData.status?.toLowerCase() || "";
      setOrderStatus(status);

      // ✅ إذا كان الطلب confirmed أو delivered أو shipped - منع التعديل
      const lockedStatuses = ["confirmed", "delivered", "shipped", "completed"];
      const isLocked = lockedStatuses.includes(status);
      setOrderLocked(isLocked);

      // حفظ البيانات الأصلية
      const originalOrder = {
        supplier_id: orderData.supplier_id,
        notes: orderData.notes || "",
        payment_method: orderData.payment_method || "Bank Transfer",
        currency: orderData.currency || "USD",
      };

      const originalItems = relatedProducts.map((product) => ({
        id: product.id,
        product_id: product.id,
        product: product.name || product.s_name || `Product ${product.id}`,
        sku: product.sku || `SKU-${product.id}`,
        quantity: product.pivot?.quantity || 1,
        unit_cost_price: parseFloat(product.pivot?.unit_cost_price) || 0,
        tax_rate: parseFloat(product.pivot?.tax_rate) || 0,
        tax_amount: parseFloat(product.pivot?.tax_amount) || 0,
        subtotal: parseFloat(product.pivot?.subtotal) || 0,
        current_stock: product.stock_quantity || 0,
      }));

      setOriginalData({
        ...originalOrder,
        items: originalItems,
      });

      setPurchaseOrder(originalOrder);
      setOrderItems(originalItems);
    } catch (err) {
      console.error("Error fetching purchase order details:", err);
      setError(
        t("fetchOrderDetailsError", "procurement") ||
          "Failed to load purchase order details",
      );
    } finally {
      setLoading(false);
    }
  };

  // جلب المنتجات من API
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await api.get("/products");
      setProducts(response.data?.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // جلب الموردين من API
  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await api.get("/suppliers");
      setSuppliers(response.data?.data || []);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // تتبع التغييرات
  useEffect(() => {
    if (originalData) {
      const isChanged =
        JSON.stringify(purchaseOrder) !==
          JSON.stringify({
            supplier_id: originalData.supplier_id,
            notes: originalData.notes,
            payment_method: originalData.payment_method,
            currency: originalData.currency,
          }) ||
        JSON.stringify(
          orderItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_cost_price: item.unit_cost_price,
            tax_rate: item.tax_rate,
          })),
        ) !==
          JSON.stringify(
            originalData.items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_cost_price: item.unit_cost_price,
              tax_rate: item.tax_rate,
            })),
          );

      setHasChanges(isChanged);
    }
  }, [purchaseOrder, orderItems, originalData]);

  // معالجة تغيير بيانات الطلب
  const handleOrderChange = (field, value) => {
    if (orderLocked) return;
    setPurchaseOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // معالجة تغيير عنصر الطلب
  const handleItemChange = (index, field, value) => {
    if (orderLocked) return;

    const updatedItems = [...orderItems];

    if (field === "product_id") {
      const product = products.find((p) => p.id === parseInt(value));
      if (product) {
        updatedItems[index] = {
          ...updatedItems[index],
          product_id: product.id,
          product: product.name || product.s_name,
          sku: product.sku,
          unit_cost_price: parseFloat(product.cost) || 0,
          current_stock: product.stock_quantity || 0,
          [field]: parseInt(value),
        };
      }
    } else if (field === "quantity") {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: parseInt(value) || 1,
      };
    } else if (field === "tax_rate") {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: parseFloat(value) || 0,
      };
    }

    // إعادة حساب subtotal و tax_amount
    const item = updatedItems[index];
    const subtotal = item.quantity * item.unit_cost_price;
    const taxAmount = subtotal * (item.tax_rate / 100);
    updatedItems[index].subtotal = subtotal;
    updatedItems[index].tax_amount = taxAmount;

    setOrderItems(updatedItems);
  };

  // إضافة عنصر جديد
  const addOrderItem = () => {
    if (orderLocked) return;
    const newItem = {
      id: `new-${Date.now()}`,
      product_id: "",
      product: "",
      sku: "",
      quantity: 1,
      unit_cost_price: 0,
      tax_rate: 0,
      tax_amount: 0,
      subtotal: 0,
      current_stock: 0,
    };
    // ✅ العنصر الجديد يضاف في البداية
    setOrderItems([newItem, ...orderItems]);
  };
  // حذف عنصر
  const removeOrderItem = (index) => {
    if (orderLocked) return;
    if (orderItems.length > 1) {
      const updatedItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(updatedItems);
    }
  };

  // إعادة التعيين للبيانات الأصلية
  const resetForm = () => {
    if (orderLocked) return;
    if (originalData) {
      setPurchaseOrder({
        supplier_id: originalData.supplier_id,
        notes: originalData.notes,
        payment_method: originalData.payment_method,
        currency: originalData.currency,
      });
      setOrderItems(originalData.items);
    }
  };

  // حساب الإجماليات
  const calculateTotals = () => {
    const subtotal = orderItems.reduce(
      (sum, item) => sum + (item.subtotal || 0),
      0,
    );
    const taxAmount = orderItems.reduce(
      (sum, item) => sum + (item.tax_amount || 0),
      0,
    );
    const totalAmount = subtotal + taxAmount;

    return {
      subtotal,
      taxAmount,
      totalAmount,
      numberOfItems: orderItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  };

  const totals = calculateTotals();

  // تنسيق المبلغ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: purchaseOrder.currency || "USD",
    }).format(amount);
  };

  // حفظ التعديلات - كل الendpoints هي POST
  const handleSave = async (e) => {
    e.preventDefault();

    // ✅ التحقق من حالة الطلب
    if (orderLocked) {
      alert(
        t("orderCannotBeEdited", "procurement") ||
          "This order cannot be edited because it is already confirmed/delivered.",
      );
      return;
    }

    // التحقق من البيانات
    if (!purchaseOrder.supplier_id) {
      alert(t("supplierRequired", "procurement") || "Please select a supplier");
      return;
    }

    if (orderItems.some((item) => !item.product_id || item.quantity <= 0)) {
      alert(
        t("validItemsRequired", "procurement") ||
          "Please add valid items with quantities",
      );
      return;
    }

    setUpdating(true);

    try {
      // 1. تحديث رأس الطلب - POST
      const headerResponse = await api.post(
        `/updatesupplierorderheaders/${id}`,
        {
          supplier_id: purchaseOrder.supplier_id,
          notes: purchaseOrder.notes,
          payment_method: purchaseOrder.payment_method,
          currency: purchaseOrder.currency,
          subtotal: totals.subtotal,
          tax_amount: totals.taxAmount,
          total_amount: totals.totalAmount,
          number_of_items: totals.numberOfItems,
        },
      );

      // ✅ التحقق من استجابة الـ API
      if (
        headerResponse.data?.message?.includes("cannot be edited") ||
        headerResponse.data?.error
      ) {
        throw new Error(
          headerResponse.data.message ||
            headerResponse.data.error ||
            "Order cannot be edited",
        );
      }

      // 2. تحديث العناصر
      // أولا: حذف العناصر القديمة (إلا إذا كانت موجودة في الجديدة) - POST
      for (const originalItem of originalData.items) {
        const stillExists = orderItems.some(
          (item) =>
            item.product_id === originalItem.product_id &&
            !item.id?.toString().startsWith("new-"),
        );

        if (!stillExists) {
          const removeResponse = await api.post(
            `/removeitemfromsupplierorder/${id}`,
            {
              product_id: originalItem.product_id,
            },
          );

          // ✅ التحقق من استجابة الـ API
          if (
            removeResponse.data?.error ||
            removeResponse.data?.message?.includes("cannot")
          ) {
            throw new Error(
              removeResponse.data.message ||
                removeResponse.data.error ||
                "Cannot remove item",
            );
          }
        }
      }

      // ثانيا: إضافة/تحديث العناصر الجديدة - POST
      for (const item of orderItems) {
        if (item.id?.toString().startsWith("new-")) {
          // عنصر جديد
          const addResponse = await api.post(`/additemtosupplierorder/${id}`, {
            product_id: item.product_id,
            quantity: item.quantity,
            unit_cost_price: item.unit_cost_price,
            tax_rate: item.tax_rate,
          });

          // ✅ التحقق من استجابة الـ API
          if (
            addResponse.data?.error ||
            addResponse.data?.message?.includes("cannot")
          ) {
            throw new Error(
              addResponse.data.message ||
                addResponse.data.error ||
                "Cannot add item",
            );
          }
        } else {
          // تحديث عنصر موجود (حذف وإضافة جديد)
          const originalItem = originalData.items.find(
            (oi) => oi.product_id === item.product_id,
          );

          if (
            originalItem &&
            (originalItem.quantity !== item.quantity ||
              originalItem.unit_cost_price !== item.unit_cost_price ||
              originalItem.tax_rate !== item.tax_rate)
          ) {
            // حذف وإضافة جديد (للتحديث) - POST
            const removeResponse = await api.post(
              `/removeitemfromsupplierorder/${id}`,
              {
                product_id: item.product_id,
              },
            );

            // ✅ التحقق من استجابة الـ API
            if (
              removeResponse.data?.error ||
              removeResponse.data?.message?.includes("cannot")
            ) {
              throw new Error(
                removeResponse.data.message ||
                  removeResponse.data.error ||
                  "Cannot update item",
              );
            }

            const addResponse = await api.post(
              `/additemtosupplierorder/${id}`,
              {
                product_id: item.product_id,
                quantity: item.quantity,
                unit_cost_price: item.unit_cost_price,
                tax_rate: item.tax_rate,
              },
            );

            // ✅ التحقق من استجابة الـ API
            if (
              addResponse.data?.error ||
              addResponse.data?.message?.includes("cannot")
            ) {
              throw new Error(
                addResponse.data.message ||
                  addResponse.data.error ||
                  "Cannot update item",
              );
            }
          }
        }
      }

      setSuccess(true);

      // تحديث البيانات الأصلية
      const updatedOriginalData = {
        supplier_id: purchaseOrder.supplier_id,
        notes: purchaseOrder.notes,
        payment_method: purchaseOrder.payment_method,
        currency: purchaseOrder.currency,
        items: orderItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost_price: item.unit_cost_price,
          tax_rate: item.tax_rate,
          tax_amount: item.tax_amount,
          subtotal: item.subtotal,
        })),
      };

      setOriginalData(updatedOriginalData);
      setHasChanges(false);
    } catch (err) {
      console.error("Error updating purchase order:", err);

      // ✅ معالجة الأخطاء المختلفة
      let errorMessage =
        t("updateError", "procurement") || "Failed to update purchase order.";

      if (err.response?.data) {
        const apiError = err.response.data;
        if (
          apiError.message?.includes("cannot be edited") ||
          apiError.message?.includes("confirmed")
        ) {
          errorMessage =
            t("orderCannotBeEdited", "procurement") ||
            "This order cannot be edited because it is already confirmed/delivered.";
          setOrderLocked(true);
        } else if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.error) {
          errorMessage = apiError.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // إلغاء والعودة
  const handleCancel = () => {
    navigate("/procurement/purchase-orders");
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/procurement/purchase-orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("editPurchaseOrder", "procurement") || "Edit Purchase Order"}
          </h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {t("loadingOrderDetails", "procurement") ||
                "Loading order details..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/procurement/purchase-orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("editPurchaseOrder", "procurement") || "Edit Purchase Order"}
          </h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {t("errorLoadingOrder", "procurement") || "Error Loading Order"}
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/procurement/purchase-orders")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition mr-2"
          >
            {t("backToOrders", "procurement") || "Back to Orders"}
          </button>
          <button
            onClick={fetchPurchaseOrderDetails}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition"
          >
            <RefreshCw size={18} className="inline mr-2" />
            {t("tryAgain", "common") || "Try Again"}
          </button>
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
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("editPurchaseOrder", "procurement") || "Edit Purchase Order"}
            </h1>
            <div className="flex items-center space-x-4 mt-1 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Hash size={14} className="text-gray-400" />
                <p className="text-gray-600 font-medium">
                  {t("purchaseOrder", "procurement") || "PO"} #{id}
                </p>
              </div>
              <span className="text-gray-500">•</span>
              <p className="text-gray-600">
                {suppliers.find(
                  (s) => s.id === parseInt(purchaseOrder.supplier_id),
                )?.name || "Unknown Supplier"}
              </p>
              <span className="text-gray-500">•</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  orderLocked
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : "bg-green-100 text-green-800 border border-green-200"
                }`}
              >
                {orderLocked ? (
                  <>
                    <Ban size={14} className="inline mr-1" />
                    {orderStatus?.charAt(0).toUpperCase() +
                      orderStatus?.slice(1)}
                  </>
                ) : (
                  orderStatus?.charAt(0).toUpperCase() + orderStatus?.slice(1)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Locked Warning */}
      {orderLocked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-red-600" size={24} />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800">
                {t("orderLocked", "procurement") || "Order Locked"}
              </h4>
              <p className="text-red-700 text-sm">
                {t("orderLockedMessage", "procurement") ||
                  "This order cannot be edited because it has already been confirmed/delivered. You can only view the order details."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Change Indicator */}
      {hasChanges && !orderLocked && (
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
              {t("purchaseOrderUpdatedSuccess", "procurement") ||
                "Purchase Order Updated Successfully!"}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("purchaseOrderUpdatedSystem", "procurement") ||
                "The purchase order has been updated in your system."}
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => navigate("/procurement/purchase-orders")}
                className="px-6 py-3 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
              >
                {t("backToPurchaseOrders", "procurement") ||
                  "Back to Purchase Orders"}
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
              {/* Order Items Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <ShoppingCart className="text-dental-blue" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {t("orderedItems", "procurement") || "Ordered Items"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {orderItems.length}{" "}
                        {t("items", "procurement") || "items"}
                      </p>
                    </div>
                  </div>
                  {!orderLocked && (
                    <button
                      type="button"
                      onClick={addOrderItem}
                      className="px-4 py-2 bg-blue-50 text-dental-blue rounded-lg hover:bg-blue-100 transition flex items-center space-x-2"
                    >
                      <Plus size={20} />
                      <span>{t("addItem", "procurement") || "Add Item"}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div
                      key={item.id || index}
                      className={`border border-gray-200 rounded-lg p-4 ${
                        orderLocked ? "bg-gray-100" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-800">
                          {t("item", "procurement") || "Item"} #{index + 1}
                        </h4>
                        {orderItems.length > 1 && !orderLocked && (
                          <button
                            type="button"
                            onClick={() => removeOrderItem(index)}
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
                            {t("product", "procurement") || "Product"} *
                          </label>
                          <select
                            value={item.product_id}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "product_id",
                                e.target.value,
                              )
                            }
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              orderLocked
                                ? "bg-gray-200 cursor-not-allowed"
                                : ""
                            }`}
                            required
                            disabled={orderLocked}
                          >
                            <option value="">
                              {t("selectProduct", "procurement") ||
                                "Select Product"}
                            </option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name || product.s_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("quantity", "procurement") || "Quantity"} *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value,
                              )
                            }
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              orderLocked
                                ? "bg-gray-200 cursor-not-allowed"
                                : ""
                            }`}
                            required
                            disabled={orderLocked}
                          />
                        </div>

                        {/* Unit Cost - غير قابل للتعديل */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("unitCost", "procurement") || "Unit Cost"} *
                            <span className="ml-1 text-xs text-gray-500">
                              (Auto)
                            </span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-2.5 text-gray-500">
                              <DollarSign size={18} />
                            </div>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_cost_price}
                              readOnly
                              className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg ${
                                orderLocked ? "bg-gray-200" : "bg-gray-100"
                              } cursor-not-allowed`}
                            />
                            <div className="absolute right-3 top-2.5 text-gray-400">
                              <Lock size={18} />
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
                              value={item.tax_rate}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "tax_rate",
                                  e.target.value,
                                )
                              }
                              className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                orderLocked
                                  ? "bg-gray-200 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={orderLocked}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Item Summary */}
                      {item.product && (
                        <div
                          className={`mt-4 p-3 rounded-lg border ${
                            orderLocked
                              ? "bg-gray-100 border-gray-300"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-800">
                                {item.product}
                              </p>
                              <div className="flex space-x-4 text-sm text-gray-600 flex-wrap gap-2">
                                <span className="bg-blue-50 px-2 py-1 rounded">
                                  {t("sku", "procurement") || "SKU"}: {item.sku}
                                </span>
                                <span>
                                  {t("quantity", "procurement") || "Qty"}:{" "}
                                  {item.quantity}
                                </span>
                                <span>
                                  {t("stock", "procurement") || "Stock"}:{" "}
                                  {item.current_stock}
                                </span>
                                <span>
                                  {t("taxRate", "procurement") || "Tax Rate"}:{" "}
                                  {item.tax_rate}%
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {t("subtotal", "procurement") || "Subtotal"}
                              </p>
                              <p className="font-bold text-lg text-blue-600">
                                {formatCurrency(item.subtotal || 0)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {t("tax", "procurement") || "Tax"}:{" "}
                                {formatCurrency(item.tax_amount || 0)}
                              </p>
                              <p className="text-xs text-gray-400">
                                {t("unitCost", "procurement") || "Unit Cost"}:{" "}
                                {formatCurrency(item.unit_cost_price || 0)}
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
                      {t("updateOrderNotes", "procurement") ||
                        "Update order notes and instructions"}
                    </p>
                  </div>
                </div>
                <textarea
                  value={purchaseOrder.notes}
                  onChange={(e) => handleOrderChange("notes", e.target.value)}
                  rows="4"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    orderLocked ? "bg-gray-200 cursor-not-allowed" : ""
                  }`}
                  placeholder={
                    orderLocked
                      ? t("orderLockedCannotEdit", "procurement") ||
                        "Order is locked and cannot be edited"
                      : t("enterNotesHere", "procurement") ||
                        "Enter any special instructions or notes here..."
                  }
                  disabled={orderLocked}
                />
              </div>

              {/* Action Buttons */}
              {!orderLocked && (
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
                    disabled={updating || !hasChanges}
                    className={`
                      px-6 py-2 rounded-lg font-medium transition flex items-center justify-center
                      ${
                        updating || !hasChanges
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
                        <span>
                          {t("updatePurchaseOrder", "procurement") ||
                            "Update Purchase Order"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Right Column - Supplier & Payment */}
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
                    {t("updateSupplierDetails", "procurement") ||
                      "Update supplier details"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("selectSupplier", "procurement") || "Select Supplier"} *
                  </label>
                  <select
                    value={purchaseOrder.supplier_id}
                    onChange={(e) =>
                      handleOrderChange("supplier_id", e.target.value)
                    }
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      orderLocked ? "bg-gray-200 cursor-not-allowed" : ""
                    }`}
                    required
                    disabled={orderLocked || loadingSuppliers}
                  >
                    <option value="">
                      {t("selectSupplier", "procurement") || "Select Supplier"}
                    </option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {loadingSuppliers && (
                    <p className="text-sm text-gray-500 mt-2">
                      {t("loadingSuppliers", "procurement") ||
                        "Loading suppliers..."}
                    </p>
                  )}
                </div>

                {/* Selected Supplier Info */}
                {purchaseOrder.supplier_id && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">
                      {t("selectedSupplier", "procurement") ||
                        "Selected Supplier"}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {t("supplierId", "procurement") || "Supplier ID"}:
                        </span>
                        <span className="font-medium">
                          {purchaseOrder.supplier_id}
                        </span>
                      </div>
                      {suppliers.find(
                        (s) => s.id === parseInt(purchaseOrder.supplier_id),
                      )?.email && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {t("email", "procurement") || "Email"}:
                          </span>
                          <span className="font-medium">
                            {
                              suppliers.find(
                                (s) =>
                                  s.id === parseInt(purchaseOrder.supplier_id),
                              )?.email
                            }
                          </span>
                        </div>
                      )}
                      {suppliers.find(
                        (s) => s.id === parseInt(purchaseOrder.supplier_id),
                      )?.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {t("phone", "procurement") || "Phone"}:
                          </span>
                          <span className="font-medium">
                            {
                              suppliers.find(
                                (s) =>
                                  s.id === parseInt(purchaseOrder.supplier_id),
                              )?.phone
                            }
                          </span>
                        </div>
                      )}
                    </div>
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
                    {t("updatePaymentDetails", "procurement") ||
                      "Update payment method and terms"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("paymentMethod", "procurement") || "Payment Method"} *
                  </label>
                  <select
                    value={purchaseOrder.payment_method}
                    onChange={(e) =>
                      handleOrderChange("payment_method", e.target.value)
                    }
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      orderLocked ? "bg-gray-200 cursor-not-allowed" : ""
                    }`}
                    required
                    disabled={orderLocked}
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
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("currency", "procurement") || "Currency"} *
                  </label>
                  <select
                    value={purchaseOrder.currency}
                    onChange={(e) =>
                      handleOrderChange("currency", e.target.value)
                    }
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      orderLocked ? "bg-gray-200 cursor-not-allowed" : ""
                    }`}
                    required
                    disabled={orderLocked}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
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
                    {t("updatedTotals", "procurement") ||
                      "Updated totals based on changes"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-3">
                  <p className="text-gray-700">
                    {t("subtotal", "procurement") || "Subtotal"}
                  </p>
                  <p className="font-medium text-gray-800">
                    {formatCurrency(totals.subtotal)}
                  </p>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-gray-200">
                  <p className="text-gray-700">
                    {t("taxAmount", "procurement") || "Tax Amount"}
                  </p>
                  <p className="font-medium text-red-600">
                    {formatCurrency(totals.taxAmount)}
                  </p>
                </div>

                <div className="flex justify-between items-center py-4 border-t border-gray-200 font-bold">
                  <div>
                    <p className="text-lg text-gray-800">
                      {t("totalAmount", "procurement") || "Total Amount"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("currency", "procurement") || "Currency"}:{" "}
                      {purchaseOrder.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl text-gray-800">
                      {formatCurrency(totals.totalAmount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("grandTotal", "procurement") || "Grand Total"}
                    </p>
                  </div>
                </div>
              </div>

              {!orderLocked && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <Info size={16} />
                    <span>
                      {t("changesWillUpdate", "procurement") ||
                        "Changes will update the total amount automatically"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPurchaseOrder;
