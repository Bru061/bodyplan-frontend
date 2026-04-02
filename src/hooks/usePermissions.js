import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/axios";
import { useAuth } from "../core/context/AuthContext";
import {
  canAccess,
  canCreateGym,
  derivePlanSnapshot,
  FEATURES,
  getFeatureUpgradeMessage,
  getMaxGyms,
  PLAN_KEYS,
} from "../core/permissions/permissions";

/**
 * Hook que obtiene y expone los permisos del usuario autenticado
 * según su plan de suscripción activo.
 * Solo realiza la consulta al API si el usuario es de rol "proveedor".
 * Para otros roles asume BASIC sin hacer peticiones.
 * Reexporta FEATURES y PLAN_KEYS para evitar imports adicionales en los consumidores.
 */
export function usePermissions() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(PLAN_KEYS.BASIC);
  const [trialUsed, setTrialUsed] = useState(false);

  /**
 * Consulta "/proveedor/mi-plan", deriva el snapshot con derivePlanSnapshot
 * y actualiza plan y trialUsed. En caso de error usa BASIC como fallback.
 * Memoizada con useCallback; se recrea si cambia el usuario.
 */
  const fetchPermissions = useCallback(async () => {
    if (!user || user.role !== "proveedor") {
      setPlan(PLAN_KEYS.BASIC);
      setTrialUsed(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/proveedor/mi-plan");
      const snapshot = derivePlanSnapshot(res.data);
      setPlan(snapshot.currentPlan);
      setTrialUsed(snapshot.trialUsed);
    } catch {
      setPlan(PLAN_KEYS.BASIC);
      setTrialUsed(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    fetchPermissions();
  }, [authLoading, fetchPermissions]);

  /**
 * Verifica si el plan actual tiene acceso a una feature específica.
 * Wrapper memoizado sobre canAccess para uso directo en componentes.
 */
  const can = useCallback((feature) => canAccess(feature, plan), [plan]);

  const getUpgradeMessage = useCallback((feature) => getFeatureUpgradeMessage(feature), []);

  /**
 * canCreateMoreGyms
 * Verifica si el proveedor puede registrar un gimnasio adicional
 * dado su plan y la cantidad de gimnasios que ya tiene.
 * Wrapper memoizado sobre canCreateGym.
 */
  const canCreateMoreGyms = useCallback(
    (currentGyms) => canCreateGym(plan, currentGyms),
    [plan]
  );

  const maxGyms = useMemo(() => getMaxGyms(plan), [plan]);

  return {
    loading,
    plan,
    trialUsed,
    isTrial: plan === PLAN_KEYS.TRIAL,
    isBasic: plan === PLAN_KEYS.BASIC,
    isPro: plan === PLAN_KEYS.PRO,
    can,
    canCreateMoreGyms,
    maxGyms,
    getUpgradeMessage,
    refreshPermissions: fetchPermissions,
    FEATURES,
    PLAN_KEYS,
  };
}

export default usePermissions;
