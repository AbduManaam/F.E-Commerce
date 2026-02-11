
import React from "react";
import { NavLink } from "react-router-dom";

// const NavBar = ({ setmenuOpened, direction = "row" }) => {

const NavBar = ({ setmenuOpened}) => {
  const navLinks = [
    { path: "/", title: "Home" },
    { path: "/menu", title: "Menu" },
    { path: "/contact", title: "Contact" },
  ];

  return (
    <nav
      // className={`flex  ${
      //   direction === "col"
      //     ? "flex-col items-start gap-4"
      //     : "flex-row items-center gap-4"
      // }`}
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
    </nav>
  );
};

export default NavBar;


