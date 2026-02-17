import React from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "../pages/CartContext";
import { useWishlist } from "../pages/WishlistContext";

const NavBar = ({ setmenuOpened }) => {
  const navLinks = [
    { path: "/", title: "Home" },
    { path: "/menu", title: "Menu" },
    { path: "/contact", title: "Contact" },
  ];

  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  return (
    <nav className="flex items-center gap-6">
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

    </nav>
  );
};

export default NavBar;
