import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ title, value, change, icon, color, trend }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        <div
          className={`flex items-center ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span className="ml-1 text-sm font-medium">{change}</span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <p className="text-gray-600 mt-1">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
