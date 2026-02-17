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


// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "./AuthContext";
// import { User, ShoppingBag, Heart, LogOut, Home, Menu as MenuIcon, Phone } from "lucide-react";

// const MobileMenu = ({ isOpen, onClose }) => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleNavigation = (path) => {
//     navigate(path);
//     onClose();
//   };

//   const handleLogout = () => {
//     logout();
//     onClose();
//     navigate("/login");
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="lg:hidden fixed top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto">
//       <div className="p-4 space-y-2">
//         {/* Main Navigation */}
//         <button
//           onClick={() => handleNavigation("/")}
//           className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 rounded-lg transition-colors text-gray-700 font-medium"
//         >
//           <Home className="w-5 h-5" />
//           Home
//         </button>

//         <button
//           onClick={() => handleNavigation("/menu")}
//           className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 rounded-lg transition-colors text-gray-700 font-medium"
//         >
//           <MenuIcon className="w-5 h-5" />
//           Menu
//         </button>

//         <button
//           onClick={() => handleNavigation("/contact")}
//           className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 rounded-lg transition-colors text-gray-700 font-medium"
//         >
//           <Phone className="w-5 h-5" />
//           Contact
//         </button>

//         {/* User Section */}
//         {user && (
//           <>
//             <div className="border-t border-gray-200 my-2 pt-2">
//               <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
//                 My Account
//               </p>
              
//               {/* Profile Link - ADDED HERE */}
//               <button
//                 onClick={() => handleNavigation("/profile")}
//                 className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 rounded-lg transition-colors text-gray-700 font-medium"
//               >
//                 <User className="w-5 h-5" />
//                 My Profile
//               </button>

//               <button
//                 onClick={() => handleNavigation("/myorders")}
//                 className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 rounded-lg transition-colors text-gray-700 font-medium"
//               >
//                 <ShoppingBag className="w-5 h-5" />
//                 My Orders
//               </button>

//               <button
//                 onClick={() => handleNavigation("/wishlist")}
//                 className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 rounded-lg transition-colors text-gray-700 font-medium"
//               >
//                 <Heart className="w-5 h-5" />
//                 Wishlist
//               </button>
//             </div>

//             <div className="border-t border-gray-200 pt-2">
//               <button
//                 onClick={handleLogout}
//                 className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg transition-colors text-red-600 font-medium"
//               >
//                 <LogOut className="w-5 h-5" />
//                 Logout
//               </button>
//             </div>
//           </>
//         )}

//         {!user && (
//           <div className="border-t border-gray-200 pt-4">
//             <button
//               onClick={() => handleNavigation("/login")}
//               className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
//             >
//               Login
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MobileMenu;