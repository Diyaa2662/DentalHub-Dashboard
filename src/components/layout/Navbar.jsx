import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Search, Bell, HelpCircle, ChevronDown, Globe } from "lucide-react";

const Navbar = () => {
  const { language, switchLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="search"
              placeholder={
                t("search", "common") + " products, orders, customers..."
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* مبدل اللغة */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => switchLanguage(e.target.value)}
              className="appearance-none bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="en">🇺🇸 English</option>
              <option value="sv">🇸🇪 Svenska</option>
            </select>
            <Globe
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
              size={16}
            />
          </div>

          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <HelpCircle size={20} />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-dental-purple to-dental-blue"></div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">Dental Admin</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
            <ChevronDown size={20} className="text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
