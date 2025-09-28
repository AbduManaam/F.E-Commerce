
import React from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "../pages/CartContext";

const NavBar = ({ setmenuOpened, direction = "row" }) => {
  const { cart } = useCart();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navLinks = [
    { path: "/", title: "Home" },
    { path: "/menu", title: "Menu" },
    { path: "/contact", title: "Contact" },
  ];

  return (
    <nav
      className={`flex ${
        direction === "col" ? "flex-col items-start gap-4" : "flex-row items-center gap-4"
      }`}
    >
      {navLinks.map((links) => (
        <NavLink
          onClick={() => setmenuOpened(false)}
          key={links.title}
          to={links.path}
          className={({ isActive }) =>
            `${isActive ? "active-link" : ""} px-3 py-2 rounded-full uppercase text-sm font-bold`
          }
        >
          {links.title}
        </NavLink>
      ))}

      {/* Optional cart badge */}
      {cartCount > 0 && (
        <span className="ml-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
          {cartCount}
        </span>
      )}
    </nav>
  );
};

export default NavBar;



