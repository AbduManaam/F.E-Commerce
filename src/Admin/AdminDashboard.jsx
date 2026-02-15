
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Routes, Route } from "react-router-dom";
import DashboardHome from "./Pages/DashboardHome";
import AdminProducts from "./Pages/Products";
import UsersPage from "./UserPage/UsersPage";   
import UserCreate from "./UserPage/UserCreate";
import UserView from "./UserPage/UserView";    
import UserEdit from "./UserPage/UserEdit";    
import OrdersPage from "./Pages/Orders/OrdersPage"; 
import Sidebar from "./Sidebar";


const COLLAPSED_W = 80;
const EXPANDED_W = 260;

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? COLLAPSED_W : EXPANDED_W;
  const sidebarWidthPx = `${sidebarWidth}px`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarWidthPx }}
        transition={{ duration: 0.36, type: "spring", stiffness: 120 }}
        className="fixed top-0 left-0 h-screen bg-gradient-to-b from-blue-700 via-purple-700 to-pink-700 text-white p-5 flex flex-col justify-between shadow-2xl z-50"
      >
        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 bg-white text-blue-600 rounded-full shadow-lg p-1 hover:bg-gray-200 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Logo */}
        {!collapsed && (
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-sky-300 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
            Yumzi
          </h2>
        )}

        {/* Sidebar menu */}
        <Sidebar collapsed={collapsed} />
      </motion.div>
           
      {/* Main Content */}
      <main
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarWidthPx }}
      >
        <div className="flex-1 p-8 mt-20">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/create" element={<UserCreate />} />
            <Route path="users/:id" element={<UserView />} />
            <Route path="users/edit/:id" element={<UserEdit />} />
            
            {/* Catch all route for admin - redirect to admin home */}
            <Route path="*" element={<DashboardHome />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}