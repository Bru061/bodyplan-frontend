import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../../components/ui/LoadingScreen";

/**
 * Guard de ruta que protege el acceso a rutas autenticadas.
 * Muestra un LoadingScreen mientras el contexto de auth inicializa.
 * Si el usuario no está autenticado, redirige a la raíz "/".
 * Si está autenticado, renderiza las rutas hijas mediante <Outlet />.
 */
export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
}