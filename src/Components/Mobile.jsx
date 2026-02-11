// components/MobileMenu.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const MobileMenu = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed top-16 right-4 bg-white shadow-xl rounded-lg w-64 z-50 border border-gray-200">
      <div className="p-4">
        {/* Menu Items */}
        <div className="space-y-2">
          <button
            onClick={() => handleNavigation("/")}
            className="w-full text-left py-3 px-4 hover:bg-amber-50 rounded-md transition-colors font-medium text-gray-700"
          >
            Home
          </button>

          <button
            onClick={() => handleNavigation("/menu")}
            className="w-full text-left py-3 px-4 hover:bg-amber-50 rounded-md transition-colors font-medium text-gray-700"
          >
            Menu
          </button>

          <button
            onClick={() => handleNavigation("/contact")}
            className="w-full text-left py-3 px-4 hover:bg-amber-50 rounded-md transition-colors font-medium text-gray-700"
          >
            Contact
          </button>

          {/* My Orders - Only for logged in users */}
          {user && (
            <button
              onClick={() => handleNavigation("/myorders")}
              className="w-full text-left py-3 px-4 hover:bg-amber-50 rounded-md transition-colors font-medium text-gray-700"
            >
              My Orders
            </button>
          )}
        </div>

        {/* Auth Section */}
        <div className="border-t border-gray-200 mt-4 pt-4">
          {user ? (
            <div className="space-y-2">
              <div className="px-4 py-2 text-sm text-gray-500">
                Welcome, {user.name}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left py-3 px-4 bg-red-50 hover:bg-red-100 rounded-md transition-colors font-medium text-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavigation("/login")}
              className="w-full text-left py-3 px-4 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors font-medium text-amber-800"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;