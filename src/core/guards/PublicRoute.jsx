import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Guard de ruta que restringe el acceso a rutas públicas (login, registro, etc.)
 * cuando el usuario ya tiene sesión activa.
 * Renderiza null durante la carga del contexto para evitar redirecciones prematuras.
 * Si el usuario está autenticado, lo redirige a su dashboard según su rol:
 *   - admin     → /admin/dashboard
 *   - proveedor → /dashboard
 *   - user      → /solo-app
 *   - (otro)    → /
 * Si no está autenticado, renderiza las rutas hijas mediante <Outlet />.
 */
export default function PublicRoute() {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  const permitirInicioAutenticado =
    location.pathname === "/" && location.state?.allowHome === true;
  const permitirAuthScreens =
    location.pathname === "/login" || location.pathname === "/register";

  if (isAuthenticated) {
    if (permitirInicioAutenticado || permitirAuthScreens) return <Outlet />;
    if (user?.role === "admin")     return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === "proveedor") return <Navigate to="/dashboard"       replace />;
    if (user?.role === "user")      return <Navigate to="/solo-app"        replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}