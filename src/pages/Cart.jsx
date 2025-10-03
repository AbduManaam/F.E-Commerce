


import React, { useState } from "react";
import { useCart } from "./CartContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../Components/AuthContext";

const API_URL = "http://localhost:5000";
const ORDERS_API = `${API_URL}/orders`;
const PRODUCTS_API = `${API_URL}/products`;

const Cart = () => {
  const { cart, updateQty, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isProcessing, setIsProcessing] = useState(false);

  const shippingFee = 10;
  const taxRate = 0.02;

  // calculate totals
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price[item.size] * item.qty,
    0
  );
  const tax = subtotal * taxRate;
  const total = subtotal + shippingFee + tax;

  // ✅ Update product stock when order is placed
  const updateProductStock = async (cartItems) => {
    const updatePromises = cartItems.map(async (item) => {
      try {
        // Get current product
        const productRes = await axios.get(`${PRODUCTS_API}/${item.id}`);
        const product = productRes.data;
        
        // Parse current stock (handle both string and number)
        const currentStock = parseInt(product.stock) || 0;
        const orderedQty = item.qty;
        
        // Calculate new stock
        const newStock = Math.max(0, currentStock - orderedQty);
        
        // Update product with new stock
        await axios.patch(`${PRODUCTS_API}/${item.id}`, {
          stock: newStock.toString()
        });
        
        return { product: product.title, oldStock: currentStock, newStock, success: true };
      } catch (error) {
        console.error(`Failed to update stock for product ${item.id}:`, error);
        return { product: item.title, success: false, error };
      }
    });

    return Promise.all(updatePromises);
  };

  // ✅ Place order with stock update
  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to place an order 🚨");
      return;
    }

    if (cart.length === 0) {
      toast.warning("Your cart is empty! 🛒");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Update product stocks
      const stockUpdates = await updateProductStock(cart);
      const failedUpdates = stockUpdates.filter(update => !update.success);
      
      if (failedUpdates.length > 0) {
        toast.error("Some products stock couldn't be updated ❌");
        return;
      }

      // 2. Create order
      const orderData = {
        userId: user.id,
        items: cart.map((item) => ({
          productId: item.id,
          title: item.title,
          quantity: item.qty,
          size: item.size,
          price: item.price[item.size],
          images: item.images
        })),
        amount: total,
        subtotal: subtotal,
        shippingFee: shippingFee,
        tax: tax,
        addressId: 1,
        status: "Pending",
        paymentMethod: paymentMethod === "COD" ? "COD" : "Online",
        isPaid: paymentMethod !== "COD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await axios.post(ORDERS_API, orderData);

      // 3. Show success message with stock updates
      stockUpdates.forEach(update => {
        if (update.success) {
          console.log(`Stock updated for ${update.product}: ${update.oldStock} → ${update.newStock}`);
        }
      });

      toast.success("Order placed successfully ✅ Stock updated!");
      clearCart();
    } catch (err) {
      console.error("Failed to place order:", err);
      toast.error("Failed to place order ❌");
    } finally {
      setIsProcessing(false);
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
          disabled={isProcessing || cart.length === 0}
          className={`w-full py-2 md:py-3 lg:py-4 text-sm md:text-base lg:text-lg rounded mt-3 ${
            isProcessing || cart.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
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