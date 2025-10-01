import React from "react";
import { Search, LogIn, LogOut } from "lucide-react";
import { useAuth } from "../Components/AuthContext"; // adjust path if needed
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      logout();            // clear context + localStorage
      navigate("/login");  // redirect after logout
    } else {
      navigate("/login");  // go to login page if not logged in
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg z-40 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 px-4">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-full py-2 pl-10 pr-4 bg-white/90 text-gray-700 placeholder-gray-500 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      {/* Login / Logout */}
      <button
        onClick={handleAuthAction}
        className="flex items-center gap-2 bg-white text-blue-600 font-medium px-4 py-2 rounded-full shadow hover:bg-blue-50 hover:scale-105 transition"
      >
        {user ? (
          <>
            <LogOut size={18} />
            <span>Logout</span>
          </>
        ) : (
          <>
            <LogIn size={18} />
            <span>Login</span>
          </>
        )}
      </button>
    </nav>
  );
}
