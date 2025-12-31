import React, { useState, useEffect } from "react";
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
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserPlus,
  AlertCircle,
  RefreshCw,
  Ban,
} from "lucide-react";

const Customers = () => {
  const { t } = useLanguage();

  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ بيانات ثابتة للإحصائيات والتوب كاستومرز
  const statsData = {
    totalCustomers: "1,234",
    avgOrderValue: "$845",
    fromLastMonth: "+12.5%",
    avgOrderGrowth: "+5.3%",
  };

  // const topCustomersData = [
  //   {
  //     rank: 1,
  //     name: "Dr. Michael Chen",
  //     spent: "$12,800",
  //     orders: 8,
  //     growth: "+24%",
  //   },
  //   {
  //     rank: 2,
  //     name: "Dr. Lisa Martinez",
  //     spent: "$9,250",
  //     orders: 18,
  //     growth: "+18%",
  //   },
  //   {
  //     rank: 3,
  //     name: "Dr. Sarah Johnson",
  //     spent: "$8,450",
  //     orders: 15,
  //     growth: "+15%",
  //   },
  //   {
  //     rank: 4,
  //     name: "Dr. Maria Garcia",
  //     spent: "$7,450",
  //     orders: 14,
  //     growth: "+12%",
  //   },
  //   {
  //     rank: 5,
  //     name: "Dr. Emily Williams",
  //     spent: "$5,320",
  //     orders: 23,
  //     growth: "+8%",
  //   },
  // ];

  // ✅ جلب بيانات الزبائن من API
  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/customers");

      // ✅ استخراج البيانات من هيكل الاستجابة المبسط
      const apiData = response.data?.data;

      if (Array.isArray(apiData)) {
        if (apiData.length === 0) {
          // ✅ لا يوجد زبائن
          setCustomersData([]);
        } else {
          // ✅ تحويل البيانات للتنسيق المناسب
          const formattedData = apiData.map((customer) => {
            // ✅ التأكد من وجود البيانات الأساسية
            const customerId = customer.id || customer.customer_id;
            const customerName =
              customer.name ||
              customer.full_name ||
              customer.email ||
              `Customer #${customerId}`;

            // ✅ حساب إجمالي الطلبات والمصروفات (إذا لم تكن موجودة)
            const ordersCount =
              customer.orders_count || customer.total_orders || 0;

            // ✅ معالجة إجمالي المصروفات
            let totalSpent = "$0.00";
            if (customer.total_spent !== undefined) {
              const spentValue = parseFloat(customer.total_spent);
              totalSpent = isNaN(spentValue)
                ? "$0.00"
                : `$${spentValue.toFixed(2)}`;
            }

            // ✅ معالجة تاريخ الانضمام
            const joinDate =
              customer.join_date ||
              customer.created_at ||
              customer.registration_date ||
              "";

            return {
              id: customerId,
              name: customerName,
              email: customer.email || "",
              phone: customer.phone || customer.phone_number || "",
              location:
                customer.location ||
                customer.address ||
                customer.city ||
                t("notSpecified", "customers"),
              orders: ordersCount,
              totalSpent: totalSpent,
              joinDate: joinDate,
            };
          });

          setCustomersData(formattedData);
        }
      } else {
        // ✅ حالة عدم وجود بيانات أو تنسيق غير صحيح
        setError(
          t("invalidDataFormat", "customers") ||
            "No customer data found or invalid data format"
        );
        setCustomersData([]);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("failedToLoadCustomers", "customers") ||
          "Failed to load customers"
      );
      setCustomersData([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ دالة إعادة التحميل
  const handleRefresh = () => {
    fetchCustomers();
  };

  // ✅ دالة حظر الزبون (مؤقتة - سترتبط بالـAPI لاحقاً)
  const handleBlockCustomer = (id, name) => {
    if (
      window.confirm(`${t("confirmBlockCustomer", "customers")} "${name}"?`)
    ) {
      // ⏳ سيتم ربطها بالـAPI لاحقاً
      alert(`${t("customerBlocked", "customers")}: ${name}`);
    }
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("customersManagement", "customers")}
            </h1>
            <p className="text-gray-600">
              {t("manageDentalProfessionals", "customers")}
            </p>
          </div>
        </div>

        {/* الإحصائيات (تظهر أثناء التحميل) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t("totalCustomers", "customers")}
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {statsData.totalCustomers}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="text-dental-blue" size={24} />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              ↑ {statsData.fromLastMonth} {t("fromLastMonth", "orders")}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t("avgOrderValue", "orders")}
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {statsData.avgOrderValue}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Calendar className="text-purple-500" size={24} />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              ↑ {statsData.avgOrderGrowth} {t("fromLastMonth", "orders")}
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue mx-auto mb-4"></div>
            <p className="text-gray-600">
              {t("loadingCustomers", "customers") || "Loading customers..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("customersManagement", "customers")}
            </h1>
            <p className="text-gray-600">
              {t("manageDentalProfessionals", "customers")}
            </p>
          </div>
        </div>

        {/* الإحصائيات (تظهر حتى عند الخطأ) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t("totalCustomers", "customers")}
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {statsData.totalCustomers}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="text-dental-blue" size={24} />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              ↑ {statsData.fromLastMonth} {t("fromLastMonth", "orders")}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t("avgOrderValue", "orders")}
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {statsData.avgOrderValue}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Calendar className="text-purple-500" size={24} />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              ↑ {statsData.avgOrderGrowth} {t("fromLastMonth", "orders")}
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <div>
              <h3 className="font-bold text-red-800">
                {t("errorLoadingCustomers", "customers") ||
                  "Error Loading Customers"}
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
            {t("customersManagement", "customers")}
          </h1>
          <p className="text-gray-600">
            {t("manageDentalProfessionals", "customers")}
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
            title={t("refresh", "common") || "Refresh"}
          >
            <RefreshCw size={18} />
            <span>{t("refresh", "common") || "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Customer Stats - بيانات ثابتة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalCustomers", "customers")}
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {statsData.totalCustomers}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="text-dental-blue" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ {statsData.fromLastMonth} {t("fromLastMonth", "orders")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("avgOrderValue", "orders")}
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {statsData.avgOrderValue}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="text-purple-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ {statsData.avgOrderGrowth} {t("fromLastMonth", "orders")}
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {customersData.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {t("noCustomersYet", "customers") || "No Customers Yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("startByAddingCustomers", "customers") ||
                "Start by adding customers to your system"}
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition inline-flex items-center space-x-2"
            >
              <RefreshCw size={18} />
              <span>{t("refresh", "common") || "Refresh"}</span>
            </button>
          </div>
        ) : (
          <DataGrid
            dataSource={customersData}
            showBorders={true}
            columnAutoWidth={true}
            height={500}
            allowColumnResizing={true}
            allowColumnReordering={true}
            columnResizingMode="widget"
            showColumnLines={true}
            showRowLines={true}
            rowAlternationEnabled={true}
          >
            <HeaderFilter visible={true} />
            <SearchPanel
              visible={true}
              placeholder={t("searchCustomers", "customers")}
            />
            <GroupPanel
              visible={true}
              emptyPanelText={
                t("dragColumnHereToGroup", "common") ||
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

            <Column
              dataField="id"
              caption={t("id", "products")}
              width={"auto"}
              alignment="left"
              allowHeaderFiltering={true}
              allowFiltering={true}
            />

            <Column
              dataField="name"
              caption={t("name", "customers")}
              width={"auto"}
              alignment="left"
              allowHeaderFiltering={true}
              allowFiltering={true}
              allowGrouping={true}
            />

            <Column
              dataField="email"
              caption={t("email", "common")}
              width={"auto"}
              alignment="left"
              allowHeaderFiltering={true}
              allowFiltering={true}
              cellRender={({ data }) => (
                <div className="flex items-center">
                  <Mail size={14} className="mr-2 text-gray-400" />
                  {data.email || t("notSpecified", "customers")}
                </div>
              )}
            />

            <Column
              dataField="phone"
              caption={t("phone", "customers")}
              width={"auto"}
              alignment="left"
              allowHeaderFiltering={true}
              allowFiltering={true}
              cellRender={({ data }) => (
                <div className="flex items-center">
                  <Phone size={14} className="mr-2 text-gray-400" />
                  {data.phone || t("notSpecified", "customers")}
                </div>
              )}
            />

            <Column
              dataField="location"
              caption={t("location", "customers")}
              width={"auto"}
              alignment="left"
              allowHeaderFiltering={true}
              allowFiltering={true}
              allowGrouping={true}
              cellRender={({ data }) => (
                <div className="flex items-center">
                  <MapPin size={14} className="mr-2 text-gray-400" />
                  {data.location || t("notSpecified", "customers")}
                </div>
              )}
            />

            <Column
              dataField="orders"
              caption={t("orders", "navigation")}
              width={"auto"}
              alignment="left"
              allowHeaderFiltering={true}
              allowFiltering={true}
              allowGrouping={true}
            />

            <Column
              dataField="totalSpent"
              caption={t("totalSpent", "customers")}
              width={"auto"}
              alignment="left"
              allowHeaderFiltering={true}
              allowFiltering={true}
              allowGrouping={true}
            />

            <Column
              dataField="joinDate"
              caption={t("joinDate", "customers")}
              width={"auto"}
              alignment="left"
              dataType="date"
              format="yyyy-MM-dd"
              allowHeaderFiltering={true}
              allowFiltering={true}
              allowGrouping={true}
            />

            {/* ✅ عمود Actions مع زر الحظر */}
            <Column
              caption={t("actions", "customers") || "Actions"}
              width={100}
              alignment="center"
              cellRender={({ data }) => (
                <div className="flex items-center justify-center">
                  <button
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                    title={t("blockCustomer", "customers") || "Block Customer"}
                    onClick={() => handleBlockCustomer(data.id, data.name)}
                  >
                    <Ban size={18} />
                  </button>
                </div>
              )}
            />
          </DataGrid>
        )}
      </div>

      {/* Top Customers - بيانات ثابتة */}
      {/* <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("topCustomers", "customers")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("highestSpendingCustomers", "customers")}
            </p>
          </div>
          <Users className="text-dental-teal" size={24} />
        </div>

        <div className="space-y-4">
          {topCustomersData.map((customer) => (
            <div
              key={customer.rank}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    customer.rank === 1
                      ? "bg-yellow-500"
                      : customer.rank === 2
                      ? "bg-gray-400"
                      : customer.rank === 3
                      ? "bg-amber-700"
                      : "bg-gray-300"
                  }`}
                >
                  {customer.rank}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{customer.name}</p>
                  <p className="text-sm text-gray-600">
                    {customer.orders} {t("orders", "navigation").toLowerCase()}{" "}
                    • {t("total", "customers")}: {customer.spent}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">{customer.growth}</p>
                <p className="text-sm text-gray-600">
                  {t("growth", "customers")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default Customers;
