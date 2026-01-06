import React from "react";
import { Outlet } from "react-router-dom"; // ⬅️ أضف هذا الاستيراد
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const MainLayout = () => {
  // ⬅️ أزل children من الـ props
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet /> {/* ⬅️ استبدل children بـ Outlet */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
