import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart2, LogIn, LogOut, Store } from "lucide-react";
import { useAuth } from "../Components/AuthContext";
import { useNavigate } from "react-router-dom";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admindash" },
  { name: "View User Module", icon: Store, path: "__VIEW_USER__" },
  { name: "Orders", icon: ShoppingCart, path: "/admindash/orders" },
  { name: "Products", icon: Package, path: "/admindash/products" },
  { name: "Users", icon: Users, path: "/admindash/users" },
  { name: "Analytics", icon: BarChart2, path: "/admindash/analytics" },
];

const SidebarItem = ({ icon: Icon, text, isActive, collapsed }) => (
  <div
    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
    ${isActive ? "bg-blue-700 shadow-md" : "hover:bg-blue-600/70"}`}
  >
    <Icon size={20} className="text-white" />
    {!collapsed && <span className="font-medium text-white">{text}</span>}
  </div>
);

export default function Sidebar({ collapsed }) {
  const location = useLocation();
  const { user, logout, setIsAdminViewingUserModule } = useAuth();
  const navigate = useNavigate();

  const handleViewUserModule = () => {
    setIsAdminViewingUserModule(true);
    navigate("/");
  };

  const handleAuthAction = () => {
    if (user) {
      logout();
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Navigation Items */}
      <div className="flex flex-col gap-2">
        {navItems.map((item, idx) =>
          item.path === "__VIEW_USER__" ? (
            <button
              key={idx}
              onClick={handleViewUserModule}
              className="w-full text-left bg-transparent border-0 p-0 cursor-pointer"
            >
              <SidebarItem
                icon={item.icon}
                text={item.name}
                isActive={false}
                collapsed={collapsed}
              />
            </button>
          ) : (
            <Link key={idx} to={item.path}>
              <SidebarItem
                icon={item.icon}
                text={item.name}
                isActive={location.pathname === item.path}
                collapsed={collapsed}
              />
            </Link>
          )
        )}
      </div>

      {/* Auth Section */}
      {!collapsed ? (
        <div className="mt-10">
          <button
            onClick={handleAuthAction}
            className="flex items-center justify-center gap-2 w-full bg-white text-blue-600 font-medium px-4 py-2 rounded-full shadow hover:bg-blue-50 hover:scale-105 transition"
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

          {user && (
            <div className="mt-3 text-center text-white text-sm">
              <p className="font-medium">{user.name || user.email}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleAuthAction}
            className="flex items-center justify-center w-10 h-10 bg-white text-blue-600 rounded-full shadow hover:bg-blue-50 hover:scale-105 transition"
          >
            {user ? <LogOut size={18} /> : <LogIn size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}