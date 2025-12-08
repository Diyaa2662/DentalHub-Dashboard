import React, { useState } from "react";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react/button";
import { Plus, Filter, Download, Edit, Trash2, Eye } from "lucide-react";

const Products = () => {
  // eslint-disable-next-line no-unused-vars
  const [selectedRows, setSelectedRows] = useState([]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Products Management
          </h1>
          <p className="text-gray-600">
            Manage your dental equipment inventory
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button
            text="Export"
            icon="download"
            type="default"
            stylingMode="contained"
            className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200"
          />
          <Button
            text="Add Product"
            icon="plus"
            type="default"
            stylingMode="contained"
            className="!bg-dental-blue !text-white hover:!bg-blue-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-gray-800">145</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">In Stock</p>
          <p className="text-2xl font-bold text-green-600">112</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-600">18</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">15</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataGrid
          dataSource={productsData}
          showBorders={true}
          columnAutoWidth={true}
          height={500}
          selection={{ mode: "multiple" }}
          onSelectionChanged={(e) => setSelectedRows(e.selectedRowsData)}
        >
          <SearchPanel visible={true} placeholder="Search products..." />
          <Paging defaultPageSize={10} />
          <Pager
            showPageSizeSelector={true}
            allowedPageSizes={[5, 10, 20]}
            showInfo={true}
          />

          <Column dataField="id" caption="ID" width={70} />
          <Column dataField="name" caption="Product Name" />
          <Column dataField="category" caption="Category" />
          <Column dataField="price" caption="Price" />
          <Column dataField="stock" caption="Stock" />
          <Column
            dataField="status"
            caption="Status"
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
                {data.status}
              </span>
            )}
          />
          <Column dataField="sales" caption="Sales" />
          <Column
            caption="Actions"
            width={120}
            cellRender={() => (
              <div className="flex space-x-2">
                <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                  <Eye size={16} />
                </button>
                <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                  <Edit size={16} />
                </button>
                <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        </DataGrid>
      </div>
    </div>
  );
};

export default Products;
