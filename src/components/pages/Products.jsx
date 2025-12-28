import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
  GroupPanel,
  HeaderFilter,
} from "devextreme-react/data-grid";
import {
  Plus,
  Download,
  Edit,
  Trash2,
  Eye,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Tag,
  Star,
} from "lucide-react";

const Products = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Mock data for products مع الحقول الجديدة
  const productsData = [
    {
      id: 1,
      name: "Advanced Dental Chair",
      category: "Equipment",
      price: "$4,500",
      discount: "10%",
      priceAfterDiscount: "$4,050",
      stock: 12,
      status: "In Stock",
      sales: 45,
      unit: "piece",
      taxRate: "15%",
    },
    {
      id: 2,
      name: "Portable X-Ray Unit",
      category: "Imaging",
      price: "$2,800",
      discount: "0%",
      priceAfterDiscount: "$2,800",
      stock: 8,
      status: "Low Stock",
      sales: 32,
      unit: "set",
      taxRate: "15%",
    },
    {
      id: 3,
      name: "Surgical Instrument Set",
      category: "Surgical",
      price: "$1,200",
      discount: "15%",
      priceAfterDiscount: "$1,020",
      stock: 25,
      status: "In Stock",
      sales: 78,
      unit: "kit",
      taxRate: "10%",
    },
    {
      id: 4,
      name: "Digital Impressions Scanner",
      category: "Digital",
      price: "$3,500",
      discount: "5%",
      priceAfterDiscount: "$3,325",
      stock: 5,
      status: "Low Stock",
      sales: 18,
      unit: "piece",
      taxRate: "20%",
    },
    {
      id: 5,
      name: "Autoclave Sterilizer",
      category: "Sterilization",
      price: "$950",
      discount: "0%",
      priceAfterDiscount: "$950",
      stock: 15,
      status: "In Stock",
      sales: 56,
      unit: "box",
      taxRate: "15%",
    },
    {
      id: 6,
      name: "Composite Resin Kit",
      category: "Restorative",
      price: "$280",
      discount: "20%",
      priceAfterDiscount: "$224",
      stock: 42,
      status: "In Stock",
      sales: 120,
      unit: "pack",
      taxRate: "10%",
    },
    {
      id: 7,
      name: "Dental Loupes 3.5x",
      category: "Magnification",
      price: "$650",
      discount: "12%",
      priceAfterDiscount: "$572",
      stock: 0,
      status: "Out of Stock",
      sales: 23,
      unit: "piece",
      taxRate: "15%",
    },
    {
      id: 8,
      name: "Ultrasonic Scaler",
      category: "Hygiene",
      price: "$1,800",
      discount: "0%",
      priceAfterDiscount: "$1,800",
      stock: 7,
      status: "Low Stock",
      sales: 34,
      unit: "set",
      taxRate: "20%",
    },
  ];

  // خيارات وحدة القياس
  const unitOptions = [
    { value: "piece", label: "Piece" },
    { value: "set", label: "Set" },
    { value: "box", label: "Box" },
    { value: "kit", label: "Kit" },
    { value: "pack", label: "Pack" },
  ];

  const handleDelete = (id, name) => {
    if (window.confirm(`${t("confirmDelete", "products")} "${name}"?`)) {
      alert(`${t("deleteSuccess", "products")}: ${name}`);
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    if (
      window.confirm(
        `${t("confirmBulkDelete", "products")} ${selectedRows.length} ${t(
          "products",
          "products"
        )}?`
      )
    ) {
      alert(
        `${t("bulkDeleteSuccess", "products")} ${selectedRows.length} ${t(
          "products",
          "products"
        )}`
      );
      setSelectedRows([]);
    }
  };

  const handleBulkExport = () => {
    if (selectedRows.length === 0) return;
    alert(
      `${t("exportSelected", "products")} ${selectedRows.length} ${t(
        "products",
        "products"
      )}`
    );
  };

  // دالة للحصول على نص وحدة القياس
  const getUnitLabel = (unitValue) => {
    const unit = unitOptions.find((u) => u.value === unitValue);
    return unit ? unit.label : unitValue;
  };

  // دالة لتحديد إذا كان هناك خصم
  const hasDiscount = (price, priceAfterDiscount) => {
    const priceNum = parseFloat(price.replace(/[^0-9.-]+/g, ""));
    const discountedPriceNum = parseFloat(
      priceAfterDiscount.replace(/[^0-9.-]+/g, "")
    );
    return priceNum > discountedPriceNum;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("productsManagement", "products")}
          </h1>
          <p className="text-gray-600">{t("manageInventory", "products")}</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          {/* تم إزالة زر Export وأبقينا على زر Add Product */}
          <button
            onClick={() => navigate("/products/add")}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t("addProduct", "products")}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            {t("totalProducts", "products")}
          </p>
          <p className="text-2xl font-bold text-gray-800">145</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("inStock", "products")}
              </p>
              <p className="text-2xl font-bold text-green-600">112</p>
            </div>
            <CheckCircle className="text-green-500" size={20} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("lowStock", "products")}
              </p>
              <p className="text-2xl font-bold text-yellow-600">18</p>
            </div>
            <AlertCircle className="text-yellow-500" size={20} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("outOfStock", "products")}
              </p>
              <p className="text-2xl font-bold text-red-600">15</p>
            </div>
            <XCircle className="text-red-500" size={20} />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataGrid
          dataSource={productsData}
          showBorders={true}
          columnAutoWidth={true}
          allowColumnResizing={true}
          columnMinWidth={50}
          height={500}
          selection={{ mode: "multiple" }}
          onSelectionChanged={(e) => setSelectedRows(e.selectedRowsData)}
          allowColumnReordering={true}
        >
          <HeaderFilter visible={true} />
          <SearchPanel
            visible={true}
            placeholder={t("searchProducts", "products")}
          />
          <GroupPanel
            visible={true}
            emptyPanelText={
              t("dragColumnHereToGroup", "products") ||
              "Drag a column header here to group by that column"
            }
            allowColumnDragging={true}
          />
          <Paging defaultPageSize={10} />
          <Pager
            showPageSizeSelector={true}
            allowedPageSizes={[5, 10, 20]}
            showInfo={true}
          />

          <Column
            dataField="id"
            caption={t("id", "products")}
            width="auto"
            alignment="left"
            allowGrouping={false}
          />
          <Column
            dataField="name"
            caption={t("productName", "products")}
            width="auto"
            alignment="left"
            allowGrouping={false}
          />
          <Column
            dataField="category"
            caption={t("category", "products")}
            width="auto"
            alignment="left"
            allowGrouping={true}
          />
          <Column
            dataField="price"
            caption={t("price", "products")}
            width="auto"
            alignment="left"
            allowGrouping={false}
          />

          {/* ✅ عمود السعر بعد الخصم بدل الخصم */}
          <Column
            dataField="priceAfterDiscount"
            caption={t("priceAfterDiscount", "products") || "Discount Price"}
            width="auto"
            alignment="left"
            allowGrouping={false}
            cellRender={({ data }) => {
              const hasDisc = hasDiscount(data.price, data.priceAfterDiscount);
              return (
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span
                      className={`font-semibold ${
                        hasDisc ? "text-green-600" : "text-gray-800"
                      }`}
                    >
                      {data.priceAfterDiscount}
                    </span>
                    {hasDisc && <Tag className="text-red-500 ml-2" size={12} />}
                  </div>
                  {hasDisc && (
                    <div className="text-xs text-gray-500 mt-1">
                      {t("discountApplied", "products") || "Discount applied"}
                    </div>
                  )}
                </div>
              );
            }}
          />

          {/* عمود المخزون */}
          <Column
            dataField="stock"
            caption={t("stock", "products")}
            width="auto"
            alignment="left"
            allowGrouping={false}
          />

          {/* عمود الوحدة الجديد */}
          <Column
            dataField="unit"
            caption={t("unit", "products") || "Unit"}
            width="auto"
            alignment="left"
            allowGrouping={true}
            cellRender={({ data }) => (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                {getUnitLabel(data.unit)}
              </span>
            )}
          />

          {/* عمود معدل الضريبة الجديد */}
          <Column
            dataField="taxRate"
            caption={t("taxRate", "products") || "Tax Rate"}
            width="auto"
            alignment="left"
            allowGrouping={true}
            cellRender={({ data }) => (
              <div className="flex items-center">
                <span
                  className={`font-medium ${
                    data.taxRate === "20%"
                      ? "text-red-600"
                      : data.taxRate === "15%"
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {data.taxRate}
                </span>
              </div>
            )}
          />

          <Column
            dataField="status"
            caption={t("status", "common")}
            width="auto"
            alignment="left"
            allowGrouping={true}
            cellRender={({ data }) => {
              let statusConfig = {
                "In Stock": {
                  color: "bg-green-100 text-green-800",
                  icon: <CheckCircle size={12} className="mr-1" />,
                },
                "Low Stock": {
                  color: "bg-yellow-100 text-yellow-800",
                  icon: <AlertCircle size={12} className="mr-1" />,
                },
                "Out of Stock": {
                  color: "bg-red-100 text-red-800",
                  icon: <XCircle size={12} className="mr-1" />,
                },
              };

              const config = statusConfig[data.status] || {
                color: "bg-gray-100 text-gray-800",
              };

              return (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${config.color}`}
                >
                  {config.icon}
                  {data.status === "In Stock"
                    ? t("inStock", "products")
                    : data.status === "Low Stock"
                    ? t("lowStock", "products")
                    : t("outOfStock", "products")}
                </span>
              );
            }}
          />
          <Column
            dataField="sales"
            caption={t("sales", "products")}
            width="auto"
            alignment="left"
            allowGrouping={false}
          />
          <Column
            caption={t("actions", "products")}
            width="auto"
            alignment="left"
            cellRender={({ data }) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/products/view/${data.id}`)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                  title={t("view", "common")}
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => navigate(`/products/edit/${data.id}`)}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                  title={t("edit", "common")}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(data.id, data.name)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                  title={t("delete", "common")}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        </DataGrid>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="text-gray-500" size={20} />
              <span className="font-medium text-gray-700">
                {selectedRows.length} {t("itemsSelected", "products")}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>{t("bulkDelete", "products")}</span>
              </button>
              <button
                onClick={handleBulkExport}
                className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition flex items-center space-x-2"
              >
                <Download size={16} />
                <span>{t("bulkExport", "products")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("inventoryValue", "products")}
            </h3>
            <DollarSign className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">$245,800</p>
          <p className="text-sm text-gray-600 mt-2">
            {t("totalInventoryValue", "products")}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("avgPrice", "products")}
            </h3>
            <Package className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">$890</p>
          <p className="text-sm text-gray-600 mt-2">
            {t("averageProductPrice", "products")}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("stockTurnover", "products")}
            </h3>
            <TrendingUp className="text-purple-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">4.2x</p>
          <p className="text-sm text-gray-600 mt-2">
            {t("annualStockTurnover", "products")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Products;
