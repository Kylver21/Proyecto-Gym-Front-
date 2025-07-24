import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRedirect: React.FC = () => {
  const { isClient, isAdmin, isEmployee } = useAuth();

  if (isClient) {
    return <Navigate to="/home" replace />;
  } else if (isAdmin || isEmployee) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default RoleBasedRedirect;
