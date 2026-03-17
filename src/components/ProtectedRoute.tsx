import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f2ed]">
        <div className="text-2xl font-serif animate-pulse text-[#5A5A40]">অপেক্ষা করুন...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
