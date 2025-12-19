import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
} from "devextreme-react/data-grid";
import {
  Users,
  UserPlus,
  Download,
  Edit,
  Trash2,
  Key,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Eye,
  MoreVertical,
} from "lucide-react";

const Employees = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // أدوار الموظفين مع الصلاحيات
  const rolePermissions = {
    superAdmin: {
      label: t("superAdmin", "employees"),
      color: "bg-purple-100 text-purple-800",
      permissions: ["all"],
    },
    admin: {
      label: t("admin", "employees"),
      color: "bg-red-100 text-red-800",
      permissions: ["view", "create", "edit", "delete", "export"],
    },
    manager: {
      label: t("manager", "employees"),
      color: "bg-blue-100 text-blue-800",
      permissions: ["view", "create", "edit", "export"],
    },
    sales: {
      label: t("sales", "employees"),
      color: "bg-green-100 text-green-800",
      permissions: ["view", "create", "edit"],
    },
    support: {
      label: t("support", "employees"),
      color: "bg-yellow-100 text-yellow-800",
      permissions: ["view", "edit"],
    },
    inventory: {
      label: t("inventory", "employees"),
      color: "bg-orange-100 text-orange-800",
      permissions: ["view", "create", "edit"],
    },
    procurement: {
      label: t("procurement", "employees"),
      color: "bg-teal-100 text-teal-800",
      permissions: ["view", "create", "edit"],
    },
    viewer: {
      label: t("viewer", "employees"),
      color: "bg-gray-100 text-gray-800",
      permissions: ["view"],
    },
  };

  // بيانات وهمية للموظفين
  const employeesData = [
    {
      id: 1,
      name: "Mohammad Ali",
      employeeId: "EMP-001",
      jobTitle: "Super Admin",
      department: "Management",
      email: "mohammad@dentalpro.com",
      phone: "(555) 111-2222",
      hireDate: "2023-01-15",
      status: "active",
      role: "superAdmin",
      lastLogin: "2024-01-15 14:30",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      employeeId: "EMP-002",
      jobTitle: "Sales Manager",
      department: "Sales",
      email: "sarah@dentalpro.com",
      phone: "(555) 222-3333",
      hireDate: "2023-03-20",
      status: "active",
      role: "manager",
      lastLogin: "2024-01-14 09:15",
    },
    {
      id: 3,
      name: "Michael Chen",
      employeeId: "EMP-003",
      jobTitle: "Inventory Specialist",
      department: "Warehouse",
      email: "michael@dentalpro.com",
      phone: "(555) 333-4444",
      hireDate: "2023-05-10",
      status: "active",
      role: "inventory",
      lastLogin: "2024-01-15 11:45",
    },
    {
      id: 4,
      name: "Emily Wilson",
      employeeId: "EMP-004",
      jobTitle: "Procurement Officer",
      department: "Procurement",
      email: "emily@dentalpro.com",
      phone: "(555) 444-5555",
      hireDate: "2023-07-05",
      status: "onLeave",
      role: "procurement",
      lastLogin: "2024-01-10 08:30",
    },
    {
      id: 5,
      name: "Robert Kim",
      employeeId: "EMP-005",
      jobTitle: "Customer Support",
      department: "Support",
      email: "robert@dentalpro.com",
      phone: "(555) 555-6666",
      hireDate: "2023-09-15",
      status: "active",
      role: "support",
      lastLogin: "2024-01-15 16:20",
    },
    {
      id: 6,
      name: "Lisa Martinez",
      employeeId: "EMP-006",
      jobTitle: "Sales Representative",
      department: "Sales",
      email: "lisa@dentalpro.com",
      phone: "(555) 666-7777",
      hireDate: "2023-11-01",
      status: "inactive",
      role: "sales",
      lastLogin: "2024-01-05 13:10",
    },
    {
      id: 7,
      name: "David Brown",
      employeeId: "EMP-007",
      jobTitle: "Viewer",
      department: "General",
      email: "david@dentalpro.com",
      phone: "(555) 777-8888",
      hireDate: "2023-12-10",
      status: "active",
      role: "viewer",
      lastLogin: "2024-01-14 10:00",
    },
    {
      id: 8,
      name: "Maria Garcia",
      employeeId: "EMP-008",
      jobTitle: "Admin Assistant",
      department: "Administration",
      email: "maria@dentalpro.com",
      phone: "(555) 888-9999",
      hireDate: "2024-01-05",
      status: "active",
      role: "admin",
      lastLogin: "2024-01-15 15:45",
    },
  ];

  // فلترة البيانات
  const filteredData = employeesData.filter((employee) => {
    const matchesRole =
      selectedRole === "all" || employee.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" || employee.status === selectedStatus;
    return matchesRole && matchesStatus;
  });

  // إحصائيات
  const stats = {
    total: employeesData.length,
    active: employeesData.filter((e) => e.status === "active").length,
    onLeave: employeesData.filter((e) => e.status === "onLeave").length,
    inactive: employeesData.filter((e) => e.status === "inactive").length,
  };

  // معالجة الحذف
  const handleDeleteEmployee = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      alert(`Employee ${name} deleted successfully`);
    }
  };

  // معالجة تحديث الدور
  const handleUpdateRole = (id, name) => {
    const newRole = prompt(
      `Enter new role for ${name} (superAdmin/admin/manager/sales/support/inventory/procurement/viewer):`
    );
    if (newRole && rolePermissions[newRole]) {
      alert(`Role updated to ${rolePermissions[newRole].label} for ${name}`);
    }
  };

  // معالجة إعادة تعيين كلمة المرور
  const handleResetPassword = (id, name) => {
    if (
      window.confirm(
        `Reset password for ${name}? A temporary password will be sent to their email.`
      )
    ) {
      alert(`Password reset email sent to ${name}`);
    }
  };

  // معالجة تعليق/تفعيل الحساب
  const handleToggleStatus = (id, name, currentStatus) => {
    // eslint-disable-next-line no-unused-vars
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const action = currentStatus === "active" ? "suspend" : "activate";

    if (
      window.confirm(`Are you sure you want to ${action} ${name}'s account?`)
    ) {
      alert(
        `${name}'s account has been ${
          action === "suspend" ? "suspended" : "activated"
        }`
      );
    }
  };

  const handleAddEmployee = () => {
    navigate("/employees/add");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("employeesManagement", "employees")}
          </h1>
          <p className="text-gray-600">{t("manageTeamMembers", "employees")}</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => alert("Export functionality")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <Download size={20} />
            <span>{t("exportEmployees", "employees")}</span>
          </button>
          <button
            onClick={handleAddEmployee}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <UserPlus size={20} />
            <span>{t("addEmployee", "employees")}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalEmployees", "employees")}
              </p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="text-dental-blue" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("activeEmployees", "employees")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.onLeave}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.inactive}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircle className="text-red-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("filterByRole", "employees")}
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">{t("allRoles", "employees")}</option>
              {Object.keys(rolePermissions).map((role) => (
                <option key={role} value={role}>
                  {rolePermissions[role].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("filterByStatus", "employees")}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">{t("allStatus", "employees")}</option>
              <option value="active">{t("active", "employees")}</option>
              <option value="onLeave">On Leave</option>
              <option value="inactive">{t("inactive", "employees")}</option>
            </select>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <DataGrid
            dataSource={filteredData}
            showBorders={true}
            columnAutoWidth={true}
            height={500}
          >
            <SearchPanel
              visible={true}
              placeholder={t("searchEmployees", "employees")}
            />
            <Paging defaultPageSize={10} />
            <Pager
              showPageSizeSelector={true}
              allowedPageSizes={[5, 10, 20]}
              showInfo={true}
            />

            {/* Employee ID */}
            <Column
              dataField="employeeId"
              caption={t("employeeId", "employees")}
              width={120}
            />

            {/* Name */}
            <Column
              dataField="name"
              caption={t("employeeName", "employees")}
              width={150}
            />

            {/* Email */}
            <Column
              dataField="email"
              caption={t("email", "employees")}
              width={250}
              cellRender={({ data }) => (
                <div className="flex items-center">
                  <Mail size={14} className="mr-2 text-gray-400" />
                  {data.email}
                </div>
              )}
            />

            {/* Role */}
            <Column
              dataField="role"
              caption={t("role", "employees")}
              width={160}
              cellRender={({ data }) => {
                const role = rolePermissions[data.role];
                return (
                  <div
                    className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${role.color}`}
                  >
                    <Shield size={14} className="mr-2" />
                    {role.label}
                  </div>
                );
              }}
            />

            {/* Status */}
            <Column
              dataField="status"
              caption={t("status", "employees")}
              width={120}
              cellRender={({ data }) => {
                const statusConfig = {
                  active: {
                    color: "bg-green-100 text-green-800",
                    icon: <CheckCircle size={12} />,
                    text: t("active", "employees"),
                  },
                  inactive: {
                    color: "bg-red-100 text-red-800",
                    icon: <XCircle size={12} />,
                    text: t("inactive", "employees"),
                  },
                  onLeave: {
                    color: "bg-yellow-100 text-yellow-800",
                    icon: <Clock size={12} />,
                    text: "On Leave",
                  },
                };

                const config = statusConfig[data.status] || {
                  color: "bg-gray-100 text-gray-800",
                  icon: <Clock size={12} />,
                  text: data.status,
                };

                return (
                  <div
                    className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
                  >
                    {config.icon}
                    <span className="ml-1">{config.text}</span>
                  </div>
                );
              }}
            />

            {/* Last Login */}
            <Column
              dataField="lastLogin"
              caption={t("lastLogin", "employees")}
              width={160}
            />

            {/* Actions */}
            <Column
              caption="Actions"
              width={180}
              cellRender={({ data }) => (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateRole(data.id, data.name)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                    title={t("updateRole", "employees")}
                  >
                    <Shield size={16} />
                  </button>
                  <button
                    onClick={() => handleResetPassword(data.id, data.name)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                    title={t("resetPassword", "employees")}
                  >
                    <Key size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleToggleStatus(data.id, data.name, data.status)
                    }
                    className={`p-1.5 rounded transition ${
                      data.status === "active"
                        ? "text-red-600 hover:bg-red-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={
                      data.status === "active"
                        ? t("suspendAccount", "employees")
                        : t("activateAccount", "employees")
                    }
                  >
                    {data.status === "active" ? (
                      <XCircle size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(data.id, data.name)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                    title={t("delete", "common")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            />
          </DataGrid>
        </div>
      </div>

      {/* Role Permissions Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Role Permissions Overview
            </h3>
            <p className="text-sm text-gray-600">
              Summary of permissions for each role
            </p>
          </div>
          <Shield className="text-dental-teal" size={24} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(rolePermissions).map(([role, info]) => (
            <div key={role} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${info.color}`}
                >
                  {info.label}
                </span>
                <span className="text-sm text-gray-500">
                  {employeesData.filter((e) => e.role === role).length} users
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Permissions:
                </p>
                <div className="flex flex-wrap gap-1">
                  {info.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Employees;
