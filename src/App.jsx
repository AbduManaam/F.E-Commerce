
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Menu from "./pages/Menu";
import AddressForm from "./pages/AddressForm";
import MyOrder from "./pages/MyOrder";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";  // ✅ Corrected: Cart page
import { CartProvider } from "./pages/CartContext"; // ✅ Cart Context
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Login from "./Components/Login";

const App = () => {
  return (
    <CartProvider>
    
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
          </Routes>
          <Footer />
        </main>
      
    </CartProvider>
  );
};

export default App;
