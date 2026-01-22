import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { Settings, Globe } from "lucide-react";

const Navbar = () => {
  const { language, switchLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleSettings = () => {
    navigate(`/settings`);
  };

  // جلب بيانات المستخدم من localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return {
          name: user.name || t("dentalAdmin", "navigation") || "Dental Admin",
          email: user.email || "",
          // توليد الأحرف الأولى من الاسم
          initials: user.name
            ? user.name
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")
                .toUpperCase()
                .substring(0, 2)
            : "DA",
        };
      }
    } catch (err) {
      console.error("Error getting user data:", err);
    }
    return {
      name: t("dentalAdmin", "navigation") || "Dental Admin",
      email: "",
      initials: "DA",
    };
  };

  const userData = getUserData();

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-1 shadow-sm">
      <div className="flex items-center justify-end w-full">
        {/* عنوان الجوال - على اليمين مع بقية العناصر */}
        <div className="md:hidden mr-auto">
          <h1 className="text-lg font-bold text-gray-800">DentalHub</h1>
          <p className="text-xs text-gray-500">
            {t("dashboard", "navigation")}
          </p>
        </div>

        {/* الأزرار والإعدادات */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* مبدل اللغة */}
          <div className="relative">
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
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
              size={16}
            />
          </div>

          {/* زر الإعدادات */}
          <button
            onClick={handleSettings}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition active:scale-95"
            title={t("settings", "common") || "Settings"}
          >
            <Settings size={20} />
          </button>

          {/* ملف المستخدم */}
          <div className="flex items-center space-x-2 md:space-x-3 hover:bg-gray-50 rounded-lg p-1 md:p-2 transition">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-dental-purple to-dental-blue flex items-center justify-center text-white font-bold text-sm">
              {userData.initials}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">
                {userData.name}
              </p>
              <p className="text-xs text-gray-500">
                {userData.email ||
                  t("superAdmin", "navigation") ||
                  "Super Admin"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
