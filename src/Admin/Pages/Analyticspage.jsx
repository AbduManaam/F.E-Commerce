import React, { useEffect, useState } from "react";
import apiService from "../../service/api.service";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, ShoppingBag, Users, Package,
  RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock
} from "lucide-react";

const fmt = (n) => `$${(n || 0).toFixed(2)}`;
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) : 0);

const DAY = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
  <div className={`rounded-2xl p-5 flex items-center gap-4 shadow-sm border ${bg}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
    <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
    {children}
  </h2>
);

export default function AnalyticsPage() {
  const [orders,     setOrders]     = useState([]);
  const [users,      setUsers]      = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [oRes, uRes, pRes] = await Promise.allSettled([
        apiService.client.get("/admin/orders?limit=100"),
        apiService.client.get("/admin/users?limit=100"),
        apiService.client.get("/products/"),
      ]);
      if (oRes.status === "fulfilled") {
        const d = oRes.value.data;
        setOrders(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
      }
      if (uRes.status === "fulfilled") {
        const d = uRes.value.data;
        const arr = Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
        setUsers(arr);
        setTotalUsers(d?.total || arr.length);
      }
      if (pRes.status === "fulfilled") {
        const d = pRes.value.data;
        setProducts(Array.isArray(d) ? d : d?.products || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getStatus = (o) => (o.Status || o.status || "").toLowerCase();
  const getPaymentStatus = (o) => (o.PaymentStatus || o.payment_status || "").toLowerCase();
  const getTotal  = (o) => o.FinalTotal || o.final_total || o.Total || o.total || 0;

  const delivered = orders.filter(o => getStatus(o) === "delivered");
  const pending   = orders.filter(o => getStatus(o) === "pending");
  const cancelled = orders.filter(o => getStatus(o) === "cancelled");
  const refunded  = orders.filter(o =>
    ["refunded", "refund"].includes(getStatus(o)) || getPaymentStatus(o) === "refunded"
  );
  const shipped   = orders.filter(o => ["shipped", "processing"].includes(getStatus(o)));

  const totalRevenue   = delivered.reduce((s, o) => s + getTotal(o), 0);
  const refundedAmount = refunded.reduce((s, o) => s + getTotal(o), 0);
  const netRevenue     = totalRevenue - refundedAmount;
  const avgOrderValue  = delivered.length ? totalRevenue / delivered.length : 0;

  const blockedUsers = users.filter(u => u.IsBlocked || u.is_blocked);
  const lowStock     = products.filter(p => (p.stock ?? p.Stock ?? 0) <= 5);

  const pieData = [
    { name: "Delivered", value: delivered.length, color: "#10b981" },
    { name: "Pending",   value: pending.length,   color: "#f59e0b" },
    { name: "Shipped",   value: shipped.length,   color: "#3b82f6" },
    { name: "Cancelled", value: cancelled.length, color: "#ef4444" },
    { name: "Refunded",  value: refunded.length,  color: "#8b5cf6" },
  ].filter(d => d.value > 0);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { day: DAY[d.getDay()], date: d.toDateString(), revenue: 0, orders: 0 };
  });
  delivered.forEach(o => {
    const d = new Date(o.CreatedAt || o.created_at);
    const entry = last7.find(e => e.date === d.toDateString());
    if (entry) { entry.revenue += getTotal(o); entry.orders += 1; }
  });

  const productCount = {};
  orders.forEach(o => {
    const items = o.Items || o.items || [];
    items.forEach(item => {
      const name = item.Product?.Name || item.product?.name || item.ProductID || "Unknown";
      productCount[name] = (productCount[name] || 0) + (item.Quantity || item.quantity || 1);
    });
  });
  const topProducts = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  const customerMap = {};
  delivered.forEach(o => {
    const uid = o.UserID || o.user_id || o.User?.ID;
    const name = o.User?.Name || o.user?.name || `User #${uid}`;
    if (!customerMap[uid]) customerMap[uid] = { name, total: 0, orders: 0 };
    customerMap[uid].total  += getTotal(o);
    customerMap[uid].orders += 1;
  });
  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const thisMonth = new Date();
  thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
  const newUsersThisMonth = users.filter(u => {
    const created = new Date(u.CreatedAt || u.created_at);
    return created >= thisMonth;
  }).length;

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="p-6 space-y-8 rounded-3xl bg-white min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📊 Business Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Full overview of your business performance</p>
        </div>
        <button onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* ── Financial Summary ── */}
      <section>
        <SectionTitle>Financial Summary</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp}   label="Total Revenue"    value={fmt(totalRevenue)}   sub={`${delivered.length} delivered orders`} color="bg-emerald-500" bg="bg-white border-emerald-100" />
          <StatCard icon={RefreshCw}    label="Refunded Amount"  value={fmt(refundedAmount)} sub={`${refunded.length} refunded orders`}   color="bg-purple-500"  bg="bg-white border-purple-100" />
          <StatCard icon={TrendingUp}   label="Net Revenue"      value={fmt(netRevenue)}     sub="After refunds"                          color="bg-blue-500"    bg="bg-white border-blue-100" />
          <StatCard icon={ShoppingBag}  label="Avg Order Value"  value={fmt(avgOrderValue)}  sub="Per delivered order"                    color="bg-orange-500"  bg="bg-white border-orange-100" />
        </div>
      </section>

      {/* ── Order Stats ── */}
      <section>
        <SectionTitle>Order Breakdown</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: CheckCircle, label: "Delivered", value: delivered.length, sub: `${pct(delivered.length, orders.length)}% of total`, color: "bg-emerald-500", bg: "bg-white border-emerald-100" },
            { icon: Clock,       label: "Pending",   value: pending.length,   sub: `${pct(pending.length, orders.length)}% of total`,   color: "bg-amber-500",   bg: "bg-white border-amber-100" },
            { icon: Package,     label: "Shipped",   value: shipped.length,   sub: `${pct(shipped.length, orders.length)}% of total`,   color: "bg-blue-500",    bg: "bg-white border-blue-100" },
            { icon: XCircle,     label: "Cancelled", value: cancelled.length, sub: `${pct(cancelled.length, orders.length)}% of total`, color: "bg-red-500",     bg: "bg-white border-red-100" },
            { icon: RefreshCw,   label: "Refunded",  value: refunded.length,  sub: `${pct(refunded.length, orders.length)}% of total`,  color: "bg-purple-500",  bg: "bg-white border-purple-100" },
          ].map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      </section>

      {/* ── Charts Row ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Last 7 Days */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-5">
          <SectionTitle>Revenue — Last 7 Days</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <SectionTitle>Order Status</SectionTitle>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-semibold text-gray-700">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No order data</p>
          )}
        </div>
      </section>

      {/* ── Users + Products Row ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* User Stats */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <SectionTitle>Users</SectionTitle>
          <div className="space-y-3">
            {[
              { label: "Total Users",    value: totalUsers,                          color: "text-indigo-600" },
              { label: "Active Users",   value: totalUsers - blockedUsers.length,    color: "text-emerald-600" },
              { label: "Blocked Users",  value: blockedUsers.length,                 color: "text-red-600" },
              { label: "New This Month", value: newUsersThisMonth,                   color: "text-blue-600" },
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm text-gray-500">{s.label}</span>
                <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-5">
          <SectionTitle>Top Customers</SectionTitle>
          {topCustomers.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b">
                  <th className="pb-2 text-left">Customer</th>
                  <th className="pb-2 text-right">Orders</th>
                  <th className="pb-2 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2.5 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-medium text-gray-700">{c.name}</span>
                    </td>
                    <td className="py-2.5 text-right text-gray-500">{c.orders}</td>
                    <td className="py-2.5 text-right font-semibold text-emerald-600">{fmt(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No delivered orders yet</p>
          )}
        </div>
      </section>

      {/* ── Products Row ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <SectionTitle>Top Ordered Products</SectionTitle>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 truncate">{p.name}</span>
                      <span className="text-gray-500 ml-2">{p.qty} units</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full"
                        style={{ width: `${(p.qty / topProducts[0].qty) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No order item data available</p>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <SectionTitle>⚠️ Low Stock Alerts</SectionTitle>
          {lowStock.length > 0 ? (
            <div className="space-y-2">
              {lowStock.map((p, i) => {
                const stock = p.stock ?? p.Stock ?? 0;
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-gray-700">{p.name || p.Name}</span>
                    </div>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                      stock === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                    }`}>
                      {stock === 0 ? "Out of stock" : `${stock} left`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mb-2" />
              <p className="text-gray-400 text-sm">All products are well stocked!</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}