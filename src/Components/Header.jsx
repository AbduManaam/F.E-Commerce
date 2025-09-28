import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/data";
import NavBar from "./NavBar";
import { useCart } from "../pages/CartContext"; // cart context

const Header = () => {
  const [menuOpened, setmenuOpened] = useState(false);
  const toggleMenu = () => setmenuOpened((prev) => !prev);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const { cart } = useCart();
  const navigate = useNavigate();

  return (
    <header className="absolute top-0 left-0 right-0 z-50 py-3">
      <div className="max-padd-container flex items-center justify-between">
        {/* Logo */}
        

        <div className="flex items-center">
   <Link to="/" className="flex items-center gap-2">
  <img src={assets.logoImg} alt="logo" className="h-12" />
  <span className="font-extrabold text-xl sm:text-2xl lg:text-3xl text-neutral-700">
    Yumzy
  </span>
     </Link>

 </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex gap-x-5 xl:gap-x-12 medium-15 p-1">
          <NavBar setmenuOpened={setmenuOpened} direction="row" />
        </div>

        {/* Cart & Profile */}
        <div className="flex items-center gap-x-6">
          {/* Mobile Menu Toggle */}
          <div className="relative lg:hidden w-7 h-6">
            <img
              onClick={toggleMenu}
              src={assets.menu}
              alt="menu"
              className={`absolute inset-0 lg:hidden cursor-pointer transition-opacity duration-700 ${
                menuOpened ? "opacity-0" : "opacity-100"
              }`}
            />
            <img
              onClick={toggleMenu}
              src={assets.menuClose}
              alt="close"
              className={`absolute inset-0 lg:hidden cursor-pointer transition-opacity duration-700 ${
                menuOpened ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          {/* Cart Button */}
          <button
            onClick={() => navigate("/cart")}
            className="relative cursor-pointer"
          >
            <img
              src={assets.cartAdded}
              alt="cart"
              className="min-w-11 bg-white rounded-full p-2"
            />
            {cart.length > 0 && (
              <label className="absolute bottom-10 right-1 text-xs font-bold bg-red-500 text-white flexCenter rounded-full w-5 h-5">
                {cart.length}
              </label>
            )}
          </button>

          {/* Login / User */}
          <Link to="/login" className="btn-solid flexCenter gap-2">
            {user ? user.name : "Login"}
            <img src={assets.user} alt="user" className="invert w-5" />
          </Link>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpened && (
        <div
          className="flex flex-col gap-y-6 fixed top-16 right-6 p-5
               bg-white shadow-md w-52 ring-1 ring-slate-900/5 z-50"
        >
          <NavBar setmenuOpened={setmenuOpened} direction="col" />
        </div>
      )}
    </header>
  );
};

export default Header;

