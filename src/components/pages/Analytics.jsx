import React, { useMemo } from "react";
import {
  Chart,
  Series,
  ArgumentAxis,
  ValueAxis,
  CommonSeriesSettings,
  Export,
  Legend,
  Tooltip,
  Title,
  Grid,
} from "devextreme-react/chart";
import {
  PieChart,
  Series as PieSeries,
  Label,
  Connector,
} from "devextreme-react/pie-chart";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  MapPin,
} from "lucide-react";

const Analytics = () => {
  // استخدام useMemo لتوليد البيانات مرة واحدة
  const growthData = useMemo(() => {
    return [
      { location: "New York", orders: 125, revenue: 45000, growth: 15 },
      { location: "Los Angeles", orders: 98, revenue: 38000, growth: 12 },
      { location: "Chicago", orders: 87, revenue: 32000, growth: 18 },
      { location: "Houston", orders: 76, revenue: 28000, growth: 8 },
      { location: "Miami", orders: 65, revenue: 24000, growth: 22 },
    ];
  }, []);

  // Mock data for revenue chart
  const revenueData = [
    { month: "Jan", revenue: 12000, profit: 8000 },
    { month: "Feb", revenue: 15000, profit: 10000 },
    { month: "Mar", revenue: 18000, profit: 12000 },
    { month: "Apr", revenue: 14000, profit: 9000 },
    { month: "May", revenue: 22000, profit: 15000 },
    { month: "Jun", revenue: 25000, profit: 17000 },
    { month: "Jul", revenue: 28000, profit: 19000 },
  ];

  // Mock data for product categories
  const categoryData = [
    { category: "Equipment", value: 35, color: "#3b82f6" },
    { category: "Imaging", value: 25, color: "#8b5cf6" },
    { category: "Surgical", value: 20, color: "#10b981" },
    { category: "Restorative", value: 15, color: "#f59e0b" },
    { category: "Hygiene", value: 5, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Analytics & Reports
        </h1>
        <p className="text-gray-600">
          Detailed insights and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">$156,000</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="text-dental-blue" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ 18.5% from last quarter
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Customers</p>
              <p className="text-2xl font-bold text-gray-800">245</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ 12.3% from last quarter
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Products Sold</p>
              <p className="text-2xl font-bold text-gray-800">1,845</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Package className="text-purple-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ 8.7% from last quarter
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-800">$845</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="text-orange-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ 5.3% from last quarter
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Revenue & Profit
              </h3>
              <p className="text-sm text-gray-600">Monthly performance</p>
            </div>
            <BarChart3 className="text-dental-blue" size={24} />
          </div>
          <Chart
            id="revenueChart"
            dataSource={revenueData}
            palette="Soft Pastel"
          >
            <CommonSeriesSettings argumentField="month" type="spline" />
            <Series valueField="revenue" name="Revenue" />
            <Series valueField="profit" name="Profit" />
            <ArgumentAxis>
              <Grid visible={true} />
            </ArgumentAxis>
            <ValueAxis>
              <Grid visible={true} />
            </ValueAxis>
            <Legend verticalAlignment="bottom" horizontalAlignment="center" />
            <Tooltip enabled={true} />
            <Title text="Monthly Revenue Trends" />
          </Chart>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Product Categories
              </h3>
              <p className="text-sm text-gray-600">Sales distribution</p>
            </div>
            <Package className="text-dental-purple" size={24} />
          </div>
          <PieChart
            id="pieChart"
            dataSource={categoryData}
            palette="Bright"
            size={{
              width: 400,
              height: 300,
            }}
          >
            <PieSeries
              argumentField="category"
              valueField="value"
              type="doughnut"
            >
              <Label visible={true}>
                <Connector visible={true} />
              </Label>
            </PieSeries>
            <Legend visible={false} />
            <Tooltip enabled={true} />
          </PieChart>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Top Locations
            </h3>
            <p className="text-sm text-gray-600">Orders by region</p>
          </div>
          <MapPin className="text-dental-teal" size={24} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Location
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Orders
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Revenue
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Avg. Order Value
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {growthData.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <MapPin size={16} className="text-gray-400 mr-2" />
                      {item.location}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{item.orders}</td>
                  <td className="py-3 px-4 font-medium text-green-600">
                    ${item.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    ${Math.round(item.revenue / item.orders).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-green-600 font-medium">
                      ↑ {item.growth}%
                    </span>
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

export default Analytics;
