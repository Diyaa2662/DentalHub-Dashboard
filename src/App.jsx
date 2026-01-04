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
import Categories from "./components/pages/Categories";
import Orders from "./components/pages/Orders";
import Customers from "./components/pages/Customers";
import Analytics from "./components/pages/Analytics";
import Settings from "./components/pages/Settings";
import Invoices from "./components/pages/Invoices";
import InvoiceDetails from "./components/pages/InvoiceDetails";
import Login from "./components/auth/Login";
import ProductDetails from "./components/pages/ProductDetails";
import OrderDetails from "./components/pages/OrderDetails";
import Inventory from "./components/pages/Inventory";
import Suppliers from "./components/pages/procurement/Suppliers";
import AddSupplier from "./components/pages/procurement/AddSupplier"; // ✅ الجديد
import EditSupplier from "./components/pages/procurement/EditSupplier"; // ✅ الجديد
import PurchaseOrders from "./components/pages/procurement/PurchaseOrders";
import PurchaseOrderDetails from "./components/pages/procurement/PurchaseOrderDetails"; // ✅ الجديد
import AddPurchaseOrder from "./components/pages/procurement/AddPurchaseOrder"; // ✅ الجديد
import EditPurchaseOrder from "./components/pages/procurement/EditPurchaseOrder"; // ✅ الجديد
import SupplierInvoices from "./components/pages/procurement/SupplierInvoices";
import Employees from "./components/pages/Employees";
import EditProduct from "./components/pages/EditProduct";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./App.css";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* مسار تسجيل الدخول */}
          <Route path="/" element={<Login />} />

          {/* المسارات المحمية */}
          <Route
            path="/dashboard"
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
            path="/categories"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Categories />
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
            path="/products/edit/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditProduct />
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
            path="/invoices/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <InvoiceDetails />
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
            path="/procurement/suppliers"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Suppliers />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ مسار إضافة مزود جديد */}
          <Route
            path="/procurement/suppliers/add"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AddSupplier />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/procurement/suppliers/edit/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditSupplier />
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

          {/* ✅ مسار عرض تفاصيل طلب الشراء */}
          <Route
            path="/procurement/purchase-orders/view/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PurchaseOrderDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ مسار إضافة طلب شراء جديد */}
          <Route
            path="/procurement/purchase-orders/add"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AddPurchaseOrder />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* ✅ مسار تحرير طلب شراء */}
          <Route
            path="/procurement/purchase-orders/edit/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditPurchaseOrder />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* المسار الجديد لفواتير الموردين */}
          <Route
            path="/procurement/supplier-invoices"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SupplierInvoices />
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
