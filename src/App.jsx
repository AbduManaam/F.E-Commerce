
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Menu from "./pages/Menu";
import AddressForm from "./pages/AddressForm";
import MyOrder from "./pages/MyOrder";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import { CartProvider } from "./pages/CartContext";
import { WishlistProvider } from "./pages/WishlistContext";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Login from "./Components/Login";
import Wishlist from "./pages/Wishlist"; 

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <CartProvider>
      <WishlistProvider>
        <main className="overflow-x-hidden text-textColor">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/addressform" element={<AddressForm />} />
            <Route path="/myorder" element={<MyOrder />} />
            <Route path="/login" element={<Login />} />
            <Route path="/wishlist" element={<Wishlist />} /> 
          </Routes>
          <Footer />
        </main>

        <ToastContainer position="top-right" autoClose={3000} />
      </WishlistProvider>
    </CartProvider>
  );
};

export default App;
