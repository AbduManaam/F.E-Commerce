import React, { useState, useEffect, useRef } from "react";
import apiService from "../../service/api.service";
import { Plus, Edit, Trash2, Upload, X, Search, ImagePlus } from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [imageUpload, setImageUpload] = useState({ productId: null, show: false });
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: "", description: "", category_id: "", stock: "", half_price: "", full_price: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiService.client.get("/products/");
      const data = res.data;
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch { showMsg("error", "Failed to load products"); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiService.client.get("/categories/");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch { console.error("Failed to load categories"); }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ name: "", description: "", category_id: "", stock: "", half_price: "", full_price: "" });
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    const prices = product.prices || product.Prices || [];
    const half = prices.find(p => (p.size || p.Size) === "H");
    const full = prices.find(p => (p.size || p.Size) === "F");
    setForm({
      name: product.name || product.Name || "",
      description: product.description || product.Description || "",
      category_id: String(product.category_id || product.CategoryID || ""),
      stock: String(product.stock ?? product.Stock ?? ""),
      half_price: half ? String(half.price || half.Price || "") : "",
      full_price: full ? String(full.price || full.Price || "") : "",
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showMsg("error", "Product name is required"); return; }
    if (!form.category_id) { showMsg("error", "Category is required"); return; }
    if (!form.full_price) { showMsg("error", "Full price is required"); return; }

    try {
      if (editingProduct) {
        // ✅ Edit payload - matches UpdateProductRequest DTO
        const editPayload = {
          name: form.name,
          description: form.description,
          category: form.category_id,
          stock: parseInt(form.stock) || 0,
          prices: [
            ...(form.half_price ? [{ size: "H", price: parseFloat(form.half_price) }] : []),
            { size: "F", price: parseFloat(form.full_price) },
          ],
        };
        const id = editingProduct.id || editingProduct.ID;
        await apiService.client.put(`/admin/products/${id}`, editPayload);
        showMsg("success", "Product updated!");
      } else {
        // ✅ Create payload - matches CreateProductRequest DTO
        const createPayload = {
          title: form.name,                        // ← backend uses "title"
          description: form.description,
          category_id: parseInt(form.category_id), // ← number ID
          stock: parseInt(form.stock) || 0,
          price: {                                 // ← object {H, F} not array
            F: parseFloat(form.full_price),
            ...(form.half_price ? { H: parseFloat(form.half_price) } : {}),
          },
        };
        await apiService.client.post("/admin/products", createPayload);
        showMsg("success", "Product created!");
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      const errMsg = err?.response?.data?.error?.message || err?.response?.data?.error || "Failed to save product";
      showMsg("error", errMsg);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.client.delete(`/admin/products/${id}`);
      showMsg("success", "Product deleted!");
      setProductToDelete(null);
      fetchProducts();
    } catch { showMsg("error", "Failed to delete product"); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      await apiService.client.post(`/admin/products/${imageUpload.productId}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showMsg("success", "Image uploaded!");
      setImageUpload({ productId: null, show: false });
      fetchProducts();
    } catch { showMsg("error", "Failed to upload image"); }
  };

const uniqueCategories = [...new Set(products.map(p => p.category_name || p.category || p.Category).filter(Boolean))];

  const filtered = products.filter(p => {
    const name = (p.name || p.Name || "").toLowerCase();
    const cat = p.category_name || p.category || p.Category || "";
    return name.includes(search.toLowerCase()) && (categoryFilter ? cat === categoryFilter : true);
  });

  const getPrice = (product) => {
    const prices = product.prices || product.Prices || [];
    if (prices.length === 0) return product.price ? `$${product.price}` : "—";
    return prices.map(p => `${p.size || p.Size}: $${p.price || p.Price}`).join(" / ");
  };

  const getImage = (product) => {
    const imgs = product.images || product.Images || [];
    return imgs[0]?.url || imgs[0]?.image_url || imgs[0]?.URL || null;
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🛍 Products</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none">
            <option value="">All Categories</option>
            {uniqueCategories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
          </select>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">ID</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Category</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, i) => {
                const id = product.id || product.ID;
                const img = getImage(product);
                return (
                  <tr key={id || i} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 flex items-center gap-3">
                      {img ? (
                        <img src={img} alt={product.name || product.Name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
                      )}
                      <span className="font-medium text-gray-800">{product.name || product.Name}</span>
                    </td>
                    <td className="p-3 text-gray-500">#{id}</td>
                    <td className="p-3 font-semibold text-gray-700">{getPrice(product)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (product.stock || product.Stock || 0) === 0 ? "bg-red-100 text-red-600" :
                        (product.stock || product.Stock || 0) <= 10 ? "bg-orange-100 text-orange-600" :
                        "bg-green-100 text-green-600"
                      }`}>
                        {product.stock ?? product.Stock ?? 0}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{product.category_name || product.category || product.Category || "—"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(product)} className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setImageUpload({ productId: id, show: true })} className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100" title="Upload Image">
                          <ImagePlus className="w-4 h-4" />
                        </button>
                        <button onClick={() => setProductToDelete(product)} className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-800">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input type="text" placeholder="e.g. Butter Chicken"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                {/* ✅ Category Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select a category</option>
                    {categories.map(c => (
                      <option key={c.ID || c.id} value={c.ID || c.id}>{c.Name || c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" placeholder="0"
                    value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Half Price ($) <span className="text-gray-400 text-xs">(Optional)</span></label>
                  <input type="number" step="0.01" placeholder="Optional"
                    value={form.half_price} onChange={e => setForm({ ...form, half_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Price ($) *</label>
                  <input type="number" step="0.01" placeholder="e.g. 12.99"
                    value={form.full_price} onChange={e => setForm({ ...form, full_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea placeholder="Product description..."
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm">
                    {editingProduct ? "Update Product" : "Create Product"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {imageUpload.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Upload Image</h2>
              <button onClick={() => setImageUpload({ productId: null, show: false })}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition"
              onClick={() => fileRef.current.click()}>
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">Click to select image</p>
              <p className="text-gray-400 text-xs mt-1">JPG, PNG, WEBP</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-3 text-gray-800">Delete Product</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete <strong>"{productToDelete.name || productToDelete.Name}"</strong>? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setProductToDelete(null)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium">Cancel</button>
              <button onClick={() => handleDelete(productToDelete.id || productToDelete.ID)} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}