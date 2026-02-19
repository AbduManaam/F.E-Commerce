import React, { useEffect, useState } from "react";
import apiService from "../service/api.service";
import Items from "../Components/Items";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { Search, Filter, X, ChevronDown, Grid, List } from "lucide-react";

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 8;

  const { cart, addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Sort options
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name", label: "Name: A-Z" },
  ];

  // Price ranges
  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "0-10", label: "Under $10" },
    { value: "10-25", label: "$10 - $25" },
    { value: "25-50", label: "$25 - $50" },
    { value: "50+", label: "$50+" },
  ];

  // Transform backend data
  const transformProduct = (backendProduct) => {
    let imageUrls = [];
    if (backendProduct.Images && Array.isArray(backendProduct.Images) && backendProduct.Images.length > 0) {
      imageUrls = backendProduct.Images.map(img => img.URL || img.url).filter(Boolean);
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
      created_at: backendProduct.CreatedAt,
      _original: backendProduct
    };
  };

  // ✅ Fetch categories — stores full objects {ID, Name}
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8080/categories/");
        const data = await res.json();
        setCategories(data); // [{ID: 13, Name: "Curry"}, ...]
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Accepts categoryId to send to backend
 const fetchProducts = async (
  category = "All",
  page = 1,
  search = "",
  sort = sortBy,
  price = priceRange,
  categoryId = ""
) => {
  try {
    setLoading(true);

    const params = {
      // ✅ only send category_id, not category_name
      ...(categoryId ? { category_id: categoryId } : {}),
      page: page,
      limit: itemsPerPage,
      search: search,
      sort: sort.includes('price') ? 'price' : 'created_at',
      order: sort === 'price-high' ? 'desc' : 'asc',
    };

    // Add price filter if selected
    if (price !== 'all') {
      const [min, max] = price.split('-').map(p => p.replace('+', ''));
      params.min_price = min;
      if (max) params.max_price = max;
    }

    const response = await apiService.getFilteredProducts(params);

    if (response.success) {
      const productList = response.data.products || [];
      let transformedProducts = productList.map(transformProduct);

      // Client-side sorting for name
      if (sort === 'name') {
        transformedProducts.sort((a, b) => a.title.localeCompare(b.title));
      }

      setProducts(transformedProducts);
      setTotalCount(response.data.total || 0);
      setCurrentPage(page);
    } else {
      setProducts([]);
      setTotalCount(0);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    setProducts([]);
    setTotalCount(0);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProducts();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(selectedCategory, 1, searchTerm, sortBy, priceRange);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, sortBy]);

  // ✅ Accepts both name and ID
  const handleFilter = (categoryName, categoryId = "") => {
    setSelectedCategory(categoryName);
    setCurrentPage(1);
    fetchProducts(categoryName, 1, searchTerm, sortBy, priceRange, categoryId);
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setSearchTerm("");
    setSortBy("newest");
    setPriceRange("all");
    setCurrentPage(1);
    fetchProducts("All", 1, "", "newest", "all", "");
  };

  const hasActiveFilters =
    selectedCategory !== "All" || searchTerm || sortBy !== "newest" || priceRange !== "all";

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchProducts(selectedCategory, page, searchTerm, sortBy, priceRange);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Menu</h1>
          <p className="text-gray-600">Discover our delicious selection of dishes</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for delicious food..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">

            {/* Left: Filter Toggle & Active Filter Pills */}
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 w-2 h-2 bg-amber-500 rounded-full"></span>
                )}
              </button>

              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  {selectedCategory}
                  <button onClick={() => handleFilter("All", "")} className="hover:text-amber-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {priceRange !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {priceRanges.find(r => r.value === priceRange)?.label}
                  <button onClick={() => setPriceRange("all")} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Right: Sort & View Toggle */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-white shadow-sm text-amber-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-white shadow-sm text-amber-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Filter Section */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* ✅ Categories */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">

                  {/* All button */}
                  <button
                    onClick={() => handleFilter("All", "")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === "All"
                        ? "bg-amber-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>

                  {/* Dynamic category buttons from backend */}
                  {categories.map((cat) => (
                    <button
                      key={cat.ID}
                      onClick={() => handleFilter(cat.Name, cat.ID)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === cat.Name
                          ? "bg-amber-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {cat.Name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => {
                        setPriceRange(range.value);
                        fetchProducts(selectedCategory, 1, searchTerm, sortBy, range.value);
                        }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        priceRange === range.value
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{products.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalCount}</span> products
          </p>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? `We couldn't find any products matching "${searchTerm}"`
                : "No products available in this category."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}>
            {products.map((product) => (
              <div key={product.id} className={viewMode === "list" ? "w-full" : ""}>
                <Items product={product} viewMode={viewMode} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center mt-12">
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition ${
                          currentPage === pageNum
                            ? "bg-amber-500 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;