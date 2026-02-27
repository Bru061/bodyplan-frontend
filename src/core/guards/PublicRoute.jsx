import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getRedirectByRole(role){
  if(role === "admin") return "/admin";
  if(role === "proveedor") return "/dashboard";
  if(role === "user") return "/solo-app";
  return "/";
}

export default function PublicRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to={getRedirectByRole(user?.role)} replace />;
  }

  return <Outlet />;
}
