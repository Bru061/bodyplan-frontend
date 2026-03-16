import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    if (user?.role === "admin")     return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === "proveedor") return <Navigate to="/dashboard"       replace />;
    if (user?.role === "user")      return <Navigate to="/solo-app"        replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}