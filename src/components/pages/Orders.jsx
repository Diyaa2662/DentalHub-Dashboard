import React, { useState } from "react";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react/button";
import {
  ShoppingCart,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const Orders = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Mock data for orders
  const ordersData = [
    {
      id: 1001,
      customer: "Dr. Sarah Johnson",
      amount: "$450",
      status: "Completed",
      date: "2024-01-15",
      items: 3,
    },
    {
      id: 1002,
      customer: "Dr. Michael Chen",
      amount: "$2,800",
      status: "Processing",
      date: "2024-01-14",
      items: 1,
    },
    {
      id: 1003,
      customer: "Dr. Emily Williams",
      amount: "$320",
      status: "Pending",
      date: "2024-01-14",
      items: 5,
    },
    {
      id: 1004,
      customer: "Dr. Robert Kim",
      amount: "$180",
      status: "Completed",
      date: "2024-01-13",
      items: 2,
    },
    {
      id: 1005,
      customer: "Dr. Lisa Martinez",
      amount: "$1,250",
      status: "Shipped",
      date: "2024-01-12",
      items: 4,
    },
    {
      id: 1006,
      customer: "Dr. James Wilson",
      amount: "$890",
      status: "Processing",
      date: "2024-01-12",
      items: 2,
    },
    {
      id: 1007,
      customer: "Dr. Maria Garcia",
      amount: "$1,450",
      status: "Completed",
      date: "2024-01-11",
      items: 3,
    },
    {
      id: 1008,
      customer: "Dr. David Brown",
      amount: "$560",
      status: "Pending",
      date: "2024-01-11",
      items: 1,
    },
  ];

  const statusFilters = [
    {
      id: "all",
      label: "All Orders",
      count: 45,
      icon: <ShoppingCart size={16} />,
    },
    { id: "pending", label: "Pending", count: 8, icon: <Clock size={16} /> },
    {
      id: "processing",
      label: "Processing",
      count: 12,
      icon: <Filter size={16} />,
    },
    {
      id: "completed",
      label: "Completed",
      count: 25,
      icon: <CheckCircle size={16} />,
    },
  ];

  const filteredOrders =
    selectedStatus === "all"
      ? ordersData
      : ordersData.filter(
          (order) => order.status.toLowerCase() === selectedStatus
        );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Orders Management
          </h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button
            text="Export Orders"
            icon="download"
            type="default"
            stylingMode="contained"
            className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200"
          />
        </div>
      </div>

      {/* Status Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusFilters.map((status) => (
          <button
            key={status.id}
            onClick={() => setSelectedStatus(status.id)}
            className={`
              p-4 rounded-xl border transition-all
              ${
                selectedStatus === status.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`
                  p-2 rounded-lg
                  ${
                    selectedStatus === status.id
                      ? "bg-primary-100"
                      : "bg-gray-100"
                  }
                `}
                >
                  <span
                    className={
                      selectedStatus === status.id
                        ? "text-primary-600"
                        : "text-gray-600"
                    }
                  >
                    {status.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{status.label}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {status.count}
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataGrid
          dataSource={filteredOrders}
          showBorders={true}
          columnAutoWidth={true}
          height={500}
        >
          <SearchPanel visible={true} placeholder="Search orders..." />
          <Paging defaultPageSize={10} />
          <Pager
            showPageSizeSelector={true}
            allowedPageSizes={[5, 10, 20]}
            showInfo={true}
          />

          <Column dataField="id" caption="Order ID" width={100} />
          <Column dataField="customer" caption="Customer" />
          <Column dataField="amount" caption="Amount" />
          <Column dataField="items" caption="Items" width={80} />
          <Column
            dataField="status"
            caption="Status"
            cellRender={({ data }) => (
              <span
                className={`
                px-3 py-1 rounded-full text-xs font-medium inline-flex items-center
                ${
                  data.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : data.status === "Processing"
                    ? "bg-blue-100 text-blue-800"
                    : data.status === "Shipped"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              `}
              >
                {data.status === "Completed" && (
                  <CheckCircle size={12} className="mr-1" />
                )}
                {data.status === "Processing" && (
                  <Clock size={12} className="mr-1" />
                )}
                {data.status}
              </span>
            )}
          />
          <Column dataField="date" caption="Date" width={120} />
          <Column
            caption="Actions"
            width={100}
            cellRender={() => (
              <div className="flex space-x-2">
                <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                  <Eye size={16} />
                </button>
                <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                  <CheckCircle size={16} />
                </button>
              </div>
            )}
          />
        </DataGrid>
      </div>
    </div>
  );
};

export default Orders;
