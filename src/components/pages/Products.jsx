import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
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
  RefreshCw,
  Hash,
} from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/products", {
        params: {
          dashboard: 1,
        },
      });

      const apiData = response.data?.data;

      if (Array.isArray(apiData)) {
        const formattedData = apiData.map((product) => {
          let stockStatus = t("inStock", "products");
          if (product.status === "outofstock") {
            stockStatus = t("outOfStock", "products");
          } else if (product.status === "lowstock") {
            stockStatus = t("lowStock", "products");
          } else if (product.status === "instock") {
            stockStatus = t("inStock", "products");
          }

          const price = parseFloat(product.price) || 0;
          const discountPrice = parseFloat(product.discount_price) || 0;
          const hasDiscount = discountPrice > 0 && discountPrice < price;
          const finalPrice = hasDiscount ? discountPrice : price;
          const discountPercentage = hasDiscount
            ? Math.round(((price - discountPrice) / price) * 100)
            : 0;

          return {
            id: product.id,
            name: product.name || "",
            s_name: product.s_name || "",
            sku: product.sku || "",
            category: product.category || t("other", "products") || "other",
            price: `$${price.toFixed(2)}`,
            discount: hasDiscount ? `${discountPercentage}%` : "0%",
            priceAfterDiscount: `$${finalPrice.toFixed(2)}`,
            stock: product.stock_quantity || 0,
            status: stockStatus,
            taxRate: product.tax_rate ? `${product.tax_rate}%` : "0%",
            originalData: product,
            hasDiscount: hasDiscount,
            discountPercentage: discountPercentage,
          };
        });

        setProducts(formattedData);
      } else {
        setError(
          t("noProductsData", "products") ||
            "No products data found or invalid data format"
        );
        setProducts([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t("loadProductsFailed", "products") ||
          "Failed to load products"
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        t("deleteProductConfirm", "products", { name }) ||
          `Are you sure you want to delete product "${name}"?`
      )
    ) {
      try {
        await api.delete(`/deleteproduct/${id}`);
        setProducts((prev) => prev.filter((product) => product.id !== id));
        alert(
          t("productDeletedSuccess", "products", { name }) ||
            `Product "${name}" deleted successfully!`
        );
      } catch (err) {
        alert(
          t("deleteProductError", "products") ||
            "Error deleting product: " +
              (err.response?.data?.message ||
                err.message ||
                t("tryAgain", "common") ||
                "Please try again")
        );
      }
    }
  };

  const getProductNameByLanguage = (product) => {
    if (currentLanguage === "sv" && product.s_name && product.s_name.trim()) {
      return product.s_name;
    }
    return product.name;
  };

  const hasDiscount = (product) => {
    return product.hasDiscount || false;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("productsManagement", "products") || "Products Management"}
            </h1>
            <p className="text-gray-600">
              {t("manageInventory", "products") ||
                "Manage your inventory and products"}
            </p>
          </div>
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium flex items-center space-x-2 mt-4 md:mt-0 cursor-not-allowed"
          >
            <Plus size={20} />
            <span>{t("addProduct", "products") || "Add Product"}</span>
          </button>
        </div>

        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto mb-4"></div>
            <p className="text-gray-600">
              {t("loadingProducts", "products") || "Loading products..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("productsManagement", "products") || "Products Management"}
            </h1>
            <p className="text-gray-600">
              {t("manageInventory", "products") ||
                "Manage your inventory and products"}
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
            >
              <RefreshCw size={18} />
              <span>{t("retry", "common") || "Retry"}</span>
            </button>
            <button
              onClick={() => navigate("/products/add")}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>{t("addProduct", "products") || "Add Product"}</span>
            </button>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoading", "products") || "Error Loading Products"}
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>

          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition flex items-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>{t("tryAgain", "common") || "Try Again"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("productsManagement", "products") || "Products Management"}
          </h1>
          <p className="text-gray-600">
            {t("manageInventory", "products") ||
              "Manage your inventory and products"}
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
            title={t("refresh", "common") || "Refresh"}
          >
            <RefreshCw size={18} />
            <span>{t("refresh", "common") || "Refresh"}</span>
          </button>
          <button
            onClick={() => navigate("/products/add")}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t("addProduct", "products") || "Add Product"}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            {t("totalProducts", "products") || "Total Products"}
          </p>
          <p className="text-2xl font-bold text-gray-800">145</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("inStock", "products") || "In Stock"}
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
                {t("lowStock", "products") || "Low Stock"}
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
                {t("outOfStock", "products") || "Out of Stock"}
              </p>
              <p className="text-2xl font-bold text-red-600">15</p>
            </div>
            <XCircle className="text-red-500" size={20} />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {t("noProductsYet", "products") || "No Products Yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("startByAddingProducts", "products") ||
                "Start by adding products to your inventory"}
            </p>
            <button
              onClick={() => navigate("/products/add")}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition inline-flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>
                {t("addFirstProduct", "products") || "Add First Product"}
              </span>
            </button>
          </div>
        ) : (
          <DataGrid
            dataSource={products}
            showBorders={true}
            columnAutoWidth={true}
            allowColumnResizing={true}
            columnMinWidth={50}
            height={500}
            allowColumnReordering={true}
          >
            <HeaderFilter visible={true} />
            <SearchPanel
              visible={true}
              placeholder={
                t("searchProducts", "products") || "Search products..."
              }
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
              infoText={
                t("pageInfoText", "products") || "Page {0} of {1} ({2} items)"
              }
            />

            <Column
              dataField="id"
              caption={t("id", "products") || "ID"}
              width="auto"
              alignment="left"
              allowGrouping={false}
            />

            <Column
              dataField="sku"
              caption="SKU"
              width="auto"
              alignment="left"
              allowGrouping={false}
              cellRender={({ data }) => (
                <div className="flex items-center">
                  <Hash size={14} className="text-gray-400 mr-2" />
                  <span className="font-mono text-sm">{data.sku}</span>
                </div>
              )}
            />

            <Column
              dataField="name"
              caption={t("productName", "products") || "Product Name"}
              width="auto"
              alignment="left"
              allowGrouping={false}
              cellRender={({ data }) => {
                const displayName = getProductNameByLanguage(data);
                const isSwedish =
                  currentLanguage === "sv" && data.s_name && data.s_name.trim();

                return (
                  <div className="flex flex-col">
                    <div className="font-medium text-gray-800">
                      {displayName}
                    </div>
                    {isSwedish && data.name !== data.s_name && (
                      <div className="text-xs text-gray-500 mt-1">
                        {t("english", "common") || "English"}: {data.name}
                      </div>
                    )}
                  </div>
                );
              }}
            />

            <Column
              dataField="category"
              caption={t("category", "products") || "Category"}
              width="auto"
              alignment="left"
              allowGrouping={true}
              cellRender={({ data }) => (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium capitalize">
                  {data.category}
                </span>
              )}
            />

            <Column
              dataField="price"
              caption={t("price", "products") || "Price"}
              width="auto"
              alignment="left"
              allowGrouping={false}
            />

            <Column
              dataField="priceAfterDiscount"
              caption={t("priceAfterDiscount", "products") || "Discount Price"}
              width="auto"
              alignment="left"
              allowGrouping={false}
              cellRender={({ data }) => {
                const hasDisc = hasDiscount(data);
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
                      {hasDisc && (
                        <Tag className="text-red-500 ml-2" size={12} />
                      )}
                    </div>
                    {hasDisc && data.discountPercentage > 0 && (
                      <div className="text-xs text-red-600 font-medium mt-1">
                        {data.discountPercentage}%{" "}
                        {t("off", "products") || "OFF"}
                      </div>
                    )}
                  </div>
                );
              }}
            />

            <Column
              dataField="stock"
              caption={t("stock", "products") || "Stock"}
              width="auto"
              alignment="left"
              allowGrouping={false}
            />

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
              caption={t("status", "common") || "Status"}
              width="auto"
              alignment="left"
              allowGrouping={true}
              cellRender={({ data }) => {
                let statusConfig = {
                  [t("inStock", "products") || "In Stock"]: {
                    color: "bg-green-100 text-green-800",
                    icon: <CheckCircle size={12} className="mr-1" />,
                  },
                  [t("lowStock", "products") || "Low Stock"]: {
                    color: "bg-yellow-100 text-yellow-800",
                    icon: <AlertCircle size={12} className="mr-1" />,
                  },
                  [t("outOfStock", "products") || "Out of Stock"]: {
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
                    {data.status}
                  </span>
                );
              }}
            />

            <Column
              caption={t("actions", "products") || "Actions"}
              width="auto"
              alignment="left"
              cellRender={({ data }) => (
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/products/view/${data.id}`)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                    title={t("view", "common") || "View"}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => navigate(`/products/edit/${data.id}`)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                    title={t("edit", "common") || "Edit"}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(data.id, getProductNameByLanguage(data))
                    }
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                    title={t("delete", "common") || "Delete"}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            />
          </DataGrid>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("inventoryValue", "products") || "Inventory Value"}
            </h3>
            <DollarSign className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">$245,800</p>
          <p className="text-sm text-gray-600 mt-2">
            {t("totalInventoryValue", "products") || "Total inventory value"}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("avgPrice", "products") || "Average Price"}
            </h3>
            <Package className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">$890</p>
          <p className="text-sm text-gray-600 mt-2">
            {t("averageProductPrice", "products") || "Average product price"}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("stockTurnover", "products") || "Stock Turnover"}
            </h3>
            <TrendingUp className="text-purple-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">4.2x</p>
          <p className="text-sm text-gray-600 mt-2">
            {t("annualStockTurnover", "products") ||
              "Annual stock turnover rate"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Products;
