import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, Users } from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admindash" },
  { name: "Orders", icon: ShoppingCart, path: "/admindash/orders" },
  { name: "Products", icon: Package, path: "/admindash/products" },
  { name: "Users", icon: Users, path: "/admindash/users" },
];

const SidebarItem = ({ icon: Icon, text, isActive, collapsed }) => (
  <div
    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
    ${isActive ? "bg-blue-700 shadow-md" : "hover:bg-blue-600/70"}`}
  >
    <Icon size={20} className="text-white" />
    {!collapsed && <span className="font-medium text-white">{text}</span>}
  </div>
);

export default function Sidebar({ collapsed }) {
  const location = useLocation();

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Navigation Items */}
      <div className="flex flex-col gap-2">
        {navItems.map((item, idx) => (
          <Link key={idx} to={item.path}>
            <SidebarItem
              icon={item.icon}
              text={item.name}
              isActive={location.pathname === item.path}
              collapsed={collapsed}
            />
          </Link>
        ))}
      </div>

      {/* Footer links */}
      {!collapsed && (
        <div className="text-sm text-gray-200 mt-10 space-x-3">
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">Google</a>
        </div>
      )}
    </div>
  );
}


// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import Sidebar from "./Sidebar";
// import Navbar from "./Navbar";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { Routes, Route } from "react-router-dom";
// import DashboardHome from "./Pages/DashboardHome";
// import AdminProducts from "./Pages/Products";

// // Import actual admin pages
// import UsersPage from "./UserPage/UsersPage";   // ✅ full users list page
// import UserCreate from "./UserPage/UserCreate"; // ✅ create user
// import UserView from "./UserPage/UserView";     // ✅ view user details
// import UserEdit from "./UserPage/UserEdit";     // ✅ edit user
// import OrdersPage from "./Pages/Orders/OrdersPage"; // ✅ Add this import

// const COLLAPSED_W = 80;
// const EXPANDED_W = 260;

// export default function AdminDashboard() {
//   const [collapsed, setCollapsed] = useState(false);

//   const sidebarWidth = collapsed ? COLLAPSED_W : EXPANDED_W;
//   const sidebarWidthPx = `${sidebarWidth}px`;

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <motion.div
//         animate={{ width: sidebarWidthPx }}
//         transition={{ duration: 0.36, type: "spring", stiffness: 120 }}
//         className="fixed top-0 left-0 h-screen bg-gradient-to-b from-blue-700 via-purple-700 to-pink-700 text-white p-5 flex flex-col justify-between shadow-2xl z-50"
//       >
//         {/* Toggle button */}
//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           className="absolute -right-3 top-8 bg-white text-blue-600 rounded-full shadow-lg p-1 hover:bg-gray-200 transition"
//         >
//           {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
//         </button>

//         {/* Logo */}
//         {!collapsed && (
//           <h2 className="text-3xl font-extrabold bg-gradient-to-r from-sky-300 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
//             Yumzi
//           </h2>
//         )}

//         {/* Sidebar menu */}
//         <Sidebar collapsed={collapsed} />
//       </motion.div>

//       {/* Top Navbar */}
//       <Navbar />

//       {/* Main Content */}
//       <main
//         className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
//         style={{ marginLeft: sidebarWidthPx }}
//       >
//         <div className="flex-1 p-8 mt-20">
//           <Routes>
//             <Route path="/" element={<DashboardHome />} />
//             <Route path="orders" element={<OrdersPage />} /> {/* ✅ Updated to use OrdersPage */}
//             <Route path="products" element={<AdminProducts />} />
            
//             {/* ✅ Users Routes */}
//             <Route path="users" element={<UsersPage />} />
//             <Route path="users/create" element={<UserCreate />} />
//             <Route path="users/:id" element={<UserView />} />
//             <Route path="users/edit/:id" element={<UserEdit />} />
//           </Routes>
//         </div>
//       </main>
//     </div>
//   );
// }