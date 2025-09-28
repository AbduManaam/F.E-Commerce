

import React, { useState } from "react";
import { useCart } from "../pages/CartContext";

const Items = ({ product }) => {
  const [size, setSize] = useState(product.sizes ? product.sizes[0] : null);
  const { addToCart } = useCart();
  const currency = "$";

  const handleAddToCart = () => {
    addToCart(product, size);
  };

  return (
    <div className="bg-pink-50 rounded-2xl shadow-lg pt-16 pb-6 px-5 relative flex flex-col items-center transition transform hover:-translate-y-1 hover:shadow-xl">
      {/* Product Image */}
      {product.images ? (
<div className="w-full h-48 rounded-t-2xl overflow-hidden">
          <img
            src={Array.isArray(product.images) ? product.images[0] : product.images}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-4 border-white shadow-md flex items-center justify-center bg-gray-200 text-xs">
          No Img
        </div>
      )}
      {/* Product Image - full width instead of circle */}



      {/* Info */}
      <div className="mt-4 text-center flex-1">
        <h3 className="text-lg font-semibold line-clamp-1">{product.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {product.description}
        </p>
      </div>

      {/* Sizes */}
      {product.sizes && (
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          {product.sizes.map((item, i) => (
            <button
              key={i}
              onClick={() => setSize(item)}
              className={`px-3 py-1 text-xs rounded-full transition ${
                item === size
                  ? "bg-solidOne text-white shadow-sm"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Price + Cart */}
      <div className="flex justify-between items-center mt-5 w-full">
        <span className="font-bold text-red-500 text-lg">
          {currency}
          {size ? product.price[size] : product.price}
        </span>
        <button
          onClick={handleAddToCart}
          className="bg-solidOne hover:bg-solidTwo text-white rounded-full p-3 shadow-md transition"
        >
          🛒
        </button>
      </div>
    </div>
  );
};

export default Items;
