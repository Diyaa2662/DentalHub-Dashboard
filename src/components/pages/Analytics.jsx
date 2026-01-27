/* eslint-disable no-case-declarations */
import React, { useState, useEffect } from "react";
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
  Activity,
  Calendar,
} from "lucide-react";
import api from "../../services/api";
import SelectBox from "devextreme-react/select-box";

const Analytics = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("month");
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );

    return {
      from: firstDayOfMonth.toISOString().split("T")[0],
      to: lastDayOfMonth.toISOString().split("T")[0],
    };
  });

  // State for API data
  const [topCardsData, setTopCardsData] = useState({});
  const [monthlyProfitData, setMonthlyProfitData] = useState([]);
  const [productCategoriesData, setProductCategoriesData] = useState({
    data: [],
    total_number_of_products: 0,
  });

  // Time periods for selector
  const timePeriods = [
    { id: "today", label: t("today", "analytics") },
    { id: "week", label: t("thisWeek", "analytics") },
    { id: "month", label: t("thisMonth", "analytics") },
    { id: "quarter", label: t("thisQuarter", "analytics") },
    { id: "year", label: t("thisYear", "analytics") },
    { id: "custom", label: t("customRange", "analytics") },
  ];

  // Available years for selection
  const availableYears = [2022, 2023, 2024, 2025, 2026];

  // Helper functions for API calls
  const fetchTopCardsData = async (dateRange) => {
    try {
      const response = await api.post("/topcards", dateRange);
      return response.data;
    } catch (error) {
      console.error("Error fetching top cards data:", error);
      throw error;
    }
  };

  const fetchMonthlyProfitData = async (year) => {
    try {
      const response = await api.post("/monthlyprofit", { year });
      return response.data;
    } catch (error) {
      console.error("Error fetching monthly profit data:", error);
      throw error;
    }
  };

  const fetchProductCategoriesData = async () => {
    try {
      const response = await api.get("/productspercategory");
      return response.data;
    } catch (error) {
      console.error("Error fetching product categories data:", error);
      throw error;
    }
  };

  // Fetch all analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [topCards, monthlyProfit, productCategories] = await Promise.all([
          fetchTopCardsData(dateRange),
          fetchMonthlyProfitData(selectedYear),
          fetchProductCategoriesData(),
        ]);

        setTopCardsData(topCards || {});
        setMonthlyProfitData(monthlyProfit?.monthly_profit || []);
        setProductCategoriesData(
          productCategories || { data: [], total_number_of_products: 0 },
        );
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedYear, dateRange]);

  const handleYearChange = (e) => {
    setSelectedYear(e.value);
  };

  const handleTimePeriodChange = (periodId) => {
    setSelectedTimePeriod(periodId);

    const today = new Date();
    let fromDate, toDate;

    switch (periodId) {
      case "today":
        fromDate = today.toISOString().split("T")[0];
        toDate = today.toISOString().split("T")[0];
        break;
      case "week":
        // الأسبوع الحالي من الأحد إلى السبت
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // الأحد
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // السبت
        fromDate = startOfWeek.toISOString().split("T")[0];
        toDate = endOfWeek.toISOString().split("T")[0];
        break;
      case "month":
        // الشهر الحالي من الأول إلى الأخير
        const firstDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );
        const lastDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
        );
        fromDate = firstDayOfMonth.toISOString().split("T")[0];
        toDate = lastDayOfMonth.toISOString().split("T")[0];
        break;
      case "quarter":
        // الربع الحالي
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const quarterStartMonth = currentQuarter * 3;
        const quarterEndMonth = quarterStartMonth + 2;
        const firstDayOfQuarter = new Date(
          today.getFullYear(),
          quarterStartMonth,
          1,
        );
        const lastDayOfQuarter = new Date(
          today.getFullYear(),
          quarterEndMonth + 1,
          0,
        );
        fromDate = firstDayOfQuarter.toISOString().split("T")[0];
        toDate = lastDayOfQuarter.toISOString().split("T")[0];
        break;
      case "year":
        // السنة الحالية من الأول من يناير إلى آخر ديسمبر
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
        fromDate = firstDayOfYear.toISOString().split("T")[0];
        toDate = lastDayOfYear.toISOString().split("T")[0];
        break;
      case "custom":
        // For custom range, keep existing dates or set to last 30 days
        if (!dateRange.from || !dateRange.to) {
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          fromDate = thirtyDaysAgo.toISOString().split("T")[0];
          toDate = today.toISOString().split("T")[0];
          setDateRange({ from: fromDate, to: toDate });
        }
        return;
      default:
        // Default to current month
        const defaultFirstDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );
        const defaultLastDay = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
        );
        fromDate = defaultFirstDay.toISOString().split("T")[0];
        toDate = defaultLastDay.toISOString().split("T")[0];
    }

    setDateRange({ from: fromDate, to: toDate });
  };

  // Calculate conversion rate
  const calculateConversionRate = () => {
    const totalCustomers = topCardsData["number of customers"] || 0;
    const payingCustomers = topCardsData["number of paying customers"] || 0;

    if (totalCustomers === 0) return 0;
    return Math.round((payingCustomers / totalCustomers) * 100);
  };

  // Format monthly profit data for chart
  const formatMonthlyProfitData = () => {
    if (!monthlyProfitData || monthlyProfitData.length === 0) return [];

    const monthNames = [
      t("jan", "analytics"),
      t("feb", "analytics"),
      t("mar", "analytics"),
      t("apr", "analytics"),
      t("may", "analytics"),
      t("jun", "analytics"),
      t("jul", "analytics"),
      t("aug", "analytics"),
      t("sep", "analytics"),
      t("oct", "analytics"),
      t("nov", "analytics"),
      t("dec", "analytics"),
    ];

    return monthlyProfitData.map((item) => ({
      month: monthNames[item.month - 1] || `Month ${item.month}`,
      revenue: item.total_revanue || 0,
      profit: item.total_profit || 0,
    }));
  };

  // Format product categories data for pie chart
  const formatProductCategoriesData = () => {
    if (!productCategoriesData.data || productCategoriesData.data.length === 0)
      return [];

    const colors = [
      "#3b82f6",
      "#8b5cf6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#06b6d4",
      "#84cc16",
    ];

    return productCategoriesData.data
      .filter((item) => item.number_of_products > 0)
      .map((item, index) => {
        const percentage =
          productCategoriesData.total_number_of_products > 0
            ? Math.round(
                (item.number_of_products /
                  productCategoriesData.total_number_of_products) *
                  100,
              )
            : 0;

        return {
          category: item.category || `Category ${index + 1}`,
          value: percentage,
          color: colors[index % colors.length],
          count: item.number_of_products,
        };
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-dental-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600">
          {t("loading", "common") || "Loading analytics data..."}
        </p>
      </div>
    );
  }

  const formattedMonthlyData = formatMonthlyProfitData();
  const formattedCategoriesData = formatProductCategoriesData();
  const conversionRate = calculateConversionRate();

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
                {t("totalRevenue", "analytics")}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                ${(topCardsData["Total Revanue"] || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="text-dental-blue" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalProfit", "analytics")}
              </p>
              <p
                className={`text-2xl font-bold ${(topCardsData["Total Profit"] || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                ${(topCardsData["Total Profit"] || 0).toLocaleString()}
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
                {t("totalCustomerOrders", "analytics")}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {topCardsData["Total Customer Orders"] || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Package className="text-purple-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("productsSold", "analytics")}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {topCardsData["Products Sold"] || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Users className="text-orange-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("newUsers", "analytics")}
            </h3>
            <Users className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {topCardsData["New Users"] || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("numberOfCustomers", "analytics")}
            </h3>
            <Users className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {topCardsData["number of customers"] || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              {t("payingCustomers", "analytics")}
            </h3>
            <Users className="text-purple-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {topCardsData["number of paying customers"] || 0}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profit Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t("revenueProfit", "analytics")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("monthlyRevenueTrends", "analytics")}
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
                  {t("selectYear", "common")}
                </label>
              </div>
              <BarChart3 className="text-dental-blue" size={24} />
            </div>
          </div>
          {formattedMonthlyData.length > 0 ? (
            <Chart
              id="revenueChart"
              dataSource={formattedMonthlyData}
              palette="Soft Pastel"
            >
              <CommonSeriesSettings argumentField="month" type="line" />
              <Series
                valueField="revenue"
                name={t("revenue", "analytics") + " ($)"}
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
              <Title
                text={`${t("monthlyRevenueTrends", "analytics")} - ${selectedYear}`}
              />
            </Chart>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              {t("noDataAvailable", "common") || "No data available"}
            </div>
          )}
        </div>

        {/* Product Categories Pie Chart */}
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
          {formattedCategoriesData.length > 0 ? (
            <>
              <PieChart
                id="pieChart"
                dataSource={formattedCategoriesData}
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
                <Tooltip
                  enabled={true}
                  customizeTooltip={(e) => {
                    return {
                      text: `${e.argument}: ${e.valueText}% (${e.point.data.count} products)`,
                    };
                  }}
                />
              </PieChart>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {formattedCategoriesData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-medium truncate">
                        {item.category}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.value}% ({item.count} {t("units", "dashboard")})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              {t("noDataAvailable", "common") || "No data available"}
            </div>
          )}
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("conversionRate", "analytics")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("visitorToCustomer", "analytics")}
            </p>
          </div>
          <Activity className="text-dental-blue" size={24} />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center mb-6 md:mb-0">
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
                  strokeDashoffset={`${3.14 * 56 * 2 * (1 - conversionRate / 100)}`}
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-2xl font-bold text-gray-800">
                  {conversionRate}%
                </span>
                <p className="text-sm text-gray-600">
                  {t("conversion", "analytics")}
                </p>
              </div>
            </div>
          </div>
          <div className="md:ml-8">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {t("numberOfCustomers", "analytics")}
              </p>
              <p className="text-xl font-bold text-gray-800">
                {topCardsData["number of customers"] || 0}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {t("payingCustomers", "analytics")}
              </p>
              <p className="text-xl font-bold text-gray-800">
                {topCardsData["number of paying customers"] || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {t("conversionRate", "analytics")}
              </p>
              <p className="text-xl font-bold text-gray-800">
                {conversionRate}%
              </p>
            </div>
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
          {timePeriods.map((period) => (
            <button
              key={period.id}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                selectedTimePeriod === period.id
                  ? "bg-dental-blue text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => handleTimePeriodChange(period.id)}
            >
              {period.label}
            </button>
          ))}
        </div>
        {selectedTimePeriod === "custom" && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange({ ...dateRange, from: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange({ ...dateRange, to: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-600">
          {t("currentPeriod", "analytics")}: {dateRange.from} to {dateRange.to}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
