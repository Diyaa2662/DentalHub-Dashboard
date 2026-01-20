import React, { useState, useEffect } from "react";
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
  ValueAxis,
} from "devextreme-react/chart";
import SelectBox from "devextreme-react/select-box";
import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  Star,
} from "lucide-react";
import StatCard from "../ui/StatCard";
import api from "../../services/api";

const Dashboard = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears] = useState([2022, 2023, 2024, 2025, 2026]);

  // Helper functions for API calls
  const fetchStatsData = async (endpoint) => {
    try {
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  const fetchRecentOrders = async (endpoint) => {
    try {
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching recent orders:`, error);
      throw error;
    }
  };

  const fetchTopProducts = async (endpoint) => {
    try {
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching top products:`, error);
      throw error;
    }
  };

  const fetchSalesData = async (endpoint, yearData) => {
    try {
      const response = await api.post(endpoint, yearData);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sales data:`, error);
      throw error;
    }
  };

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch basic stats
        const [
          revenueResponse,
          productsResponse,
          customersResponse,
          ordersResponse,
        ] = await Promise.all([
          fetchStatsData("/totalrevanue"),
          fetchStatsData("/totalproducts"),
          fetchStatsData("/totalcustomers"),
          fetchStatsData("/orderstoday"),
        ]);

        // Format stats data based on actual API responses
        const formattedStats = [
          {
            title: t("totalRevenue", "dashboard"),
            value: `$${Number(
              revenueResponse.total_revanue || 0,
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            icon: <DollarSign className="text-green-500" size={24} />,
            color: "bg-green-50",
          },
          {
            title: t("totalProducts", "dashboard"),
            value: Number(productsResponse.data || 0).toLocaleString("en-US"),
            icon: <Package className="text-blue-500" size={24} />,
            color: "bg-blue-50",
          },
          {
            title: t("totalCustomers", "dashboard"),
            value: Number(
              customersResponse.total_customers || 0,
            ).toLocaleString("en-US"),
            icon: <Users className="text-purple-500" size={24} />,
            color: "bg-purple-50",
          },
          {
            title: t("ordersToday", "dashboard"),
            value: Number(
              ordersResponse.total_orders_today || 0,
            ).toLocaleString("en-US"),
            icon: <ShoppingCart className="text-orange-500" size={24} />,
            color: "bg-orange-50",
          },
        ];

        setStatsData(formattedStats);

        // Fetch recent orders
        const orders = await fetchRecentOrders("/fiverecentorders");
        setOrdersData(Array.isArray(orders.data) ? orders.data : []);

        // Fetch top products
        const products = await fetchTopProducts("/topproducts");
        setTopProducts(Array.isArray(products.data) ? products.data : []);

        // Fetch initial sales data for current year
        await fetchSalesOverview(selectedYear);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch sales data when year changes
  useEffect(() => {
    if (selectedYear) {
      fetchSalesOverview(selectedYear);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const fetchSalesOverview = async (year) => {
    try {
      const response = await fetchSalesData("/salestoorders", { year });
      // Convert month numbers to names
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const formattedData =
        response.monthly_revanue?.map((item) => ({
          month: monthNames[item.month - 1] || `Month ${item.month}`,
          sales: item.sales || 0,
          orders: item.orders || 0,
        })) || [];

      setSalesData(formattedData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setSalesData([]);
    }
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.value);
  };

  // Format recent orders data for the table
  const formatOrderData = (orders) => {
    return orders.map((order) => ({
      id: order.id,
      customer: order.user_name,
      product: `Order #${order.order_number}`,
      amount: `$${order.total_amount}`,
      status: order.status,
      date: order.order_date,
      items: order.number_of_items,
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-dental-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600">
          {t("loading", "common") || "Loading dashboard data..."}
        </p>
      </div>
    );
  }

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
          <div key={index}>
            <StatCard
              title={stat.title} // هنا نستخدم العنوان المترجم مباشرة
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </div>
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
                {t("monthlyRevenueOrders", "dashboard")}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <SelectBox
                  items={availableYears}
                  value={selectedYear}
                  onValueChanged={handleYearChange}
                  width={120}
                  searchEnabled={false}
                />
                <label className="text-xs text-gray-500 mt-1">
                  {t("selectYear", "dashboard") || "Select Year"}
                </label>
              </div>
              <TrendingUp className="text-dental-blue" size={24} />
            </div>
          </div>
          {salesData.length > 0 ? (
            <Chart id="chart" dataSource={salesData} palette="Soft">
              <CommonSeriesSettings argumentField="month" type="line" />
              <Series
                valueField="sales"
                name={t("sales", "products") + " ($)"}
                axis="sales"
              />
              <Series
                valueField="orders"
                name={t("orders", "navigation")}
                axis="orders"
              />
              <ArgumentAxis>
                <Grid visible={true} />
              </ArgumentAxis>
              <ValueAxis name="sales" position="left" />
              <ValueAxis name="orders" position="right" />
              <Legend
                verticalAlignment="bottom"
                horizontalAlignment="center"
                margin={{ bottom: 20 }}
              />
              <Export enabled={true} />
              <Tooltip
                enabled={true}
                shared={true}
                customizeTooltip={(e) => {
                  return {
                    text: `${e.seriesName}: ${e.valueText}`,
                  };
                }}
              />
              <Title
                text={`${t("monthlyPerformance", "dashboard")} - ${selectedYear}`}
              />
            </Chart>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              {t("noDataAvailable", "common") || "No data available"}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t("recentOrders", "dashboard")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("latestCustomerPurchases", "dashboard")}
              </p>
            </div>
            <ShoppingCart className="text-dental-purple" size={24} />
          </div>
          {ordersData.length > 0 ? (
            <DataGrid
              dataSource={formatOrderData(ordersData)}
              showBorders={true}
              columnAutoWidth={true}
              height={350}
            >
              <Column dataField="id" caption={t("id", "products")} width={60} />
              <Column
                dataField="customer"
                caption={t("customer", "dashboard") || "Customer"}
              />
              <Column
                dataField="product"
                caption={t("product", "dashboard") || "Product"}
                cellRender={({ data }) => (
                  <div>
                    <div>{data.product}</div>
                    <div className="text-xs text-gray-500">
                      {data.items} {t("items", "dashboard") || "items"}
                    </div>
                  </div>
                )}
              />
              <Column
                dataField="amount"
                caption={t("amount", "dashboard") || "Amount"}
              />
              <Column
                dataField="status"
                caption={t("status", "dashboard")}
                cellRender={({ data }) => {
                  const statusConfig = {
                    confirmed: {
                      className: "bg-green-100 text-green-800",
                      label: t("confirmed", "dashboard") || "Confirmed",
                    },
                    pending: {
                      className: "bg-yellow-100 text-yellow-800",
                      label: t("pending", "dashboard") || "Pending",
                    },
                    processing: {
                      className: "bg-blue-100 text-blue-800",
                      label: t("processing", "dashboard") || "Processing",
                    },
                    shipped: {
                      className: "bg-purple-100 text-purple-800",
                      label: t("shipped", "dashboard") || "Shipped",
                    },
                    completed: {
                      className: "bg-green-100 text-green-800",
                      label: t("completed", "dashboard") || "Completed",
                    },
                    cancelled: {
                      className: "bg-red-100 text-red-800",
                      label: t("cancelled", "dashboard") || "Cancelled",
                    },
                  };

                  const config = statusConfig[data.status.toLowerCase()] || {
                    className: "bg-gray-100 text-gray-800",
                    label: data.status,
                  };

                  return (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}
                    >
                      {config.label}
                    </span>
                  );
                }}
              />
            </DataGrid>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              {t("noOrdersFound", "dashboard") || "No orders found"}
            </div>
          )}
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
              {t("bestSellingEquipment", "dashboard")}
            </p>
          </div>
          <Star className="text-dental-teal" size={24} />
        </div>
        {topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    {t("product", "dashboard") || "Product"}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    {t("productId", "dashboard") || "Product ID"}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    {t("totalSold", "dashboard") || "Total Sold"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">{item.product_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                        #{item.product_id}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${
                          item.total_sold > 10
                            ? "bg-green-100 text-green-800"
                            : item.total_sold > 5
                              ? "bg-blue-100 text-blue-800"
                              : item.total_sold > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                        }
                      `}
                      >
                        {item.total_sold} {t("units", "dashboard") || "units"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 flex items-center justify-center text-gray-500">
            {t("noProductsFound", "dashboard") || "No products found"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
