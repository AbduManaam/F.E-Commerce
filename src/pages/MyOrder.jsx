import React, { useState } from "react";
import { useOrders } from "./OrderContext";
import { useAuth } from "../Components/AuthContext";
import { generateInvoice } from "../utils/generateInvoice";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";

const MyOrders = () => {
  const { user } = useAuth();
  const { orders, loading, cancelOrder, cancelOrderItem } = useOrders();

  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [filter, setFilter] = useState("all");
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingItem, setCancellingItem] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const toggleOrder = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // ── Download Invoice ────────────────────────────────────────
  const handleDownloadInvoice = async (order) => {
    setDownloadingId(order.id);
    try {
      generateInvoice(order, {
        name:  user?.name  || user?.username || "",
        email: user?.email || "",
        phone: user?.phone || "",
      });
    } catch (err) {
      console.error("Invoice generation failed:", err);
      alert("Failed to generate invoice. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Status Badge ────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending:             { color: "bg-yellow-100 text-yellow-800",  icon: Clock,        label: "Pending"             },
      confirmed:           { color: "bg-blue-100 text-blue-800",      icon: Package,      label: "Confirmed"           },
      paid:                { color: "bg-green-100 text-green-800",    icon: CheckCircle,  label: "Paid"                },
      shipped:             { color: "bg-purple-100 text-purple-800",  icon: Truck,        label: "Shipped"             },
      delivered:           { color: "bg-green-100 text-green-800",    icon: CheckCircle,  label: "Delivered"           },
      cancelled:           { color: "bg-red-100 text-red-800",        icon: XCircle,      label: "Cancelled"           },
      partially_cancelled: { color: "bg-orange-100 text-orange-800",  icon: XCircle,      label: "Partially Cancelled" },
      refunded:            { color: "bg-purple-50 text-purple-700",   icon: CheckCircle,  label: "Refunded"            },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const Icon   = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getItemStatusBadge = (status) => {
    const statusConfig = {
      pending:   { color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      confirmed: { color: "bg-blue-50 text-blue-700 border-blue-200"       },
      cancelled: { color: "bg-red-50 text-red-700 border-red-200"          },
      refunded:  { color: "bg-purple-50 text-purple-700 border-purple-200" },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${config.color}`}>
        {status}
      </span>
    );
  };

  const getPaymentStatusLabel = (paymentStatus, orderStatus, paymentMethod) => {
    if (orderStatus === "cancelled") {
      const method = paymentMethod?.toLowerCase();
      if (method === "cod") return "Not Applicable";
      if (paymentStatus === "paid") return "Refund Initiated";
      return "Not Charged";
    }
    return paymentStatus
      ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)
      : "Pending";
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this entire order?")) return;
    await cancelOrder(orderId);
  };

  const handleCancelItem = async (orderId, itemId) => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }
    await cancelOrderItem(orderId, itemId, cancelReason);
    setCancellingItem(null);
    setCancelReason("");
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status?.toLowerCase() === filter;
  });

  // ── Guards ──────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto py-40 px-4 text-center">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Please Login</h2>
        <p className="text-gray-600">Login to view your orders</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-40 px-4 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-40 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? "bg-amber-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
          <p className="text-gray-600">
            {filter === "all" ? "You haven't placed any orders yet" : `No ${filter} orders`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const orderDate  = new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric",
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold mb-1">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">{orderDate}</p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                      {getStatusBadge(order.status)}
                      <p className="text-lg font-bold">
                        ${order.final_total?.toFixed(2) || "0.00"}
                      </p>
                      {order.discount > 0 && (
                        <p className="text-sm text-green-600">
                          Saved ${order.discount.toFixed(2)}
                        </p>
                      )}

                      {/* ── Download Invoice Button ── */}
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        disabled={downloadingId === order.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition
                          ${downloadingId === order.id
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                          }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        {downloadingId === order.id ? "Generating..." : "Invoice"}
                      </button>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{order.items?.length || 0} items</span>
                    <span>Payment: {order.payment_method || "COD"}</span>
                    <span
                      className={`font-medium ${
                        order.payment_status === "paid"
                          ? "text-green-600"
                          : order.status === "cancelled"
                          ? "text-gray-400"
                          : "text-yellow-600"
                      }`}
                    >
                      {getPaymentStatusLabel(
                        order.payment_status,
                        order.status,
                        order.payment_method
                      )}
                    </span>
                  </div>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => toggleOrder(order.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                  >
                    {isExpanded ? (
                      <><ChevronUp className="w-5 h-5" /> Hide Details</>
                    ) : (
                      <><ChevronDown className="w-5 h-5" /> View Details</>
                    )}
                  </button>
                </div>

                {/* Order Details (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <h4 className="font-semibold mb-4">Order Items</h4>
                    <div className="space-y-4 mb-6">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex gap-4">
                            <img
                              src={item.product?.images?.[0]?.url || "/images/placeholder.png"}
                              alt={item.product?.name || "Product"}
                              className="w-20 h-20 object-cover rounded-lg"
                              onError={(e) => (e.target.src = "/images/placeholder.png")}
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h5 className="font-semibold">
                                    {item.product?.name || "Unknown Product"}
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    Quantity: {item.quantity} × ${item.final_price?.toFixed(2)}
                                  </p>
                                  {item.discount_amount > 0 && (
                                    <p className="text-sm text-green-600">
                                      Discount: -${item.discount_amount.toFixed(2)}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  {getItemStatusBadge(item.status)}
                                  <p className="font-bold mt-2">
                                    ${item.subtotal?.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {/* Cancel Item */}
                              {(order.status === "pending" ||
                                order.status === "partially_cancelled") &&
                                item.status === "pending" && (
                                  <div className="mt-3">
                                    {cancellingItem === item.id ? (
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          placeholder="Reason for cancellation"
                                          value={cancelReason}
                                          onChange={(e) => setCancelReason(e.target.value)}
                                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                        />
                                        <button
                                          onClick={() => handleCancelItem(order.id, item.id)}
                                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          onClick={() => {
                                            setCancellingItem(null);
                                            setCancelReason("");
                                          }}
                                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setCancellingItem(item.id)}
                                        className="text-sm text-red-600 hover:underline"
                                      >
                                        Cancel this item
                                      </button>
                                    )}
                                  </div>
                                )}

                              {item.status === "cancelled" && item.cancellation_reason && (
                                <p className="text-sm text-gray-600 mt-2">
                                  Reason: {item.cancellation_reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    {order.shipping_address && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2">Shipping Address</h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm">
                          <p className="font-medium">{order.shipping_address.full_name}</p>
                          <p className="text-gray-600">{order.shipping_address.phone}</p>
                          <p className="text-gray-600 mt-2">
                            {order.shipping_address.address}
                            {order.shipping_address.landmark &&
                              `, ${order.shipping_address.landmark}`}
                          </p>
                          <p className="text-gray-600">
                            {order.shipping_address.city}, {order.shipping_address.state} -{" "}
                            {order.shipping_address.zip_code}
                          </p>
                          <p className="text-gray-600">{order.shipping_address.country}</p>
                        </div>
                      </div>
                    )}

                    {/* Cancel Order */}
                    {(order.status === "pending" ||
                      order.status === "partially_cancelled") && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                      >
                        Cancel Entire Order
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;