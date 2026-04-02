import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../../services/axios";

const RUTAS_LIBRES = ["/planes", "/checkout", "/pago-exitoso", "/perfil"];
/**
 * Guard de ruta que verifica si un proveedor tiene un plan de suscripción activo.
 * Permite el acceso libre a ciertas rutas (RUTAS_LIBRES) sin verificar el plan.
 * Si el usuario no es proveedor, deja pasar sin restricción.
 * Si no tiene plan activo y no está en una ruta libre, redirige a "/planes".
 * Renderiza null mientras se resuelve la verificación para evitar flashes.
 */
export default function PlanRoute() {

  const { user, loading } = useAuth();
  const { pathname }      = useLocation();
  const [verificando, setVerificando] = useState(true);
  const [tienePlan, setTienePlan]     = useState(false);

  useEffect(() => {
    if (!user || user.role !== "proveedor") {
      setVerificando(false);
      return;
    }

    if (RUTAS_LIBRES.includes(pathname)) {
      setVerificando(false);
      setTienePlan(true);
      return;
    }

    /**
     * Consulta el endpoint "/proveedor/mi-plan" para determinar si el proveedor
     * tiene una suscripción con estado "activa". Actualiza tienePlan en consecuencia.
     * En caso de error asume que no hay plan activo.
     */
    const verificarPlan = async () => {
      try {
        const res = await api.get("/proveedor/mi-plan");
        const planActivo = res.data.plan_activo;
        setTienePlan(planActivo?.estado === "activa");
      } catch {
        setTienePlan(false);
      } finally {
        setVerificando(false);
      }
    };

    verificarPlan();
  }, [pathname, user]);

  if (loading || verificando) return null;

  if (!tienePlan && !RUTAS_LIBRES.includes(pathname)) {
    return <Navigate to="/planes" replace />;
  }

  return <Outlet />;
}