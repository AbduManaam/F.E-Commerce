import { createContext, useContext, useEffect, useState } from "react";
import apiService from "../service/api.service";
import { useAuth } from "../Components/AuthContext";
import { toast } from "react-toastify";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load orders when user logs in
  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  // Load all orders
  const loadOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiService.getOrders();
      console.log("🔍 Raw orders from backend:", response.data);
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create order from cart
  const createOrderFromCart = async (addressId, paymentMethod = 'cod') => {
    if (!user) {
      toast.error("Please login to place order");
      return { success: false };
    }

    try {
      const response = await apiService.createOrderFromCart(addressId, paymentMethod);
      
      if (response.success) {
        toast.success("🎉 Order placed successfully!");
        await loadOrders(); // Reload orders
        return { success: true, order: response.data.order };
      } else {
        throw new Error(response.message || "Failed to create order");
      }
    } catch (err) {
      console.error("Create order failed:", err);
      toast.error(err.message || "Failed to place order");
      return { success: false, error: err.message };
    }
  };

  // Create direct order (Buy Now)
  const createDirectOrder = async (addressId, items, paymentMethod = 'cod') => {
    if (!user) {
      toast.error("Please login to place order");
      return { success: false };
    }

    try {
      const response = await apiService.createDirectOrder(addressId, items, paymentMethod);
      
      if (response.success) {
        toast.success("🎉 Order placed successfully!");
        await loadOrders();
        return { success: true, order: response.data.order };
      } else {
        throw new Error(response.message || "Failed to create order");
      }
    } catch (err) {
      console.error("Create direct order failed:", err);
      toast.error(err.message || "Failed to place order");
      return { success: false, error: err.message };
    }
  };

  // Cancel order
  const cancelOrder = async (orderId) => {
    if (!user) {
      toast.error("Please login");
      return;
    }

    try {
      const response = await apiService.cancelOrder(orderId);
      
      if (response.success) {
        toast.success("Order cancelled successfully");
        await loadOrders(); // Reload to update status
      } else {
        throw new Error(response.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Cancel order failed:", err);
      toast.error(err.message || "Failed to cancel order");
    }
  };

  // Cancel order item
  const cancelOrderItem = async (orderId, itemId, reason = '') => {
    if (!user) {
      toast.error("Please login");
      return;
    }

    try {
      const response = await apiService.cancelOrderItem(orderId, itemId, reason);
      
      if (response.success) {
        toast.success("Item cancelled successfully");
        await loadOrders();
      } else {
        throw new Error(response.message || "Failed to cancel item");
      }
    } catch (err) {
      console.error("Cancel item failed:", err);
      toast.error(err.message || "Failed to cancel item");
    }
  };

  // Initiate payment
  const initiatePayment = async (orderId, method = 'razorpay') => {
    if (!user) {
      toast.error("Please login");
      return { success: false };
    }

    try {
      const response = await apiService.createPaymentIntent(orderId, method);
      
      if (response.success) {
        return { 
          success: true, 
          paymentData: response.data 
        };
      } else {
        throw new Error(response.message || "Failed to initiate payment");
      }
    } catch (err) {
      console.error("Payment initiation failed:", err);
      toast.error(err.message || "Failed to initiate payment");
      return { success: false, error: err.message };
    }
  };

  // Confirm payment
  const confirmPayment = async (paymentId, status = 'completed') => {
    try {
      const response = await apiService.confirmPayment(paymentId, status);
      
      if (response.success) {
        toast.success("Payment confirmed!");
        await loadOrders();
        return { success: true };
      } else {
        throw new Error(response.message || "Payment confirmation failed");
      }
    } catch (err) {
      console.error("Payment confirmation failed:", err);
      toast.error(err.message || "Payment confirmation failed");
      return { success: false };
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        loadOrders,
        createOrderFromCart,
        createDirectOrder,
        cancelOrder,
        cancelOrderItem,
        initiatePayment,
        confirmPayment
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within OrderProvider");
  }
  return context;
};