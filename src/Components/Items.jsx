
import React, { useState } from "react";
import { useCart } from "../pages/CartContext";
import { useWishlist } from "../pages/WishlistContext";
import { toast } from "react-toastify";
import { ShoppingCart, ArrowRight } from "lucide-react";

const Items = ({ product, viewMode = "grid" }) => {
  // Initialize with first available size or 'H' for half/full
  const [size, setSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : "H"
  );
  const [imageError, setImageError] = useState(false);

  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, moveToCart } = useWishlist();
  const currency = "$";

  const isInWishlist = wishlist.some((w) => Number(w.id) === Number(product.id));

  const handleAddToCart = () => {
    addToCart(product, size);
  };

  const handleWishlistToggle = () => {

     console.log("Product being added:", product); // ✅ Add this
  console.log("Product ID:", product.id);

    if (isInWishlist) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  const getImageUrl = () => {
    if (!product.images || product.images.length === 0) {
      return null;
    }
    return Array.isArray(product.images) ? product.images[0] : product.images;
  };

  const imageUrl = getImageUrl();

  // Check if product has Half/Full pricing
  const hasHalfFullPricing = product._original?.Prices &&
    Array.isArray(product._original.Prices) &&
    product._original.Prices.length > 1;

  // Get price for selected size
  const getPrice = () => {
    if (hasHalfFullPricing && product._original?.Prices) {
      const priceObj = product._original.Prices.find(p => p.Type === size);
      return priceObj ? priceObj.Price : product.price;
    }
    return product.price;
  };

  const currentPrice = getPrice();

  // LIST VIEW
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-6 hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden relative bg-gray-100">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
          )}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 rounded-full p-2 shadow-md transition ${
              isInWishlist ? "bg-red-500" : "bg-white hover:bg-red-50"
            }`}
          >
            <img
              src={isInWishlist ? "/images/other/white wishlist.png" : "/images/other/wishlist.png"}
              alt="wishlist"
              className="w-4 h-4"
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">{product.title}</h3>
              <span className="text-2xl font-bold text-red-500">
                {currency}{currentPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>

            {product.category_name && (
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                {product.category_name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-4">
            {hasHalfFullPricing && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setSize("H")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    size === "H" ? "bg-white shadow-sm text-amber-600" : "text-gray-600"
                  }`}
                >
                  Half
                </button>
                <button
                  onClick={() => setSize("F")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    size === "F" ? "bg-white shadow-sm text-amber-600" : "text-gray-600"
                  }`}
                >
                  Full
                </button>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>

            {isInWishlist && (
              <button
                onClick={() => moveToCart(product, size)}
                className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-md transition flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Move to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // GRID VIEW (Original with improvements)
  return (
    <div className="bg-white rounded-2xl shadow-lg pt-16 pb-6 px-5 relative flex flex-col items-center transition transform hover:-translate-y-1 hover:shadow-xl">
      {imageUrl && !imageError ? (
        <div className="w-full h-48 flex-shrink-0 rounded-xl overflow-hidden relative bg-gray-100">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Image failed to load:", imageUrl);
              setImageError(true);
            }}
          />

          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 rounded-full p-2 shadow-md transition ${
              isInWishlist ? "bg-red-500" : "bg-white hover:bg-red-50"
            }`}
          >
            <img
              src={
                isInWishlist
                  ? "/images/other/white wishlist.png"
                  : "/images/other/wishlist.png"
              }
              alt="wishlist"
              className="w-5 h-5"
            />
          </button>
        </div>
      ) : (
        <div className="w-full h-48 rounded-t-2xl overflow-hidden relative bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-xs text-gray-500">No Image</p>
          </div>

          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 rounded-full p-2 shadow-md transition ${
              isInWishlist ? "bg-red-500" : "bg-white hover:bg-red-50"
            }`}
          >
            <img
              src={
                isInWishlist
                  ? "/images/other/white wishlist.png"
                  : "/images/other/wishlist.png"
              }
              alt="wishlist"
              className="w-5 h-5"
            />
          </button>
        </div>
      )}

      <div className="mt-4 text-center flex-1 w-full">
        <h3 className="text-lg font-semibold line-clamp-1">{product.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {product.description}
        </p>
      </div>

      {/* Half/Full Toggle or Size Buttons */}
      {hasHalfFullPricing ? (
        <div className="flex items-center gap-1 mt-3 bg-white rounded-full p-1 shadow-sm">
          <button
            onClick={() => setSize("H")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              size === "H"
                ? "bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Half
          </button>
          <button
            onClick={() => setSize("F")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              size === "F"
                ? "bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Full
          </button>
        </div>
      ) : product.sizes && product.sizes.length > 1 && product.sizes[0] !== "default" ? (
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          {product.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-3 py-1 text-xs rounded-full transition ${
                s === size
                  ? "bg-solidOne text-white shadow-sm"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex justify-between items-center mt-5 w-full">
        <span className="font-bold text-red-500 text-lg">
          {currency}{currentPrice.toFixed(2)}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="bg-solidOne hover:bg-solidTwo text-white rounded-full p-3 shadow-md transition"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          {isInWishlist && (
            <button
              onClick={() => moveToCart(product, size)}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-md transition"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Items;