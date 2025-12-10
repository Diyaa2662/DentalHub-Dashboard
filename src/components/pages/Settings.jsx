import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Switch } from "devextreme-react/switch";
import { TextBox } from "devextreme-react/text-box";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Globe,
  CreditCard,
  Users,
  Database,
  Save,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

const Settings = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weeklyReport: false,
    newOrders: true,
    lowStock: true,
  });
  const [formData, setFormData] = useState({
    storeName: "DentalPro Shop",
    storeEmail: "contact@dentalpro.com",
    storePhone: "+1 (555) 123-4567",
    storeAddress: "123 Dental Street, New York, NY 10001",
    currency: "USD",
    timezone: "UTC-5",
    language: "en",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorAuth: false,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSecurityChange = (name, value) => {
    setSecurityData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveSettings = () => {
    alert(t("settingsSaved", "settings") || "Settings saved successfully!");
  };

  const notificationItems = [
    {
      key: "email",
      label: t("emailNotifications", "settings"),
      description: t("receiveEmailUpdates", "settings"),
    },
    {
      key: "push",
      label: t("pushNotifications", "settings"),
      description: t("browserPushNotifications", "settings"),
    },
    {
      key: "weeklyReport",
      label: t("weeklyReports", "settings"),
      description: t("weeklySalesSummary", "settings"),
    },
    {
      key: "newOrders",
      label: t("newOrders", "settings"),
      description: t("notifyForNewOrders", "settings"),
    },
    {
      key: "lowStock",
      label: t("lowStockAlerts", "settings"),
      description: t("alertWhenStockIsLow", "settings"),
    },
  ];

  const tabs = [
    {
      id: "general",
      label: t("generalSettings", "settings"),
      icon: <SettingsIcon size={18} />,
    },
    {
      id: "notifications",
      label: t("notifications", "common"),
      icon: <Bell size={18} />,
    },
    {
      id: "security",
      label: t("security", "settings"),
      icon: <Shield size={18} />,
    },
    {
      id: "regional",
      label: t("regional", "settings"),
      icon: <Globe size={18} />,
    },
    {
      id: "billing",
      label: t("billing", "settings"),
      icon: <CreditCard size={18} />,
    },
    {
      id: "team",
      label: t("teamMembers", "settings"),
      icon: <Users size={18} />,
    },
    {
      id: "data",
      label: t("dataManagement", "settings"),
      icon: <Database size={18} />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("storeName", "settings")}
              </label>
              <TextBox
                placeholder="DentalPro Shop"
                value={formData.storeName}
                onValueChange={(value) => handleChange("storeName", value)}
                width="100%"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("storeEmail", "settings")}
              </label>
              <TextBox
                placeholder="contact@dentalpro.com"
                value={formData.storeEmail}
                onValueChange={(value) => handleChange("storeEmail", value)}
                width="100%"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("storePhone", "settings")}
              </label>
              <TextBox
                placeholder="+1 (555) 123-4567"
                value={formData.storePhone}
                onValueChange={(value) => handleChange("storePhone", value)}
                width="100%"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("storeAddress", "settings")}
              </label>
              <TextBox
                placeholder="123 Dental Street, New York, NY 10001"
                value={formData.storeAddress}
                onValueChange={(value) => handleChange("storeAddress", value)}
                width="100%"
              />
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-4">
            {notificationItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <Switch
                  value={notifications[item.key]}
                  onValueChange={() => toggleNotification(item.key)}
                />
              </div>
            ))}
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("currentPassword", "settings")}
              </label>
              <div className="relative">
                <TextBox
                  type={showPassword ? "text" : "password"}
                  value={securityData.currentPassword}
                  onValueChange={(value) =>
                    handleSecurityChange("currentPassword", value)
                  }
                  width="100%"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="text-gray-400" size={18} />
                  ) : (
                    <Eye className="text-gray-400" size={18} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("newPassword", "settings")}
              </label>
              <TextBox
                type="password"
                value={securityData.newPassword}
                onValueChange={(value) =>
                  handleSecurityChange("newPassword", value)
                }
                width="100%"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("confirmPassword", "settings")}
              </label>
              <TextBox
                type="password"
                value={securityData.confirmPassword}
                onValueChange={(value) =>
                  handleSecurityChange("confirmPassword", value)
                }
                width="100%"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">
                  {t("twoFactorAuth", "settings")}
                </p>
                <p className="text-sm text-gray-600">
                  {t("enhancedSecurity", "settings")}
                </p>
              </div>
              <Switch
                value={securityData.twoFactorAuth}
                onValueChange={(value) =>
                  handleSecurityChange("twoFactorAuth", value)
                }
              />
            </div>
          </div>
        );

      case "regional":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("currency", "settings")}
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="SEK">SEK (kr)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("timezone", "settings")}
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="UTC-5">UTC-5 (Eastern Time)</option>
                <option value="UTC-8">UTC-8 (Pacific Time)</option>
                <option value="UTC+0">UTC+0 (GMT)</option>
                <option value="UTC+1">UTC+1 (CET)</option>
                <option value="UTC+2">UTC+2 (Sweden)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("language", "common")}
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="sv">Swedish</option>
              </select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <SettingsIcon className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t("comingSoon", "settings")}
            </h3>
            <p className="text-gray-600">
              {t("thisSectionUnderDevelopment", "settings")}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {t("settings", "common")}
        </h1>
        <p className="text-gray-600">{t("manageStoreSettings", "settings")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings Menu */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              {t("settingsCategories", "settings")}
            </h3>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 w-full p-3 text-left rounded-lg transition ${
                    activeTab === tab.id
                      ? "bg-primary-50 text-primary-700 border-l-4 border-primary-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={
                      activeTab === tab.id
                        ? "text-primary-600"
                        : "text-gray-500"
                    }
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Column - Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Settings Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div
                className={`p-2 rounded-lg ${
                  activeTab === "general"
                    ? "bg-blue-50"
                    : activeTab === "notifications"
                    ? "bg-green-50"
                    : activeTab === "security"
                    ? "bg-red-50"
                    : activeTab === "regional"
                    ? "bg-purple-50"
                    : "bg-gray-50"
                }`}
              >
                {tabs.find((tab) => tab.id === activeTab)?.icon || (
                  <SettingsIcon className="text-gray-500" size={24} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {tabs.find((tab) => tab.id === activeTab)?.label ||
                    t("settings", "common")}
                </h3>
                <p className="text-sm text-gray-600">
                  {activeTab === "general" &&
                    t("basicStoreConfiguration", "settings")}
                  {activeTab === "notifications" &&
                    t("manageNotificationPreferences", "settings")}
                  {activeTab === "security" &&
                    t("securitySettingsDescription", "settings")}
                  {activeTab === "regional" &&
                    t("regionalSettingsDescription", "settings")}
                  {activeTab === "billing" &&
                    t("billingSettingsDescription", "settings")}
                  {activeTab === "team" &&
                    t("teamSettingsDescription", "settings")}
                  {activeTab === "data" &&
                    t("dataSettingsDescription", "settings")}
                </p>
              </div>
            </div>

            {renderTabContent()}

            {/* Save Button */}
            <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
              >
                <Save size={20} />
                <span>{t("saveChanges", "common")}</span>
              </button>
            </div>
          </div>

          {/* Settings Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              ℹ️ {t("settingsInfo", "settings")}
            </h3>
            <ul className="space-y-3 text-sm text-blue-700">
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">✓</span>
                </div>
                <span>{t("settingsTip1", "settings")}</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">✓</span>
                </div>
                <span>{t("settingsTip2", "settings")}</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">✓</span>
                </div>
                <span>{t("settingsTip3", "settings")}</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">✓</span>
                </div>
                <span>{t("settingsTip4", "settings")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
