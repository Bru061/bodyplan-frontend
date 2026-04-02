import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../../components/ui/LoadingScreen";

/**
 * Guard de ruta que restringe el acceso según el rol del usuario autenticado.
 * Muestra un LoadingScreen mientras el contexto de auth inicializa.
 * Si no hay usuario activo, redirige a "/".
 * Si el rol del usuario no está incluido en allowedRoles, lo redirige
 * a su dashboard correspondiente:
 *   - admin     → /admin/dashboard
 *   - proveedor → /dashboard
 *   - (otro)    → /
 * Si el rol está permitido, renderiza las rutas hijas mediante <Outlet />.
 */
export default function RoleRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) return <Navigate to="/" replace />;

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin")      return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "proveedor")  return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}