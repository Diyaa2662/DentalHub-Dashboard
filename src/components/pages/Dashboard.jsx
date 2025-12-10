import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { DataGrid, Column } from "devextreme-react/data-grid";
import {
  Chart,
  Series,
  ArgumentAxis,
  CommonSeriesSettings,
  Export,
  Legend,
  Tooltip,
  Title,
  Grid,
} from "devextreme-react/chart";
import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  Star,
} from "lucide-react";
import StatCard from "../ui/StatCard";

const Dashboard = () => {
  const { t } = useLanguage();

  // Mock data for statistics
  const statsData = [
    {
      title: "totalRevenue",
      value: "$45,231.89",
      change: "+20.1%",
      icon: <DollarSign className="text-green-500" size={24} />,
      color: "bg-green-50",
      trend: "up",
    },
    {
      title: "totalProducts",
      value: "2,345",
      change: "+5.2%",
      icon: <Package className="text-blue-500" size={24} />,
      color: "bg-blue-50",
      trend: "up",
    },
    {
      title: "activeCustomers",
      value: "1,234",
      change: "+12.5%",
      icon: <Users className="text-purple-500" size={24} />,
      color: "bg-purple-50",
      trend: "up",
    },
    {
      title: "ordersToday",
      value: "45",
      change: "-2.3%",
      icon: <ShoppingCart className="text-orange-500" size={24} />,
      color: "bg-orange-50",
      trend: "down",
    },
  ];

  // Mock data for recent orders
  const ordersData = [
    {
      id: 1,
      customer: "Dr. Sarah Johnson",
      product: "Dental Drill Set",
      amount: "$450",
      status: "Completed",
      date: "2024-01-15",
    },
    {
      id: 2,
      customer: "Dr. Michael Chen",
      product: "X-Ray Machine",
      amount: "$2,800",
      status: "Processing",
      date: "2024-01-14",
    },
    {
      id: 3,
      customer: "Dr. Emily Williams",
      product: "Scaling Kit",
      amount: "$320",
      status: "Pending",
      date: "2024-01-14",
    },
    {
      id: 4,
      customer: "Dr. Robert Kim",
      product: "Impression Material",
      amount: "$180",
      status: "Completed",
      date: "2024-01-13",
    },
    {
      id: 5,
      customer: "Dr. Lisa Martinez",
      product: "Surgical Instruments",
      amount: "$1,250",
      status: "Shipped",
      date: "2024-01-12",
    },
  ];

  // Mock data for sales chart
  const salesData = [
    { month: "Jan", sales: 4000, orders: 240 },
    { month: "Feb", sales: 3000, orders: 139 },
    { month: "Mar", sales: 2000, orders: 980 },
    { month: "Apr", sales: 2780, orders: 390 },
    { month: "May", sales: 1890, orders: 480 },
    { month: "Jun", sales: 2390, orders: 380 },
    { month: "Jul", sales: 3490, orders: 430 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {t("overview", "dashboard")}
        </h1>
        <p className="text-gray-600">{t("welcomeBack", "dashboard")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            title={t(stat.title, "dashboard")}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Charts and Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t("salesOverview", "dashboard")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("monthlyRevenueOrders", "dashboard") ||
                  "Monthly revenue and orders"}
              </p>
            </div>
            <TrendingUp className="text-dental-blue" size={24} />
          </div>
          <Chart id="chart" dataSource={salesData} palette="Soft">
            <CommonSeriesSettings argumentField="month" />
            <Series valueField="sales" name={t("sales", "products") + " ($)"} />
            <Series valueField="orders" name={t("orders", "navigation")} />
            <ArgumentAxis>
              <Grid visible={true} />
            </ArgumentAxis>
            <Legend verticalAlignment="bottom" horizontalAlignment="center" />
            <Export enabled={true} />
            <Tooltip enabled={true} />
            <Title text={t("monthlyPerformance", "dashboard")} />
          </Chart>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t("recentOrders", "dashboard")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("latestCustomerPurchases", "dashboard") ||
                  "Latest customer purchases"}
              </p>
            </div>
            <ShoppingCart className="text-dental-purple" size={24} />
          </div>
          <DataGrid
            dataSource={ordersData}
            showBorders={true}
            columnAutoWidth={true}
            height={350}
          >
            <Column dataField="id" caption={t("id", "products")} width={60} />
            <Column
              dataField="customer"
              caption={t("customer", "navigation")}
            />
            <Column
              dataField="product"
              caption={t("product", "products") || "Product"}
            />
            <Column
              dataField="amount"
              caption={t("amount", "common") || "Amount"}
            />
            <Column
              dataField="status"
              caption={t("status", "common")}
              cellRender={({ data }) => (
                <span
                  className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${
                    data.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : data.status === "Processing"
                      ? "bg-yellow-100 text-yellow-800"
                      : data.status === "Pending"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                  }
                `}
                >
                  {data.status === "Completed"
                    ? t("completed", "common")
                    : data.status === "Processing"
                    ? t("processing", "common") || "Processing"
                    : data.status === "Pending"
                    ? t("pending", "common")
                    : data.status}
                </span>
              )}
            />
          </DataGrid>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("topProducts", "dashboard")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("bestSellingEquipment", "dashboard") ||
                "Best selling dental equipment"}
            </p>
          </div>
          <Star className="text-dental-teal" size={24} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  {t("product", "products") || "Product"}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  {t("category", "products")}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  {t("price", "products")}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  {t("stock", "products")}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  {t("sales", "products")}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  {t("rating", "products")}
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  product: "Advanced Dental Chair",
                  category: "Equipment",
                  price: "$4,500",
                  stock: 12,
                  sales: 45,
                  rating: 4.8,
                },
                {
                  product: "Portable X-Ray Unit",
                  category: "Imaging",
                  price: "$2,800",
                  stock: 8,
                  sales: 32,
                  rating: 4.7,
                },
                {
                  product: "Surgical Instrument Set",
                  category: "Surgical",
                  price: "$1,200",
                  stock: 25,
                  sales: 78,
                  rating: 4.9,
                },
                {
                  product: "Digital Impressions Scanner",
                  category: "Digital",
                  price: "$3,500",
                  stock: 5,
                  sales: 18,
                  rating: 4.6,
                },
                {
                  product: "Autoclave Sterilizer",
                  category: "Sterilization",
                  price: "$950",
                  stock: 15,
                  sales: 56,
                  rating: 4.5,
                },
              ].map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">{item.product}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{item.price}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`
                      px-2 py-1 rounded text-sm
                      ${
                        item.stock > 10
                          ? "bg-green-100 text-green-800"
                          : item.stock > 5
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    `}
                    >
                      {item.stock} {t("units", "products") || "units"}
                    </span>
                  </td>
                  <td className="py-3 px-4">{item.sales}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Star
                        size={16}
                        className="text-yellow-500 fill-current"
                      />
                      <span className="ml-1">{item.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
