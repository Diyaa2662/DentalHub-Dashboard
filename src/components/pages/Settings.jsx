import React, { useState } from "react";
import { Button } from "devextreme-react/button";
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
} from "lucide-react";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weeklyReport: false,
    newOrders: true,
    lowStock: true,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const notificationItems = [
    {
      key: "email",
      label: "Email Notifications",
      description: "Receive email updates",
    },
    {
      key: "push",
      label: "Push Notifications",
      description: "Browser push notifications",
    },
    {
      key: "weeklyReport",
      label: "Weekly Reports",
      description: "Weekly sales summary",
    },
    {
      key: "newOrders",
      label: "New Orders",
      description: "Notify for new orders",
    },
    {
      key: "lowStock",
      label: "Low Stock Alerts",
      description: "Alert when stock is low",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">
          Manage your store settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings Menu */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              Settings Categories
            </h3>
            <nav className="space-y-2">
              {[
                {
                  id: "general",
                  label: "General Settings",
                  icon: <SettingsIcon size={18} />,
                },
                {
                  id: "notifications",
                  label: "Notifications",
                  icon: <Bell size={18} />,
                },
                {
                  id: "security",
                  label: "Security",
                  icon: <Shield size={18} />,
                },
                {
                  id: "regional",
                  label: "Regional",
                  icon: <Globe size={18} />,
                },
                {
                  id: "billing",
                  label: "Billing",
                  icon: <CreditCard size={18} />,
                },
                {
                  id: "team",
                  label: "Team Members",
                  icon: <Users size={18} />,
                },
                {
                  id: "data",
                  label: "Data Management",
                  icon: <Database size={18} />,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  className="flex items-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  <span className="text-gray-500">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Column - Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <SettingsIcon className="text-dental-blue" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  General Settings
                </h3>
                <p className="text-sm text-gray-600">
                  Basic store configuration
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <TextBox
                  placeholder="DentalPro Shop"
                  defaultValue="DentalPro Shop"
                  width="100%"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Email
                </label>
                <TextBox
                  placeholder="contact@dentalpro.com"
                  defaultValue="contact@dentalpro.com"
                  width="100%"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Phone
                </label>
                <TextBox
                  placeholder="+1 (555) 123-4567"
                  defaultValue="+1 (555) 123-4567"
                  width="100%"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Address
                </label>
                <TextBox
                  placeholder="123 Dental Street, New York, NY 10001"
                  defaultValue="123 Dental Street, New York, NY 10001"
                  width="100%"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <Bell className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Notification Settings
                </h3>
                <p className="text-sm text-gray-600">
                  Manage your notification preferences
                </p>
              </div>
            </div>

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
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              text="Save Changes"
              type="default"
              stylingMode="contained"
              className="!bg-dental-blue !text-white hover:!bg-blue-600"
              width={200}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
