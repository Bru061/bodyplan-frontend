import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/axios";
import "../../styles/planes.css";
import usePermissions from "../../hooks/usePermissions";

const ACCESOS_HARDCODED = {
  1: [ // Prueba Gratis
    { nombre: "Hasta 3 gimnasios", incluido: true  },
    { nombre: "Gestión de clientes", incluido: true  },
    { nombre: "Rutinas", incluido: true  },
    { nombre: "Exportar reportes", incluido: true  },
    { nombre: "Módulo de personal", incluido: true  },
    { nombre: "Destacar gimnasio", incluido: true  },
    { nombre: "Soporte prioritario", incluido: false }
  ],
  2: [ // Estándar / Básico
    { nombre: "Hasta 3 gimnasios", incluido: true  },
    { nombre: "Gestión de clientes", incluido: true  },
    { nombre: "Rutinas", incluido: true  },
    { nombre: "Exportar reportes", incluido: true  },
    { nombre: "Módulo de personal", incluido: false },
    { nombre: "Destacar gimnasio", incluido: false },
    { nombre: "Soporte prioritario", incluido: false }
  ],
  3: [ // Pro
    { nombre: "Gimnasios ilimitados", incluido: true  },
    { nombre: "Gestión de clientes", incluido: true  },
    { nombre: "Rutinas", incluido: true  },
    { nombre: "Exportar reportes", incluido: true  },
    { nombre: "Módulo de personal", incluido: true  },
    { nombre: "Destacar gimnasio", incluido: true  },
    { nombre: "Soporte prioritario", incluido: true  }
  ]
};

function Planes() {

  const navigate = useNavigate();
  const location = useLocation();
  const [planes, setPlanes] = useState([]);
  const [planActivo, setPlanActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [error, setError] = useState("");
  const [hasPlanHistory, setHasPlanHistory] = useState(false);

  const { trialUsed, refreshPermissions } = usePermissions();
  const fromPerfil = location.state?.from === "/perfil";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resPlanes = await api.get("/planes/web");
        setPlanes(resPlanes.data.planes || []);

        try {
          const resPlan = await api.get("/proveedor/mi-plan");
          const historial = resPlan.data.historial || [];
          setHasPlanHistory(historial.length > 0);
          if (resPlan.data.plan_activo?.estado === "activa") {
            setPlanActivo(resPlan.data.plan_activo);
            refreshPermissions();
          }
        } catch {
          setHasPlanHistory(false);
        }

      } catch (err) {
        console.error("Error cargando planes", err);
        setError("No se pudieron cargar los planes. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshPermissions]);

  const handleSeleccionar = async (plan) => {
    setError("");

    const esTrial = parseFloat(plan.precio) === 0 || /trial|prueba/i.test(plan.nombre || "");
    if (esTrial && hasPlanHistory && !esPlanActual(plan)) {
      setError("La promoción gratuita solo puede activarse una vez por cuenta.");
      return;
    }

    if (esTrial && trialUsed && !esPlanActual(plan)) {
      setError("El plan de prueba solo puede activarse una vez por usuario.");
      return;
    }

    setProcesando(plan.id_plan);

    try {
      const res = await api.post("/pagos/premium/web/intent", {
        id_plan: plan.id_plan,
        renovacion_automatica: false
      });

      if (res.data.message) {
        navigate("/dashboard");
        return;
      }

      navigate("/checkout", {
        state: {
          client_secret: res.data.client_secret,
          desglose: res.data.desglose,
          plan
        }
      });

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "No se pudo procesar la solicitud"
      );
    } finally {
      setProcesando(null);
    }
  };

  const esPlanActual = (plan) =>
    planActivo?.plan?.nombre?.toLowerCase() === plan.nombre?.toLowerCase();

  const formatPrecio = (plan) => {
    const precio = parseFloat(plan.precio);
    if (precio === 0) return "$0";
    return `$${precio.toLocaleString("es-MX")}`;
  };

  const formatPeriodo = (plan) => {
    const precio = parseFloat(plan.precio);
    if (precio === 0) return `(${plan.duracion_dias} días gratis)`;
    if (plan.duracion_dias >= 365) return "/año";
    return "/mes";
  };

  if (loading) {
    return (
      <div className="planes-page">
        <div className="planes-header"><h1>Cargando planes...</h1></div>
      </div>
    );
  }

  return (
    <div className="planes-page">

      {fromPerfil && (
        <button
          className="planes-back"
          onClick={() => navigate("/perfil")}
        >
          ← Atrás
        </button>
      )}

      <div className="planes-header">
        <h1>Elige tu plan</h1>
        <p>Empieza gratis y escala cuando lo necesites. Sin contratos, sin sorpresas.</p>
      </div>

      {error && (
        <div style={{
          background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca",
          borderRadius: "12px", padding: "0.75rem 1.25rem", marginBottom: "1.5rem",
          fontSize: "0.9rem", maxWidth: "600px", width: "100%", textAlign: "center"
        }}>
          {error}
        </div>
      )}

      <div className="planes-grid">
        {planes.map((plan, index) => {
          const activo   = esPlanActual(plan);
          const gratuito = parseFloat(plan.precio) === 0;
          const popular  = index === 1;
          const cargando = procesando === plan.id_plan;
          const accesos  = ACCESOS_HARDCODED[plan.id_plan] || [];
          const trialBloqueada = gratuito && !activo && (trialUsed || hasPlanHistory);

          return (
            <div
              key={plan.id_plan}
              className={`plan-card ${activo ? "plan-card-activo" : ""} ${popular && !activo ? "plan-card-popular" : ""}`}
            >
              {activo  && <span className="plan-activo-badge">✓ Plan actual</span>}
              {popular && !activo && <span className="plan-popular-badge">Más popular</span>}

              <p className="plan-nombre">{plan.nombre}</p>

              <div className="plan-precio">
                <p className="plan-precio-valor">{formatPrecio(plan)}</p>
                <p className="plan-precio-periodo">{formatPeriodo(plan)}</p>
              </div>

              {plan.descripcion && (
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, textAlign: "center" }}>
                  {plan.descripcion}
                </p>
              )}

              <hr className="plan-divider" />

              <ul className="plan-accesos">
                {accesos.map((acceso, i) => (
                  <li key={i} className={`plan-acceso-item ${!acceso.incluido ? "excluido" : ""}`}>
                    <span className="plan-acceso-icon">
                      {acceso.incluido ? "✅" : "❌"}
                    </span>
                    {acceso.nombre}
                  </li>
                ))}
              </ul>

              <button
                className={`plan-btn ${gratuito ? "plan-btn-ghost" : ""}`}
                onClick={() => handleSeleccionar(plan)}
                disabled={activo || cargando || !!procesando || trialBloqueada}
                title={trialBloqueada ? "Este plan promocional ya fue usado anteriormente" : ""}
              >
                {activo    ? "Plan actual"
                : cargando ? "Procesando..."
                : trialBloqueada ? "Promoción ya usada"
                : gratuito ? "Comenzar gratis"
                : index === planes.length - 1 ? "Empezar"
                : "Comenzar"}
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
}

export default Planes;