

// import React, { useState } from "react";
// import { useCart } from "../pages/CartContext";
// import { useWishlist } from "../pages/WishlistContext";

// const Items = ({ product }) => {
//   // If product has sizes, default to "H", else null
//   const [size, setSize] = useState(
//     product.price && typeof product.price === "object"
//       ? Object.keys(product.price)[0] // first size key (H)
//       : null
//   );

//   const { addToCart } = useCart();
//   const { wishlist, toggleWishlist } = useWishlist();
//   const currency = "$";

//   const handleAddToCart = () => {
//     addToCart(product, size);
//   };

//   const handleWishlist = () => {
//     toggleWishlist(product);
//   };

//   const isInWishlist = wishlist.some((w) => w.id === product.id);

//   return (
//     <div className="bg-pink-50 rounded-2xl shadow-lg pt-16 pb-6 px-5 relative flex flex-col items-center transition transform hover:-translate-y-1 hover:shadow-xl">
//       {/* Product Image */}
//       {product.images ? (
//         <div className="w-full h-48 rounded-t-2xl overflow-hidden relative">
//           <img
//             src={Array.isArray(product.images) ? product.images[0] : product.images}
//             alt={product.title}
//             className="w-full h-full object-cover"
//           />

//           {/* ❤️ Wishlist Toggle */}
//           <button
//             onClick={handleWishlist}
//             className={`absolute top-2 right-2 rounded-full p-2 shadow-md transition ${
//               isInWishlist ? "bg-red-500" : "bg-white hover:bg-red-50"
//             }`}
//           >
//             <img
//               src={
//                 isInWishlist
//                   ? "/images/other/white wishlist.png"
//                   : "/images/other/wishlist.png"
//               }
//               alt="wishlist"
//               className="w-5 h-5"
//             />
//           </button>
//         </div>
//       ) : (
//         <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-4 border-white shadow-md flex items-center justify-center bg-gray-200 text-xs">
//           No Img
//         </div>
//       )}

//       {/* Info */}
//       <div className="mt-4 text-center flex-1">
//         <h3 className="text-lg font-semibold line-clamp-1">{product.title}</h3>
//         <p className="text-sm text-gray-500 mt-1 line-clamp-2">
//           {product.description}
//         </p>
//       </div>

//       {/* Sizes */}
//       {product.price && typeof product.price === "object" && (
//         <div className="flex justify-center gap-2 mt-3 flex-wrap">
//           {Object.keys(product.price).map((key) => (
//             <button
//               key={key}
//               onClick={() => setSize(key)}
//               className={`px-3 py-1 text-xs rounded-full transition ${
//                 key === size
//                   ? "bg-solidOne text-white shadow-sm"
//                   : "border border-gray-300 text-gray-700 hover:bg-gray-100"
//               }`}
//             >
//               {key}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Price + Cart */}
//       <div className="flex justify-between items-center mt-5 w-full">
//         <span className="font-bold text-red-500 text-lg">
//           {currency}
//           {size && product.price && typeof product.price === "object"
//             ? product.price[size]
//             : product.price}
//         </span>
//         <button
//           onClick={handleAddToCart}
//           className="bg-solidOne hover:bg-solidTwo text-white rounded-full p-3 shadow-md transition"
//         >
//           🛒
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Items;


import React, { useState } from "react";
import { useCart } from "../pages/CartContext";
import { useWishlist } from "../pages/WishlistContext";
import { toast } from "react-toastify"; // ✅ Import toast

const Items = ({ product }) => {
  const [size, setSize] = useState(
    product.price && typeof product.price === "object"
      ? Object.keys(product.price)[0]
      : null
  );

  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const currency = "$";

  const handleAddToCart = () => {
    addToCart(product, size);
    // ✅ Toast will be shown from CartContext now
  };

  const handleWishlist = () => {
    toggleWishlist(product);
  };

  const isInWishlist = wishlist.some((w) => w.id === product.id);

  return (
    <div className="bg-pink-50 rounded-2xl shadow-lg pt-16 pb-6 px-5 relative flex flex-col items-center transition transform hover:-translate-y-1 hover:shadow-xl">
      {/* Product Image */}
      {product.images ? (
        <div className="w-full h-48 rounded-t-2xl overflow-hidden relative">
          <img
            src={Array.isArray(product.images) ? product.images[0] : product.images}
            alt={product.title}
            className="w-full h-full object-cover"
          />

          {/* ❤️ Wishlist Toggle */}
          <button
            onClick={handleWishlist}
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
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-4 border-white shadow-md flex items-center justify-center bg-gray-200 text-xs">
          No Img
        </div>
      )}

      {/* Rest of your JSX remains the same */}
      <div className="mt-4 text-center flex-1">
        <h3 className="text-lg font-semibold line-clamp-1">{product.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {product.description}
        </p>
      </div>

      {product.price && typeof product.price === "object" && (
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          {Object.keys(product.price).map((key) => (
            <button
              key={key}
              onClick={() => setSize(key)}
              className={`px-3 py-1 text-xs rounded-full transition ${
                key === size
                  ? "bg-solidOne text-white shadow-sm"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-5 w-full">
        <span className="font-bold text-red-500 text-lg">
          {currency}
          {size && product.price && typeof product.price === "object"
            ? product.price[size]
            : product.price}
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