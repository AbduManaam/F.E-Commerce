import React, { useEffect, useState } from "react";
import apiService from "../../service/api.service";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function DashboardHome() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ordersRes, productsRes] = await Promise.all([
          apiService.client.get("/admin/users"),    // ✅ auth token sent automatically
          apiService.client.get("/admin/orders"),   // ✅ auth token sent automatically
          apiService.client.get("/products/"),      // ✅ correct endpoint (no /admin/products)
        ]);

        setUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.users || []);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.orders || []);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : productsRes.data?.products || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const calculateStats = () => {
    const totalRevenue = orders
  .filter(o => o.Status === "delivered")
  .reduce((sum, o) => sum + (o.FinalTotal || o.Total || 0), 0);

    return [
      { title: "Total Users", value: users.length.toLocaleString() },
      { title: "Total Orders", value: orders.length.toLocaleString() },
      { title: "Total Products", value: products.length.toLocaleString() },
      { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
    ];
  };

  const generateRevenueData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push({
        name: date.toLocaleDateString("en-US", { weekday: "short" }),
        fullDate: date.toISOString().split("T")[0],
        revenue: 0,
      });
    }

    orders.forEach((order) => {
      const orderDate = new Date(order.created_at || order.createdAt || order.date);
      if (isNaN(orderDate.getTime())) return;
      const dateStr = orderDate.toISOString().split("T")[0];
      const dayData = last7Days.find((day) => day.fullDate === dateStr);
      if (dayData) {
        dayData.revenue += Number(order.final_total || order.total_amount || order.amount) || 0;
      }
    });

    return last7Days;
  };

  const calculateMetrics = () => {
    const pendingOrders = orders.filter(o => (o.status || o.Status) === "pending").length;
    const completedOrders = orders.filter(o => (o.status || o.Status) === "delivered").length;
    const cancelledOrders = orders.filter(o => (o.status || o.Status) === "cancelled").length;
    const blockedUsers = users.filter(u => u.is_blocked || u.IsBlocked).length;
    const newUsersToday = users.filter(u => {
      const d = new Date(u.created_at || u.CreatedAt || u.date);
      return d.toDateString() === new Date().toDateString();
    }).length;

    return { pendingOrders, completedOrders, cancelledOrders, blockedUsers, newUsersToday };
  };

  const stats = calculateStats();
  const revenueData = generateRevenueData();
  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Welcome to Admin Dashboard</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
            <p className="text-lg">{stat.title}</p>
            <h2 className="text-3xl font-bold">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl p-6 shadow-lg">
          <p className="text-lg">Delivered Orders</p>
          <h2 className="text-3xl font-bold">{metrics.completedOrders}</h2>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <p className="text-lg">Pending Orders</p>
          <h2 className="text-3xl font-bold">{metrics.pendingOrders}</h2>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
          <p className="text-lg">Cancelled Orders</p>
          <h2 className="text-3xl font-bold">{metrics.cancelledOrders}</h2>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 mb-6">
        <h2 className="text-xl font-semibold mb-4">Revenue Overview (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) return `Date: ${payload[0].payload.fullDate}`;
                return label;
              }}
            />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Pending</span>
              <span className="font-semibold text-yellow-600">{metrics.pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Delivered</span>
              <span className="font-semibold text-green-600">{metrics.completedOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Cancelled</span>
              <span className="font-semibold text-red-600">{metrics.cancelledOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">User Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Total Users</span>
              <span className="font-semibold text-blue-600">{users.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Blocked Users</span>
              <span className="font-semibold text-red-600">{metrics.blockedUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>New Users (Today)</span>
              <span className="font-semibold text-green-600">{metrics.newUsersToday}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}