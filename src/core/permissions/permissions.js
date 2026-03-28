export const PLAN_KEYS = {
  TRIAL: "trial",
  BASIC: "basic",
  PRO: "pro",
};

export const FEATURES = {
  MULTI_GYM: "multi_gym",
  ADVANCED_STATS: "advanced_stats",
  UNLIMITED_ROUTINE_ASSIGNMENTS: "unlimited_routine_assignments",
  FULL_CLIENT_MANAGEMENT: "full_client_management",
  PERSONAL_MODULE: "personal_module",
  GYM_HIGHLIGHT: "gym_highlight",
};

const PLAN_RULES = {
  [PLAN_KEYS.TRIAL]: {
    [FEATURES.MULTI_GYM]: true,
    [FEATURES.ADVANCED_STATS]: true,
    [FEATURES.UNLIMITED_ROUTINE_ASSIGNMENTS]: true,
    [FEATURES.FULL_CLIENT_MANAGEMENT]: true,
    [FEATURES.PERSONAL_MODULE]: true,
    [FEATURES.GYM_HIGHLIGHT]: true,
    maxGyms: 3,
  },
  [PLAN_KEYS.BASIC]: {
    [FEATURES.MULTI_GYM]: true,
    [FEATURES.ADVANCED_STATS]: false,
    [FEATURES.UNLIMITED_ROUTINE_ASSIGNMENTS]: false,
    [FEATURES.FULL_CLIENT_MANAGEMENT]: false,
    [FEATURES.PERSONAL_MODULE]: false,
    [FEATURES.GYM_HIGHLIGHT]: false,
    maxGyms: 3,
  },
  [PLAN_KEYS.PRO]: {
    [FEATURES.MULTI_GYM]: true,
    [FEATURES.ADVANCED_STATS]: true,
    [FEATURES.UNLIMITED_ROUTINE_ASSIGNMENTS]: true,
    [FEATURES.FULL_CLIENT_MANAGEMENT]: true,
    [FEATURES.PERSONAL_MODULE]: true,
    [FEATURES.GYM_HIGHLIGHT]: true,
    maxGyms: null,
  },
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function inferPlanFromSubscription(plan) {
  const nombre = (plan?.nombre || "").toLowerCase();
  const precio = toNumber(plan?.precio);

  if (nombre.includes("pro")) return PLAN_KEYS.PRO;
  if (nombre.includes("bás") || nombre.includes("bas")) return PLAN_KEYS.BASIC;
  if (nombre.includes("trial") || nombre.includes("prueba") || precio === 0) {
    return PLAN_KEYS.TRIAL;
  }

  return PLAN_KEYS.BASIC;
}

export function derivePlanSnapshot(planResponse) {
  const planActivo = planResponse?.plan_activo || null;
  const historial = planResponse?.historial || [];

  const allSubs = [planActivo, ...historial].filter(Boolean);

  const trialUsed = allSubs.some((sub) => {
    const nombre = (sub?.plan?.nombre || "").toLowerCase();
    const precio = toNumber(sub?.plan?.precio);
    return nombre.includes("trial") || nombre.includes("prueba") || precio === 0;
  });

  const currentPlan = planActivo?.plan
    ? inferPlanFromSubscription(planActivo.plan)
    : PLAN_KEYS.BASIC;

  return {
    currentPlan,
    trialUsed,
    raw: {
      planActivo,
      historial,
    },
  };
}

export function canAccess(feature, plan) {
  const safePlan = plan && PLAN_RULES[plan] ? plan : PLAN_KEYS.BASIC;
  return Boolean(PLAN_RULES[safePlan]?.[feature]);
}

export function getMaxGyms(plan) {
  const safePlan = plan && PLAN_RULES[plan] ? plan : PLAN_KEYS.BASIC;
  return PLAN_RULES[safePlan]?.maxGyms ?? 1;
}

export function canCreateGym(plan, currentGyms = 0) {
  const maxGyms = getMaxGyms(plan);
  if (maxGyms == null) return true;
  return Number(currentGyms) < maxGyms;
}

export function getFeatureUpgradeMessage(feature) {
  const customMessages = {
    [FEATURES.ADVANCED_STATS]: "Las estadísticas avanzadas están disponibles solo en el plan Pro.",
    [FEATURES.UNLIMITED_ROUTINE_ASSIGNMENTS]: "La asignación ilimitada de rutinas está disponible solo en el plan Pro.",
    [FEATURES.FULL_CLIENT_MANAGEMENT]: "La gestión completa de clientes está disponible solo en el plan Pro.",
    [FEATURES.MULTI_GYM]: "La creación de múltiples gimnasios está disponible solo en el plan Pro.",
    [FEATURES.PERSONAL_MODULE]: "El módulo de personal está disponible solo en el plan Pro.",
    [FEATURES.GYM_HIGHLIGHT]: "Destacar gimnasio está disponible solo en el plan Pro.",
  };

  return customMessages[feature] || "Esta función está disponible solo en el plan Pro.";
}
