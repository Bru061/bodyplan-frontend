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

export function usePermissions() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(PLAN_KEYS.BASIC);
  const [trialUsed, setTrialUsed] = useState(false);

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

  const can = useCallback((feature) => canAccess(feature, plan), [plan]);

  const getUpgradeMessage = useCallback((feature) => getFeatureUpgradeMessage(feature), []);

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
