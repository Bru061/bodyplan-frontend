import DashboardLayout from "../../layout/DashboardLayout";
import "../../styles/dashboard.css";
import { useDashboardData } from "./hooks/useDashboardData";
import { useEffect, useRef, useState } from "react";
import { getMyGym } from "../../services/gymService";
import { useAuth } from "../../core/context/AuthContext";
import Chart from "chart.js/auto";
import { Link, useNavigate } from "react-router-dom";
import usePermissions from "../../hooks/usePermissions"
import LoadingScreen from "../../components/ui/LoadingScreen";

function Dashboard() {

  const [meses, setMeses] = useState(6);
  const { dashboard, loading } = useDashboardData(meses);
  const { user } = useAuth();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const clientesChartRef = useRef(null);
  const clientesChartInstanceRef = useRef(null);
  const gimnasiosChartRef = useRef(null);
  const gimnasiosChartInstanceRef = useRef(null);
  const navigate = useNavigate();

  const { can, FEATURES, getUpgradeMessage, loading: permissionsLoading } = usePermissions();
  const advancedStatsEnabled = can(FEATURES.ADVANCED_STATS);

  /**
 * Verifica que el proveedor tenga al menos un gimnasio registrado al montar.
 * No bloquea ni redirige; solo registra en consola si ocurre un error.
 */
  useEffect(() => {
    const checkGym = async () => {
      if (user?.role !== "proveedor") return;
      try {
        await getMyGym();
      } catch (err) {
        console.error(err);
      }
    };
    checkGym();
  }, [user]);

  useEffect(() => {
    if (loading || !chartRef.current || !advancedStatsEnabled ) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: dashboard.chartData.labels,
        datasets: [
          {
            label: "Membresías iniciadas",
            data: dashboard.chartData.membresiasIniciadas,
            borderColor: "rgba(37, 99, 235, 1)",
            backgroundColor: "rgba(37, 99, 235, 0.08)",
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3,
            fill: true
          },
          {
            label: "Membresías activas",
            data: dashboard.chartData.membresiasActivas,
            borderColor: "rgba(16, 185, 129, 1)",
            backgroundColor: "rgba(16, 185, 129, 0.08)",
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: "rgba(0,0,0,0.05)" }
          },
          x: { grid: { display: false } }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };

  }, [loading, dashboard.chartData, advancedStatsEnabled]);

  useEffect(() => {
    if (loading || !advancedStatsEnabled || !clientesChartRef.current) return;

    if (clientesChartInstanceRef.current) {
      clientesChartInstanceRef.current.destroy();
    }

    const ctx = clientesChartRef.current.getContext("2d");

    clientesChartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: dashboard.chartData.labels,
        datasets: [
          {
            label: "Clientes activos",
            data: dashboard.chartData.clientesActivos,
            borderColor: "rgba(14, 165, 233, 1)",
            backgroundColor: "rgba(14, 165, 233, 0.1)",
            borderWidth: 2,
            tension: 0.35,
            fill: true,
          },
          {
            label: "Clientes inactivos",
            data: dashboard.chartData.clientesInactivos,
            borderColor: "rgba(244, 63, 94, 1)",
            backgroundColor: "rgba(244, 63, 94, 0.08)",
            borderWidth: 2,
            tension: 0.35,
            fill: true,
          }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } },
          },
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      if (clientesChartInstanceRef.current) {
        clientesChartInstanceRef.current.destroy();
      }
    };
  }, [loading, advancedStatsEnabled, dashboard.chartData]);

  useEffect(() => {
    if (loading || !advancedStatsEnabled || !gimnasiosChartRef.current) return;

    if (gimnasiosChartInstanceRef.current) {
      gimnasiosChartInstanceRef.current.destroy();
    }

    const ctx = gimnasiosChartRef.current.getContext("2d");

    gimnasiosChartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dashboard.chartData.gimnasiosRankingLabels,
        datasets: [
          {
            label: "Clientes por gimnasio",
            data: dashboard.chartData.gimnasiosRankingValores,
            backgroundColor: [
              "rgba(37, 99, 235, 0.8)",
              "rgba(14, 165, 233, 0.8)",
              "rgba(16, 185, 129, 0.8)",
              "rgba(245, 158, 11, 0.8)",
              "rgba(236, 72, 153, 0.8)",
            ],
            borderRadius: 8,
          }
        ]
      },
      options: {
        responsive: true,
        indexAxis: "y",
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1 } },
          y: { grid: { display: false } },
        },
      },
    });

    return () => {
      if (gimnasiosChartInstanceRef.current) {
        gimnasiosChartInstanceRef.current.destroy();
      }
    };
  }, [loading, advancedStatsEnabled, dashboard.chartData]);

  if (permissionsLoading) {
    return <LoadingScreen message="Cargando dashboard..." />;
  }

  return (
    <DashboardLayout>

      <section className="metrics-grid" aria-label="Indicadores">

        <Link to="/clientes?estado=activa" className="metric-card metric-card-link">
          <p className="metric-title">Clientes activos</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.clientesActivos}</p>
          <p className="metric-sub">Con membresía vigente</p>
        </Link>

        <Link to="/clientes?estado=inactiva" className="metric-card metric-card-link">
          <p className="metric-title">Clientes inactivos</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.clientesInactivos}</p>
          <p className="metric-sub">Sin membresía activa</p>
        </Link>

        <Link to="/clientes?estado=activa" className="metric-card metric-card-link">
          <p className="metric-title">Membresías activas</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.membresiasActivas}</p>
          <p className="metric-sub">Membresías vigentes</p>
        </Link>

        <Link to="/rutinas" className="metric-card metric-card-link">
          <p className="metric-title">Rutinas creadas</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.rutinas}</p>
          <p className="metric-sub">Rutinas registradas</p>
        </Link>

        <Link to="/mis-gimnasios" className="metric-card metric-card-link">
          <p className="metric-title">Gimnasios</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.gimnasios}</p>
          <p className="metric-sub">Gimnasios activos</p>
        </Link>

      </section>

      <section className="metrics-grid metrics-grid-3" aria-label="Indicadores adicionales">

        <Link to="/clientes" className="metric-card metric-card-highlight metric-card-link">
          <p className="metric-title">Nuevos este mes</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.clientesNuevosMes}</p>
          <p className="metric-sub">Inscritos en el mes actual</p>
        </Link>

        <Link to="/clientes?estado=activa" className={`metric-card metric-card-link ${
          !loading && dashboard.metrics.membresiasPorVencer > 0 ? "metric-card-warning" : ""
        }`}>
          <p className="metric-title">Por vencer</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.membresiasPorVencer}</p>
          <p className="metric-sub">Vencen en 15 días</p>
        </Link>

        <Link to="/mis-gimnasios" className="metric-card metric-card-link">
          <p className="metric-title">Gym más activo</p>
          <p className="metric-value metric-value-sm">
            {loading ? "..." : dashboard.metrics.gimnasioTop}
          </p>
          <p className="metric-sub">Más clientes registrados</p>
        </Link>

      </section>

      <section className="content-grid">
        <article className="panel chart-panel" style={{ gridColumn: "1 / -1" }}>
          <div className="panel-header">
            <div>
              <h2>Evolución de membresías</h2>
              <p>Membresías iniciadas y activas por mes.</p>
            </div>
            <div className="chart-period-selector">
              {[3, 6, 12].map(n => (
                <button
                  key={n}
                  className={`period-btn ${meses === n ? "period-btn-active" : ""}`}
                  onClick={() => setMeses(n)}
                >
                  {n} meses
                </button>
              ))}
            </div>
          </div>

          {!advancedStatsEnabled ? (
            <div style={{ padding: "1.5rem 0" }}>
              <p style={{ marginBottom: "0.75rem", color: "var(--text-secondary)" }}>
                {getUpgradeMessage(FEATURES.ADVANCED_STATS)}
              </p>

              <button className="btn btn-primary" onClick={() => navigate("/planes")}>Mejorar plan</button>
            </div>
          ) : loading ? (
            <p style={{ padding: "2rem", color: "var(--text-secondary)" }}>
              Cargando datos...
            </p>
          ) : (
            <canvas ref={chartRef} height="100" />
          )}
        </article>

        {advancedStatsEnabled && (
          <>
            <article className="panel chart-panel">
              <div className="panel-header">
                <div>
                  <h2>Clientes activos vs inactivos</h2>
                  <p>Comparativo mensual por estado.</p>
                </div>
              </div>
              {loading ? (
                <p style={{ padding: "2rem", color: "var(--text-secondary)" }}>
                  Cargando datos...
                </p>
              ) : (
                <canvas ref={clientesChartRef} height="120" />
              )}
            </article>

            <article className="panel chart-panel">
              <div className="panel-header">
                <div>
                  <h2>Gimnasios más activos</h2>
                  <p>Top gimnasios con mayor cantidad de clientes registrados.</p>
                </div>
              </div>
              {loading ? (
                <p style={{ padding: "2rem", color: "var(--text-secondary)" }}>
                  Cargando datos...
                </p>
              ) : dashboard.chartData.gimnasiosRankingLabels.length === 0 ? (
                <p style={{ padding: "2rem", color: "var(--text-secondary)" }}>
                  Aún no hay datos suficientes para mostrar ranking de gimnasios.
                </p>
              ) : (
                <canvas ref={gimnasiosChartRef} height="120" />
              )}
            </article>
          </>
        )}
      </section>

    </DashboardLayout>
  );
}

export default Dashboard;