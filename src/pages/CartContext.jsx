import { createContext, useContext, useEffect, useState } from "react";
import apiService from "../service/api.service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCart([]);
      setCartCount(0);
    }
  }, [user]);


  
 // ✅ Load cart from backend
const loadCart = async () => {
  if (!user) return;
  
  try {
    const response = await apiService.getCart();
    if (response.success) {
      // ✅ FIX: Ensure cart is always an array
      const cartData = Array.isArray(response.data) ? response.data : [];
      setCart(cartData);
      const count = cartData.reduce((acc, item) => acc + (item.qty || 1), 0);
      setCartCount(count);
    }
  } catch (err) {
    console.error("Failed to fetch cart:", err);
    setCart([]); // ✅ Set empty array on error
    setCartCount(0);
  }
};


  // ✅ Add to cart using POST /api/cart
  const addToCart = async (product, size) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const existing = cart.find((item) => item.id === product.id && item.size === size);

    if (existing) {
      toast.info("🛒 This product is already in your cart!");
      return;
    }

    try {
      const response = await apiService.addToCart(product.id, 1);
      
      if (response.success) {
        const newItem = { ...product, size, qty: 1 };
        const newCart = [...cart, newItem];
        setCart(newCart);
        setCartCount(cartCount + 1);
        toast.success("✅ Product added to cart!");
      }
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error("Failed to add to cart");
    }
  };

  // ✅ Remove from cart using DELETE /api/cart/item/:itemId
  const removeFromCart = async (id, size) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // Find the cart item ID (you'll need this from your backend response)
      const item = cart.find((item) => item.id === id && item.size === size);
      if (!item) return;

      const response = await apiService.removeCartItem(item.cartItemId || id);
      
      if (response.success) {
        const newCart = cart.filter((item) => !(item.id === id && item.size === size));
        setCart(newCart);
        const count = newCart.reduce((acc, item) => acc + (item.qty || 1), 0);
        setCartCount(count);
        toast.info("🗑️ Product removed from cart");
      }
    } catch (err) {
      console.error("Remove from cart failed:", err);
      toast.error("Failed to remove from cart");
    }
  };

  // ✅ Update quantity using PUT /api/cart/item/:itemId
  const updateQty = async (id, size, qty) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const item = cart.find((item) => item.id === id && item.size === size);
      if (!item) return;

      const response = await apiService.updateCartItem(item.cartItemId || id, qty);
      
      if (response.success) {
        const newCart = cart.map((item) =>
          item.id === id && item.size === size ? { ...item, qty } : item
        );
        setCart(newCart);
        const count = newCart.reduce((acc, item) => acc + (item.qty || 1), 0);
        setCartCount(count);
      }
    } catch (err) {
      console.error("Update quantity failed:", err);
      toast.error("Failed to update quantity");
    }
  };

  // ✅ Clear cart
  const clearCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const promises = cart.map(item => apiService.removeCartItem(item.cartItemId || item.id));
      await Promise.all(promises);
      
      setCart([]);
      setCartCount(0);
      toast.info("🛒 Cart cleared");
    } catch (err) {
      console.error("Clear cart failed:", err);
      toast.error("Failed to clear cart");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, cartCount, addToCart, removeFromCart, updateQty, clearCart, loadCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};