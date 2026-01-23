import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import api from "../../services/api";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
  HeaderFilter,
  GroupPanel,
  LoadPanel,
} from "devextreme-react/data-grid";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const Inventory = () => {
  const { t } = useLanguage();

  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalMovements: 0,
    incomingStock: 0,
    outgoingStock: 0,
    returns: 0,
  });

  useEffect(() => {
    fetchInventoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/stockmovments");

      let movements = [];

      if (Array.isArray(response.data)) {
        if (response.data.length > 0 && Array.isArray(response.data[0])) {
          movements = response.data[0];
        } else if (
          response.data.length > 0 &&
          typeof response.data[0] === "object"
        ) {
          movements = response.data;
        }
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        movements = response.data.data;
      }

      // ✅ تنسيق البيانات من API
      const formattedData = movements.map((movement) => {
        let typeText = "unknown";
        let typeColor = "bg-gray-100 text-gray-800";
        let arrowIcon = null;

        if (movement.type === "in") {
          typeText = t("typeIn", "inventory") || "In";
          typeColor = "bg-green-100 text-green-800";
          arrowIcon = <ArrowDown size={12} className="mr-1" />;
        } else if (movement.type === "out") {
          typeText = t("typeOut", "inventory") || "Out";
          typeColor = "bg-red-100 text-red-800";
          arrowIcon = <ArrowUp size={12} className="mr-1" />;
        }

        let returnStatusText = movement.return
          ? t("yes", "common") || "Yes"
          : t("no", "common") || "No";
        let returnStatusColor = movement.return
          ? "bg-yellow-100 text-yellow-800"
          : "bg-gray-100 text-gray-800";
        let returnIcon = movement.return ? (
          <RotateCcw size={12} className="mr-1" />
        ) : (
          <CheckCircle size={12} className="mr-1" />
        );

        let stockColor = "bg-gray-100 text-gray-800";
        if (movement.quantity_in_stock > 20) {
          stockColor = "bg-green-100 text-green-800";
        } else if (movement.quantity_in_stock > 10) {
          stockColor = "bg-yellow-100 text-yellow-800";
        } else if (movement.quantity_in_stock > 0) {
          stockColor = "bg-orange-100 text-orange-800";
        } else {
          stockColor = "bg-red-100 text-red-800";
        }

        return {
          id: movement.id,
          product_id: movement.product_id,
          product: `Product #${movement.product_id}`,
          quantity: movement.quantity_ordered,
          type: movement.type,
          return: movement.return,
          inStock: movement.quantity_in_stock,
          date: movement.created_at?.split("T")[0] || "N/A",
          notes: movement.notes || "",
          related_type: movement.related_type,
          related_id: movement.related_id,
          typeText: typeText,
          typeColor: typeColor,
          arrowIcon: arrowIcon,
          returnStatusText: returnStatusText,
          returnStatusColor: returnStatusColor,
          returnIcon: returnIcon,
          stockColor: stockColor,
          originalData: movement,
        };
      });

      setInventoryData(formattedData);
      calculateStats(formattedData);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("failedToLoadInventory", "inventory") ||
          "Failed to load inventory data",
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalMovements = data.length;
    const incomingStock = data.filter((item) => item.type === "in").length;
    const outgoingStock = data.filter((item) => item.type === "out").length;
    const returns = data.filter((item) => item.return === true).length;

    setStats({
      totalMovements,
      incomingStock,
      outgoingStock,
      returns,
    });
  };

  const handleRefresh = () => {
    fetchInventoryData();
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("inventoryManagement", "inventory")}
            </h1>
            <p className="text-gray-600">
              {t("loadingInventory", "inventory") ||
                "Loading inventory data..."}
            </p>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-blue"></div>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("inventoryManagement", "inventory")}
            </h1>
            <p className="text-gray-600">
              {t("warehouseMovement", "inventory")}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>{t("retry", "common") || "Retry"}</span>
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoadingInventory", "inventory") ||
                  "Error Loading Inventory"}
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
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
            {t("inventoryManagement", "inventory")}
          </h1>
          <p className="text-gray-600">{t("warehouseMovement", "inventory")}</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <RefreshCw size={20} />
            <span>{t("refresh", "common") || "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - باستخدام البيانات الحقيقية */}
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

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {t("productMovements", "inventory")}
          </h3>
          <p className="text-sm text-gray-600">
            {inventoryData.length}{" "}
            {t("movementsFound", "inventory") || "movements found"}
          </p>
        </div>

        {inventoryData.length === 0 ? (
          <div className="text-center py-12">
            <Package className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {t("noMovements", "inventory") || "No Movements"}
            </h3>
            <p className="text-gray-600">
              {t("noMovementsDescription", "inventory") ||
                "No inventory movements found"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <DataGrid
              dataSource={inventoryData}
              showBorders={true}
              columnAutoWidth={true}
              height={500}
              showColumnLines={true}
              showRowLines={true}
              rowAlternationEnabled={true}
              allowColumnResizing={true}
              allowColumnReordering={true}
              columnResizingMode="widget"
            >
              <LoadPanel enabled={false} />
              <HeaderFilter visible={true} />
              <SearchPanel
                visible={true}
                placeholder={
                  t("searchMovements", "inventory") || "Search movements..."
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
              />

              {/* ID */}
              <Column
                dataField="id"
                caption={t("id", "common") || "ID"}
                width={"auto"}
                alignment="left"
                allowGrouping={false}
              />

              {/* Product ID */}
              <Column
                dataField="product_id"
                caption={t("productId", "inventory") || "Product ID"}
                width={"auto"}
                alignment="left"
                allowGrouping={true}
              />

              {/* Quantity */}
              <Column
                dataField="quantity"
                caption={t("quantity", "inventory")}
                width={"auto"}
                alignment="left"
                allowGrouping={true}
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
                    <span className="ml-2 text-gray-500 text-sm">
                      {t("units", "inventory") || "units"}
                    </span>
                  </div>
                )}
              />

              {/* Type */}
              <Column
                dataField="type"
                caption={t("movementType", "inventory")}
                width={"auto"}
                alignment="left"
                allowGrouping={true}
                cellRender={({ data }) => (
                  <div
                    className={`flex items-center px-6 py-1 rounded-full text-xs font-medium ${data.typeColor}`}
                  >
                    {data.arrowIcon}
                    {data.typeText}
                  </div>
                )}
              />

              {/* Return */}
              <Column
                dataField="return"
                caption={t("returnStatus", "inventory")}
                width={"auto"}
                alignment="left"
                allowGrouping={true}
                cellRender={({ data }) => (
                  <div
                    className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${data.returnStatusColor}`}
                  >
                    {data.returnIcon}
                    {data.returnStatusText}
                  </div>
                )}
              />

              {/* In Stock */}
              <Column
                dataField="inStock"
                caption={t("inStock", "inventory")}
                width={"auto"}
                alignment="left"
                allowGrouping={false}
                cellRender={({ data }) => (
                  <div className="flex items-center justify-between">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${data.stockColor}`}
                    >
                      {data.inStock} {t("units", "inventory") || "units"}
                    </div>
                  </div>
                )}
              />

              {/* Date */}
              <Column
                dataField="date"
                caption={t("movementDate", "inventory")}
                width={"auto"}
                alignment="left"
                allowGrouping={true}
              />

              {/* Related Info */}
              <Column
                dataField="related_type"
                caption={t("relatedTo", "inventory") || "Related To"}
                width={"auto"}
                alignment="left"
                allowGrouping={true}
                cellRender={({ data }) => (
                  <div className="text-sm">
                    <span className="font-medium">{data.related_type}: </span>
                    <span className="text-gray-600">#{data.related_id}</span>
                  </div>
                )}
              />

              {/* Notes */}
              <Column
                dataField="notes"
                caption={t("notes", "procurement") || "Notes"}
                width={"auto"}
                alignment="left"
                allowGrouping={false}
                cellRender={({ data }) => (
                  <div className="text-sm text-gray-600">
                    {data.notes || "-"}
                  </div>
                )}
              />
            </DataGrid>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
