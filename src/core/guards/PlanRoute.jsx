import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../../services/axios";

const RUTAS_LIBRES = ["/planes", "/checkout", "/pago-exitoso", "/perfil"];

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

    const verificarPlan = async () => {
      try {
        const res = await api.get("/proveedor/mi-plan");
        const planActivo = res.data.plan_activo;
        setTienePlan(planActivo?.estado === "activa");
      } catch {
        setTienePlan(true);
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