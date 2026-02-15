import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";
import { toast } from "react-toastify";

const WishlistContext = createContext();
const API_URL = "http://localhost:5000/users";

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      axios
        .get(`${API_URL}/${user.id}`)
        .then((res) => setWishlist(res.data.wishlist || []))
        .catch((err) => console.error("Failed to fetch user wishlist:", err));
    } else {
      setWishlist([]);
    }
  }, [user]);

  const syncWishlist = async (newWishlist) => {
    if (!user) return;
    try {
      await axios.patch(`${API_URL}/${user.id}`, { wishlist: newWishlist });
      setWishlist(newWishlist);
    } catch (err) {
      console.error("Wishlist sync failed:", err);
    }
  };

  const addToWishlist = (product) => {
    if (!user) return navigate("/login");

    const existing = wishlist.find((item) => item.id === product.id);
    
    if (existing) {
      toast.info("❤️ This product is already in your wishlist!");
      return;
    }

    const newWishlist = [...wishlist, product];
    syncWishlist(newWishlist);
    toast.success("❤️ Added to wishlist!");
  };

  const removeFromWishlist = (id) => {
    if (!user) return navigate("/login");
    syncWishlist(wishlist.filter((item) => item.id !== id));
    toast.info("🗑️ Removed from wishlist");
  };

  const clearWishlist = () => {
    if (!user) return navigate("/login");
    syncWishlist([]);
    toast.info("❤️ Wishlist cleared");
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// ✅ Export useWishlist hook
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};