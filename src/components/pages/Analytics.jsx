import React, { useMemo } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
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
  Activity,
  Calendar,
} from "lucide-react";

const Analytics = () => {
  const { t } = useLanguage();

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

  // بيانات الرسم البياني للإيرادات
  const revenueData = [
    { month: t("jan", "analytics") || "Jan", revenue: 12000, profit: 8000 },
    { month: t("feb", "analytics") || "Feb", revenue: 15000, profit: 10000 },
    { month: t("mar", "analytics") || "Mar", revenue: 18000, profit: 12000 },
    { month: t("apr", "analytics") || "Apr", revenue: 14000, profit: 9000 },
    { month: t("may", "analytics") || "May", revenue: 22000, profit: 15000 },
    { month: t("jun", "analytics") || "Jun", revenue: 25000, profit: 17000 },
    { month: t("jul", "analytics") || "Jul", revenue: 28000, profit: 19000 },
  ];

  // بيانات فئات المنتجات
  const categoryData = [
    { category: t("equipment", "products"), value: 35, color: "#3b82f6" },
    { category: t("imaging", "products"), value: 25, color: "#8b5cf6" },
    { category: t("surgical", "products"), value: 20, color: "#10b981" },
    { category: t("restorative", "products"), value: 15, color: "#f59e0b" },
    { category: t("hygiene", "products"), value: 5, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {t("analyticsReports", "analytics")}
        </h1>
        <p className="text-gray-600">
          {t("detailedInsightsMetrics", "analytics")}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalRevenue", "dashboard")}
              </p>
              <p className="text-2xl font-bold text-gray-800">$156,000</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="text-dental-blue" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ 18.5% {t("fromLastQuarter", "analytics")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("newCustomers", "analytics")}
              </p>
              <p className="text-2xl font-bold text-gray-800">245</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ 12.3% {t("fromLastQuarter", "analytics")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("productsSold", "analytics")}
              </p>
              <p className="text-2xl font-bold text-gray-800">1,845</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Package className="text-purple-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ 8.7% {t("fromLastQuarter", "analytics")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("avgOrderValue", "orders")}
              </p>
              <p className="text-2xl font-bold text-gray-800">$845</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="text-orange-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ 5.3% {t("fromLastQuarter", "analytics")}
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
                {t("revenueProfit", "analytics")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("monthlyPerformance", "dashboard")}
              </p>
            </div>
            <BarChart3 className="text-dental-blue" size={24} />
          </div>
          <Chart
            id="revenueChart"
            dataSource={revenueData}
            palette="Soft Pastel"
          >
            <CommonSeriesSettings argumentField="month" type="spline" />
            <Series
              valueField="revenue"
              name={t("revenue", "products") + " ($)"}
            />
            <Series
              valueField="profit"
              name={t("profit", "analytics") + " ($)"}
            />
            <ArgumentAxis>
              <Grid visible={true} />
            </ArgumentAxis>
            <ValueAxis>
              <Grid visible={true} />
            </ValueAxis>
            <Legend verticalAlignment="bottom" horizontalAlignment="center" />
            <Tooltip enabled={true} />
            <Title text={t("monthlyRevenueTrends", "analytics")} />
          </Chart>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t("productCategories", "analytics")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("salesDistribution", "analytics")}
              </p>
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
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="text-xs font-medium">{item.category}</p>
                  <p className="text-xs text-gray-600">{item.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("topLocations", "analytics")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("ordersByRegion", "analytics")}
            </p>
          </div>
          <MapPin className="text-dental-teal" size={24} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  {t("location", "customers")}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  {t("orders", "navigation")}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  {t("revenue", "products")}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  {t("avgOrderValue", "orders")}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  {t("growth", "customers")}
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
                    <div className="flex items-center">
                      <TrendingUp size={16} className="text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">
                        ↑ {item.growth}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("conversionRate", "analytics")}
            </h3>
            <Activity className="text-blue-500" size={20} />
          </div>
          <div className="text-center">
            <div className="inline-block relative">
              <svg className="w-32 h-32">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
                <circle
                  className="text-green-500"
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                  strokeDasharray={`${3.14 * 56 * 2}`}
                  strokeDashoffset={`${3.14 * 56 * 2 * (1 - 0.68)}`}
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-2xl font-bold text-gray-800">68%</span>
                <p className="text-sm text-gray-600">
                  {t("rate", "analytics")}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {t("visitorToCustomer", "analytics")}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("customerRetention", "analytics")}
            </h3>
            <Users className="text-purple-500" size={20} />
          </div>
          <div className="text-center">
            <div className="inline-block relative">
              <svg className="w-32 h-32">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
                <circle
                  className="text-purple-500"
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                  strokeDasharray={`${3.14 * 56 * 2}`}
                  strokeDashoffset={`${3.14 * 56 * 2 * (1 - 0.82)}`}
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-2xl font-bold text-gray-800">82%</span>
                <p className="text-sm text-gray-600">
                  {t("retention", "analytics")}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {t("repeatCustomers", "analytics")}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("inventoryTurnover", "analytics")}
            </h3>
            <Package className="text-orange-500" size={20} />
          </div>
          <div className="text-center">
            <div className="inline-block relative">
              <svg className="w-32 h-32">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
                <circle
                  className="text-orange-500"
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                  strokeDasharray={`${3.14 * 56 * 2}`}
                  strokeDashoffset={`${3.14 * 56 * 2 * (1 - 0.45)}`}
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-2xl font-bold text-gray-800">4.5x</span>
                <p className="text-sm text-gray-600">
                  {t("annual", "analytics")}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {t("stockRotation", "analytics")}
            </p>
          </div>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("timePeriod", "analytics")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("selectAnalysisPeriod", "analytics")}
            </p>
          </div>
          <Calendar className="text-dental-blue" size={24} />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "today", label: t("today", "analytics") },
            { id: "week", label: t("thisWeek", "analytics") },
            { id: "month", label: t("thisMonth", "analytics") },
            { id: "quarter", label: t("thisQuarter", "analytics") },
            { id: "year", label: t("thisYear", "analytics") },
            { id: "custom", label: t("customRange", "analytics") },
          ].map((period) => (
            <button
              key={period.id}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
