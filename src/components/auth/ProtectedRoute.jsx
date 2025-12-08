import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (!isAuthenticated) {
    // إعادة التوجيه إلى صفحة تسجيل الدخول
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
