import { Routes, Route, useLocation } from "react-router-dom";
import Menu from "./pages/Menu";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import MyOrder from "./pages/MyOrder";
import Wishlist from "./pages/Wishlist";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./Admin/AdminDashboard";
import UsersPage from "./Admin/UserPage/UsersPage";
import UserCreate from "./Admin/UserPage/UserCreate";
import UserView from "./Admin/UserPage/UserView";
import UserEdit from "./Admin/UserPage/UserEdit";
import Profile from "./Components/Profile";

// Import from new locations
import PublicRoute from "./Route/PublicRoute";
import UserProtectedRoute from "./Route/UserProtectedRoute";
import AdminProtectedRoute from "./Admin/Router/AdminProtectedRoute ";
import Login from "./Components/Login";
import ForgotPassword from "./Components/ForgotPassword";
import AdminLogin from "./Admin/Pages/Admin_Login";

const AppContent = () => {
  const location = useLocation();
  const isAdminPage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/admindash");

  return (
    <>
      {!isAdminPage && <Header />}

      <Routes>
        {/* PUBLIC ROUTES */}
        
        <Route path="/login"element={<PublicRoute> <Login /> </PublicRoute>}/>
        <Route path="/forgot-password"element={<PublicRoute> <ForgotPassword /> </PublicRoute>}/>
          <Route path="/admin-login" element={<AdminLogin />} />

        {/* USER PROTECTED ROUTES */}
        <Route element={<UserProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/myorders" element={<MyOrder />} />
          <Route path="/profile" element={<Profile/>}/>
        </Route>

        {/* ADMIN PROTECTED ROUTES */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admindash/*" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/users/create" element={<UserCreate />} />
          <Route path="/admin/users/:id" element={<UserView />} />
          <Route path="/admin/users/edit/:id" element={<UserEdit />} />

        </Route>

        {/* 404 PAGE */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600">Page not found</p>
              </div>
            </div>
          }
        />
      </Routes>

      {!isAdminPage && <Footer />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

const App = () => {
  return (
    <main className="overflow-x-hidden text-textColor">
      <AppContent />
    </main>
  );
};

export default App;
