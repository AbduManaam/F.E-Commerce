

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";

const WishlistContext = createContext();
const API_URL = "http://localhost:5000/users";

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();   // ✅ sync with AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      axios
        .get(`${API_URL}/${user.id}`)
        .then((res) => setWishlist(res.data.wishlist || []))
        .catch((err) => console.error("Failed to fetch wishlist:", err));
    } else {
      setWishlist([]);
    }
  }, [user]);  // ✅ re-run whenever user changes

  const syncWishlist = async (newWishlist) => {
    if (!user) return;
    try {
      await axios.patch(`${API_URL}/${user.id}`, { wishlist: newWishlist });
      setWishlist(newWishlist);
    } catch (err) {
      console.error("Wishlist sync failed:", err);
    }
  };

  const toggleWishlist = (product) => {
    if (!user) return navigate("/login");

    const exists = wishlist.find((w) => w.id === product.id);
    if (exists) {
      syncWishlist(wishlist.filter((w) => w.id !== product.id));
    } else {
      syncWishlist([...wishlist, product]);
    }
  };

  const clearWishlist = () => {
    if (!user) return navigate("/login");
    syncWishlist([]);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);


