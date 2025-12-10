import React from "react";
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
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  UserPlus,
  TrendingUp,
} from "lucide-react";

const Customers = () => {
  const { t } = useLanguage();

  // Mock data for customers
  const customersData = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarah@dentalclinic.com",
      phone: "(555) 123-4567",
      location: "New York",
      orders: 15,
      totalSpent: "$8,450",
      joinDate: "2023-03-15",
      rating: 4.8,
      status: "Active",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      email: "michael@dentalcare.com",
      phone: "(555) 234-5678",
      location: "Los Angeles",
      orders: 8,
      totalSpent: "$12,800",
      joinDate: "2023-05-22",
      rating: 4.9,
      status: "Active",
    },
    {
      id: 3,
      name: "Dr. Emily Williams",
      email: "emily@smiledental.com",
      phone: "(555) 345-6789",
      location: "Chicago",
      orders: 23,
      totalSpent: "$5,320",
      joinDate: "2023-01-10",
      rating: 4.7,
      status: "Active",
    },
    {
      id: 4,
      name: "Dr. Robert Kim",
      email: "robert@familydental.com",
      phone: "(555) 456-7890",
      location: "Houston",
      orders: 12,
      totalSpent: "$3,180",
      joinDate: "2023-06-30",
      rating: 4.6,
      status: "Active",
    },
    {
      id: 5,
      name: "Dr. Lisa Martinez",
      email: "lisa@modernental.com",
      phone: "(555) 567-8901",
      location: "Miami",
      orders: 18,
      totalSpent: "$9,250",
      joinDate: "2023-02-18",
      rating: 4.9,
      status: "Active",
    },
    {
      id: 6,
      name: "Dr. James Wilson",
      email: "james@wilsondental.com",
      phone: "(555) 678-9012",
      location: "Seattle",
      orders: 7,
      totalSpent: "$4,890",
      joinDate: "2023-08-05",
      rating: 4.5,
      status: "Inactive",
    },
    {
      id: 7,
      name: "Dr. Maria Garcia",
      email: "maria@garciadental.com",
      phone: "(555) 789-0123",
      location: "Phoenix",
      orders: 14,
      totalSpent: "$7,450",
      joinDate: "2023-04-12",
      rating: 4.8,
      status: "Active",
    },
    {
      id: 8,
      name: "Dr. David Brown",
      email: "david@browndental.com",
      phone: "(555) 890-1234",
      location: "Boston",
      orders: 9,
      totalSpent: "$2,560",
      joinDate: "2023-07-25",
      rating: 4.4,
      status: "Active",
    },
  ];

  const handleAddCustomer = () => {
    alert(t("addCustomerMessage", "customers") || "Add customer functionality");
  };

  const handleSendEmail = (email) => {
    alert(`${t("sendingEmailTo", "customers")} ${email}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("customersManagement", "customers")}
          </h1>
          <p className="text-gray-600">
            {t("manageDentalProfessionals", "customers")}
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleAddCustomer}
            className="px-4 py-2 bg-dental-blue text-white rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
          >
            <UserPlus size={20} />
            <span>{t("addCustomer", "customers")}</span>
          </button>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("totalCustomers", "customers")}
              </p>
              <p className="text-3xl font-bold text-gray-800">1,234</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="text-dental-blue" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ 12.5% {t("fromLastMonth", "orders")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("activeCustomers", "customers")}
              </p>
              <p className="text-3xl font-bold text-gray-800">856</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ 8.2% {t("fromLastMonth", "orders")}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {t("avgOrderValue", "orders")}
              </p>
              <p className="text-3xl font-bold text-gray-800">$845</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="text-purple-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">
            ↑ 5.3% {t("fromLastMonth", "orders")}
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataGrid
          dataSource={customersData}
          showBorders={true}
          columnAutoWidth={true}
          height={500}
        >
          <SearchPanel
            visible={true}
            placeholder={t("searchCustomers", "customers")}
          />
          <Paging defaultPageSize={10} />
          <Pager
            showPageSizeSelector={true}
            allowedPageSizes={[5, 10, 20]}
            showInfo={true}
          />

          <Column dataField="id" caption={t("id", "products")} width={70} />
          <Column dataField="name" caption={t("name", "customers")} />
          <Column
            dataField="email"
            caption={t("email", "common")}
            cellRender={({ data }) => (
              <div
                className="flex items-center cursor-pointer hover:text-blue-600"
                onClick={() => handleSendEmail(data.email)}
              >
                <Mail size={14} className="mr-2 text-gray-400" />
                {data.email}
              </div>
            )}
          />
          <Column
            dataField="phone"
            caption={t("phone", "customers")}
            cellRender={({ data }) => (
              <div className="flex items-center">
                <Phone size={14} className="mr-2 text-gray-400" />
                {data.phone}
              </div>
            )}
          />
          <Column
            dataField="location"
            caption={t("location", "customers")}
            cellRender={({ data }) => (
              <div className="flex items-center">
                <MapPin size={14} className="mr-2 text-gray-400" />
                {data.location}
              </div>
            )}
          />
          <Column
            dataField="orders"
            caption={t("orders", "navigation")}
            width={80}
          />
          <Column
            dataField="totalSpent"
            caption={t("totalSpent", "customers")}
          />
          <Column
            dataField="rating"
            caption={t("rating", "products")}
            cellRender={({ data }) => (
              <div className="flex items-center">
                <Star size={14} className="text-yellow-500 fill-current mr-1" />
                <span>{data.rating}</span>
              </div>
            )}
          />
          <Column
            dataField="status"
            caption={t("status", "common")}
            cellRender={({ data }) => (
              <span
                className={`
                px-3 py-1 rounded-full text-xs font-medium
                ${
                  data.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              `}
              >
                {data.status === "Active"
                  ? t("active", "common")
                  : t("inactive", "common")}
              </span>
            )}
          />
        </DataGrid>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("topCustomers", "customers")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("highestSpendingCustomers", "customers")}
            </p>
          </div>
          <Star className="text-dental-teal" size={24} />
        </div>

        <div className="space-y-4">
          {[
            {
              rank: 1,
              name: "Dr. Michael Chen",
              spent: "$12,800",
              orders: 8,
              growth: "+24%",
            },
            {
              rank: 2,
              name: "Dr. Lisa Martinez",
              spent: "$9,250",
              orders: 18,
              growth: "+18%",
            },
            {
              rank: 3,
              name: "Dr. Sarah Johnson",
              spent: "$8,450",
              orders: 15,
              growth: "+15%",
            },
            {
              rank: 4,
              name: "Dr. Maria Garcia",
              spent: "$7,450",
              orders: 14,
              growth: "+12%",
            },
            {
              rank: 5,
              name: "Dr. Emily Williams",
              spent: "$5,320",
              orders: 23,
              growth: "+8%",
            },
          ].map((customer) => (
            <div
              key={customer.rank}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    customer.rank === 1
                      ? "bg-yellow-500"
                      : customer.rank === 2
                      ? "bg-gray-400"
                      : customer.rank === 3
                      ? "bg-amber-700"
                      : "bg-gray-300"
                  }`}
                >
                  {customer.rank}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{customer.name}</p>
                  <p className="text-sm text-gray-600">
                    {customer.orders} {t("orders", "navigation").toLowerCase()}{" "}
                    • {t("total", "customers")}: {customer.spent}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">{customer.growth}</p>
                <p className="text-sm text-gray-600">
                  {t("growth", "customers")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Customers;
