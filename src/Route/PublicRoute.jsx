import { Navigate } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already logged in, redirect them to appropriate dashboard
  if (user) {
    return <Navigate to={isAdmin ? "/admindash" : "/"} replace />;
  }

  return children;
};

export default PublicRoute;