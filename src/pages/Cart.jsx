
import React, { useState } from "react";
import { useCart } from "./CartContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../Components/AuthContext";

const API_URL = "http://localhost:5000/orders";

const Cart = () => {
  const { cart, updateQty, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const shippingFee = 10;
  const taxRate = 0.02;

  // calculate totals
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price[item.size] * item.qty,
    0
  );
  const tax = subtotal * taxRate;
  const total = subtotal + shippingFee + tax;

  // place order
  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to place an order 🚨");
      return;
    }

    if (cart.length === 0) {
      toast.warning("Your cart is empty! 🛒");
      return;
    }

    try {
      await axios.post(API_URL, {
        userId: user.id, // ✅ link to logged in user
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.qty,
          size: item.size,
        })),
        amount: total,
        addressId: 1, // ⚡ you can change this to real address
        status: "Pending",
        paymentMethod: paymentMethod === "COD" ? "COD" : "Online",
        isPaid: paymentMethod !== "COD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast.success("Order placed successfully ✅");
      clearCart();
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order ❌");
    }
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
                  src={Array.isArray(item.images) ? item.images[0] : item.images}
                  alt={item.title}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-gray-500">Size: {item.size}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQty(item.id, item.size, Math.max(item.qty - 1, 1))
                      }
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.size, item.qty + 1)}
                      className="px-2 py-1 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <p className="font-bold">
                  ${(item.price[item.size] * item.qty).toFixed(2)}
                </p>
                <button
                  onClick={() => removeFromCart(item.id, item.size)}
                  className="text-red-500"
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

        {/* Payment Section */}
        <div>
          <p className="text-sm md:text-base font-semibold">Payment Method</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setPaymentMethod("COD")}
              className={`px-3 py-1 md:px-4 md:py-2 border rounded text-sm md:text-base ${
                paymentMethod === "COD"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white"
              }`}
            >
              Cash On Delivery
            </button>
            <button
              onClick={() => setPaymentMethod("Online")}
              className={`px-3 py-1 md:px-4 md:py-2 border rounded text-sm md:text-base ${
                paymentMethod === "Online"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white"
              }`}
            >
              Online
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 md:py-3 lg:py-4 text-sm md:text-base lg:text-lg rounded mt-3"
        >
          Proceed to Order
        </button>
      </div>
    </div>
  );
};

export default Cart;
