import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "../pages/CartContext";
import { useWishlist } from "../pages/WishlistContext";

const MobileMenu = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
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

        {/* ── Main nav links ─────────────────────────────────────────── */}
        <div className="space-y-1">
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

          {/* ── My Orders: only for logged-in users ──────────────────── */}
          {user && (
            <button
              onClick={() => handleNavigation("/myorders")}
              className="w-full text-left py-3 px-4 hover:bg-amber-50 rounded-md transition-colors font-medium text-gray-700"
            >
              My Orders
            </button>
          )}
        </div>

        {/* ── Cart & Wishlist shortcuts: only for logged-in users ─────── */}
        {user && (
          <div className="border-t border-gray-100 mt-3 pt-3 space-y-1">
            <button
              onClick={() => handleNavigation("/wishlist")}
              className="w-full flex items-center justify-between py-3 px-4 hover:bg-red-50 rounded-md transition-colors font-medium text-gray-700"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Wishlist
              </span>
              {wishlist.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavigation("/cart")}
              className="w-full flex items-center justify-between py-3 px-4 hover:bg-amber-50 rounded-md transition-colors font-medium text-gray-700"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-500" />
                Cart
              </span>
              {cartCount > 0 && (
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ── Auth section ──────────────────────────────────────────── */}
        <div className="border-t border-gray-200 mt-4 pt-4">
          {user ? (
            <div className="space-y-2">
              <div className="px-4 py-2 text-sm text-gray-500">
                Welcome, {user.name || user.email}
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