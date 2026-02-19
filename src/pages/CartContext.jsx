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
      const cartData = response.data;
      
      const transformedItems = cartData.Items?.map(item => {
        console.log("🔍 Raw cart item from backend:", item);
        const product = item.Product || {};
        const imageUrls = product.Images?.map(img => img.URL || img.url) || [];
        
        // Handle price - check if product has multiple prices
        let priceData;
        if (product.Prices && Array.isArray(product.Prices) && product.Prices.length > 0) {
          // Convert prices array to object {H: 10, F: 20}
          priceData = product.Prices.reduce((acc, p) => {
            acc[p.Type] = p.Price;
            return acc;
          }, {});
        } else {
          // Single price
          priceData = product.FinalPrice || product.Price || 0;
        }
        
        return {
          id: item.ProductID,
          cartItemId: item.ID,
          title: product.Name || "Unknown Product",
          description: product.Description || "",
          price: priceData,  // ✅ Can be object or number
          images: imageUrls.length > 0 ? imageUrls : ["/images/placeholder.png"],
          qty: item.Quantity,
          size: item.Size || 'H',  // Default to Half
          stock: product.Stock || 0,
          category_name: product.Category?.Name || "",
        };
      }) || [];
      
      setCart(transformedItems);
      setCartCount(transformedItems.reduce((acc, item) => acc + item.qty, 0));
    }
  } catch (err) {
    console.error("Failed to load cart:", err);
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
      await loadCart(); // ✅ replaces manual setCart
      toast.success("✅ Product added to cart!");
    }
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error("Failed to add to cart");
    }
  };

const removeFromCart = async (id, size) => {
  if (!user) {
    navigate("/login");
    return;
  }

  const item = cart.find((item) => item.id === id && item.size === size);
  if (!item) return;

  // ✅ Optimistically remove from UI first
  const newCart = cart.filter((item) => !(item.id === id && item.size === size));
  setCart(newCart);
  setCartCount(newCart.reduce((acc, item) => acc + (item.qty || 1), 0));

  try {
    const response = await apiService.removeCartItem(item.cartItemId || item.id);
    if (!response.success) {
      // ✅ If API fails, reload cart to get correct state
      await loadCart();
      toast.error("Failed to remove item");
    } else {
      toast.info("🗑️ Product removed from cart");
    }
  } catch (err) {
    await loadCart(); // ✅ Re-sync on any error
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
    if (!item) {
      console.error("Cart item not found");
      return;
    }

    // ✅ cartItemId should always exist now
    if (!item.cartItemId) {
      console.error("Cart item missing cartItemId:", item);
      toast.error("Invalid cart item");
      return;
    }

    const response = await apiService.updateCartItem(item.cartItemId, qty);

    if (response.success) {
      const newCart = cart.map((cartItem) =>
        cartItem.id === id && cartItem.size === size
          ? { ...cartItem, qty }
          : cartItem
      );
      setCart(newCart);
      setCartCount(newCart.reduce((acc, item) => acc + item.qty, 0));
      toast.success("Cart updated");
    }
  } catch (err) {
    console.error("Update quantity failed:", err);
    toast.error("Failed to update quantity");
  }
};

// Reset Cart

const resetCart = async () => {
  setCart([]);
  setCartCount(0);
  await loadCart();
};


  //  Clear cart
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
      value={{ cart, cartCount, addToCart, removeFromCart, updateQty, clearCart, loadCart,resetCart }}
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