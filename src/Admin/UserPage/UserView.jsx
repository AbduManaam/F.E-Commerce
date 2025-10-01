
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const UserView = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userRes, ordersRes] = await Promise.all([
          axios.get(`http://localhost:5000/users/${id}`),
          axios.get(`http://localhost:5000/orders?userId=${id}`)
        ]);
        
        setUser(userRes.data);
        setUserOrders(ordersRes.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
    
    // Real-time updates
    const interval = setInterval(fetchUserData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (!user) return <p className="p-8 text-white">Loading...</p>;

  const totalSpent = userOrders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
  const recentOrder = userOrders.length > 0 
    ? userOrders.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0]
    : null;

  return (
    <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-indigo-700">User Details</h2>
          <Link 
            to="/admin/users" 
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
          >
            ← Back to Users
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
              <div className="space-y-3">
                <p><strong className="text-gray-700">Name:</strong> {user.name}</p>
                <p><strong className="text-gray-700">Email:</strong> {user.email}</p>
                <p><strong className="text-gray-700">User ID:</strong> {user.id}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Summary</h3>
              <div className="space-y-3">
                <p>
                  <strong className="text-gray-700">Status:</strong> 
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                    userOrders.length > 0 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {userOrders.length > 0 ? "Active" : "Inactive"}
                  </span>
                </p>
                <p><strong className="text-gray-700">Total Orders:</strong> {userOrders.length}</p>
                <p><strong className="text-gray-700">Total Spent:</strong> ${totalSpent.toFixed(2)}</p>
                {recentOrder && (
                  <p><strong className="text-gray-700">Last Order:</strong> {new Date(recentOrder.createdAt || recentOrder.date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order History</h3>
          {userOrders.length > 0 ? (
            <div className="space-y-4">
              {userOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(order.createdAt || order.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">Status: {order.status || "Pending"}</p>
                    </div>
                    <p className="font-bold text-indigo-600">${Number(order.amount || 0).toFixed(2)}</p>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Items: {order.items.length} product(s)
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No orders found for this user.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserView;