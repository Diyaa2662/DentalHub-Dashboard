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
import AddSupplier from "./components/pages/procurement/AddSupplier";
import EditSupplier from "./components/pages/procurement/EditSupplier";
import PurchaseOrders from "./components/pages/procurement/PurchaseOrders";
import PurchaseOrderDetails from "./components/pages/procurement/PurchaseOrderDetails";
import AddPurchaseOrder from "./components/pages/procurement/AddPurchaseOrder";
import EditPurchaseOrder from "./components/pages/procurement/EditPurchaseOrder";
import SupplierInvoices from "./components/pages/procurement/SupplierInvoices";
import SupplierInvoiceDetails from "./components/pages/procurement/SupplierInvoiceDetails";
import Payments from "./components/pages/Payments";
import AddPayment from "./components/pages/AddPayment";
import PaymentDetails from "./components/pages/PaymentDetails";
import EditPayment from "./components/pages/EditPayment";
import AddSupplierInvoice from "./components/pages/procurement/AddSupplierInvoice";
import Employees from "./components/pages/Employees";
import EditProduct from "./components/pages/EditProduct";
import Backup from "./components/pages/Backup";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./App.css";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* مسار تسجيل الدخول (غير محمي) */}
          <Route path="/login" element={<Login />} />

          {/* ============================================ */}
          {/* جميع المسارات المحمية داخل MainLayout */}
          {/* ============================================ */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            <Route index element={<Dashboard />} />

            {/* Products */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/edit/:id" element={<EditProduct />} />
            <Route path="/products/view/:id" element={<ProductDetails />} />

            {/* Categories */}
            <Route path="/categories" element={<Categories />} />

            {/* Orders */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/view/:id" element={<OrderDetails />} />

            {/* Customers */}
            <Route path="/customers" element={<Customers />} />

            {/* Inventory */}
            <Route path="/inventory" element={<Inventory />} />

            {/* Employees */}
            <Route path="/employees" element={<Employees />} />

            {/* Analytics */}
            <Route path="/analytics" element={<Analytics />} />

            {/* Invoices */}
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/:id" element={<InvoiceDetails />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />

            {/* ============================================ */}
            {/* Procurement Routes */}
            {/* ============================================ */}

            {/* Suppliers */}
            <Route path="/procurement/suppliers" element={<Suppliers />} />
            <Route
              path="/procurement/suppliers/add"
              element={<AddSupplier />}
            />
            <Route
              path="/procurement/suppliers/edit/:id"
              element={<EditSupplier />}
            />

            {/* Purchase Orders */}
            <Route
              path="/procurement/purchase-orders"
              element={<PurchaseOrders />}
            />
            <Route
              path="/procurement/purchase-orders/add"
              element={<AddPurchaseOrder />}
            />
            <Route
              path="/procurement/purchase-orders/edit/:id"
              element={<EditPurchaseOrder />}
            />
            <Route
              path="/procurement/purchase-orders/view/:id"
              element={<PurchaseOrderDetails />}
            />

            {/* Supplier Invoices */}
            <Route
              path="/procurement/supplier-invoices"
              element={<SupplierInvoices />}
            />

            <Route
              path="/procurement/supplier-invoices/:id"
              element={<SupplierInvoiceDetails />}
            />

            <Route
              path="/procurement/supplier-invoices/add"
              element={<AddSupplierInvoice />}
            />

            <Route path="/payments" element={<Payments />} />

            <Route path="/payments/add" element={<AddPayment />} />

            <Route path="/payments/:id" element={<PaymentDetails />} />

            <Route path="/payments/edit/:id" element={<EditPayment />} />

            <Route path="/backup" element={<Backup />} />
          </Route>
          {/* ============================================ */}
          {/* نهاية المسارات المحمية */}
          {/* ============================================ */}

          {/* إعادة التوجيه للمسارات غير المعروفة */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
