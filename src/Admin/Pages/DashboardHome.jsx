
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardHome() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ordersRes, productsRes] = await Promise.all([  //Promise.all() is a JavaScript method that runs multiple promises in parallel and waits until all of them are finished.
          axios.get("http://127.0.0.1:8080/users"),                     //Promise.all([...]) takes an array of promises and returns a single promise that resolves with an array of results.
          axios.get("http://127.0.0.1:8080/orders"),
          axios.get("http://127.0.0.1:8080/products")
        ]);
        
        setUsers(usersRes.data || []);             //|| [] is a safety fallback. It means:
        setOrders(ordersRes.data || []);          //If usersRes.data (or ordersRes.data / productsRes.data) exists → use it.
        setProducts(productsRes.data || []);     //If it’s null or undefined → use an empty array [] instead.
      } catch (err) {                           //This ensures the state is always an array so the app won’t crash when doing .map() or .length.
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Real-time updates every 30 seconds
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, []);
  /* When your dashboard page closes or reloads, React removes (unmounts) the component.
return () => clearInterval(interval) means:
“Before removing this component, stop the running timer.”
If we don’t stop it, the timer keeps running in the background, even though the page is gone — that causes memory waste (leak) or multiple fetches happening at once later.*/

  // Calculate real statistics
  const calculateStats = () => {
    const totalUsers = users.length;
    const totalOrders = orders.length;
    const totalProducts = products.length;
    
    // Calculate total revenue from orders
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (Number(order.amount) || 0);
    }, 0);

    return [
      { title: "Total Users", value: totalUsers.toLocaleString() },
      { title: "Total Orders", value: totalOrders.toLocaleString() },
      { title: "Total Products", value: totalProducts.toLocaleString() },
      { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
    ];
  };

  // Generate revenue data for chart (last 7 days)
  const generateRevenueData = () => {
    const last7Days = [];
    
    // Create last 7 days array     
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toISOString().split('T')[0],
        revenue: 0
      });
    }                          

    // Calculate revenue for each day
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt || order.date);
      const dateStr = orderDate.toISOString().split('T')[0];
      
      const dayData = last7Days.find(day => day.fullDate === dateStr);
      if (dayData) {
        dayData.revenue += Number(order.amount) || 0;
      }
    });

    return last7Days;
  };

  // Calculate additional metrics
  const calculateMetrics = () => {
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;
    const completedOrders = orders.filter(order => order.status === 'Completed').length;
    
    const activeUsers = users.filter(user => {
      const userOrders = orders.filter(order => order.userId === user.id);
      
      const recentOrders = userOrders.filter(order => {
        const orderDate = new Date(order.createdAt || order.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return orderDate > thirtyDaysAgo;
      });
      return recentOrders.length > 0 || user.status === "Active";
    }).length;

    return { pendingOrders, completedOrders, activeUsers };
  };

  const stats = calculateStats();
  const revenueData = generateRevenueData();
  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
      <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Welcome to Admin Dashboard</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <p className="text-lg">{stat.title}</p>
            <h2 className="text-3xl font-bold">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl p-6 shadow-lg">
          <p className="text-lg">Active Users</p>
          <h2 className="text-3xl font-bold">{metrics.activeUsers}</h2>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <p className="text-lg">Pending Orders</p>
          <h2 className="text-3xl font-bold">{metrics.pendingOrders}</h2>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
          <p className="text-lg">Completed Orders</p>
          <h2 className="text-3xl font-bold">{metrics.completedOrders}</h2>
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
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return `Date: ${payload[0].payload.fullDate}`;
                }
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
              <span>Pending Orders</span>
              <span className="font-semibold text-yellow-600">{metrics.pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Completed Orders</span>
              <span className="font-semibold text-green-600">{metrics.completedOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Cancelled Orders</span>
              <span className="font-semibold text-red-600">
                {orders.filter(order => order.status === 'Cancelled').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">User Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Active Users</span>
              <span className="font-semibold text-green-600">{metrics.activeUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Inactive Users</span>
              <span className="font-semibold text-gray-600">
                {users.length - metrics.activeUsers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>New Users (Today)</span>
              <span className="font-semibold text-blue-600">
                {users.filter(user => {
                  const userDate = new Date(user.createdAt || user.date);
                  return userDate.toDateString() === new Date().toDateString();
                }).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}