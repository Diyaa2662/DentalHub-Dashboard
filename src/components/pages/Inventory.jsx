import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
} from "devextreme-react/data-grid";
import {
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Plus,
  ArrowUp,
  ArrowDown,
  ShoppingCart,
  Truck,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Hash,
  FileText,
  Box,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";

const Inventory = () => {
  const { t } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [updatingProductId, setUpdatingProductId] = useState(null);
  const [newStockQuantity, setNewStockQuantity] = useState("");

  // بيانات وهمية لحركة المستودع
  const inventoryData = [
    {
      id: 1,
      product: "Advanced Dental Chair",
      quantity: 2,
      relatedProducts: ["Dental Stool", "X-Ray Unit"],
      type: "in",
      return: false,
      inStock: 14,
      date: "2024-01-15",
      reference: "REC-001",
      notes: "New stock from supplier",
    },
    {
      id: 2,
      product: "Portable X-Ray Unit",
      quantity: 1,
      relatedProducts: ["Protective Apron", "Film Processor"],
      type: "out",
      return: false,
      inStock: 7,
      date: "2024-01-14",
      reference: "ORD-1002",
      notes: "Order fulfillment for Dr. Chen",
    },
    {
      id: 3,
      product: "Surgical Instrument Set",
      quantity: 3,
      relatedProducts: ["Sterilization Kit", "Surgical Gloves"],
      type: "out",
      return: true,
      inStock: 28,
      date: "2024-01-14",
      reference: "RET-001",
      notes: "Customer return - defective item",
    },
    {
      id: 4,
      product: "Digital Impressions Scanner",
      quantity: 2,
      relatedProducts: ["Scanner Tips", "Software License"],
      type: "in",
      return: false,
      inStock: 7,
      date: "2024-01-13",
      reference: "REC-002",
      notes: "Restock from manufacturer",
    },
    {
      id: 5,
      product: "Autoclave Sterilizer",
      quantity: 1,
      relatedProducts: ["Sterilization Pouches", "Indicators"],
      type: "in",
      return: false,
      inStock: 16,
      date: "2024-01-12",
      reference: "REC-003",
      notes: "New inventory",
    },
    {
      id: 6,
      product: "Composite Resin Kit",
      quantity: 5,
      relatedProducts: ["Bonding Agent", "Curing Light"],
      type: "out",
      return: false,
      inStock: 37,
      date: "2024-01-12",
      reference: "ORD-1005",
      notes: "Bulk order for dental clinic",
    },
    {
      id: 7,
      product: "Dental Loupes 3.5x",
      quantity: 2,
      relatedProducts: ["LED Headlight", "Carrying Case"],
      type: "in",
      return: true,
      inStock: 2,
      date: "2024-01-11",
      reference: "RET-002",
      notes: "Returned from demo unit",
    },
    {
      id: 8,
      product: "Ultrasonic Scaler",
      quantity: 1,
      relatedProducts: ["Scaler Tips", "Water Lines"],
      type: "out",
      return: false,
      inStock: 6,
      date: "2024-01-11",
      reference: "ORD-1006",
      notes: "Sold to private practice",
    },
  ];

  // منتجات فريدة للفلتر
  const products = [...new Set(inventoryData.map((item) => item.product))];

  // فلترة البيانات
  const filteredData = inventoryData.filter((item) => {
    const matchesProduct =
      selectedProduct === "all" || item.product === selectedProduct;
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesProduct && matchesType;
  });

  // إحصائيات
  const stats = {
    totalMovements: filteredData.length,
    incomingStock: filteredData.filter((item) => item.type === "in").length,
    outgoingStock: filteredData.filter((item) => item.type === "out").length,
    returns: filteredData.filter((item) => item.return === true).length,
  };

  // معالجة تحديث المخزون
  const handleUpdateStock = (productId, currentStock) => {
    setUpdatingProductId(productId);
    setNewStockQuantity(currentStock.toString());
  };

  const handleConfirmUpdate = () => {
    if (!newStockQuantity || isNaN(newStockQuantity)) {
      alert("Please enter a valid number");
      return;
    }

    // محاكاة تحديث API
    const product = inventoryData.find((item) => item.id === updatingProductId);
    if (product) {
      alert(
        `${t("updateSuccess", "inventory")}: ${
          product.product
        } → ${newStockQuantity} units`
      );
    }

    setUpdatingProductId(null);
    setNewStockQuantity("");
  };

  const handleCancelUpdate = () => {
    setUpdatingProductId(null);
    setNewStockQuantity("");
  };

  const handleAddMovement = () => {
    alert(t("addMovement", "inventory") || "Add new movement functionality");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("inventoryManagement", "inventory")}
          </h1>
          <p className="text-gray-600">{t("warehouseMovement", "inventory")}</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleAddMovement}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t("addMovement", "inventory")}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalMovements", "inventory")}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalMovements}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="text-dental-blue" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("incomingStock", "inventory")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.incomingStock}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="text-green-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("outgoingStock", "inventory")}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.outgoingStock}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <TrendingDown className="text-red-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("returns", "inventory")}
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.returns}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <RotateCcw className="text-yellow-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {t("productMovements", "inventory")}
          </h3>

          <div className="flex space-x-3 mt-4 md:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="today">{t("today", "inventory")}</option>
              <option value="thisWeek">{t("thisWeek", "inventory")}</option>
              <option value="thisMonth">{t("thisMonth", "inventory")}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("filterByProduct", "inventory")}
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">{t("allProducts", "inventory")}</option>
              {products.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("filterByType", "inventory")}
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">{t("allTypes", "inventory")}</option>
              <option value="in">{t("typeIn", "inventory")} (Incoming)</option>
              <option value="out">
                {t("typeOut", "inventory")} (Outgoing)
              </option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <DataGrid
            dataSource={filteredData}
            showBorders={true}
            columnAutoWidth={true}
            height={500}
          >
            <SearchPanel
              visible={true}
              placeholder={t("searchMovements", "inventory")}
            />
            <Paging defaultPageSize={10} />
            <Pager
              showPageSizeSelector={true}
              allowedPageSizes={[5, 10, 20]}
              showInfo={true}
            />

            {/* Product */}
            <Column
              dataField="product"
              caption={t("product", "inventory")}
              width={200}
            />

            {/* Quantity */}
            <Column
              dataField="quantity"
              caption={t("quantity", "inventory")}
              width={100}
              cellRender={({ data }) => (
                <div className="flex items-center">
                  <span
                    className={`font-bold ${
                      data.type === "in" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {data.type === "in" ? "+" : "-"}
                    {data.quantity}
                  </span>
                  <span className="ml-2 text-gray-500 text-sm">units</span>
                </div>
              )}
            />

            {/* Related Products */}
            <Column
              dataField="relatedProducts"
              caption={t("relatedProducts", "inventory")}
              cellRender={({ data }) => (
                <div className="flex flex-wrap gap-1">
                  {data.relatedProducts.map((product, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              )}
            />

            {/* Type */}
            <Column
              dataField="type"
              caption={t("movementType", "inventory")}
              width={120}
              cellRender={({ data }) => (
                <div
                  className={`flex items-center px-6 py-1 rounded-full text-xs font-medium ${
                    data.type === "in"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {data.type === "in" ? (
                    <>
                      <ArrowUp size={12} className="mr-1" />
                      {t("typeIn", "inventory")}
                    </>
                  ) : (
                    <>
                      <ArrowDown size={12} className="mr-1" />
                      {t("typeOut", "inventory")}
                    </>
                  )}
                </div>
              )}
            />

            {/* Return */}
            <Column
              dataField="return"
              caption={t("returnStatus", "inventory")}
              width={100}
              cellRender={({ data }) => (
                <div
                  className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    data.return
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {data.return ? (
                    <>
                      <RotateCcw size={12} className="mr-1" />
                      {t("yes", "common")}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={12} className="mr-1" />
                      {t("no", "common")}
                    </>
                  )}
                </div>
              )}
            />

            {/* In Stock */}
            <Column
              dataField="inStock"
              caption={t("inStock", "inventory")}
              width={120}
              cellRender={({ data }) => (
                <div className="flex items-center justify-between">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      data.inStock > 10
                        ? "bg-green-100 text-green-800"
                        : data.inStock > 5
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {data.inStock} units
                  </div>

                  {/* زر التحديث */}
                  <button
                    onClick={() => handleUpdateStock(data.id, data.inStock)}
                    className="ml-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                    title={t("updateStock", "inventory")}
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              )}
            />

            {/* Date */}
            <Column
              dataField="date"
              caption={t("movementDate", "inventory")}
              width={120}
            />

            {/* Actions */}
            {/* <Column
              caption="Actions"
              width={100}
              // eslint-disable-next-line no-unused-vars
              cellRender={({ data }) => (
                <div className="flex space-x-2">
                  <button
                    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition"
                    title="View Details"
                  >
                    <FileText size={14} />
                  </button>
                </div>
              )}
            /> */}
          </DataGrid>
        </div>
      </div>

      {/* Update Stock Modal */}
      {updatingProductId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("updateQuantity", "inventory")}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("newStockQuantity", "inventory")}
                </label>
                <input
                  type="number"
                  value={newStockQuantity}
                  onChange={(e) => setNewStockQuantity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  placeholder="Enter new quantity"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelUpdate}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  className="px-4 py-2 bg-dental-blue text-white rounded-lg hover:bg-blue-600 transition"
                >
                  {t("confirmUpdate", "inventory")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Movements & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Movements */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t("recentMovements", "inventory")}
              </h3>
              <p className="text-sm text-gray-600">
                Latest warehouse transactions
              </p>
            </div>
            <Calendar className="text-dental-teal" size={24} />
          </div>

          <div className="space-y-4">
            {filteredData.slice(0, 5).map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      movement.type === "in" ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    {movement.type === "in" ? (
                      <ArrowUp className="text-green-500" size={20} />
                    ) : (
                      <ArrowDown className="text-red-500" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {movement.product}
                    </p>
                    <p className="text-sm text-gray-600">
                      {movement.quantity} units • {movement.reference}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{movement.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t("lowStockAlert", "inventory")}
              </h3>
              <p className="text-sm text-gray-600">
                Products requiring attention
              </p>
            </div>
            <AlertTriangle className="text-yellow-500" size={24} />
          </div>

          <div className="space-y-4">
            {inventoryData
              .filter((item) => item.inStock <= 5)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="text-red-500" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.product}
                      </p>
                      <p className="text-sm text-gray-600">
                        Current stock:{" "}
                        <span className="font-bold text-red-600">
                          {item.inStock} units
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateStock(item.id, item.inStock)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                  >
                    Reorder
                  </button>
                </div>
              ))}

            {inventoryData.filter((item) => item.inStock <= 5).length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto text-green-500" size={48} />
                <p className="mt-4 text-gray-600">
                  All products have sufficient stock levels
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
