import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <p className="text-gray-600 mt-1">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
