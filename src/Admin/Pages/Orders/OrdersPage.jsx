import React, { useEffect, useState } from "react";
import apiService from "../../../service/api.service";
import { Eye, RotateCcw, Search, Filter, X, Loader } from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false); // ← for lazy load
  const [message, setMessage] = useState({ type: "", text: "" });
  const itemsPerPage = 8;

  useEffect(() => { fetchOrders(); }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiService.client.get("/admin/orders");
      setOrders(Array.isArray(res.data) ? res.data : res.data?.orders || res.data?.data || []);
    } catch { showMsg("error", "Failed to load orders"); }
    finally { setLoading(false); }
  };

  // ✅ Lazy load - only fetch full order details when eye button is clicked
  const handleViewOrder = async (order) => {
    setSelectedOrder(order); // show modal immediately with basic info
    setModalLoading(true);   // show spinner inside modal
    try {
      const res = await apiService.client.get(`/admin/orders/${order.ID}`);
      const fullOrder = res.data;
      setSelectedOrder(fullOrder); // replace with full data including address
    } catch {
      showMsg("error", "Failed to load order details");
    } finally {
      setModalLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
  try {
    await apiService.client.put(`/admin/orders/${orderId}/status`, { status: newStatus });
    setOrders(prev => prev.map(o => o.ID === orderId ? { 
      ...o, 
      Status: newStatus,
      
      // auto mark as paid when delivered
      PaymentStatus: newStatus === "delivered" ? "paid" : o.PaymentStatus
    } : o));
    showMsg("success", "Order status updated!");
  } catch { showMsg("error", "Failed to update status"); }
};

  const handleRefund = async (orderId) => {
    if (!window.confirm("Process refund for this order?")) return;
    try {
      await apiService.client.post(`/admin/payments/refund/${orderId}`);
      showMsg("success", "Refund processed successfully!");
      fetchOrders();
    } catch (err) {
      showMsg("error", err?.response?.data?.error || "Refund failed");
    }
  };

  const filtered = orders
    .filter(o => {
      const id = String(o.ID || "");
      const status = o.Status || "";
      const matchSearch = id.includes(searchTerm);
      const matchStatus = statusFilter === "All" || status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentOrders = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusColor = (status) => ({
    delivered: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
    shipped: "bg-blue-100 text-blue-700",
    confirmed: "bg-indigo-100 text-indigo-700",
    refunded: "bg-purple-100 text-purple-700",
    partially_cancelled: "bg-orange-100 text-orange-700",
  }[status?.toLowerCase()] || "bg-gray-100 text-gray-700");

const totalRevenue = orders
  .filter(o => o.Status === "delivered")
  .reduce((sum, o) => sum + (o.FinalTotal || o.Total || 0), 0);  const pendingCount = orders.filter(o => o.Status === "pending").length;
  const deliveredCount = orders.filter(o => o.Status === "delivered").length;

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 min-h-screen">
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-indigo-700">📦 Manage Orders</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search by Order ID..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none w-72" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border px-3 py-2 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none">
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Orders", value: orders.length, color: "text-indigo-600" },
          { label: "Pending", value: pendingCount, color: "text-yellow-600" },
          { label: "Delivered", value: deliveredCount, color: "text-green-600" },
          { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, color: "text-purple-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gradient-to-r from-indigo-100 to-cyan-100 text-gray-700 uppercase text-xs">
              <tr>
                {["Order", "User ID", "Total", "Payment", "Status", "Actions"].map(h => (
                  <th key={h} className="px-6 py-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentOrders.map(order => {
                const status = order.Status || "pending";
                const paymentStatus = order.PaymentStatus || "pending";
                const paymentMethod = order.PaymentMethod || "N/A";
                const total = order.FinalTotal || order.Total || 0;
                const items = order.Items || [];
                const canRefund = status === "cancelled" && paymentStatus === "paid" && paymentMethod !== "cod";

                return (
                  <tr key={order.ID} className="border-b hover:bg-indigo-50/40 transition group">
                    <td className="px-6 py-4">
                      <p className="font-mono font-bold text-gray-900">#{order.ID}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.CreatedAt ? new Date(order.CreatedAt).toLocaleDateString() : "—"}
                      </p>
                      <p className="text-xs text-gray-400">{items.length} item(s)</p>
                    </td>

                    {/* Show UserID since ShippingAddress is null in list — full details load on click */}
                    <td className="px-6 py-4">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        User #{order.UserID}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-indigo-600">${Number(total).toFixed(2)}</td>

                    <td className="px-6 py-4">
                      <p className="text-xs capitalize text-gray-600">{paymentMethod}</p>
                      <p className={`text-xs font-medium capitalize mt-1 ${
                        paymentStatus === "paid" ? "text-green-600" :
                        paymentStatus === "refunded" ? "text-purple-600" : "text-yellow-600"
                      }`}>{paymentStatus}</p>
                    </td>

                    <td className="px-6 py-4">
                      <select value={status} onChange={e => updateOrderStatus(order.ID, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-indigo-400 outline-none ${getStatusColor(status)}`}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* ✅ Eye button - lazy loads full order details including address */}
                        <button onClick={() => handleViewOrder(order)} title="View Details"
                          className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 opacity-0 group-hover:opacity-100 transition">
                          <Eye size={15} />
                        </button>
                        {canRefund && (
                          <button onClick={() => handleRefund(order.ID)} title="Process Refund"
                            className="p-2 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 opacity-0 group-hover:opacity-100 transition">
                            <RotateCcw size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-white border text-sm disabled:opacity-40 hover:bg-indigo-50">←</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded text-sm ${page === currentPage ? "bg-indigo-500 text-white" : "bg-white border hover:bg-indigo-50"}`}>
              {page}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-white border text-sm disabled:opacity-40 hover:bg-indigo-50">→</button>
        </div>
      )}

      {/* ✅ Order Detail Modal - shows spinner while loading full details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-800">Order #{selectedOrder.ID}</h3>
                <button onClick={() => setSelectedOrder(null)}><X className="w-5 h-5 text-gray-500 hover:text-gray-700" /></button>
              </div>

              {/* ✅ Show spinner while fetching full details */}
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                  <p className="text-gray-500 text-sm">Loading order details...</p>
                </div>
              ) : (
                <>
                  {/* Order Meta */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {[
                      { label: "Date", value: selectedOrder.CreatedAt ? new Date(selectedOrder.CreatedAt).toLocaleDateString() : "—" },
                      { label: "Payment Method", value: selectedOrder.PaymentMethod || "N/A" },
                      { label: "Payment Status", value: selectedOrder.PaymentStatus || "pending" },
                      { label: "Order Status", value: selectedOrder.Status || "pending" },
                    ].map((f, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">{f.label}</p>
                        <p className="font-semibold capitalize text-gray-800">{f.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* ✅ Shipping Address - loaded on demand */}
                  {selectedOrder.ShippingAddress ? (
                    <div className="mb-5">
                      <h4 className="font-semibold text-gray-800 mb-2">Shipping Address</h4>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-900">
                        <p className="font-medium text-gray-900">{selectedOrder.ShippingAddress.FullName}</p>
                        <p className="text-indigo-600 font-medium">{selectedOrder.ShippingAddress.Phone}</p>
                        <p className="text-gray-700">{selectedOrder.ShippingAddress.Address}</p>
                        <p className="text-gray-700">{selectedOrder.ShippingAddress.City}, {selectedOrder.ShippingAddress.State} - {selectedOrder.ShippingAddress.ZipCode}</p>
                        <p className="text-gray-700">{selectedOrder.ShippingAddress.Country}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                      No shipping address found for this order.
                    </div>
                  )}

                  {/* Items */}
                  <div className="mb-5">
                    <h4 className="font-semibold text-gray-800 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {(selectedOrder.Items || []).map((item, i) => {
                        const product = item.Product || {};
                        const imgs = product.Images || product.images || [];
                        const imgUrl = imgs[0]?.url || imgs[0]?.URL || null;
                        return (
                          <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                            {imgUrl && <img src={imgUrl} className="w-10 h-10 rounded object-cover" alt={product.Name} />}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{product.Name || "Unknown"}</p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.Quantity} × ${(item.FinalPrice || 0).toFixed(2)}
                              </p>
                            </div>
                            <p className="font-semibold text-sm">${(item.Subtotal || 0).toFixed(2)}</p>
                          </div>
                        );
                      })}
                      {(!selectedOrder.Items || selectedOrder.Items.length === 0) && (
                        <p className="text-gray-400 text-sm text-center py-3">No items found</p>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-indigo-600">${(selectedOrder.FinalTotal || selectedOrder.Total || 0).toFixed(2)}</span>
                  </div>

                  {/* Refund */}
                  {selectedOrder.Status === "cancelled" &&
                    selectedOrder.PaymentStatus === "paid" &&
                    selectedOrder.PaymentMethod !== "cod" && (
                      <button onClick={() => { handleRefund(selectedOrder.ID); setSelectedOrder(null); }}
                        className="mt-4 w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition text-sm">
                        💜 Process Refund
                      </button>
                    )}
                </>
              )}

              <button onClick={() => setSelectedOrder(null)}
                className="mt-3 w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;