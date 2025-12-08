import React from "react";
import {
  DataGrid,
  Column,
  SearchPanel,
  Paging,
  Pager,
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react/button";
import { Users, Mail, Phone, MapPin, Star, Calendar } from "lucide-react";

const Customers = () => {
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
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Customers Management
          </h1>
          <p className="text-gray-600">
            Manage your dental professional customers
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button
            text="Add Customer"
            icon="add"
            type="default"
            stylingMode="contained"
            className="!bg-dental-blue !text-white hover:!bg-blue-600"
          />
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-800">1,234</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="text-dental-blue" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">↑ 12.5% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-3xl font-bold text-gray-800">856</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Star className="text-green-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">↑ 8.2% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Order Value</p>
              <p className="text-3xl font-bold text-gray-800">$845</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="text-purple-500" size={24} />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">↑ 5.3% from last month</p>
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
          <SearchPanel visible={true} placeholder="Search customers..." />
          <Paging defaultPageSize={10} />
          <Pager
            showPageSizeSelector={true}
            allowedPageSizes={[5, 10, 20]}
            showInfo={true}
          />

          <Column dataField="id" caption="ID" width={70} />
          <Column dataField="name" caption="Name" />
          <Column
            dataField="email"
            caption="Email"
            cellRender={({ data }) => (
              <div className="flex items-center">
                <Mail size={14} className="mr-2 text-gray-400" />
                {data.email}
              </div>
            )}
          />
          <Column
            dataField="phone"
            caption="Phone"
            cellRender={({ data }) => (
              <div className="flex items-center">
                <Phone size={14} className="mr-2 text-gray-400" />
                {data.phone}
              </div>
            )}
          />
          <Column
            dataField="location"
            caption="Location"
            cellRender={({ data }) => (
              <div className="flex items-center">
                <MapPin size={14} className="mr-2 text-gray-400" />
                {data.location}
              </div>
            )}
          />
          <Column dataField="orders" caption="Orders" width={80} />
          <Column dataField="totalSpent" caption="Total Spent" />
          <Column
            dataField="rating"
            caption="Rating"
            cellRender={({ data }) => (
              <div className="flex items-center">
                <Star size={14} className="text-yellow-500 fill-current mr-1" />
                <span>{data.rating}</span>
              </div>
            )}
          />
        </DataGrid>
      </div>
    </div>
  );
};

export default Customers;
