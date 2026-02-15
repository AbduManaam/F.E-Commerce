
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/data";
import NavBar from "./NavBar";
import { useCart } from "../pages/CartContext";
import { useWishlist } from "../pages/WishlistContext";
import { useAuth } from "./AuthContext";
import MobileMenu from "./Mobile";

const Header = () => {
  const [menuOpened, setmenuOpened] = useState(false);
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  
  const toggleMenu = () => setmenuOpened((prev) => !prev);
  const toggleMobileMenu = () => setMobileMenuOpened((prev) => !prev);

  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-amber-50 shadow-sm">
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

          {/* My Orders link only if user logged in */}
          {user && (
            <button
              onClick={() => navigate("/myorders")}
              className="font-bold transition-colors"
            >
              My Orders
            </button>
          )}
        </div>

        <div className="flex items-center gap-x-4 sm:gap-x-6">
          {/* Mobile Menu Icon - Visible only on small/medium screens */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="relative cursor-pointer p-2 rounded-full hover:bg-amber-100 transition-colors"
              aria-label="Toggle menu"
            >
              {/* Hamburger Icon */}
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${mobileMenuOpened ? 'rotate-45 translate-y-1.5' : '-translate-y-1'}`}></span>
                <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${mobileMenuOpened ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${mobileMenuOpened ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`}></span>
              </div>
            </button>
          </div>

          {/* Wishlist */}
          <button
            onClick={() => navigate("/wishlist")}
            className="relative cursor-pointer"
          >
            <span className="min-w-11 bg-white rounded-full p-2 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              ❤️
            </span>
            {wishlist.length > 0 && (
              <label className="absolute -top-1 -right-1 text-xs font-bold bg-pink-500 text-white flexCenter rounded-full w-5 h-5">
                {wishlist.length}
              </label>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate("/cart")}
            className="relative cursor-pointer"
          >
            <img
              src={assets.cartAdded}
              alt="cart"
              className="min-w-11 bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-shadow"
            />
            {cartCount > 0 && (
              <label className="absolute -top-1 -right-1 text-xs font-bold bg-red-500 text-white flexCenter rounded-full w-5 h-5">
                {cartCount}
              </label>
            )}
          </button>

          {/* Desktop Auth - Hidden on mobile */}
          {user ? (
            <button
              onClick={handleLogout}
              className="btn-solid flexCenter gap-2 hidden lg:flex"
            >
              Logout ({user.name})
              <img src={assets.user} alt="user" className="invert w-5" />
            </button>
          ) : (
            <Link to="/login" className="btn-solid flexCenter gap-2 hidden lg:flex">
              Login
              <img src={assets.user} alt="user" className="invert w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Component */}
      <MobileMenu 
        isOpen={mobileMenuOpened} 
        onClose={() => setMobileMenuOpened(false)} 
      />

      {/* Existing Menu (if you still need it for other purposes) */}
      {menuOpened && (
        <div className="flex flex-col gap-y-6 fixed top-16 right-6 p-5 bg-white shadow-md w-52 ring-1 ring-slate-900/5 z-50">
          <NavBar setmenuOpened={setmenuOpened} direction="col" />

          {user && (
            <button
              onClick={() => {
                navigate("/myorders");
                setmenuOpened(false);
              }}
              className="hover:text-indigo-600 text-left transition-colors"
            >
              My Orders
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;