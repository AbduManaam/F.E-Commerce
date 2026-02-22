// src/Components/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import apiService from "../service/api.service";
import {
  User, Mail, Shield, CheckCircle, AlertCircle, Lock,
  Eye, EyeOff, ShoppingBag, Heart, MapPin, LogOut,
  Edit3, Package, ChevronRight, Plus, Trash2, Home, Star,
} from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [profileForm, setProfileForm] = useState({ name: "" });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    full_name: "", phone: "", address: "", city: "",
    state: "", country: "", zip_code: "", landmark: "", is_default: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchProfile();
    fetchOrders();
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "addresses") fetchAddresses();
  }, [activeTab]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // ─── REAL-TIME INPUT FILTER ───────────────────────────────────────────────
  // Called by every address field onChange instead of directly setAddressForm
  const handleAddressChange = (key, value) => {
    const lettersOnlyFields = ["full_name", "city", "state", "country"];
    const digitsOnlyFields  = ["phone", "zip_code"];

    if (lettersOnlyFields.includes(key)) {
      // Allow letters, spaces, dots, hyphens, apostrophes — block all digits & other specials
      value = value.replace(/[^a-zA-Z\s.\-']/g, "");
    } else if (digitsOnlyFields.includes(key)) {
      // Allow digits only
      value = value.replace(/[^0-9]/g, "");
    }
    // "address" and "landmark" accept everything (numbers + text + symbols)

    setAddressForm((prev) => ({ ...prev, [key]: value }));
  };

  // ─── API CALLS ────────────────────────────────────────────────────────────

  const fetchProfile = async () => {
    try {
      const result = await apiService.getProfile();
      if (result.success) {
        setProfile(result.user);
        setProfileForm({ name: result.user.Name || result.user.name || "" });
      } else {
        showMessage("error", "Failed to load profile");
      }
    } catch {
      showMessage("error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const result = await apiService.getOrders();
      if (result.success) {
        setOrders(Array.isArray(result.data) ? result.data : []);
      } else {
        setOrders([]);
      }
    } catch {
      showMessage("error", "Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const result = await apiService.getAddresses();
      if (result.success) {
        setAddresses(Array.isArray(result.data) ? result.data : []);
      } else {
        setAddresses([]);
      }
    } catch {
      showMessage("error", "Failed to load addresses");
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { showMessage("error", "Name is required"); return; }
    try {
      await apiService.client.put("/user/profile", { name: profileForm.name });
      setProfile((prev) => ({ ...prev, Name: profileForm.name, name: profileForm.name }));
      showMessage("success", "Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      showMessage("error", err?.response?.data?.error || err?.details?.error || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) { showMessage("error", "Please fill all password fields"); return; }
    if (newPassword !== confirmPassword) { showMessage("error", "New passwords don't match"); return; }
    if (newPassword.length < 6) { showMessage("error", "Password must be at least 6 characters"); return; }
    const result = await apiService.changePassword(currentPassword, newPassword);
    if (result.success) {
      showMessage("success", "Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      showMessage("error", result.message || "Failed to change password");
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    // Submit-time validation (second safety net)
    if (!addressForm.full_name.trim())                              { showMessage("error", "Full name is required"); return; }
    if (!addressForm.phone.trim())                                  { showMessage("error", "Phone number is required"); return; }
    if (!/^\d{10}$/.test(addressForm.phone.trim()))                 { showMessage("error", "Phone must be exactly 10 digits"); return; }
    if (!addressForm.address.trim())                                { showMessage("error", "Address is required"); return; }
    if (!addressForm.city.trim())                                   { showMessage("error", "City is required"); return; }
    if (!addressForm.state.trim())                                  { showMessage("error", "State is required"); return; }
    if (!addressForm.country.trim())                                { showMessage("error", "Country is required"); return; }
    if (!addressForm.zip_code.trim())                               { showMessage("error", "ZIP code is required"); return; }
    if (!/^\d{4,10}$/.test(addressForm.zip_code.trim()))            { showMessage("error", "Enter a valid ZIP code (4–10 digits)"); return; }

    // Client-side limit check — instant feedback, no network round trip
    if (!editingAddress && addresses.length >= 3) {
      showMessage("error", "Address limit reached: Maximum 3 addresses allowed");
      return;
    }

    try {
      if (editingAddress) {
        await apiService.client.put(`/api/addresses/${editingAddress.ID || editingAddress.id}`, addressForm);
        showMessage("success", "Address updated!");
      } else {
        const result = await apiService.createAddress(addressForm);
        if (!result.success) { showMessage("error", result.message || "Failed to save address"); return; }
        showMessage("success", "Address added!");
      }
      resetAddressForm();
      fetchAddresses();
    } catch (err) {
      // Walk all common backend error shapes to find the real message
      const data = err?.response?.data;
      const msg =
        (typeof data?.error === "string"   ? data.error           : null) ||
        (typeof data?.message === "string" ? data.message         : null) ||
        data?.error?.message                                               ||
        err?.message                                                       ||
        "Failed to save address";
      showMessage("error", msg);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await apiService.client.delete(`/api/addresses/${id}`);
      showMessage("success", "Address deleted!");
      fetchAddresses();
    } catch {
      showMessage("error", "Failed to delete address");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await apiService.client.put(`/api/addresses/${id}/set-default`);
      showMessage("success", "Default address updated!");
      fetchAddresses();
    } catch {
      showMessage("error", "Failed to set default address");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    const result = await apiService.cancelOrder(orderId);
    if (result.success) {
      showMessage("success", "Order cancelled!");
      fetchOrders();
    } else {
      showMessage("error", result.message || "Failed to cancel order");
    }
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const resetAddressForm = () => {
    setAddressForm({ full_name: "", phone: "", address: "", city: "", state: "", country: "", zip_code: "", landmark: "", is_default: false });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const startEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      full_name: addr.FullName  || addr.full_name  || "",
      phone:     addr.Phone     || addr.phone      || "",
      address:   addr.Address   || addr.address    || "",
      city:      addr.City      || addr.city       || "",
      state:     addr.State     || addr.state      || "",
      country:   addr.Country   || addr.country    || "",
      zip_code:  addr.ZipCode   || addr.zip_code   || "",
      landmark:  addr.Landmark  || addr.landmark   || "",
      is_default: addr.IsDefault || addr.is_default || false,
    });
    setShowAddressForm(true);
  };

  const togglePasswordVisibility = (field) =>
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":  return "bg-green-100 text-green-700";
      case "cancelled":  return "bg-red-100 text-red-700";
      case "shipped":    return "bg-blue-100 text-blue-700";
      case "confirmed":  return "bg-amber-100 text-amber-700";
      default:           return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const currentUser = profile || user;
  const userName  = currentUser?.Name  || currentUser?.name  || "User";
  const userEmail = currentUser?.Email || currentUser?.email || "";
  const userRole  = currentUser?.Role  || currentUser?.role  || "Customer";

  // ─── Address form field definitions ──────────────────────────────────────
  // inputMode: "numeric" shows number-pad on mobile for digit-only fields
  const addressFields = [
    { key: "full_name",  label: "Full Name",           type: "text", inputMode: "text",    maxLength: 60,  placeholder: "John Doe",       hint: "Letters only"        },
    { key: "phone",      label: "Phone",               type: "tel",  inputMode: "numeric", maxLength: 10,  placeholder: "9876543210",     hint: "10 digits only"      },
    { key: "address",    label: "Address",             type: "text", inputMode: "text",    maxLength: 120, placeholder: "123, Main St",   hint: null                  },
    { key: "city",       label: "City",                type: "text", inputMode: "text",    maxLength: 60,  placeholder: "Mumbai",         hint: "Letters only"        },
    { key: "state",      label: "State",               type: "text", inputMode: "text",    maxLength: 60,  placeholder: "Maharashtra",    hint: "Letters only"        },
    { key: "country",    label: "Country",             type: "text", inputMode: "text",    maxLength: 60,  placeholder: "India",          hint: "Letters only"        },
    { key: "zip_code",   label: "ZIP Code",            type: "text", inputMode: "numeric", maxLength: 10,  placeholder: "400001",         hint: "Digits only"         },
    { key: "landmark",   label: "Landmark (optional)", type: "text", inputMode: "text",    maxLength: 80,  placeholder: "Near City Mall", hint: null                  },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-12">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative -mt-20">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{userName}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4 text-gray-600 flex-wrap">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{userEmail}</span>
                <span className="flex items-center gap-1"><Shield className="w-4 h-4" /><span className="capitalize">{userRole}</span></span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setActiveTab("overview"); setIsEditing(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <nav className="flex flex-col">
                {[
                  { id: "overview",   label: "Overview",   icon: User    },
                  { id: "orders",     label: "My Orders",  icon: Package, count: orders.length },
                  { id: "wishlist",   label: "Wishlist",   icon: Heart   },
                  { id: "addresses",  label: "Addresses",  icon: MapPin  },
                  { id: "security",   label: "Security",   icon: Lock    },
                ].map((item) => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-6 py-4 text-left font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-amber-50 text-amber-700 border-l-4 border-amber-500"
                        : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {item.count > 0 && (
                      <span className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">{item.count}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                <ShoppingBag className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                <div className="text-xs text-gray-500">Orders</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                <MapPin className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{addresses.length}</div>
                <div className="text-xs text-gray-500">Addresses</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </div>
            )}

            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-amber-600 hover:text-amber-700 font-medium text-sm">Edit</button>
                  )}
                </div>
                {isEditing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" value={profileForm.name}
                        onChange={(e) => setProfileForm({ name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={userEmail} disabled
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">Save Changes</button>
                      <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div><label className="text-sm text-gray-500">Full Name</label><p className="font-medium text-gray-900 mt-1">{userName}</p></div>
                    <div><label className="text-sm text-gray-500">Email Address</label><p className="font-medium text-gray-900 mt-1">{userEmail}</p></div>
                    <div><label className="text-sm text-gray-500">Role</label><p className="font-medium text-gray-900 mt-1 capitalize">{userRole}</p></div>
                  </div>
                )}
              </div>
            )}

            {/* ── ORDERS ── */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
                  <Link to="/myorders" className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 text-sm">
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {ordersLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">No orders yet</p>
                    <Link to="/menu" className="mt-4 inline-block text-amber-600 hover:text-amber-700 font-medium">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.ID || order.id} className="border border-gray-100 rounded-xl p-4 hover:border-amber-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-gray-900">Order #{order.ID || order.id}</span>
                            <span className="ml-3 text-sm text-gray-500">{new Date(order.CreatedAt || order.created_at).toLocaleDateString()}</span>
                          </div>
                          <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${getOrderStatusColor(order.Status || order.status)}`}>
                            {order.Status || order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">{order.Items?.length || order.items?.length || 0} item(s)</p>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-amber-600">${(order.TotalAmount || order.total_amount || 0).toFixed(2)}</span>
                            {(order.Status || order.status) === "pending" && (
                              <button onClick={() => handleCancelOrder(order.ID || order.id)}
                                className="text-xs text-red-600 hover:text-red-700 font-medium border border-red-200 px-2 py-1 rounded-lg">
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── WISHLIST ── */}
            {activeTab === "wishlist" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">My Wishlist</h2>
                  <Link to="/wishlist" className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 text-sm">
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Your saved items are on the Wishlist page</p>
                  <Link to="/wishlist" className="mt-4 inline-block px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                    Go to Wishlist
                  </Link>
                </div>
              </div>
            )}

            {/* ── ADDRESSES ── */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
                  {!showAddressForm && (
                    <button onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-sm">
                      <Plus className="w-4 h-4" /> Add Address
                    </button>
                  )}
                </div>

                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="mb-6 p-4 border border-amber-200 rounded-xl bg-amber-50 space-y-3">
                    <h3 className="font-semibold text-gray-900">{editingAddress ? "Edit Address" : "New Address"}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {addressFields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {field.label}
                            {/* Small inline hint so users know what's expected */}
                            {field.hint && (
                              <span className="ml-1 text-gray-400 font-normal">({field.hint})</span>
                            )}
                          </label>
                          <input
                            type={field.type}
                            inputMode={field.inputMode}
                            maxLength={field.maxLength}
                            placeholder={field.placeholder}
                            value={addressForm[field.key]}
                            onChange={(e) => handleAddressChange(field.key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={addressForm.is_default}
                        onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                        className="w-4 h-4 accent-amber-500" />
                      Set as default address
                    </label>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors">
                        {editingAddress ? "Update" : "Save"} Address
                      </button>
                      <button type="button" onClick={resetAddressForm}
                        className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {addressesLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No addresses saved yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => {
                      const id        = addr.ID        || addr.id;
                      const isDefault = addr.IsDefault || addr.is_default;
                      return (
                        <div key={id} className={`rounded-xl p-4 border-2 relative ${isDefault ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white"}`}>
                          {isDefault && (
                            <span className="absolute top-2 right-2 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" /> Default
                            </span>
                          )}
                          <div className="flex items-start gap-2 mb-2">
                            <Home className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-gray-900">{addr.FullName || addr.full_name}</p>
                              <p className="text-sm text-gray-600">{addr.Phone || addr.phone}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {addr.Address || addr.address}, {addr.City || addr.city}, {addr.State || addr.state} -{" "}
                            {addr.ZipCode || addr.zip_code}, {addr.Country || addr.country}
                            {(addr.Landmark || addr.landmark) && `, Near ${addr.Landmark || addr.landmark}`}
                          </p>
                          <div className="flex gap-3 flex-wrap">
                            <button onClick={() => startEditAddress(addr)} className="text-sm text-amber-600 hover:text-amber-700 font-medium">Edit</button>
                            <button onClick={() => handleDeleteAddress(id)} className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                            {!isDefault && (
                              <button onClick={() => handleSetDefault(id)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Set Default</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── SECURITY ── */}
            {activeTab === "security" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  {[
                    { field: "current", placeholder: "Current Password",     key: "currentPassword"  },
                    { field: "new",     placeholder: "New Password",         key: "newPassword"      },
                    { field: "confirm", placeholder: "Confirm New Password", key: "confirmPassword"  },
                  ].map((item) => (
                    <div key={item.field} className="relative">
                      <input
                        type={showPassword[item.field] ? "text" : "password"}
                        placeholder={item.placeholder}
                        value={passwordForm[item.key]}
                        onChange={(e) => setPasswordForm({ ...passwordForm, [item.key]: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10"
                      />
                      <button type="button" onClick={() => togglePasswordVisibility(item.field)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword[item.field] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  ))}
                  <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                    Update Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;