import React, { useState } from "react"; // ⬅️ أضف useState
import { useLanguage } from "../../contexts/LanguageContext";
import { Search, Bell, HelpCircle, ChevronDown, Globe } from "lucide-react";

const Navbar = () => {
  const { language, switchLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(""); // ⬅️ أضف state للبحث

  const handleNotifications = () => {
    // يمكنك ربط هذا بالـ notifications الفعلية
    alert(t("notifications", "common") + " - " + t("comingSoon", "common"));
  };

  const handleHelp = () => {
    // يمكن ربط هذا بصفحة المساعدة
    window.open("/help", "_blank");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // يمكنك تنفيذ البحث هنا
      console.log("Searching for:", searchQuery);
      // أو استخدام navigate للصفحة
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
        {/* العنوان - يظهر على الجوال فقط */}
        <div className="md:hidden">
          <h1 className="text-lg font-bold text-gray-800">DentalHub</h1>
          <p className="text-xs text-gray-500">
            {t("dashboard", "navigation")}
          </p>
        </div>

        {/* حقل البحث */}
        <div className="flex-1 w-full md:max-w-2xl">
          <form onSubmit={handleSearch} className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`${t("search", "common")} ${t(
                "products",
                "products"
              ).toLowerCase()}, ${t("orders", "navigation").toLowerCase()}, ${t(
                "customers",
                "navigation"
              ).toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-dental-blue hover:text-blue-700"
              >
                ↵
              </button>
            )}
          </form>
        </div>

        {/* الأزرار والإعدادات */}
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto space-x-2 md:space-x-4">
          {/* مبدل اللغة */}
          <div className="relative p-2">
            <select
              value={language}
              onChange={(e) => switchLanguage(e.target.value)}
              className="appearance-none bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5 md:px-4 md:py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer transition-all hover:bg-gray-200"
            >
              <option value="en">
                🇺🇸 {t("english", "common") || "English"}
              </option>
              <option value="sv">
                🇸🇪 {t("swedish", "common") || "Svenska"}
              </option>
            </select>
            <Globe
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
              size={16}
            />
          </div>

          {/* زر الإشعارات */}
          <button
            onClick={handleNotifications}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition active:scale-95"
            title={t("notifications", "common")}
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* زر المساعدة */}
          <button
            onClick={handleHelp}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition active:scale-95 hidden md:block"
            title={t("help", "common")}
          >
            <HelpCircle size={20} />
          </button>

          {/* ملف المستخدم */}
          <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-1 md:p-2 transition">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-dental-purple to-dental-blue flex items-center justify-center text-white font-bold text-sm">
              DA
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">
                {t("dentalAdmin", "navigation") || "Dental Admin"}
              </p>
              <p className="text-xs text-gray-500">
                {t("superAdmin", "navigation") || "Super Admin"}
              </p>
            </div>
            <ChevronDown size={18} className="text-gray-500 hidden md:block" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
