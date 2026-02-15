import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Edit, Trash, Search, Filter } from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const itemsPerPage = 8;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, usersRes, productsRes] = await Promise.all([
          axios.get("http://localhost:5000/orders"),
          axios.get("http://localhost:5000/users"),
          axios.get("http://localhost:5000/products")
        ]);
        setOrders(ordersRes.data);
        setUsers(usersRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
    
    // Real-time updates
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced orders with customer and product details
  const getEnhancedOrders = () => {
    return orders.map(order => {
      const customer = users.find(user => user.id === order.userId) || {};
      const orderItems = order.items?.map(item => {
        const product = products.find(p => p.id === item.productId) || {};
        return {
          ...item,
          productName: product.title || "Unknown Product",
          productImage: Array.isArray(product.images) ? product.images[0] : product.images,
          productPrice: product.price && item.size ? product.price[item.size] : 0
        };
      }) || [];

      const totalAmount = orderItems.reduce((sum, item) => {
        return sum + (Number(item.productPrice) || 0) * (item.quantity || 1);
      }, 0);

      return {
        ...order,
        customerName: customer.name || "Unknown Customer",
        customerEmail: customer.email || "No email",
        items: orderItems,
        totalAmount: totalAmount > 0 ? totalAmount : (Number(order.amount) || 0),
        displayId: order.id?.slice(0, 16) || order.id // Shortened ID for display
      };
    });
  };

  // Filtering logic
  useEffect(() => {
    let data = getEnhancedOrders();

    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      data = data.filter(order =>
        order.id?.toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower) ||
        order.customerEmail?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== "All") {
      data = data.filter(order => order.status === statusFilter);
    }

    // Sort by latest first
    data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    
    setFilteredOrders(data);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, orders, users, products]);

  const deleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`http://localhost:5000/orders/${id}`);
        setOrders(orders.filter(order => order.id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/orders/${orderId}`, {
        status: newStatus
      });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return "bg-green-100 text-green-700";
      case 'pending':
        return "bg-yellow-100 text-yellow-700";
      case 'cancelled':
        return "bg-red-100 text-red-700";
      case 'shipped':
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const enhancedOrders = getEnhancedOrders();
  const totalRevenue = enhancedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = enhancedOrders.filter(order => order.status === 'Pending').length;
  const completedOrders = enhancedOrders.filter(order => order.status === 'Completed').length;

  return (
    <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-indigo-700">📦 Manage Orders</h2>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none w-80"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-3 py-2 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Shipped">Shipped</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-indigo-600">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600">Pending Orders</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600">Completed Orders</p>
          <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-600">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gradient-to-r from-indigo-100 to-cyan-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-semibold">Order Details</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b hover:bg-indigo-50/40 transition group"
              >
                {/* Order Details */}
                <td className="px-6 py-4">
                  <div>
                    <p className="font-mono font-bold text-gray-900 text-sm">
                      #{order.displayId}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'No date'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items?.length || 0} item(s)
                    </p>
                  </div>
                </td>

                {/* Customer */}
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.customerEmail}</p>
                  </div>
                </td>

                {/* Total */}
                <td className="px-6 py-4">
                  <p className="font-bold text-indigo-600">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <select
                    value={order.status || 'Pending'}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-indigo-400 outline-none ${getStatusColor(order.status)}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition opacity-0 group-hover:opacity-100"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition opacity-0 group-hover:opacity-100"
                      title="Delete Order"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-gray-400"
                >
                  {searchTerm ? 'No orders found matching your search.' : 'No orders found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between w-full max-w-96 mx-auto mt-6 text-gray-600 font-medium">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="prev"
            className="rounded-full bg-slate-200/50 disabled:opacity-50 hover:bg-slate-300/50 transition"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z"
                fill="#475569"
                stroke="#475569"
                strokeWidth=".078"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2 text-sm font-medium">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`h-10 w-10 flex items-center justify-center aspect-square transition ${
                  page === currentPage
                    ? "text-white bg-indigo-500 rounded-full shadow-md"
                    : "hover:text-indigo-500"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="next"
            className="rounded-full bg-slate-200/50 disabled:opacity-50 hover:bg-slate-300/50 transition"
          >
            <svg
              className="rotate-180"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z"
                fill="#475569"
                stroke="#475569"
                strokeWidth=".078"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order ID</label>
                    <p className="mt-1 font-mono text-lg font-semibold">#{selectedOrder.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-lg">
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{selectedOrder.customerName}</p>
                    <p className="text-gray-600">{selectedOrder.customerEmail}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            Size: {item.size} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${((Number(item.productPrice) || 0) * (item.quantity || 1)).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-indigo-600">${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;