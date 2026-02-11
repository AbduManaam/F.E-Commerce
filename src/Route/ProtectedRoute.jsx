// ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Components/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requireAuth = false, 
  requireAdmin = false,
  redirectTo = '/login'
}) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If admin access is required but user is not admin
  if (requireAdmin && (!user || !isAdmin)) {
    return <Navigate to="/" replace />;
  }

  // If user is logged in but trying to access login page, redirect to home
  if (!requireAuth && user && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;