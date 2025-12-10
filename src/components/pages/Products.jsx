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
            onClick={() => {
              /* Export logic */
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <Download size={20} />
            <span>{t("export", "products")}</span>
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
          <p className="text-sm text-gray-600">{t("inStock", "products")}</p>
          <p className="text-2xl font-bold text-green-600">112</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">{t("lowStock", "products")}</p>
          <p className="text-2xl font-bold text-yellow-600">18</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">{t("outOfStock", "products")}</p>
          <p className="text-2xl font-bold text-red-600">15</p>
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
            caption={t("status", "products")}
            cellRender={({ data }) => (
              <span
                className={`
                px-3 py-1 rounded-full text-xs font-medium
                ${
                  data.status === "In Stock"
                    ? "bg-green-100 text-green-800"
                    : data.status === "Low Stock"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }
              `}
              >
                {data.status === "In Stock"
                  ? t("inStock", "products")
                  : data.status === "Low Stock"
                  ? t("lowStock", "products")
                  : t("outOfStock", "products")}
              </span>
            )}
          />
          <Column dataField="sales" caption={t("sales", "products")} />
          <Column
            caption={t("actions", "products")}
            width={120}
            cellRender={({ data }) => (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/products/view/${data.id}`)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title={t("view", "products")}
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => navigate(`/products/edit/${data.id}`)}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title={t("edit", "products")}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(t("confirmDelete", "products"))) {
                      // Delete logic here
                    }
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title={t("delete", "products")}
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
                {selectedRows.length}{" "}
                {t("itemsSelected", "products") || "items selected"}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (window.confirm(t("confirmDelete", "products"))) {
                    // Bulk delete logic
                  }
                }}
                className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition"
              >
                {t("bulkDelete", "products")}
              </button>
              <button
                onClick={() => {
                  /* Bulk export logic */
                }}
                className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
              >
                {t("bulkExport", "products")}
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
            "Equipment",
            "Imaging",
            "Surgical",
            "Restorative",
            "Hygiene",
            "Digital",
            "All",
          ].map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              {category === "All" ? t("allCategories", "products") : category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
