import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
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
  RotateCcw,
  Info,
  Calendar,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Tag,
} from "lucide-react";

const EditPurchaseOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showProductSuggestions, setShowProductSuggestions] = useState({});

  // حالة البيانات الأصلية للمقارنة
  const [originalData, setOriginalData] = useState(null);

  // حالة بيانات طلب الشراء للتعديل
  const [formData, setFormData] = useState({
    supplierName: "",
    supplierEmail: "",
    supplierPhone: "",
    notes: "",
    paymentMethod: "credit_card",
    paymentTerms: "Net 30",
  });

  // حالة عناصر الطلب
  const [orderItems, setOrderItems] = useState([
    {
      id: 1,
      product: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 15,
    },
  ]);

  // حالة PO Number (غير قابل للتعديل)
  const [poNumber, setPoNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // قائمة الموردين
  const [suppliers] = useState([
    {
      id: 1,
      name: "Dental Equipment Co.",
      email: "contact@dentalequip.com",
      phone: "+1-555-123-4567",
    },
    {
      id: 2,
      name: "MediDental Supplies",
      email: "sales@medidental.com",
      phone: "+1-555-987-6543",
    },
    {
      id: 3,
      name: "DentalTech Solutions",
      email: "info@dentaltech.com",
      phone: "+1-555-456-7890",
    },
    {
      id: 4,
      name: "Oral Care Distributors",
      email: "orders@oralcare.com",
      phone: "+1-555-321-0987",
    },
  ]);

  // قائمة المنتجات
  const [products] = useState([
    { id: 1, name: "Advanced Dental Chair", price: 4500, stock: 12 },
    { id: 2, name: "Dental X-Ray Unit", price: 3200, stock: 8 },
    { id: 3, name: "Sterilization Equipment", price: 950, stock: 15 },
    { id: 4, name: "Dental Handpiece", price: 350, stock: 25 },
    { id: 5, name: "Dental Composite", price: 85, stock: 50 },
    { id: 6, name: "Dental Anesthesia Kit", price: 120, stock: 30 },
  ]);

  // ✅ محاكاة جلب بيانات طلب الشراء من API
  useEffect(() => {
    const fetchPurchaseOrder = () => {
      setLoading(true);

      // بيانات وهمية لطلب الشراء (بديل لـ API)
      setTimeout(() => {
        const mockPurchaseOrder = {
          id: parseInt(id),
          poNumber: "PO-2024-001",
          supplierName: "Dental Equipment Co.",
          supplierEmail: "john@dentalequip.com",
          supplierPhone: "+1-555-123-4567",
          notes: "Urgent order for new clinic setup",
          paymentMethod: "credit_card",
          paymentTerms: "Net 30",
          orderStatus: "pending",
          paymentStatus: "pending",
          items: [
            {
              id: 1,
              product: "Advanced Dental Chair",
              quantity: 1,
              unitPrice: 4500,
              taxRate: 15,
              subTotal: 4500,
              taxAmount: 675,
            },
            {
              id: 2,
              product: "Dental X-Ray Unit",
              quantity: 1,
              unitPrice: 3200,
              taxRate: 15,
              subTotal: 3200,
              taxAmount: 480,
            },
          ],
        };

        setOriginalData(mockPurchaseOrder);
        setFormData({
          supplierName: mockPurchaseOrder.supplierName,
          supplierEmail: mockPurchaseOrder.supplierEmail,
          supplierPhone: mockPurchaseOrder.supplierPhone,
          notes: mockPurchaseOrder.notes,
          paymentMethod: mockPurchaseOrder.paymentMethod,
          paymentTerms: mockPurchaseOrder.paymentTerms,
        });
        setOrderItems(mockPurchaseOrder.items);
        setPoNumber(mockPurchaseOrder.poNumber);
        setLoading(false);
      }, 800);
    };

    fetchPurchaseOrder();
  }, [id]);

  // ✅ تتبع التغييرات لمقارنة مع البيانات الأصلية
  useEffect(() => {
    if (originalData) {
      // eslint-disable-next-line no-unused-vars
      const currentData = {
        ...formData,
        items: orderItems,
      };

      // مقارنة باستبعاد الحقول المحسوبة (subTotal, taxAmount)
      const isChanged =
        JSON.stringify({
          ...formData,
          items: orderItems.map((item) => ({
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
          })),
        }) !==
        JSON.stringify({
          supplierName: originalData.supplierName,
          supplierEmail: originalData.supplierEmail,
          supplierPhone: originalData.supplierPhone,
          notes: originalData.notes,
          paymentMethod: originalData.paymentMethod,
          paymentTerms: originalData.paymentTerms,
          items: originalData.items.map((item) => ({
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
          })),
        });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasChanges(isChanged);
    }
  }, [formData, orderItems, originalData]);

  // معالجة تغيير الحقول النصية
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // معالجة تغيير عنصر الطلب (مع taxRate)
  const handleItemChange = (id, field, value) => {
    setOrderItems(
      orderItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // حساب Subtotal و Tax
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
      })
    );

    // ✅ إذا كان التغيير في حقل المنتج، افتح القائمة
    if (field === "product" && value) {
      setShowProductSuggestions((prev) => ({
        ...prev,
        [id]: true,
      }));
    } else if (field === "product" && !value) {
      // ✅ إذا تم مسح المنتج، أغلق القائمة
      setShowProductSuggestions((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  // إضافة عنصر جديد للطلب
  const addOrderItem = () => {
    const newId =
      orderItems.length > 0
        ? Math.max(...orderItems.map((item) => item.id)) + 1
        : 1;
    setOrderItems([
      ...orderItems,
      {
        id: newId,
        product: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 15, // القيمة الافتراضية
        subTotal: 0,
        taxAmount: 0,
      },
    ]);

    // ✅ إغلاق القائمة للعنصر الجديد
    setShowProductSuggestions((prev) => ({
      ...prev,
      [newId]: false,
    }));
  };

  // حذف عنصر من الطلب
  const removeOrderItem = (id) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((item) => item.id !== id));
    }
  };

  // اختيار مورد من القائمة
  const selectSupplier = (supplier) => {
    setFormData({
      ...formData,
      supplierName: supplier.name,
      supplierEmail: supplier.email,
      supplierPhone: supplier.phone,
    });
  };

  // ✅ دالة اختيار منتج مع إغلاق القائمة
  const selectProduct = (itemId, product) => {
    setOrderItems(
      orderItems.map((item) => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            product: product.name,
            unitPrice: product.price,
          };

          // إعادة الحساب
          const subtotal = updatedItem.quantity * updatedItem.unitPrice;
          const taxAmount = subtotal * (updatedItem.taxRate / 100);
          updatedItem.subTotal = subtotal;
          updatedItem.taxAmount = taxAmount;

          return updatedItem;
        }
        return item;
      })
    );

    // ✅ إغلاق قائمة المنتجات لهذا العنصر
    setShowProductSuggestions((prev) => ({
      ...prev,
      [itemId]: false,
    }));
  };

  // ✅ إعادة تعيين النموذج للبيانات الأصلية
  const resetForm = () => {
    if (originalData) {
      setFormData({
        supplierName: originalData.supplierName,
        supplierEmail: originalData.supplierEmail,
        supplierPhone: originalData.supplierPhone,
        notes: originalData.notes,
        paymentMethod: originalData.paymentMethod,
        paymentTerms: originalData.paymentTerms,
      });
      setOrderItems(originalData.items);
    }
  };

  // حساب الإجماليات
  const calculateTotals = () => {
    const subtotal = orderItems.reduce(
      (sum, item) => sum + (item.subTotal || 0),
      0
    );
    const tax = orderItems.reduce(
      (sum, item) => sum + (item.taxAmount || 0),
      0
    );
    const totalAmount = subtotal + tax;

    return {
      subtotal,
      tax,
      totalAmount,
    };
  };

  const totals = calculateTotals();

  // تنسيق المبلغ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // ✅ حفظ التعديلات
  const handleSave = (e) => {
    e.preventDefault();

    // التحقق من البيانات المطلوبة
    if (!formData.supplierName) {
      alert(
        t("supplierNameRequired", "procurement") || "Supplier name is required"
      );
      return;
    }

    if (orderItems.some((item) => !item.product || item.unitPrice <= 0)) {
      alert(
        t("validItemsRequired", "procurement") ||
          "Please add valid items with prices"
      );
      return;
    }

    setUpdating(true);

    // محاكاة إرسال البيانات إلى الخادم للتحديث
    setTimeout(() => {
      const updatedPurchaseOrder = {
        ...formData,
        items: orderItems.map((item) => ({
          ...item,
          currentStock:
            products.find((p) => p.name === item.product)?.stock || 0,
          image: `https://images.unsplash.com/photo-${Math.floor(
            Math.random() * 1000
          )}?w=400&auto=format&fit=crop`,
        })),
        ...totals,
        poNumber: poNumber,
        orderStatus: "pending",
        paymentStatus: "pending",
      };

      console.log("Updated Purchase Order:", updatedPurchaseOrder);
      setUpdating(false);
      setSuccess(true);

      // تحديث البيانات الأصلية بعد التعديل الناجح
      setOriginalData(updatedPurchaseOrder);
      setHasChanges(false);
    }, 1500);
  };

  // ✅ إلغاء والعودة
  const handleCancel = () => {
    navigate("/procurement/purchase-orders");
  };

  // ✅ الذهاب لصفحة التفاصيل
  const goToDetails = () => {
    navigate(`/procurement/purchase-orders/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue"></div>
        <span className="ml-4 text-gray-600">
          Loading purchase order data...
        </span>
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
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-gray-600">
                {t("editingPurchaseOrder", "procurement") || "Editing"}{" "}
                {poNumber} • {formData.supplierName}
              </p>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                ID: {id}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={goToDetails}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition flex items-center space-x-2"
          >
            <Info size={18} />
            <span>{t("viewDetails", "procurement") || "View Details"}</span>
          </button>
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
              {t("purchaseOrderUpdatedSuccess", "procurement") ||
                "Purchase Order Updated Successfully!"}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("purchaseOrderUpdatedSystem", "procurement") ||
                "The purchase order has been updated in your system."}
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={goToDetails}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                {t("viewUpdatedOrder", "procurement") || "View Updated Order"}
              </button>
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
              {/* Purchase Order Info Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Tag className="text-blue-500" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {t("purchaseOrderInformation", "procurement") ||
                          "Purchase Order Information"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t("basicOrderDetails", "procurement") ||
                          "Basic order details"}
                      </p>
                    </div>
                  </div>

                  {/* PO Number Display (غير قابل للتعديل) */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {t("purchaseOrderNumber", "procurement") || "PO Number:"}
                    </span>
                    <div className="flex items-center px-3 py-1 bg-gray-100 rounded-lg">
                      <Tag size={16} className="text-gray-500 mr-2" />
                      <span className="font-bold text-gray-800">
                        {poNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Order Status:</span>
                      <span className="ml-2 font-medium text-yellow-600">
                        Pending
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Status:</span>
                      <span className="ml-2 font-medium text-yellow-600">
                        Pending
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created On:</span>
                      <span className="ml-2 font-medium">2024-01-15</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="ml-2 font-medium">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
                        {t("updateOrderItems", "procurement") ||
                          "Update order items and quantities"}
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
                                  e.target.value
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
                              <ChevronDown
                                size={20}
                                className="text-gray-400"
                              />
                            </div>
                          </div>

                          {/* Product Suggestions - تظهر فقط إذا كانت الحالة true */}
                          {showProductSuggestions[item.id] && item.product && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {products
                                .filter((p) =>
                                  p.name
                                    .toLowerCase()
                                    .includes(item.product.toLowerCase())
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
                                        {formatCurrency(product.price)}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      <span>
                                        {t("stock", "procurement") || "Stock"}:{" "}
                                        {product.stock}
                                      </span>
                                    </div>
                                  </div>
                                ))}
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
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        {/* Unit Price */}
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
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
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
                                  parseFloat(e.target.value) || 0
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
                      {t("updateOrderNotes", "procurement") ||
                        "Update order notes and instructions"}
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
                    updating || !formData.supplierName.trim() || !hasChanges
                  }
                  className={`
                    px-6 py-2 rounded-lg font-medium transition flex items-center justify-center
                    ${
                      updating || !formData.supplierName.trim() || !hasChanges
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
                {/* Supplier Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("selectSupplier", "procurement") || "Select Supplier"} *
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {suppliers.map((supplier) => (
                      <div
                        key={supplier.id}
                        onClick={() => selectSupplier(supplier)}
                        className={`p-3 border rounded-lg cursor-pointer transition ${
                          formData.supplierName === supplier.name
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">
                              {supplier.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {supplier.email}
                            </p>
                          </div>
                          {formData.supplierName === supplier.name && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manual Supplier Input */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-3">
                    {t("orEnterManually", "procurement") || "Or Enter Manually"}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("supplierName", "procurement") || "Supplier Name"} *
                      </label>
                      <input
                        type="text"
                        name="supplierName"
                        value={formData.supplierName}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("email", "procurement") || "Email"}
                        </label>
                        <input
                          type="email"
                          name="supplierEmail"
                          value={formData.supplierEmail}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("phone", "procurement") || "Phone"}
                        </label>
                        <input
                          type="tel"
                          name="supplierPhone"
                          value={formData.supplierPhone}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
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
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="credit_card">
                      {t("creditCard", "procurement") || "Credit Card"}
                    </option>
                    <option value="bank_transfer">
                      {t("bankTransfer", "procurement") || "Bank Transfer"}
                    </option>
                    <option value="cash">
                      {t("cash", "procurement") || "Cash"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("paymentTerms", "procurement") || "Payment Terms"} *
                  </label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
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
                <div className="flex justify-between items-center py-4 border-t border-gray-200">
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {t("totalAmount", "procurement") || "Total Amount"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("includesTaxes", "procurement") ||
                        "Includes all taxes"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">
                      {formatCurrency(totals.totalAmount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("grandTotal", "procurement") || "Grand Total"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <Info size={16} />
                  <span>
                    {t("changesWillUpdate", "procurement") ||
                      "Changes will update the total amount automatically"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPurchaseOrder;
