
import React, { useEffect, useState } from "react";
import Api from "../Api/Api";
import Items from "../Components/items";

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    // fetch all products
    Api.get("/products")
      .then((res) => {
        setProducts(res.data);
        setFiltered(res.data);

        // unique categories from products
        const uniqueCategories = [
          "All",
          ...new Set(res.data.map((p) => p.category)),
        ];
        setCategories(uniqueCategories);
      })
      .catch((err) => console.error(err));
  }, []);

  // handle filter
  const handleFilter = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFiltered(products);
    } else {
      setFiltered(products.filter((p) => p.category === category));
    }
  };

  if (!products.length) return <p>Loading...</p>;

  return (
    <div className="p-16 py-48 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center"> Menu</h1>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-36">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              selectedCategory === cat
                ? "bg-solidOne text-white border-solidOne"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-16 mt-10">
        {filtered.map((product) => (
          <div key={product.id} className="w-full max-w-[380px] mx-auto">
            <Items product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
