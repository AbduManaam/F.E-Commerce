
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Eye, Edit, Trash } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const UsersPage = () => {
//   const [users, setUsers] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;
//   const navigate = useNavigate();

//   // Fetch users and orders
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [usersRes, ordersRes] = await Promise.all([
//           axios.get("http://localhost:5000/users"),
//           axios.get("http://localhost:5000/orders")
//         ]);
//         setUsers(usersRes.data);
//         setOrders(ordersRes.data);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//       }
//     };

//     fetchData();
    
//     // Set up real-time updates (polling every 10 seconds)
//     const interval = setInterval(fetchData, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   // Calculate user statistics based on actual order data
//   const getEnhancedUsers = () => {
//     return users.map(user => {
//       // Count orders for this user
//       const userOrders = orders.filter(order => order.userId === user.id);
//       const orderCount = userOrders.length;
      
//       // Determine status based on recent activity (last 30 days)
//       const recentOrders = userOrders.filter(order => {
//         const orderDate = new Date(order.createdAt || order.date);
//         const thirtyDaysAgo = new Date();
//         thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//         return orderDate > thirtyDaysAgo;
//       });
      
//       // User is active if they have orders in the last 30 days or were manually set as active
//       const isActive = recentOrders.length > 0 || user.status === "Active";
      
//       return {
//         ...user,
//         orders: orderCount,
//         status: isActive ? "Active" : "Inactive",
//         lastOrderDate: userOrders.length > 0 
//           ? new Date(Math.max(...userOrders.map(o => new Date(o.createdAt || o.date))))
//           : null
//       };
//     });
//   };

//   // 🔎 Filtering logic
//   useEffect(() => {
//     let data = getEnhancedUsers();

//     if (search.trim() !== "") {
//       data = data.filter(
//         (u) =>
//           u.name.toLowerCase().includes(search.toLowerCase()) ||
//           u.email.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     if (statusFilter !== "All") {
//       data = data.filter((u) => u.status === statusFilter);
//     }

//     setFilteredUsers(data);
//     setCurrentPage(1); // reset to page 1 on filter
//   }, [search, statusFilter, users, orders]);

//   const deleteUser = async (id) => {
//     try {
//       await axios.delete(`http://localhost:5000/users/${id}`);
//       setUsers(users.filter((u) => u.id !== id));
//     } catch (err) {
//       console.error("Delete failed:", err);
//     }
//   };

//   const editUser = (userId) => {
//     navigate(`/admin/users/edit/${userId}`);
//   };

//   const viewUser = (userId) => {
//     navigate(`/admin/users/${userId}`);
//   };

//   // Pagination logic
//   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   return (
//     <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 min-h-screen">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-3xl font-bold text-indigo-700">👥 Users</h2>

//         <div className="flex items-center gap-3">
//           {/* Search */}
//           <input
//             type="text"
//             placeholder="Search user..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="border px-3 py-2 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none"
//           />

//           {/* Filter */}
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="border px-3 py-2 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none"
//           >
//             <option value="All">All</option>
//             <option value="Active">Active</option>
//             <option value="Inactive">Inactive</option>
//           </select>
//         </div>
//       </div>

//       {/* Stats Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-lg shadow">
//           <p className="text-gray-600">Total Users</p>
//           <p className="text-2xl font-bold text-indigo-600">{users.length}</p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <p className="text-gray-600">Active Users</p>
//           <p className="text-2xl font-bold text-green-600">
//             {getEnhancedUsers().filter(u => u.status === "Active").length}
//           </p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <p className="text-gray-600">Total Orders</p>
//           <p className="text-2xl font-bold text-purple-600">{orders.length}</p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <p className="text-gray-600">Active Today</p>
//           <p className="text-2xl font-bold text-blue-600">
//             {getEnhancedUsers().filter(u => 
//               u.lastOrderDate && 
//               new Date(u.lastOrderDate).toDateString() === new Date().toDateString()
//             ).length}
//           </p>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
//         <table className="w-full text-sm text-left text-gray-700">
//           <thead className="bg-gradient-to-r from-indigo-100 to-cyan-100 text-gray-700 uppercase text-xs">
//             <tr>
//               <th className="px-6 py-3">User</th>
//               <th className="px-6 py-3">Status</th>
//               <th className="px-6 py-3">Orders</th>
//               <th className="px-6 py-3">Last Activity</th>
//               <th className="px-6 py-3 text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentUsers.map((u) => (
//               <tr
//                 key={u.id}
//                 className="border-b hover:bg-indigo-50/40 transition"
//               >
//                 {/* User */}
//                 <td className="px-6 py-4">
//                   <div>
//                     <p className="font-medium text-gray-900">{u.name}</p>
//                     <p className="text-xs text-gray-500">{u.email}</p>
//                   </div>
//                 </td>

//                 {/* Status */}
//                 <td className="px-6 py-4">
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
//                       u.status === "Active"
//                         ? "bg-green-100 text-green-700"
//                         : "bg-red-100 text-red-700"
//                     }`}
//                   >
//                     {u.status}
//                   </span>
//                 </td>

//                 {/* Orders */}
//                 <td className="px-6 py-4 font-medium text-indigo-600">
//                   {u.orders}
//                 </td>

//                 {/* Last Activity */}
//                 <td className="px-6 py-4 text-sm text-gray-500">
//                   {u.lastOrderDate 
//                     ? new Date(u.lastOrderDate).toLocaleDateString()
//                     : 'No activity'
//                   }
//                 </td>

//                 {/* Actions */}
//                 <td className="px-6 py-4 flex justify-center gap-4">
//                   <button 
//                     onClick={() => viewUser(u.id)}
//                     className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
//                   >
//                     <Eye size={18} />
//                   </button>
//                   <button 
//                     onClick={() => editUser(u.id)}
//                     className="p-2 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
//                   >
//                     <Edit size={18} />
//                   </button>
//                   <button
//                     onClick={() => deleteUser(u.id)}
//                     className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
//                   >
//                     <Trash size={18} />
//                   </button>
//                 </td>
//               </tr>
//             ))}

//             {filteredUsers.length === 0 && (
//               <tr>
//                 <td
//                   colSpan="5"
//                   className="px-6 py-4 text-center text-gray-400"
//                 >
//                   No users found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Custom Pagination */}
//       <div className="flex items-center justify-between w-full max-w-96 mx-auto mt-6 text-gray-600 font-medium">
//         {/* Prev button */}
//         <button
//           type="button"
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           aria-label="prev"
//           className="rounded-full bg-slate-200/50 disabled:opacity-50"
//         >
//           <svg
//             width="40"
//             height="40"
//             viewBox="0 0 40 40"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z"
//               fill="#475569"
//               stroke="#475569"
//               strokeWidth=".078"
//             />
//           </svg>
//         </button>

//         {/* Page numbers */}
//         <div className="flex items-center gap-2 text-sm font-medium">
//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//             <button
//               key={page}
//               onClick={() => handlePageChange(page)}
//               className={`h-10 w-10 flex items-center justify-center aspect-square transition ${
//                 page === currentPage
//                   ? "text-white bg-indigo-500 rounded-full shadow-md"
//                   : "hover:text-indigo-500"
//               }`}
//             >
//               {page}
//             </button>
//           ))}
//         </div>

//         {/* Next button */}
//         <button
//           type="button"
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           aria-label="next"
//           className="rounded-full bg-slate-200/50 disabled:opacity-50"
//         >
//           <svg
//             className="rotate-180"
//             width="40"
//             height="40"
//             viewBox="0 0 40 40"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z"
//               fill="#475569"
//               stroke="#475569"
//               strokeWidth=".078"
//             />
//           </svg>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default UsersPage;

// src/Admin/UserPage/UsersPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Edit, Trash } from "lucide-react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const itemsPerPage = 5;

  // Fetch users and orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          axios.get("http://localhost:5000/users"),
          axios.get("http://localhost:5000/orders")
        ]);
        setUsers(usersRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
    
    // Set up real-time updates (polling every 10 seconds)
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate user statistics based on actual order data
  const getEnhancedUsers = () => {
    return users.map(user => {
      // Count orders for this user
      const userOrders = orders.filter(order => order.userId === user.id);
      const orderCount = userOrders.length;
      
      // Determine status based on recent activity (last 30 days)
      const recentOrders = userOrders.filter(order => {
        const orderDate = new Date(order.createdAt || order.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return orderDate > thirtyDaysAgo;
      });
      
      // User is active if they have orders in the last 30 days or were manually set as active
      const isActive = recentOrders.length > 0 || user.status === "Active";
      
      // Get last order date
      const lastOrderDate = userOrders.length > 0 
        ? new Date(Math.max(...userOrders.map(o => new Date(o.createdAt || o.date))))
        : null;

      return {
        ...user,
        orders: orderCount,
        status: isActive ? "Active" : "Inactive",
        lastOrderDate: lastOrderDate,
        lastActivity: lastOrderDate ? lastOrderDate.toLocaleDateString() : 'No activity'
      };
    });
  };

  // 🔎 Filtering logic
  useEffect(() => {
    let data = getEnhancedUsers();

    if (search.trim() !== "") {
      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      data = data.filter((u) => u.status === statusFilter);
    }

    setFilteredUsers(data);
    setCurrentPage(1); // reset to page 1 on filter
  }, [search, statusFilter, users, orders]);

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:5000/users/${id}`);
        setUsers(users.filter((u) => u.id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
  };

  const handleEditUser = (user) => {
    setEditUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setEditUser(null);
  };

  const handleSaveUser = async (updatedUser) => {
    try {
      await axios.put(`http://localhost:5000/users/${updatedUser.id}`, updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setEditUser(null);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const enhancedUsers = getEnhancedUsers();
  const activeTodayCount = enhancedUsers.filter(u => 
    u.lastOrderDate && 
    new Date(u.lastOrderDate).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-indigo-700">👥 Users</h2>

        <div className="flex items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          {/* Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 text-sm rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-indigo-600">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600">Active Users</p>
          <p className="text-2xl font-bold text-green-600">
            {enhancedUsers.filter(u => u.status === "Active").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-purple-600">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600">Active Today</p>
          <p className="text-2xl font-bold text-blue-600">{activeTodayCount}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gradient-to-r from-indigo-100 to-cyan-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Orders</th>
              <th className="px-6 py-3">Last Activity</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((u) => (
              <tr
                key={u.id}
                className="border-b hover:bg-indigo-50/40 transition"
              >
                {/* User */}
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                      u.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>

                {/* Orders */}
                <td className="px-6 py-4 font-medium text-indigo-600">
                  {u.orders}
                </td>

                {/* Last Activity */}
                <td className="px-6 py-4 text-sm text-gray-500">
                  {u.lastActivity}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 flex justify-center gap-4">
                  <button 
                    onClick={() => handleViewUser(u)}
                    className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => handleEditUser(u)}
                    className="p-2 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center text-gray-400"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Pagination */}
      <div className="flex items-center justify-between w-full max-w-96 mx-auto mt-6 text-gray-600 font-medium">
        {/* Prev button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="prev"
          className="rounded-full bg-slate-200/50 disabled:opacity-50"
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

        {/* Page numbers */}
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

        {/* Next button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="next"
          className="rounded-full bg-slate-200/50 disabled:opacity-50"
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

      {/* View User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">User Details</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-lg font-semibold">{selectedUser.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-lg">{selectedUser.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                    selectedUser.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Orders</label>
                  <p className="mt-1 text-lg font-semibold text-indigo-600">{selectedUser.orders}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Activity</label>
                  <p className="mt-1 text-lg">{selectedUser.lastActivity}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Edit User</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editUser.name}
                    onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editUser.status}
                    onChange={(e) => setEditUser({...editUser, status: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveUser(editUser)}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;