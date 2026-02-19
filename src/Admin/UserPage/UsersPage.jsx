
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Eye, Edit, Trash, Ban, CheckCircle } from "lucide-react";


// const UsersPage = () => {
//   const [users, setUsers] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [editUser, setEditUser] = useState(null);
//   const [userToBlock, setUserToBlock] = useState(null);
//   const [userToUnblock, setUserToUnblock] = useState(null);
//   const itemsPerPage = 5;

//   // Fetch data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [usersRes, ordersRes] = await Promise.all([
//           axios.get("http://127.0.0.1:8080/users"),
//           axios.get("http://127.0.0.1:8080/orders")
//         ]);
//         setUsers(usersRes.data);
//         setOrders(ordersRes.data);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   // Enhanced users with stats
//   const getEnhancedUsers = () => users.map(user => {
//     const userOrders = orders.filter(order => order.userId === user.id);
//     const orderCount = userOrders.length;
    
//     const recentOrders = userOrders.filter(order => {
//       const orderDate = new Date(order.createdAt || order.date);
//       const thirtyDaysAgo = new Date();
//       thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//       return orderDate > thirtyDaysAgo;
//     });
    
//     const isActive = recentOrders.length > 0 || user.status === "Active";
//     const lastOrderDate = userOrders.length > 0 
//       ? new Date(Math.max(...userOrders.map(o => new Date(o.createdAt || o.date))))
//       : null;

//     return {
//       ...user,
//       orders: orderCount,
//       status: user.status === "Blocked" ? "Blocked" : (isActive ? "Active" : "Inactive"),
//       lastOrderDate: lastOrderDate,
//       lastActivity: lastOrderDate ? lastOrderDate.toLocaleDateString() : 'No activity'
//     };
//   });

//   // Filter users
//   useEffect(() => {
//     let data = getEnhancedUsers();
//     if (search.trim() !== "") {
//       data = data.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
//     }
//     if (statusFilter !== "All") data = data.filter(u => u.status === statusFilter);
//     setFilteredUsers(data);
//     setCurrentPage(1);
//   }, [search, statusFilter, users, orders]);

//   // User actions
//   // const deleteUser = async (id) => {
//   //   if (window.confirm("Are you sure you want to delete this user?")) {
//   //     try {
//   //       await axios.delete(`http://127.0.0.1:8080/users/${id}`);
//   //       setUsers(users.filter(u => u.id !== id));
//   //     } catch (err) {
//   //       console.error("Delete failed:", err);
//   //     }
//   //   }
//   // };

//   const blockUser = async (id) => {
//     try {
//       const userToUpdate = users.find(u => u.id === id);
//       const updatedUser = { ...userToUpdate, status: "Blocked", blockedAt: new Date().toISOString() };
//       await axios.put(`http://127.0.0.1:8080/users/${id}`, updatedUser);
//       setUsers(users.map(u => u.id === id ? updatedUser : u));
//       setUserToBlock(null);
//     } catch (err) {
//       console.error("Block failed:", err);
//     }
//   };

//   const unblockUser = async (id) => {
//     try {
//       const userToUpdate = users.find(u => u.id === id);
//       const updatedUser = { ...userToUpdate, status: "Active", blockedAt: null };
//       await axios.put(`http://127.0.0.1:8080/users/${id}`, updatedUser);
//       setUsers(users.map(u => u.id === id ? updatedUser : u));
//       setUserToUnblock(null);
//     } catch (err) {
//       console.error("Unblock failed:", err);
//     }
//   };

//   const handleSaveUser = async (updatedUser) => {
//     try {
//       await axios.put(`http://127.0.0.1:8080/users/${updatedUser.id}`, updatedUser);
//       setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
//       setEditUser(null);
//     } catch (err) {
//       console.error("Update failed:", err);
//     }
//   };

//   // Pagination
//   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) setCurrentPage(page);
//   };

//   const handleCloseModal = () => {
//     setSelectedUser(null);
//     setEditUser(null);
//     setUserToBlock(null);
//     setUserToUnblock(null);
//   };

//   const enhancedUsers = getEnhancedUsers();
//   const activeTodayCount = enhancedUsers.filter(u => 
//     u.lastOrderDate && new Date(u.lastOrderDate).toDateString() === new Date().toDateString()
//   ).length;

//   // Status badge colors
//   const getStatusColor = (status) => {
//     const colors = {
//       Active: "bg-green-100 text-green-700",
//       Blocked: "bg-red-100 text-red-700",
//       Inactive: "bg-gray-100 text-gray-700"
//     };
//     return colors[status] || colors.Inactive;
//   };

//   return (
//     <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 min-h-screen">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-3xl font-bold text-indigo-700">👥 Users</h2>
//         <div className="flex items-center gap-3">
//           <input
//             type="text"
//             placeholder="Search user..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="border px-3 py-2 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none"
//           />
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="border px-3 py-2 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none"
//           >
//             <option value="All">All</option>
//             <option value="Active">Active</option>
//             <option value="Inactive">Inactive</option>
//             <option value="Blocked">Blocked</option>
//           </select>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         {[
//           { label: "Total Users", value: users.length, color: "text-indigo-600" },
//           { label: "Active Users", value: enhancedUsers.filter(u => u.status === "Active").length, color: "text-green-600" },
//           { label: "Blocked Users", value: enhancedUsers.filter(u => u.status === "Blocked").length, color: "text-red-600" },
//           { label: "Total Orders", value: orders.length, color: "text-purple-600" }
//         ].map((stat, index) => (
//           <div key={index} className="bg-white p-4 rounded-lg shadow">
//             <p className="text-gray-600">{stat.label}</p>
//             <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
//         <table className="w-full text-sm text-left text-gray-700">
//           <thead className="bg-gradient-to-r from-indigo-100 to-cyan-100 text-gray-700 uppercase text-xs">
//             <tr>
//               {["User", "Status", "Orders", "Last Activity", "Actions"].map((header) => (
//                 <th key={header} className="px-6 py-3">{header}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {currentUsers.map((u) => (
//               <tr key={u.id} className="border-b hover:bg-indigo-50/40 transition">
//                 <td className="px-6 py-4">
//                   <div>
//                     <p className="font-medium text-gray-900">{u.name}</p>
//                     <p className="text-xs text-gray-500">{u.email}</p>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4">
//                   <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(u.status)}`}>
//                     {u.status}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 font-medium text-indigo-600">{u.orders}</td>
//                 <td className="px-6 py-4 text-sm text-gray-500">{u.lastActivity}</td>
//                 <td className="px-6 py-4 flex justify-center gap-3">
//                   {[
//                     { icon: Eye, action: () => setSelectedUser(u), color: "indigo", title: "View User" },
//                     { icon: Edit, action: () => setEditUser(u), color: "yellow", title: "Edit User" },
//                     u.status === "Blocked" 
//                       ? { icon: CheckCircle, action: () => setUserToUnblock(u), color: "green", title: "Unblock User" }
//                       : { icon: Ban, action: () => setUserToBlock(u), color: "red", title: "Block User" },
//                     { icon: Trash, action: () => UserDelete(), color: "red", title: "Delete User" }
//                   ].map((btn, index) => (
//                     <button
//                       key={index}
//                       onClick={btn.action}
//                       className={`p-2 rounded-full bg-${btn.color}-50 text-${btn.color}-600 hover:bg-${btn.color}-100 transition`}
//                       title={btn.title}
//                     >
//                       <btn.icon size={16} />
//                     </button>
//                   ))}
//                 </td>
//               </tr>
//             ))}
//             {filteredUsers.length === 0 && (
//               <tr>
//                 <td colSpan="5" className="px-6 py-4 text-center text-gray-400">No users found.</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-between w-full max-w-96 mx-auto mt-6 text-gray-600 font-medium">
//         <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="rounded-full bg-slate-200/50 disabled:opacity-50">
//           <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
//             <path d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z" fill="#475569"/>
//           </svg>
//         </button>
//         <div className="flex items-center gap-2 text-sm font-medium">
//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//             <button key={page} onClick={() => handlePageChange(page)} className={`h-10 w-10 flex items-center justify-center aspect-square transition ${page === currentPage ? "text-white bg-indigo-500 rounded-full shadow-md" : "hover:text-indigo-500"}`}>
//               {page}
//             </button>
//           ))}
//         </div>
//         <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="rounded-full bg-slate-200/50 disabled:opacity-50">
//           <svg className="rotate-180" width="40" height="40" viewBox="0 0 40 40" fill="none">
//             <path d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z" fill="#475569"/>
//           </svg>
//         </button>
//       </div>

//       {/* Modals */}
//       {userToBlock && (
//         <Modal title="Block User" onClose={handleCloseModal}>
//           <p className="mb-6 text-gray-600">Are you sure you want to block <strong>"{userToBlock.name}"</strong>? This user will not be able to login until unblocked.</p>
//           <div className="flex flex-col sm:flex-row justify-end gap-3">
//             <button onClick={handleCloseModal} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
//             <button onClick={() => blockUser(userToBlock.id)} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Block User</button>
//           </div>
//         </Modal>
//       )}

//       {userToUnblock && (
//         <Modal title="Unblock User" onClose={handleCloseModal}>
//           <p className="mb-6 text-gray-600">Are you sure you want to unblock <strong>"{userToUnblock.name}"</strong>? This user will be able to login again.</p>
//           <div className="flex flex-col sm:flex-row justify-end gap-3">
//             <button onClick={handleCloseModal} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
//             <button onClick={() => unblockUser(userToUnblock.id)} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Unblock User</button>
//           </div>
//         </Modal>
//       )}

//       {selectedUser && (
//         <Modal title="User Details" onClose={handleCloseModal}>
//           <div className="space-y-4">
//             {[
//               { label: "Name", value: selectedUser.name, bold: true },
//               { label: "Email", value: selectedUser.email },
//               { label: "Status", value: selectedUser.status, badge: true },
//               { label: "Total Orders", value: selectedUser.orders, color: "text-indigo-600", bold: true },
//               { label: "Last Activity", value: selectedUser.lastActivity }
//             ].map((field, index) => (
//               <div key={index}>
//                 <label className="block text-sm font-medium text-gray-700">{field.label}</label>
//                 {field.badge ? (
//                   <span className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(field.value)}`}>
//                     {field.value}
//                   </span>
//                 ) : (
//                   <p className={`mt-1 text-lg ${field.bold ? 'font-semibold' : ''} ${field.color || ''}`}>{field.value}</p>
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="mt-6 flex justify-end">
//             <button onClick={handleCloseModal} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition">Close</button>
//           </div>
//         </Modal>
//       )}

//       {editUser && (
//         <Modal title="Edit User" onClose={handleCloseModal}>
//           <div className="space-y-4">
//             {[
//               { label: "Name", name: "name", type: "text" },
//               { label: "Email", name: "email", type: "email" },
//               { label: "Status", name: "status", type: "select", options: ["Active", "Inactive", "Blocked"] }
//             ].map((field) => (
//               <div key={field.name}>
//                 <label className="block text-sm font-medium text-gray-700">{field.label}</label>
//                 {field.type === "select" ? (
//                   <select value={editUser[field.name]} onChange={(e) => setEditUser({...editUser, [field.name]: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-transparent">
//                     {field.options.map(option => <option key={option} value={option}>{option}</option>)}
//                   </select>
//                 ) : (
//                   <input type={field.type} value={editUser[field.name]} onChange={(e) => setEditUser({...editUser, [field.name]: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="mt-6 flex justify-end gap-3">
//             <button onClick={handleCloseModal} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">Cancel</button>
//             <button onClick={() => handleSaveUser(editUser)} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition">Save Changes</button>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// };

// // Reusable Modal Component
// const Modal = ({ title, children, onClose }) => (
//   <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
//     <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
//       <div className="p-6">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-xl font-bold text-gray-800">{title}</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
//         </div>
//         {children}
//       </div>
//     </div>
//   </div>
// );

// export default UsersPage;


//---------------------------------------------------------



import React, { useEffect, useState } from "react";
import apiService from "../../service/api.service";
import { Eye, Edit, Ban, CheckCircle, Search, X } from "lucide-react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [userToBlock, setUserToBlock] = useState(null);
  const [userToUnblock, setUserToUnblock] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const itemsPerPage = 8;

  useEffect(() => { fetchUsers(); }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiService.client.get("/admin/users");
      setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch { showMsg("error", "Failed to load users"); }
    finally { setLoading(false); }
  };

  const blockUser = async (id) => {
    try {
      await apiService.client.put(`/admin/users/${id}/block`);
      showMsg("success", "User blocked!");
      setUserToBlock(null);
      fetchUsers();
    } catch { showMsg("error", "Failed to block user"); }
  };

  const unblockUser = async (id) => {
    try {
      await apiService.client.put(`/admin/users/${id}/unblock`);
      showMsg("success", "User unblocked!");
      setUserToUnblock(null);
      fetchUsers();
    } catch { showMsg("error", "Failed to unblock user"); }
  };

  const handleSaveUser = async (u) => {
    try {
      const id = u.id || u.ID;
      await apiService.client.put(`/admin/users/${id}`, { name: u.name || u.Name, email: u.email || u.Email });
      showMsg("success", "User updated!");
      setEditUser(null);
      fetchUsers();
    } catch { showMsg("error", "Failed to update user"); }
  };

  const getStatus = (u) => {
    if (u.is_blocked || u.IsBlocked || u.blocked) return "Blocked";
    return u.status || u.Status || "Active";
  };

  const filtered = users.filter(u => {
    const name = (u.name || u.Name || "").toLowerCase();
    const email = (u.email || u.Email || "").toLowerCase();
    const status = getStatus(u);
    const matchSearch = name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusColor = (status) => ({
    Active: "bg-green-100 text-green-700",
    Blocked: "bg-red-100 text-red-700",
    Inactive: "bg-gray-100 text-gray-600",
  }[status] || "bg-gray-100 text-gray-600");

  const activeCount = users.filter(u => getStatus(u) === "Active").length;
  const blockedCount = users.filter(u => getStatus(u) === "Blocked").length;

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 min-h-screen">
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-indigo-700">👥 Users</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search user..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border px-3 py-2 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none">
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Users", value: users.length, color: "text-indigo-600" },
          { label: "Active", value: activeCount, color: "text-green-600" },
          { label: "Blocked", value: blockedCount, color: "text-red-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gradient-to-r from-indigo-100 to-cyan-100 text-gray-700 uppercase text-xs">
              <tr>
                {["User", "Role", "Status", "Actions"].map(h => (
                  <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(u => {
                const id = u.id || u.ID;
                const status = getStatus(u);
                return (
                  <tr key={id} className="border-b hover:bg-indigo-50/40 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{u.name || u.Name}</p>
                      <p className="text-xs text-gray-500">{u.email || u.Email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs capitalize">
                        {u.role || u.Role || "customer"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedUser(u)} title="View"
                          className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => setEditUser({ ...u })} title="Edit"
                          className="p-2 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100">
                          <Edit size={15} />
                        </button>
                        {status === "Blocked" ? (
                          <button onClick={() => setUserToUnblock(u)} title="Unblock"
                            className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100">
                            <CheckCircle size={15} />
                          </button>
                        ) : (
                          <button onClick={() => setUserToBlock(u)} title="Block"
                            className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100">
                            <Ban size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No users found.</td></tr>
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

      {/* View Modal */}
      {selectedUser && (
        <Modal title="User Details" onClose={() => setSelectedUser(null)}>
          <div className="space-y-3 text-sm">
            {[
              { label: "Name", value: selectedUser.name || selectedUser.Name },
              { label: "Email", value: selectedUser.email || selectedUser.Email },
              { label: "Role", value: selectedUser.role || selectedUser.Role || "customer" },
              { label: "Status", value: getStatus(selectedUser), badge: true },
              { label: "User ID", value: `#${selectedUser.id || selectedUser.ID}` },
            ].map((f, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-gray-500">{f.label}</span>
                {f.badge ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(f.value)}`}>{f.value}</span>
                ) : (
                  <span className="font-medium text-gray-800">{f.value}</span>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setSelectedUser(null)} className="mt-5 w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm font-medium">Close</button>
        </Modal>
      )}

      {/* Edit Modal */}
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={editUser.name || editUser.Name || ""} onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={editUser.email || editUser.Email || ""} onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => handleSaveUser(editUser)} className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm font-medium">Save</button>
            <button onClick={() => setEditUser(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
          </div>
        </Modal>
      )}

      {/* Block Modal */}
      {userToBlock && (
        <Modal title="Block User" onClose={() => setUserToBlock(null)}>
          <p className="text-gray-600 mb-5">Block <strong>{userToBlock.name || userToBlock.Name}</strong>? They won't be able to login until unblocked.</p>
          <div className="flex gap-3">
            <button onClick={() => setUserToBlock(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
            <button onClick={() => blockUser(userToBlock.id || userToBlock.ID)} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Block</button>
          </div>
        </Modal>
      )}

      {/* Unblock Modal */}
      {userToUnblock && (
        <Modal title="Unblock User" onClose={() => setUserToUnblock(null)}>
          <p className="text-gray-600 mb-5">Unblock <strong>{userToUnblock.name || userToUnblock.Name}</strong>? They will be able to login again.</p>
          <div className="flex gap-3">
            <button onClick={() => setUserToUnblock(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
            <button onClick={() => unblockUser(userToUnblock.id || userToUnblock.ID)} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Unblock</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button onClick={onClose}><X className="w-5 h-5 text-gray-500 hover:text-gray-700" /></button>
      </div>
      {children}
    </div>
  </div>
);

export default UsersPage;