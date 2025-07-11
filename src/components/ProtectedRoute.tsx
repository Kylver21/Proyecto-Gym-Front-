import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  employeeOnly?: boolean;
  clientOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false, 
  employeeOnly = false,
  clientOnly = false 
}) => {
  const { isAuthenticated, isAdmin, isEmployee, isClient } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permisos específicos
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (employeeOnly && !isEmployee && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (clientOnly && !isClient) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;