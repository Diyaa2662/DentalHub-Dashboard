import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
} from "devextreme-react/data-grid";
import {
  Plus,
  Filter,
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
} from "lucide-react";

const Products = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Mock data for products
  const productsData = [
    {
      id: 1,
      name: "Advanced Dental Chair",
      category: "Equipment",
      price: "$4,500",
      stock: 12,
      status: "In Stock",
      sales: 45,
    },
    {
      id: 2,
      name: "Portable X-Ray Unit",
      category: "Imaging",
      price: "$2,800",
      stock: 8,
      status: "Low Stock",
      sales: 32,
    },
    {
      id: 3,
      name: "Surgical Instrument Set",
      category: "Surgical",
      price: "$1,200",
      stock: 25,
      status: "In Stock",
      sales: 78,
    },
    {
      id: 4,
      name: "Digital Impressions Scanner",
      category: "Digital",
      price: "$3,500",
      stock: 5,
      status: "Low Stock",
      sales: 18,
    },
    {
      id: 5,
      name: "Autoclave Sterilizer",
      category: "Sterilization",
      price: "$950",
      stock: 15,
      status: "In Stock",
      sales: 56,
    },
    {
      id: 6,
      name: "Composite Resin Kit",
      category: "Restorative",
      price: "$280",
      stock: 42,
      status: "In Stock",
      sales: 120,
    },
    {
      id: 7,
      name: "Dental Loupes 3.5x",
      category: "Magnification",
      price: "$650",
      stock: 0,
      status: "Out of Stock",
      sales: 23,
    },
    {
      id: 8,
      name: "Ultrasonic Scaler",
      category: "Hygiene",
      price: "$1,800",
      stock: 7,
      status: "Low Stock",
      sales: 34,
    },
  ];

  const handleExport = () => {
    alert(
      t("exportSuccess", "products") ||
        "Export functionality would be implemented here"
    );
  };

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
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <Download size={20} />
            <span>{t("export", "common")}</span>
          </button>
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
          height={500}
          selection={{ mode: "multiple" }}
          onSelectionChanged={(e) => setSelectedRows(e.selectedRowsData)}
        >
          <SearchPanel
            visible={true}
            placeholder={t("searchProducts", "products")}
          />
          <Paging defaultPageSize={10} />
          <Pager
            showPageSizeSelector={true}
            allowedPageSizes={[5, 10, 20]}
            showInfo={true}
          />

          <Column dataField="id" caption={t("id", "products")} width={70} />
          <Column dataField="name" caption={t("productName", "products")} />
          <Column dataField="category" caption={t("category", "products")} />
          <Column dataField="price" caption={t("price", "products")} />
          <Column dataField="stock" caption={t("stock", "products")} />
          <Column
            dataField="status"
            caption={t("status", "common")}
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
          <Column dataField="sales" caption={t("sales", "products")} />
          <Column
            caption={t("actions", "products")}
            width={140}
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

      {/* Quick Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t("filterByCategory", "products")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: t("allCategories", "products") },
            { value: "equipment", label: t("equipment", "products") },
            { value: "imaging", label: t("imaging", "products") },
            { value: "surgical", label: t("surgical", "products") },
            { value: "restorative", label: t("restorative", "products") },
            { value: "hygiene", label: t("hygiene", "products") },
          ].map((category) => (
            <button
              key={category.value}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

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
