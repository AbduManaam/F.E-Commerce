import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext();
const API_URL = "http://localhost:5000/users";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  // Load user from localStorage when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setCart(parsedUser.cart || []);
    }
  }, []);

  // ✅ Sync cart with backend + localStorage
  const syncCart = async (newCart) => {
    if (!user) {
      setCart(newCart);
      return;
    }

    try {
      // update backend user.cart
      await axios.patch(`${API_URL}/${user.id}`, { cart: newCart });

      // update local state + localStorage
      const updatedUser = { ...user, cart: newCart };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCart(newCart);
    } catch (err) {
      console.error("Cart sync failed:", err);
    }
  };

  // ✅ Add to Cart
  const addToCart = (product, size) => {
    const existing = cart.find(
      (item) => item.id === product.id && item.size === size
    );
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

  // ✅ Remove from Cart
  const removeFromCart = (id, size) => {
    const newCart = cart.filter((item) => !(item.id === id && item.size === size));
    syncCart(newCart);
  };

  // ✅ Update Qty
  const updateQty = (id, size, qty) => {
    const newCart = cart.map((item) =>
      item.id === id && item.size === size ? { ...item, qty } : item
    );
    syncCart(newCart);
  };

  // ✅ Clear Cart
  const clearCart = () => syncCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);


