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
  Star,
  Edit,
} from "lucide-react";
import { Popup } from "devextreme-react/popup";

const Customers = () => {
  const { t } = useLanguage();

  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالة للتقييم الجديد
  const [ratingPopup, setRatingPopup] = useState({
    visible: false,
    customerId: null,
    customerName: "",
    currentRating: "",
    newRating: "",
  });

  // ✅ بيانات ثابتة للإحصائيات والتوب كاستومرز
  const statsData = {
    totalCustomers: "1,234",
    avgOrderValue: "$845",
    fromLastMonth: "+12.5%",
    avgOrderGrowth: "+5.3%",
  };

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

            // ✅ معالجة التقييم
            const rate = customer.rate || customer.rating || "0.00";

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
              rate: rate, // إضافة التقييم
            };
          });

          setCustomersData(formattedData);
        }
      } else {
        // ✅ حالة عدم وجود بيانات أو تنسيق غير صحيح
        setError(
          t("invalidDataFormat", "customers") ||
            "No customer data found or invalid data format",
        );
        setCustomersData([]);
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

            {/* ✅ عمود التقييم الجديد */}
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

            {/* ✅ عمود Actions مع زر تعديل التقييم وزر الحظر */}
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
