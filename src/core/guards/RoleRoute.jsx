import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/" replace />;

  if (!allowedRoles.includes(user.role)) {
    // redirección segura según rol
    if (user.role === "admin") return <Navigate to="/superadmin/dashboard" replace />;
    if (user.role === "proveedor") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}