
import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductForm from "./ProductForm";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);

  const API_URL = "http://localhost:5000/products";

  // Load products from JSON server
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //   SAVE 
                                                
  const handleSave = async (product) => {
    try {
      if (product.id!==null) {
        // update product
        await axios.put(`${API_URL}/${product.id}`, product);
      } else {
        // create new product
        await axios.post(API_URL, {
          ...product,
          id: "ID" + Math.floor(Math.random() * 10000),
        });
      }
      fetchProducts(); // refresh list
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("Failed to save product:", err);
    }
  };
                                                //   SAVE 
                                                         
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                //  DELETE 
                                                
  const handleDelete = async (productId) => {
    try {
      await axios.delete(`${API_URL}/${productId}`);
      fetchProducts(); // refresh list
      setProductToDelete(null); // close confirmation dialog
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
  };
                                                //  DELETE 
                                                         
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //  Get unique categories from products
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  //  Apply search + category filter
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  //  Stock status indicator
  const getStockStatus = (stock) => {
    const stockNum = parseInt(stock) || 0;
    if (stockNum === 0) return { text: "Out of Stock", color: "text-red-600 bg-red-100" };
    if (stockNum <= 10) return { text: "Low Stock", color: "text-orange-600 bg-orange-100" };
    return { text: "In Stock", color: "text-green-600 bg-green-100" };
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

          {/* Category Filter Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Categories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Add New Product */}
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
            <tr>
              <th className="p-3">Product Name</th>
              <th className="p-3">Product ID</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Category</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <tr key={product.id || index} className="border-b hover:bg-gray-50">
                  {/* Product Name + Image */}
                  <td className="flex items-center gap-3 p-3">
                    <img
                      src={product.images || "https://via.placeholder.com/40"}
                      alt={product.title}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-medium">{product.title}</span>
                  </td>

                  {/* Product ID */}
                  <td className="p-3 text-gray-500">#{product.id}</td>

                  {/* Price */}
                  <td className="p-3 font-semibold">
                    {product.price &&typeof product.price === "object"
                      ? Object.entries(product.price)
                          .map(([key, value]) => `${key}: $${value}`)
                          .join(" / ")
                      : `$${product.price}`}
                  </td>

                  {/* Stock */}
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {product.stock}
                    </span>
                  </td>

                  {/* Stock Status */}
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </td>

                  {/* Category/Type */}
                  <td className="p-3 text-gray-600">{product.category || "—"}</td>

                  {/* Actions */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                        className="px-3 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 text-sm"
                      >
                        Edit
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => confirmDelete(product)}
                        className="px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete <strong>"{productToDelete.title}"</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(productToDelete.id)}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}