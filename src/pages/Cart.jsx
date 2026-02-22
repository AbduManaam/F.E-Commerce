import React, { useState, useEffect } from "react";
import { useCart } from "./CartContext";
import { useOrders } from "./OrderContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../Components/AuthContext";
import apiService from "../service/api.service";

const Cart = () => {
  const { cart, updateQty, removeFromCart, clearCart,resetCart  } = useCart();
  const { createOrderFromCart } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const shippingFee = 10;
  const taxRate = 0.02;

  // Load addresses on mount
  useEffect(() => {
    const loadAddresses = async () => {
      if (!user) return;
      
      const response = await apiService.getAddresses();
      if (response.success) {
        setAddresses(response.data || []);
        const defaultAddr = response.data.find(a => a.IsDefault) || response.data[0];
        if (defaultAddr) {
          setSelectedAddress(defaultAddr.ID);
        }
      }
    };
    
    loadAddresses();
  }, [user]);

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => {
    if (typeof item.price === 'object' && item.price !== null) {
      const priceForSize = item.price[item.size] || Object.values(item.price)[0] || 0;
      return acc + priceForSize * item.qty;
    }
    return acc + (item.price || 0) * item.qty;
  }, 0);

  const tax = subtotal * taxRate;
  const total = subtotal + shippingFee + tax;

  // Handle quick address creation
  const handleQuickAddAddress = async () => {
    const fullName = prompt("Full Name:");
    const phone = prompt("Phone:");
    const address = prompt("Street Address:");
    const city = prompt("City:");
    const state = prompt("State:");
    const zipCode = prompt("ZIP Code:");
    
    if (fullName && phone && address && city && state && zipCode) {
      const response = await apiService.createAddress({
        full_name: fullName,
        phone: phone,
        address: address,
        city: city,
        state: state,
        country: "India",
        zip_code: zipCode,
        landmark: "",
        is_default: true
      });
      
      if (response.success) {
        toast.success("Address added!");
        // Reload addresses
        const addressesResponse = await apiService.getAddresses();
        if (addressesResponse.success) {
          setAddresses(addressesResponse.data || []);
          const newAddr = addressesResponse.data[addressesResponse.data.length - 1];
          if (newAddr) {
            setSelectedAddress(newAddr.ID);
          }
        }
      } else {
        toast.error("Failed to add address");
      }
    }
  };

  // Place order
 const handleCheckout = async () => {
  if (!user) {
    toast.error("Please login to place an order 🚨");
    navigate("/login");
    return;
  }

  if (cart.length === 0) {
    toast.warning("Your cart is empty! 🛒");
    return;
  }

  if (!selectedAddress) {
    toast.error("Please select a delivery address 📍");
    return;
  }

  console.log(" Checkout data:", {
    selectedAddress,
    paymentMethod,
    addressType: typeof selectedAddress,
    paymentType: typeof paymentMethod
  });

  setIsProcessing(true);

  try {
    const result = await createOrderFromCart(selectedAddress, paymentMethod);
    
      console.log(" Order result:", result);

    if (result.success) {
      resetCart();
      navigate("/myorders");
    } else {
          console.error(" Order failed with error:", result.error);
      throw new Error(result.error || "Failed to place order");
    }
  } catch (err) {

    console.error(" Checkout error:", {
      message: err.message,
      response: err.response,
      fullError: err
    });
    toast.error(err.message || "Failed to place order ❌");
  } finally {
    setIsProcessing(false);
  }
};

  // Get price for display
  const getItemPrice = (item) => {
    if (typeof item.price === 'object' && item.price !== null) {
      return item.price[item.size] || Object.values(item.price)[0] || 0;
    }
    return item.price || 0;
  };

  return (
    <div className="p-6 py-40 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left - Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold mb-4">Cart Overview</h1>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          cart.map((item) => (
            <div
              key={`${item.id}-${item.size}`}
              className="flex items-center justify-between bg-white p-4 rounded-xl shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={Array.isArray(item.images) && item.images.length > 0 
                    ? item.images[0] 
                    : "/images/placeholder.png"}
                  alt={item.title}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => e.target.src = "/images/placeholder.png"}
                />
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-gray-500">Size: {item.size}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQty(item.id, item.size, Math.max(item.qty - 1, 1))
                      }
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.size, item.qty + 1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <p className="font-bold">
                  ${(getItemPrice(item) * item.qty).toFixed(2)}
                </p>
                <button
                  onClick={() => removeFromCart(item.id, item.size)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right - Checkout */}
      <div className="bg-white p-6 md:p-10 lg:p-12 rounded-xl shadow flex flex-col gap-4 md:gap-6">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
          Order Details ({cart.length} Items)
        </h2>

        {/* Address Selection - ✅ IMPROVED VERSION */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm md:text-base font-semibold">Delivery Address</p>
            {addresses.length > 0 && (
              <button
                onClick={() => navigate("/profile#addresses")}
                className="text-xs text-blue-600 hover:underline"
              >
                + Add New
              </button>
            )}
          </div>
          
          {addresses.length === 0 ? (
            <div className="text-sm bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-yellow-800 mb-2">⚠️ No delivery address found</p>
              <button
                onClick={handleQuickAddAddress}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm w-full"
              >
                Add Address Now
              </button>
            </div>
          ) : (
            <select
              value={selectedAddress || ""}
              onChange={(e) => setSelectedAddress(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select an address</option>
              {addresses.map(addr => (
                <option key={addr.ID} value={addr.ID}>
                  {addr.FullName} - {addr.City}, {addr.State} {addr.ZipCode}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Payment Section */}
        <div>
          <p className="text-sm md:text-base font-semibold">Payment Method</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setPaymentMethod("cod")}
              className={`px-3 py-1 md:px-4 md:py-2 border rounded text-sm md:text-base ${
                paymentMethod === "cod"
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              Cash On Delivery
            </button>
            <button
              onClick={() => setPaymentMethod("razorpay")}
              className={`px-3 py-1 md:px-4 md:py-2 border rounded text-sm md:text-base ${
                paymentMethod === "razorpay"
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              Razorpay
            </button>
          </div>
        </div>

        <hr />

        {/* Totals */}
        <div className="space-y-1 text-sm md:text-base">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Shipping Fee: ${shippingFee}</p>
          <p>Tax (2%): ${tax.toFixed(2)}</p>
        </div>

        <h3 className="font-bold text-lg md:text-xl lg:text-2xl">
          Total: ${total.toFixed(2)}
        </h3>

        <button
          onClick={handleCheckout}
          disabled={isProcessing || cart.length === 0 || !selectedAddress}
          className={`w-full py-2 md:py-3 lg:py-4 text-sm md:text-base lg:text-lg rounded mt-3 ${
            isProcessing || cart.length === 0 || !selectedAddress
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {isProcessing ? "Processing..." : "Proceed to Order"}
        </button>

        {/* Stock Warning */}
        {cart.some(item => {
          const stock = parseInt(item.stock) || 0;
          return item.qty > stock;
        }) && (
          <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            ⚠️ Some items in your cart exceed available stock. Please adjust quantities.
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;