/* eslint-disable no-unused-vars */
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
  Filter,
  Undo,
  Trash,
} from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();

  // State للفلاتر
  const [activeFilter, setActiveFilter] = useState("all"); // all, lowStock, outOfStock, deleted
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    deleted: 0,
  });

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update filtered products when filter changes
  useEffect(() => {
    applyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/products");

      const apiData = response.data?.data;

      if (Array.isArray(apiData)) {
        const formattedData = apiData.map((product) => {
          const normalizedStatus = (product.status || "")
            .toLowerCase()
            .replace(/[_\s]/g, "");

          let stockStatus = t("inStock", "products");
          let isLowStock = false;
          let isOutOfStock = false;
          let isDeleted = normalizedStatus === "deleted";

          if (normalizedStatus === "outofstock") {
            stockStatus = t("outOfStock", "products");
            isOutOfStock = true;
          } else if (normalizedStatus === "lowstock") {
            stockStatus = t("lowStock", "products");
            isLowStock = true;
          } else if (normalizedStatus === "instock") {
            stockStatus = t("inStock", "products");
          } else if (isDeleted) {
            stockStatus = t("deleted", "products") || "Deleted";
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
            isLowStock: isLowStock,
            isOutOfStock: isOutOfStock,
            isDeleted: isDeleted,
            normalizedStatus: normalizedStatus,
          };
        });

        setProducts(formattedData);
        calculateStats(formattedData);
      } else {
        setError(
          t("noProductsData", "products") ||
            "No products data found or invalid data format",
        );
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t("loadProductsFailed", "products") ||
          "Failed to load products",
      );
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productsList) => {
    const total = productsList.length;
    const lowStock = productsList.filter(
      (product) => product.isLowStock,
    ).length;
    const outOfStock = productsList.filter(
      (product) => product.isOutOfStock,
    ).length;
    const deleted = productsList.filter((product) => product.isDeleted).length;

    setStats({
      total,
      lowStock,
      outOfStock,
      deleted,
    });
  };

  const applyFilter = () => {
    let filtered = [...products];

    switch (activeFilter) {
      case "lowStock":
        filtered = products.filter((product) => product.isLowStock);
        break;
      case "outOfStock":
        filtered = products.filter((product) => product.isOutOfStock);
        break;
      case "deleted":
        filtered = products.filter((product) => product.isDeleted);
        break;
      case "all":
      default:
        filtered = products;
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`${t("deleteProductConfirm", "products")} "${name}"?`)) {
      try {
        await api.delete(`/deleteproduct/${id}`);
        await fetchProducts(); // Refresh the products list
        alert(
          t("productDeletedSuccess", "products", { name }) ||
            `Product "${name}" deleted successfully!`,
        );
      } catch (err) {
        alert(
          t("deleteProductError", "products") ||
            "Error deleting product: " +
              (err.response?.data?.message ||
                err.message ||
                t("tryAgain", "common") ||
                "Please try again"),
        );
      }
    }
  };

  const handleRestore = async (id, name) => {
    if (
      window.confirm(`${t("restoreProductConfirm", "products")} "${name}"?`)
    ) {
      try {
        // Assuming the endpoint is similar to the one you mentioned
        await api.post(`/restoreproduct/${id}`);
        await fetchProducts(); // Refresh the products list
        alert(
          t("productRestoredSuccess", "products") ||
            "Product restored successfully!",
        );
      } catch (err) {
        alert(
          t("restoreProductError", "products") ||
            "Error restoring product: " +
              (err.response?.data?.message ||
                err.message ||
                t("tryAgain", "common") ||
                "Please try again"),
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

  const getFilterButtonClass = (filterType) => {
    const baseClass =
      "p-4 rounded-lg border transition-all duration-200 cursor-pointer ";

    if (activeFilter === filterType) {
      switch (filterType) {
        case "all":
          return baseClass + "bg-blue-50 border-blue-200 shadow-sm";
        case "lowStock":
          return baseClass + "bg-yellow-50 border-yellow-200 shadow-sm";
        case "outOfStock":
          return baseClass + "bg-red-50 border-red-200 shadow-sm";
        case "deleted":
          return baseClass + "bg-gray-100 border-gray-300 shadow-sm";
        default:
          return baseClass + "bg-gray-50 border-gray-200";
      }
    }

    return baseClass + "bg-white border-gray-200 hover:bg-gray-50";
  };

  const getFilterTextClass = (filterType) => {
    if (activeFilter === filterType) {
      switch (filterType) {
        case "all":
          return "text-blue-700";
        case "lowStock":
          return "text-yellow-700";
        case "outOfStock":
          return "text-red-700";
        case "deleted":
          return "text-gray-700";
        default:
          return "text-gray-800";
      }
    }
    return "text-gray-600";
  };

  const getFilterCountClass = (filterType) => {
    if (activeFilter === filterType) {
      switch (filterType) {
        case "all":
          return "text-blue-800";
        case "lowStock":
          return "text-yellow-800";
        case "outOfStock":
          return "text-red-800";
        case "deleted":
          return "text-gray-800";
        default:
          return "text-gray-800";
      }
    }
    return "text-gray-800";
  };

  // ... (بقية الكود يبقى كما هو حتى جزء الفلاتر)

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

      {/* Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Products Filter */}
        <div
          className={getFilterButtonClass("all")}
          onClick={() => handleFilterClick("all")}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Filter size={16} className={getFilterTextClass("all")} />
                <p
                  className={`text-sm font-medium ${getFilterTextClass("all")}`}
                >
                  {t("totalProducts", "products") || "Total Products"}
                </p>
              </div>
              <p className={`text-2xl font-bold ${getFilterCountClass("all")}`}>
                {stats.total}
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                activeFilter === "all" ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <Package size={20} className={getFilterTextClass("all")} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {activeFilter === "all"
                ? t("showingAllProducts", "products")
                : t("clickToShowAll", "products", { count: stats.total })}
            </p>
          </div>
        </div>

        {/* Low Stock Filter */}
        <div
          className={getFilterButtonClass("lowStock")}
          onClick={() => handleFilterClick("lowStock")}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <AlertCircle
                  size={16}
                  className={getFilterTextClass("lowStock")}
                />
                <p
                  className={`text-sm font-medium ${getFilterTextClass(
                    "lowStock",
                  )}`}
                >
                  {t("lowStock", "products") || "Low Stock"}
                </p>
              </div>
              <p
                className={`text-2xl font-bold ${getFilterCountClass(
                  "lowStock",
                )}`}
              >
                {stats.lowStock}
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                activeFilter === "lowStock" ? "bg-yellow-100" : "bg-gray-100"
              }`}
            >
              <AlertCircle
                size={20}
                className={getFilterTextClass("lowStock")}
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {activeFilter === "lowStock"
                ? t("showingLowStockProducts", "products", {
                    count: stats.lowStock,
                  })
                : t("clickToFilterLowStock", "products", {
                    count: stats.lowStock,
                  })}
            </p>
          </div>
        </div>

        {/* Out of Stock Filter */}
        <div
          className={getFilterButtonClass("outOfStock")}
          onClick={() => handleFilterClick("outOfStock")}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <XCircle
                  size={16}
                  className={getFilterTextClass("outOfStock")}
                />
                <p
                  className={`text-sm font-medium ${getFilterTextClass(
                    "outOfStock",
                  )}`}
                >
                  {t("outOfStock", "products") || "Out of Stock"}
                </p>
              </div>
              <p
                className={`text-2xl font-bold ${getFilterCountClass(
                  "outOfStock",
                )}`}
              >
                {stats.outOfStock}
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                activeFilter === "outOfStock" ? "bg-red-100" : "bg-gray-100"
              }`}
            >
              <XCircle size={20} className={getFilterTextClass("outOfStock")} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {activeFilter === "outOfStock"
                ? t("showingOutOfStockProducts", "products", {
                    count: stats.outOfStock,
                  })
                : t("clickToFilterOutOfStock", "products", {
                    count: stats.outOfStock,
                  })}
            </p>
          </div>
        </div>

        {/* Deleted Products Filter */}
        <div
          className={getFilterButtonClass("deleted")}
          onClick={() => handleFilterClick("deleted")}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Trash size={16} className={getFilterTextClass("deleted")} />
                <p
                  className={`text-sm font-medium ${getFilterTextClass(
                    "deleted",
                  )}`}
                >
                  {t("deleted", "products") || "Deleted"}
                </p>
              </div>
              <p
                className={`text-2xl font-bold ${getFilterCountClass(
                  "deleted",
                )}`}
              >
                {stats.deleted}
              </p>
            </div>
            <div
              className={`p-2 rounded-lg ${
                activeFilter === "deleted" ? "bg-gray-200" : "bg-gray-100"
              }`}
            >
              <Trash size={20} className={getFilterTextClass("deleted")} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {activeFilter === "deleted"
                ? t("showingDeletedProducts", "products", {
                    count: stats.deleted,
                  })
                : t("clickToFilterDeleted", "products", {
                    count: stats.deleted,
                  })}
            </p>
          </div>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {activeFilter !== "all" && (
        <div
          className={`p-3 rounded-lg ${
            activeFilter === "lowStock"
              ? "bg-yellow-50 border border-yellow-200"
              : activeFilter === "outOfStock"
                ? "bg-red-50 border border-red-200"
                : "bg-gray-100 border border-gray-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {activeFilter === "lowStock" ? (
                <>
                  <AlertCircle className="text-yellow-600" size={18} />
                  <span className="font-medium text-yellow-800">
                    {t("filteredBy", "products")}: {t("lowStock", "products")}
                  </span>
                </>
              ) : activeFilter === "outOfStock" ? (
                <>
                  <XCircle className="text-red-600" size={18} />
                  <span className="font-medium text-red-800">
                    {t("filteredBy", "products")}: {t("outOfStock", "products")}
                  </span>
                </>
              ) : (
                <>
                  <Trash className="text-gray-600" size={18} />
                  <span className="font-medium text-gray-800">
                    {t("filteredBy", "products")}: {t("deleted", "products")}
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() => handleFilterClick("all")}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              {t("clearFilter", "products")}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1 ml-7">
            {activeFilter === "lowStock"
              ? `${stats.lowStock} ${t("lowStockProducts", "products")}`
              : activeFilter === "outOfStock"
                ? `${stats.outOfStock} ${t("outOfStockProducts", "products")}`
                : `${stats.deleted} ${t("deletedProducts", "products")}`}
          </p>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {activeFilter === "all"
                ? t("noProductsYet", "products")
                : t("noFilteredProducts", "products")}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeFilter === "all"
                ? t("startByAddingProducts", "products")
                : t("tryDifferentFilter", "products")}
            </p>
            {activeFilter !== "all" && (
              <button
                onClick={() => handleFilterClick("all")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition mr-2"
              >
                {t("showAllProducts", "products")}
              </button>
            )}
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
          <>
            {/* Table Header with Count */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package size={18} className="text-gray-500" />
                  <span className="font-medium text-gray-700">
                    {activeFilter === "all"
                      ? t("allProducts", "products")
                      : activeFilter === "lowStock"
                        ? t("lowStockProducts", "products")
                        : activeFilter === "outOfStock"
                          ? t("outOfStockProducts", "products")
                          : t("deletedProducts", "products")}
                  </span>
                  <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                    {filteredProducts.length} {t("items", "products")}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {activeFilter === "all" &&
                    `${stats.total} ${t("total", "products")}`}
                  {activeFilter === "lowStock" &&
                    `${stats.lowStock} ${t(
                      "lowStock",
                      "products",
                    )?.toLowerCase()}`}
                  {activeFilter === "outOfStock" &&
                    `${stats.outOfStock} ${t(
                      "outOfStock",
                      "products",
                    )?.toLowerCase()}`}
                  {activeFilter === "deleted" &&
                    `${stats.deleted} ${t(
                      "deleted",
                      "products",
                    )?.toLowerCase()}`}
                </div>
              </div>
            </div>

            <DataGrid
              dataSource={filteredProducts}
              showBorders={true}
              columnAutoWidth={true}
              allowColumnResizing={true}
              columnMinWidth={50}
              height={500}
              allowColumnReordering={true}
              rowAlternationEnabled={true}
              showColumnLines={true}
              showRowLines={true}
              rowClass={(rowData) => {
                return rowData.isDeleted ? "deleted-row" : "";
              }}
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

              {/* ... نفس الأعمدة السابقة ... */}
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
                    currentLanguage === "sv" &&
                    data.s_name &&
                    data.s_name.trim();

                  return (
                    <div
                      className={`flex flex-col ${data.isDeleted ? "product-name-cell" : ""}`}
                    >
                      <div
                        className={`font-medium ${
                          data.isDeleted ? "text-gray-500" : "text-gray-800"
                        }`}
                      >
                        {displayName}
                        {data.isDeleted && (
                          <span className="ml-2 text-xs text-gray-400">
                            ({t("deleted", "products")})
                          </span>
                        )}
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
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium capitalize ${
                      data.isDeleted
                        ? "bg-gray-200 text-gray-600"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
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
                caption={t("priceAfterDiscount", "products") || "Offer Price"}
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
                            data.isDeleted
                              ? "text-gray-500"
                              : hasDisc
                                ? "text-green-600"
                                : "text-gray-800"
                          }`}
                        >
                          {data.priceAfterDiscount}
                        </span>
                        {hasDisc && !data.isDeleted && (
                          <Tag className="text-red-500 ml-2" size={12} />
                        )}
                      </div>
                      {hasDisc &&
                        data.discountPercentage > 0 &&
                        !data.isDeleted && (
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
                        data.isDeleted
                          ? "text-gray-500"
                          : data.taxRate === "20%"
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
                    [t("deleted", "products") || "Deleted"]: {
                      color: "bg-gray-200 text-gray-700",
                      icon: <Trash size={12} className="mr-1" />,
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
                    {data.isDeleted ? (
                      <>
                        <button
                          onClick={() =>
                            handleRestore(
                              data.id,
                              getProductNameByLanguage(data),
                            )
                          }
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                          title={t("restore", "products") || "Restore"}
                        >
                          <Undo size={16} />
                        </button>
                      </>
                    ) : (
                      <>
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
                            handleDelete(
                              data.id,
                              getProductNameByLanguage(data),
                            )
                          }
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          title={t("delete", "common") || "Delete"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              />
            </DataGrid>
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
