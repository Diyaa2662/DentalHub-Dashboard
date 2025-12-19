import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./components/pages/Dashboard";
import Products from "./components/pages/Products";
import AddProduct from "./components/pages/AddProduct";
import Orders from "./components/pages/Orders";
import Customers from "./components/pages/Customers";
import Analytics from "./components/pages/Analytics";
import Settings from "./components/pages/Settings";
import Invoices from "./components/pages/Invoices";
import Login from "./components/auth/Login";
import ProductDetails from "./components/pages/ProductDetails";
import OrderDetails from "./components/pages/OrderDetails";
import Inventory from "./components/pages/Inventory";
import Procurement from "./components/pages/procurement/Procurement";
import Suppliers from "./components/pages/procurement/Suppliers";
import PurchaseOrders from "./components/pages/procurement/PurchaseOrders";
import Employees from "./components/pages/Employees";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./App.css";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* مسار تسجيل الدخول */}
          <Route path="/login" element={<Login />} />

          {/* المسارات المحمية */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Products />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/add"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AddProduct />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Orders />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Customers />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Analytics />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Invoices />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/view/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProductDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/view/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <OrderDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Inventory />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/procurement"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Procurement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/procurement/suppliers"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Suppliers />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Employees />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/procurement/purchase-orders"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PurchaseOrders />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* إعادة التوجيه إلى الداشبورد للمسارات غير المعروفة */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
