


import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";

const CartContext = createContext();
const API_URL = "http://localhost:5000/users";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useAuth();   // ✅ always get latest user from AuthContext
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
  }, [user]);  // ✅ re-run whenever user changes

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
    let newCart;
    if (existing) {
      newCart = cart.map((item) =>
        item.id === product.id && item.size === size
          ? { ...item, qty: item.qty + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, size, qty: 1 }];
    }
    syncCart(newCart);
  };

  const removeFromCart = (id, size) => {
    if (!user) return navigate("/login");
    syncCart(cart.filter((item) => !(item.id === id && item.size === size)));
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
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);


