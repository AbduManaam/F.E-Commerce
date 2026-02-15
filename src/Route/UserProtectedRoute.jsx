import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../Components/AuthContext"; 

const UserProtectedRoute = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Admin trying to access user side → redirect to admin dashboard
  if (isAdmin) {
    return <Navigate to="/admindash" replace />;
  }

  // Check if user is blocked (backend will handle this on API calls)
  return <Outlet />;
};

export default UserProtectedRoute;