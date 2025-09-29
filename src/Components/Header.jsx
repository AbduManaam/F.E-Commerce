

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/data";
import NavBar from "./NavBar";
import { useCart } from "../pages/CartContext";
import { useWishlist } from "../pages/WishlistContext";
import { useAuth } from "./AuthContext";


const Header = () => {
  const [menuOpened, setmenuOpened] = useState(false);
  const toggleMenu = () => setmenuOpened((prev) => !prev);

  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth(); // ✅ context
  const navigate = useNavigate();

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleLogout = () => {
    logout(); // ✅ update via context
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-amber-50">
      <div className="max-padd-container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={assets.logoImg} alt="logo" className="h-12" />
          <span className="font-extrabold text-xl sm:text-2xl lg:text-3xl text-neutral-700">
            Yumzy
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex gap-x-5 xl:gap-x-12 medium-15 p-1">
          <NavBar setmenuOpened={setmenuOpened} direction="row" />
        </div>

        {/* Wishlist, Cart & Profile */}
        <div className="flex items-center gap-x-6">
          {/* Wishlist */}
          <button onClick={() => navigate("/wishlist")} className="relative cursor-pointer">
            <span className="min-w-11 bg-white rounded-full p-2 flex items-center justify-center">
              ❤️
            </span>
            {wishlist.length > 0 && (
              <label className="absolute bottom-10 right-1 text-xs font-bold bg-pink-500 text-white flexCenter rounded-full w-5 h-5">
                {wishlist.length}
              </label>
            )}
          </button>

          {/* Cart */}
          <button onClick={() => navigate("/cart")} className="relative cursor-pointer">
            <img
              src={assets.cartAdded}
              alt="cart"
              className="min-w-11 bg-white rounded-full p-2"
            />
            {cartCount > 0 && (
              <label className="absolute bottom-10 right-1 text-xs font-bold bg-red-500 text-white flexCenter rounded-full w-5 h-5">
                {cartCount}
              </label>
            )}
          </button>

          {/* Auth */}
          {user ? (
            <button onClick={handleLogout} className="btn-solid flexCenter gap-2">
              Logout ({user.name})
              <img src={assets.user} alt="user" className="invert w-5" />
            </button>
          ) : (
            <Link to="/login" className="btn-solid flexCenter gap-2">
              Login
              <img src={assets.user} alt="user" className="invert w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpened && (
        <div className="flex flex-col gap-y-6 fixed top-16 right-6 p-5 bg-white shadow-md w-52 ring-1 ring-slate-900/5 z-50">
          <NavBar setmenuOpened={setmenuOpened} direction="col" />
        </div>
      )}
    </header>
  );
};

export default Header;
