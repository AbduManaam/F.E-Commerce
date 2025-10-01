

import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Menu from "./pages/Menu";
import AddressForm from "./pages/AddressForm";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import MyOrder from "./pages/MyOrder";   // ✅ import MyOrder
import { CartProvider } from "./pages/CartContext";
import { WishlistProvider } from "./pages/WishlistContext";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Login from "./Components/Login";
import Wishlist from "./pages/Wishlist";


import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminDashboard from "./Admin/AdminDashboard";

// Admin user pages
import UsersPage from "./Admin/UserPage/UsersPage";
import UserCreate from "./Admin/UserPage/UserCreate";
import UserView from "./Admin/UserPage/UserView";
import UserEdit from "./Admin/UserPage/UserEdit";

const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admindash");

  return (
    <>
      {!isAdminPage && <Header />}

      <Routes>
        {/* User-side */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/addressform" element={<AddressForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/myorders" element={<MyOrder />} /> {/* ✅ My Orders page */}

        {/* Admin-side */}
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/users/create" element={<UserCreate />} />
        <Route path="/admin/users/:id" element={<UserView />} />
        <Route path="/admin/users/edit/:id" element={<UserEdit />} />

        <Route path="/admindash/*" element={<AdminDashboard />} />
      </Routes>

      {!isAdminPage && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <CartProvider>
      <WishlistProvider>
        <main className="overflow-x-hidden text-textColor">
          <AppContent />
        </main>
        <ToastContainer position="top-right" autoClose={3000} />
      </WishlistProvider>
    </CartProvider>
  );
};

export default App;
