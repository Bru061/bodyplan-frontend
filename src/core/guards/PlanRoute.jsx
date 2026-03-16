import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../../services/axios";

// Rutas que NO requieren plan activo (el proveedor siempre puede acceder)
const RUTAS_LIBRES = ["/planes", "/checkout", "/pago-exitoso", "/perfil"];

export default function PlanRoute() {

  const { user, loading } = useAuth();
  const { pathname }      = useLocation();

  const [verificando, setVerificando] = useState(true);
  const [tienePlan, setTienePlan]     = useState(false);

  useEffect(() => {
    // Solo verificar para proveedores
    if (!user || user.role !== "proveedor") {
      setVerificando(false);
      return;
    }

    // Si es una ruta libre no necesitamos verificar
    if (RUTAS_LIBRES.includes(pathname)) {
      setVerificando(false);
      setTienePlan(true);
      return;
    }

    const verificarPlan = async () => {
      try {
        const res = await api.get("/proveedor/mi-plan");
        const planActivo = res.data.plan_activo;
        setTienePlan(planActivo?.estado === "activa");
      } catch {
        // Si falla la verificación dejamos pasar para no bloquear innecesariamente
        setTienePlan(true);
      } finally {
        setVerificando(false);
      }
    };

    verificarPlan();
  }, [pathname, user]);

  if (loading || verificando) return null;

  // Si no tiene plan activo y no es ruta libre → forzar a /planes
  if (!tienePlan && !RUTAS_LIBRES.includes(pathname)) {
    return <Navigate to="/planes" replace />;
  }

  return <Outlet />;
}