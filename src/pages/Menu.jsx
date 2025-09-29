


import React, { useEffect, useState } from "react";
import Api from "../Api/Api";
import Items from "../Components/items";

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ✅ pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // how many products per page

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
    setCurrentPage(1); // reset to first page when category changes
    if (category === "All") {
      setFiltered(products);
    } else {
      setFiltered(products.filter((p) => p.category === category));
    }
  };

  // ✅ pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
        {currentItems.map((product) => (
          <div key={product.id} className="w-full max-w-[380px] mx-auto">
            <Items product={product} />
          </div>
        ))}
      </div>

      {/* ✅ Pagination Controls */}
      <div className="flex items-center justify-center mt-16">
        <div className="flex items-center justify-between w-full max-w-80 text-gray-500 font-medium">
          {/* Prev button */}
          <button
            type="button"
            aria-label="prev"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-full bg-slate-200/50 disabled:opacity-50"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z"
                fill="#475569"
                stroke="#475569"
                strokeWidth=".078"
              />
            </svg>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-2 text-sm font-medium">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => goToPage(i + 1)}
                className={`h-10 w-10 flex items-center justify-center aspect-square ${
                  currentPage === i + 1
                    ? "text-indigo-500 border border-indigo-200 rounded-full"
                    : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            type="button"
            aria-label="next"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-full bg-slate-200/50 disabled:opacity-50"
          >
            <svg
              className="rotate-180"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z"
                fill="#475569"
                stroke="#475569"
                strokeWidth=".078"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menu;
