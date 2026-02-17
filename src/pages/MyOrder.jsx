
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Components/AuthContext";

const ORDERS_API = "http://127.0.0.1:8080/orders";
const PRODUCTS_API = "http://127.0.0.1:8080/products"; 

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(PRODUCTS_API);
        setProducts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  // fetch user orders
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${ORDERS_API}?userId=${user.id}`);
        const filteredOrders = (res.data || []).filter(order => {
          // Filter out orders with no items, zero amount, or unknown products
          const hasItems = order.items && order.items.length > 0;
          const hasValidAmount = Number(order.amount || 0) > 0;
          
          // Check if any items have valid product information
          const hasValidProducts = hasItems && order.items.some(item => {
            const product = products.find(p => p.id === item.productId);
            return product && product.title && product.title !== "Unknown Product";
          });

          return hasItems && hasValidAmount && hasValidProducts;
        });
        setOrders(filteredOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    fetchOrders();
  }, [user, products]); // Added products dependency

  if (!user) {
    return <p className="text-center py-20">Please login to view orders 🚨</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-40 px-4">
        <h2 className="text-2xl font-bold mb-6">My Orders</h2>
        <p>No orders found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-40 px-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>

      {orders.map((order) => {
        const items = order.items || [];
        const amount = Number(order.amount || 0);
        const paymentMethod = order.paymentMethod || "N/A";
        const status = order.status || "Pending";
        const createdAt = order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : "Unknown";

        return (
          <div
            key={order.id || Math.random()}
            className="bg-white p-6 rounded-xl shadow border"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Order #{order.id || "N/A"}</h3>
              <p className="text-gray-500 text-sm">{createdAt}</p>
            </div>

            <div className="space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-700">No items in this order.</p>
              ) : (
                items.map((item, idx) => {
                  const product = products.find((p) => p.id === item.productId) || {};
                  const image = Array.isArray(product.images)
                    ? product.images[0]
                    : product.images || "https://via.placeholder.com/80";

                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <img
                        src={image}
                        alt={product.title || "Product"}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{product.title || "Unknown Product"}</h4>
                        <p className="text-gray-500 text-sm">
                          Size: {item.size || "N/A"} × {item.quantity || 0}
                        </p>
                        <p className="text-gray-700 font-medium">
                          Price: $
                          {product.price && item.size
                            ? Number(product.price[item.size] || 0).toFixed(2)
                            : "0.00"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600 ">
              <p>Payment: {paymentMethod}</p>
              <p>Status: {status}</p>
              <p className="font-bold">Total: ${amount.toFixed(2)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyOrders;