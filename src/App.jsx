
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Menu from "./pages/Menu";
import AddressForm from "./pages/AddressForm";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import MyOrder from "./pages/MyOrder";
import { CartProvider } from "./pages/CartContext";
import { WishlistProvider } from "./pages/WishlistContext";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Login from "./Components/Login";
import Wishlist from "./pages/Wishlist";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./Admin/AdminDashboard";
import UsersPage from "./Admin/UserPage/UsersPage";
import UserCreate from "./Admin/UserPage/UserCreate";
import UserView from "./Admin/UserPage/UserView";
import UserEdit from "./Admin/UserPage/UserEdit";
import ProtectedRoute from "./Route/ProtectedRoute";
import { AuthProvider } from "./Components/AuthContext";

const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admindash");

  return (
    <>
      {!isAdminPage && <Header />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Auth Routes - redirect to home if already logged in */}
        <Route 
          path="/login" 
          element={
            <ProtectedRoute>
              <Login />
            </ProtectedRoute>
          } 
        />

        {/* Protected User Routes */}
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute requireAuth>
              <Cart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/addressform" 
          element={
            <ProtectedRoute requireAuth>
              <AddressForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wishlist" 
          element={
            <ProtectedRoute requireAuth>
              <Wishlist />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/myorders" 
          element={
            <ProtectedRoute requireAuth>
              <MyOrder />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admindash/*" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requireAdmin>
              <UsersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users/create" 
          element={
            <ProtectedRoute requireAdmin>
              <UserCreate />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users/:id" 
          element={
            <ProtectedRoute requireAdmin>
              <UserView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users/edit/:id" 
          element={
            <ProtectedRoute requireAdmin>
              <UserEdit />
            </ProtectedRoute>
          } 
        />
      </Routes>

      {!isAdminPage && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <main className="overflow-x-hidden text-textColor">
            <AppContent />
          </main>
          <ToastContainer position="top-right" autoClose={3000} />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;