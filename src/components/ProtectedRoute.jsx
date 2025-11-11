import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireRole }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center text-gray-600">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requireRole && role !== requireRole) {
    // redirect to role selection if role missing; otherwise to home
    return role ? <Navigate to="/" replace /> : <Navigate to="/select-role" replace />;
  }
  return children;
}


