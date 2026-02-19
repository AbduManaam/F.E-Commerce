
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import { AuthProvider } from "./Components/AuthContext.jsx";
import { CartProvider } from "./pages/CartContext.jsx";
import { WishlistProvider } from "./pages/WishlistContext.jsx";
import { OrderProvider } from "./pages/OrderContext.jsx";


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>  
             <App />
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
