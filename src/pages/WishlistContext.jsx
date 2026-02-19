import { createContext, useContext, useEffect, useState } from "react";
import apiService from "../service/api.service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";
import { toast } from "react-toastify";
import { useCart } from "./CartContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Load wishlist when user logs in
  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  // ✅ Transform backend data to match frontend format
  const transformProduct = (backendProduct) => {
    // Extract image URLs
    let imageUrls = [];
    if (backendProduct.Images && Array.isArray(backendProduct.Images) && backendProduct.Images.length > 0) {
      imageUrls = backendProduct.Images.map(img => img.url || img.URL).filter(Boolean);
    }
    
    if (imageUrls.length === 0) {
      imageUrls = ["/images/placeholder.png"];
    }

    return {
      id: Number(backendProduct.ID),
      title: backendProduct.Name,
      description: backendProduct.Description || "",
      images: imageUrls,
      price: backendProduct.FinalPrice || backendProduct.Price || 0,
      stock: backendProduct.Stock,
      category_name: backendProduct.CategoryName || backendProduct.category_name,
      _original: backendProduct
    };
  };

  // ✅ Load wishlist from backend using GET /api/wishlist
  const loadWishlist = async () => {
    if (!user) return;
    
    try {
      const response = await apiService.getWishlist();
      if (response.success) {
        const wishlistItems = response.data || [];

        
        // ✅ Extract Product from WishlistItem and transform
        const transformedProducts = wishlistItems.map(item => {
          // Backend returns { ProductID, Product: {...} }
          const product = item.Product || item;
          return transformProduct(product);
        });
        
        console.log("Loaded wishlist:", transformedProducts);
        setWishlist(transformedProducts);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  // ✅ Add to wishlist using POST /api/wishlist
  const addToWishlist = async (product) => {
    if (!user) {
      toast.info("Please login to add items to wishlist");
      navigate("/login");
      return;
    }

    // Check if already in wishlist
    const existing = wishlist.find((item) => Number(item.id) === Number(product.id));
    if (existing) {
      toast.info("❤️ This product is already in your wishlist!");
      return;
    }

    try {
      // POST /api/wishlist with { product_id: number }
      const response = await apiService.addToWishlist(Number(product.id));
      
      if (response.success) {
        setWishlist([...wishlist, product]);
        toast.success("❤️ Added to wishlist!");
      } else {
        throw new Error(response.message || "Failed to add to wishlist");
      }
    } catch (err) {
      console.error("Add to wishlist failed:", err);
      
      const errorMessage = err.response?.data?.error?.message || err.message || "";
      
      if (errorMessage.includes("duplicate key") || errorMessage.includes("unique constraint")) {
        toast.info("❤️ This product is already in your wishlist!");
        loadWishlist();
      } else if (err.response?.status === 401 || err.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to add to wishlist. Please try again.");
      }
    }
  };

  // ✅ Remove from wishlist using DELETE /api/wishlist/:product_id
  const removeFromWishlist = async (id) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // DELETE /api/wishlist/:product_id
      const response = await apiService.removeFromWishlist(id);
      
      if (response.success) {
        // Update local state
        setWishlist(wishlist.filter((item) => item.id !== id));
        toast.info("🗑️ Removed from wishlist");
      } else {
        throw new Error(response.message || "Failed to remove from wishlist");
      }
    } catch (err) {
      console.error("Remove from wishlist failed:", err);
      toast.error("Failed to remove from wishlist");
    }
  };

  // ✅ Clear entire wishlist
  const clearWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // Remove all items one by one
      const promises = wishlist.map(item => apiService.removeFromWishlist(item.id));
      await Promise.all(promises);
      
      setWishlist([]);
      toast.info("❤️ Wishlist cleared");
    } catch (err) {
      console.error("Clear wishlist failed:", err);
      toast.error("Failed to clear wishlist");
    }
  };

  // ✅ Move item from wishlist to cart
  const moveToCart = async (product, size) => {
    if (!user) {
      toast.info("Please login to move items to cart");
      navigate("/login");
      return;
    }

    try {
      // Use the size if provided, otherwise use first available price key
      const selectedSize = size || (product.price && typeof product.price === "object" 
        ? Object.keys(product.price)[0] 
        : null);

      // Add to cart first
      addToCart(product, selectedSize);
      
      // Then remove from wishlist
      await removeFromWishlist(product.id);
      
      toast.success("✅ Moved to cart!");
    } catch (err) {
      console.error("Move to cart failed:", err);
      toast.error("Failed to move to cart");
    }
  };

  return (
    <WishlistContext.Provider
      value={{ 
        wishlist, 
        addToWishlist, 
        removeFromWishlist, 
        clearWishlist, 
        moveToCart,
        loadWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};