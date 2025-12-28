// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
  HeaderFilter,
  GroupPanel,
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
} from "lucide-react";

const Inventory = () => {
  const { t } = useLanguage();

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
      notes: "Sold to private practice",
    },
  ];

  // إحصائيات
  const stats = {
    totalMovements: inventoryData.length,
    incomingStock: inventoryData.filter((item) => item.type === "in").length,
    outgoingStock: inventoryData.filter((item) => item.type === "out").length,
    returns: inventoryData.filter((item) => item.return === true).length,
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

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {t("productMovements", "inventory")}
          </h3>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <DataGrid
            dataSource={inventoryData}
            showBorders={true}
            columnAutoWidth={true}
            height={500}
            allowColumnResizing={true}
            allowColumnReordering={true}
            columnResizingMode="widget"
          >
            <HeaderFilter visible={true} />
            <SearchPanel
              visible={true}
              placeholder={t("searchMovements", "inventory")}
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

            {/* Product */}
            <Column
              dataField="product"
              caption={t("product", "inventory")}
              width={"auto"}
              alignment="left"
              allowGrouping={false}
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
                  <span className="ml-2 text-gray-500 text-sm">units</span>
                </div>
              )}
            />

            {/* Related Products */}
            <Column
              dataField="relatedProducts"
              caption={t("relatedProducts", "inventory")}
              width={"auto"}
              alignment="left"
              allowGrouping={false}
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
              width={"auto"}
              alignment="left"
              allowGrouping={true}
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
              width={"auto"}
              alignment="left"
              allowGrouping={true}
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
              width={"auto"}
              alignment="left"
              allowGrouping={true}
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
          </DataGrid>
        </div>

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
          </div>

          <div className="space-y-4">
            {inventoryData.slice(0, 5).map((movement) => (
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
                      {movement.quantity} units
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{movement.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
