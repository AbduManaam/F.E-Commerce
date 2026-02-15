import React from "react";
import { useWishlist } from "./WishlistContext";
import Items from "../Components/Items";
// import Items from "../Components/items"

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

  return (
    <div className="p-6 py-40">
      <h1 className="text-2xl font-bold mb-6">My Wishlist ❤️</h1>

      {wishlist.length === 0 ? (
        <p>Your wishlist is empty</p>
      ) : (
        <>
          {/*  same grid style as Menu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="relative">
                {/* Card (same size as Menu) */}
                <Items product={item} />

                {/*  Remove button (top-left corner) */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 left-3 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow hover:bg-red-600 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Clear Wishlist */}
          <button
            onClick={clearWishlist}
            className="mt-6 bg-gray-800 text-white px-4 py-2 rounded-lg"
          >
            Clear Wishlist
          </button>
        </>
      )}
    </div>
  );
};

export default Wishlist;


