import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // ✅ تحقق من التوكن أو حالة المصادقة
  const token = localStorage.getItem("authToken");
  const isAuthenticated =
    localStorage.getItem("isAuthenticated") === "true" || token;

  if (!isAuthenticated) {
    // إعادة التوجيه إلى صفحة تسجيل الدخول
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
