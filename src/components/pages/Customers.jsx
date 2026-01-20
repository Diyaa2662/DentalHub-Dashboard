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
  AlertCircle,
  RefreshCw,
  Ban,
  Star,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Popup } from "devextreme-react/popup";

const Customers = () => {
  const { t } = useLanguage();

  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ إضافة حالة للإحصائيات الحقيقية
  const [statsData, setStatsData] = useState({
    totalCustomers: "0",
    avgOrderValue: "$0.00",
  });

  // حالة للتقييم الجديد
  const [ratingPopup, setRatingPopup] = useState({
    visible: false,
    customerId: null,
    customerName: "",
    currentRating: "",
    newRating: "",
  });

  // ✅ جلب بيانات الزبائن من API
  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ دالة لحساب الإحصائيات من البيانات الحقيقية
  const calculateStats = (customers) => {
    if (!customers || customers.length === 0) {
      return {
        totalCustomers: "0",
        avgOrderValue: "$0.00",
      };
    }

    try {
      // 1. حساب إجمالي الزبائن
      const totalCustomers = customers.length;

      // 2. حساب متوسط قيمة الطلب
      let totalSpent = 0;
      let totalOrders = 0;

      customers.forEach((customer) => {
        // استخراج قيمة المصروفات من تنسيق السلسلة "0.00"
        const spentValue = parseFloat(customer.total_spent) || 0;
        totalSpent += spentValue;

        // إجمالي الطلبات
        const orders = parseInt(customer.orders_count) || 0;
        totalOrders += orders;
      });

      // حساب متوسط قيمة الطلب (إجمالي المصروفات ÷ إجمالي الطلبات)
      const avgOrderValue =
        totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : 0;

      return {
        totalCustomers: totalCustomers.toLocaleString(),
        avgOrderValue: `$${avgOrderValue}`,
      };
    } catch (err) {
      console.error("Error calculating stats:", err);
      return {
        totalCustomers: customers.length.toLocaleString(),
        avgOrderValue: "$0.00",
      };
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/customers");

      // ✅ استخراج البيانات من هيكل الاستجابة
      const apiData = response.data?.data;

      if (Array.isArray(apiData)) {
        if (apiData.length === 0) {
          // ✅ لا يوجد زبائن
          setCustomersData([]);
          setStatsData({
            totalCustomers: "0",
            avgOrderValue: "$0.00",
          });
        } else {
          // ✅ استخدام البيانات كما هي من API بدون تحويل تنسيق المصروفات
          const formattedData = apiData.map((customer) => {
            return {
              id: customer.id,
              name: customer.name,
              email: customer.email || "",
              phone: customer.phone || "",
              address: customer.address || t("notSpecified", "customers"),
              orders_count: customer.orders_count || 0,
              total_spent: customer.total_spent || "0.00", // حفظ كسلسلة نصية
              join_date: customer.join_date,
              rate: customer.rate || "0.00",
              status: customer.status || "active", // إضافة الحالة
              type: customer.type,
              roles: customer.roles,
            };
          });

          setCustomersData(formattedData);

          // ✅ حساب الإحصائيات من البيانات الحقيقية
          const calculatedStats = calculateStats(apiData); // استخدام apiData الأصلية
          setStatsData(calculatedStats);
        }
      } else {
        // ✅ حالة عدم وجود بيانات أو تنسيق غير صحيح
        setError(
          t("invalidDataFormat", "customers") ||
            "No customer data found or invalid data format",
        );
        setCustomersData([]);
        setStatsData({
          totalCustomers: "0",
          avgOrderValue: "$0.00",
        });
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          t("failedToLoadCustomers", "customers") ||
          "Failed to load customers",
      );
      setCustomersData([]);
      setStatsData({
        totalCustomers: "0",
        avgOrderValue: "$0.00",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ دالة إعادة التحميل
  const handleRefresh = () => {
    fetchCustomers();
  };

  // ✅ دالة حظر الزبون - متصلة بالـAPI
  const handleBlockCustomer = async (id, name) => {
    if (
      window.confirm(`${t("confirmBlockCustomer", "customers")} "${name}"?`)
    ) {
      try {
        // ✅ ربط مع API حظر المستخدم
        await api.post(`/banuser/${id}`);

        // تحديث الواجهة بعد الحظر
        setCustomersData((prevData) =>
          prevData.map((customer) =>
            customer.id === id ? { ...customer, status: "blocked" } : customer,
          ),
        );

        alert(`${t("customerBlocked", "customers")}: ${name}`);
      } catch (err) {
        console.error("Error blocking customer:", err);
        alert(
          t("failedToBlockCustomer", "customers") ||
            "Failed to block customer: " +
              (err.response?.data?.message || err.message),
        );
      }
    }
  };

  // ✅ دالة فك حظر الزبون - متصلة بالـAPI
  const handleUnblockCustomer = async (id, name) => {
    if (
      window.confirm(`${t("confirmUnblockCustomer", "customers")} "${name}"?`)
    ) {
      try {
        // ✅ ربط مع API فك حظر المستخدم
        await api.post(`/unbanuser/${id}`);

        // تحديث الواجهة بعد فك الحظر
        setCustomersData((prevData) =>
          prevData.map((customer) =>
            customer.id === id ? { ...customer, status: "active" } : customer,
          ),
        );

        alert(`${t("customerUnblocked", "customers")}: ${name}`);
      } catch (err) {
        console.error("Error unblocking customer:", err);
        alert(
          t("failedToUnblockCustomer", "customers") ||
            "Failed to unblock customer: " +
              (err.response?.data?.message || err.message),
        );
      }
    }
  };

  // ✅ دالة لتحديد حالة الحظر واختيار الإجراء المناسب
  const handleBlockAction = (customer) => {
    if (customer.status === "blocked") {
      handleUnblockCustomer(customer.id, customer.name);
    } else {
      handleBlockCustomer(customer.id, customer.name);
    }
  };

  // ✅ فتح بوب اب تعديل التقييم
  const openRatingPopup = (customer) => {
    setRatingPopup({
      visible: true,
      customerId: customer.id,
      customerName: customer.name,
      currentRating: customer.rate || "0.00",
      newRating: customer.rate || "0.00",
    });
  };

  // ✅ إغلاق بوب اب التقييم
  const closeRatingPopup = () => {
    setRatingPopup({
      visible: false,
      customerId: null,
      customerName: "",
      currentRating: "",
      newRating: "",
    });
  };

  // ✅ تغيير قيمة التقييم
  const handleRatingChange = (value) => {
    // التأكد من أن القيمة بين 0 و 5
    let ratingValue = parseFloat(value);
    if (isNaN(ratingValue)) ratingValue = 0;
    if (ratingValue < 0) ratingValue = 0;
    if (ratingValue > 5) ratingValue = 5;

    setRatingPopup({
      ...ratingPopup,
      newRating: ratingValue.toFixed(2),
    });
  };

  // ✅ حفظ التقييم الجديد
  const saveRating = async () => {
    if (!ratingPopup.customerId) return;

    try {
      const response = await api.post(`/updaterate/${ratingPopup.customerId}`, {
        rate: parseFloat(ratingPopup.newRating),
      });

      if (response.status === 200) {
        // تحديث البيانات المحلية
        setCustomersData((prevData) =>
          prevData.map((customer) =>
            customer.id === ratingPopup.customerId
              ? { ...customer, rate: ratingPopup.newRating }
              : customer,
          ),
        );

        // إعادة حساب الإحصائيات بعد التحديث
        const updatedStats = calculateStats(
          customersData.map((customer) =>
            customer.id === ratingPopup.customerId
              ? { ...customer, rate: ratingPopup.newRating }
              : customer,
          ),
        );
        setStatsData(updatedStats);

        closeRatingPopup();
      }
    } catch (err) {
      console.error("Error updating rating:", err);
      alert(
        t("failedToUpdateRating", "customers") ||
          "Failed to update rating: " +
            (err.response?.data?.message || err.message),
      );
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

      {/* Customer Stats - بيانات حقيقية */}
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
              dataField="address"
              caption={t("address", "customers")}
              width={"auto"}
              alignment="left"
              allowHeaderFiltering={true}
              allowFiltering={true}
              allowGrouping={true}
              cellRender={({ data }) => (
                <div className="flex items-center">
                  <MapPin size={14} className="mr-2 text-gray-400" />
                  {data.address || t("notSpecified", "customers")}
                </div>
              )}
            />

            {/* ✅ عمود التقييم */}
            <Column
              dataField="rate"
              caption={t("rating", "customers") || "Rating"}
              width={"auto"}
              alignment="center"
              allowHeaderFiltering={true}
              allowFiltering={true}
              allowGrouping={true}
              cellRender={({ data }) => (
                <div className="flex items-center justify-center space-x-1">
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <span className="font-medium">{data.rate}</span>
                </div>
              )}
            />

            {/* ✅ عمود الحالة */}
            <Column
              dataField="status"
              caption={t("status", "customers") || "Status"}
              width={"auto"}
              alignment="center"
              allowHeaderFiltering={true}
              allowFiltering={true}
              allowGrouping={true}
              cellRender={({ data }) => (
                <div className="flex items-center justify-center">
                  {data.status === "active" ? (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                      <CheckCircle size={14} />
                      <span className="text-sm font-medium">
                        {t("active", "customers") || "Active"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-800 rounded-full">
                      <XCircle size={14} />
                      <span className="text-sm font-medium">
                        {t("blocked", "customers") || "Blocked"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            />

            <Column
              dataField="orders_count"
              caption={t("orders", "navigation")}
              width={"auto"}
              alignment="left"
              allowHeaderFiltering={true}
              allowFiltering={true}
              allowGrouping={true}
            />

            <Column
              dataField="total_spent"
              caption={t("totalSpent", "customers")}
              width={"auto"}
              alignment="left"
              allowHeaderFiltering={true}
              allowFiltering={true}
              allowGrouping={true}
              cellRender={({ data }) => (
                <div>${data.total_spent || "0.00"}</div>
              )}
            />

            <Column
              dataField="join_date"
              caption={t("joinDate", "customers")}
              width={"auto"}
              alignment="left"
              dataType="date"
              format="yyyy-MM-dd"
              allowHeaderFiltering={true}
              allowFiltering={true}
              allowGrouping={true}
            />

            {/* ✅ عمود Actions مع زر تعديل التقييم وزر الحظر/فك الحظر */}
            <Column
              caption={t("actions", "customers") || "Actions"}
              width={120}
              alignment="center"
              cellRender={({ data }) => (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                    title={t("editRating", "customers") || "Edit Rating"}
                    onClick={() => openRatingPopup(data)}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className={`p-2 rounded-lg transition ${
                      data.status === "blocked"
                        ? "text-green-600 hover:text-green-800 hover:bg-green-50"
                        : "text-red-600 hover:text-red-800 hover:bg-red-50"
                    }`}
                    title={
                      data.status === "blocked"
                        ? t("unblockCustomer", "customers") ||
                          "Unblock Customer"
                        : t("blockCustomer", "customers") || "Block Customer"
                    }
                    onClick={() => handleBlockAction(data)}
                  >
                    <Ban size={18} />
                  </button>
                </div>
              )}
            />
          </DataGrid>
        )}
      </div>

      {/* ✅ Popup لتعديل التقييم */}
      <Popup
        visible={ratingPopup.visible}
        onHiding={closeRatingPopup}
        dragEnabled={false}
        hideOnOutsideClickk={true}
        showTitle={true}
        title={t("editRating", "customers") || "Edit Customer Rating"}
        width={400}
        height={320}
      >
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {t("customer", "customers") || "Customer"}:
            </p>
            <p className="font-medium text-gray-800">
              {ratingPopup.customerName}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {t("currentRating", "customers") || "Current Rating"}:
            </p>
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-500 fill-yellow-500" size={20} />
              <span className="text-lg font-bold">
                {ratingPopup.currentRating}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">
              {t("newRating", "customers") || "New Rating"} (0 - 5):
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={ratingPopup.newRating}
                onChange={(e) => handleRatingChange(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex items-center space-x-1">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
                <span className="font-medium">{ratingPopup.newRating}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {t("ratingHelp", "customers") || "Enter a value between 0 and 5"}
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={closeRatingPopup}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              {t("cancel", "common") || "Cancel"}
            </button>
            <button
              onClick={saveRating}
              className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition"
            >
              {t("saveRating", "customers") || "Save Rating"}
            </button>
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default Customers;
