import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";
import { toast } from "react-toastify";

const CartContext = createContext();
const API_URL = "http://localhost:5000/users";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      axios
        .get(`${API_URL}/${user.id}`)
        .then((res) => setCart(res.data.cart || []))
        .catch((err) => console.error("Failed to fetch user cart:", err));
    } else {
      setCart([]);
    }
  }, [user]);

  const syncCart = async (newCart) => {
    if (!user) return;
    try {
      await axios.patch(`${API_URL}/${user.id}`, { cart: newCart });
      setCart(newCart);
    } catch (err) {
      console.error("Cart sync failed:", err);
    }
  };

  const addToCart = (product, size) => {
    if (!user) return navigate("/login");

    const existing = cart.find((item) => item.id === product.id && item.size === size);
    
    if (existing) {
      toast.info("🛒 This product is already in your cart!");
      return;
    }

    const newCart = [...cart, { ...product, size, qty: 1 }];
    syncCart(newCart);
    toast.success("✅ Product added to cart!");
  };

  const removeFromCart = (id, size) => {
    if (!user) return navigate("/login");
    syncCart(cart.filter((item) => !(item.id === id && item.size === size)));
    toast.info("🗑️ Product removed from cart");
  };

  const updateQty = (id, size, qty) => {
    if (!user) return navigate("/login");
    syncCart(cart.map((item) =>
      item.id === id && item.size === size ? { ...item, qty } : item
    ));
  };

  const clearCart = () => {
    if (!user) return navigate("/login");
    syncCart([]);
    toast.info("🛒 Cart cleared");
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// ✅ IMPORTANT: This export must be here
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};