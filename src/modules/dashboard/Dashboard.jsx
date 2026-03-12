import DashboardLayout from "../../layout/DashboardLayout";
import '../../styles/dashboard.css';
import { Link } from "react-router-dom";
import { useDashboardData } from "./hooks/useDashboardData";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMyGym } from "../../services/gymService";
import { useAuth } from "../../core/context/AuthContext";
import Chart from "chart.js/auto";

function Dashboard() {

  const { dashboard, loading } = useDashboardData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

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

  // ── Gráfica de barras ──
  useEffect(() => {

    if (loading || !chartRef.current) return;

    // Destruir instancia anterior si existe
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dashboard.chartData.labels,
        datasets: [
          {
            label: "Total",
            data: dashboard.chartData.values,
            backgroundColor: [
              "rgba(37, 99, 235, 0.7)",
              "rgba(239, 68, 68, 0.7)",
              "rgba(16, 185, 129, 0.7)",
              "rgba(139, 92, 246, 0.7)",
              "rgba(245, 158, 11, 0.7)"
            ],
            borderColor: [
              "rgba(37, 99, 235, 1)",
              "rgba(239, 68, 68, 1)",
              "rgba(16, 185, 129, 1)",
              "rgba(139, 92, 246, 1)",
              "rgba(245, 158, 11, 1)"
            ],
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: "rgba(0,0,0,0.05)" }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };

  }, [loading, dashboard.chartData]);

  return (
    <DashboardLayout>
      <div className="dashboard-container">

        <section className="page-header">
          <div>
            <p className="eyebrow">Panel Administrativo</p>
            <h1>Dashboard ejecutivo</h1>
            <p className="subtitle">
              Resumen operativo para tomar decisiones rápidas del gimnasio.
            </p>
          </div>
          <div className="quick-actions">
            {/* ✅ Botón "Crear rutina" eliminado */}
            <Link className="btn btn-primary" to="/resenas">Ver reseñas</Link>
          </div>
        </section>

        {/* ── Métricas principales ── */}
        <section className="metrics-grid" aria-label="Indicadores">

          <article className="metric-card">
            <p className="metric-title">Clientes activos</p>
            <p className="metric-value">
              {loading ? "..." : dashboard.metrics.clientesActivos}
            </p>
            <p className="metric-sub">Clientes con membresía vigente</p>
          </article>

          <article className="metric-card">
            <p className="metric-title">Clientes inactivos</p>
            <p className="metric-value">
              {loading ? "..." : dashboard.metrics.clientesInactivos}
            </p>
            <p className="metric-sub">Clientes sin membresía activa</p>
          </article>

          <article className="metric-card">
            <p className="metric-title">Membresías activas</p>
            <p className="metric-value">
              {loading ? "..." : dashboard.metrics.membresiasActivas}
            </p>
            <p className="metric-sub">Membresías vigentes</p>
          </article>

          <article className="metric-card">
            <p className="metric-title">Rutinas creadas</p>
            <p className="metric-value">
              {loading ? "..." : dashboard.metrics.rutinas}
            </p>
            <p className="metric-sub">Rutinas registradas</p>
          </article>

          <article className="metric-card">
            <p className="metric-title">Gimnasios registrados</p>
            <p className="metric-value">
              {loading ? "..." : dashboard.metrics.gimnasios}
            </p>
            <p className="metric-sub">Gimnasios activos</p>
          </article>

        </section>

        {/* ── Métricas adicionales ── */}
        <section className="metrics-grid" aria-label="Indicadores adicionales">

          <article className="metric-card metric-card-highlight">
            <p className="metric-title">Clientes nuevos este mes</p>
            <p className="metric-value">
              {loading ? "..." : dashboard.metrics.clientesNuevosMes}
            </p>
            <p className="metric-sub">Inscritos en el mes actual</p>
          </article>

          <article className={`metric-card ${
            !loading && dashboard.metrics.membresiasPorVencer > 0
              ? "metric-card-warning"
              : ""
          }`}>
            <p className="metric-title">Membresías por vencer</p>
            <p className="metric-value">
              {loading ? "..." : dashboard.metrics.membresiasPorVencer}
            </p>
            <p className="metric-sub">Vencen en los próximos 15 días</p>
          </article>

          <article className="metric-card">
            <p className="metric-title">Gimnasio más activo</p>
            <p className="metric-value metric-value-sm">
              {loading ? "..." : dashboard.metrics.gimnasioTop}
            </p>
            <p className="metric-sub">Con más clientes registrados</p>
          </article>

        </section>

        {/* ── Gráfica ── */}
        <section className="content-grid">
          <article className="panel chart-panel" style={{ gridColumn: "1 / -1" }}>
            <div className="panel-header">
              <div>
                <h2>Resumen general</h2>
                <p>Vista gráfica de los indicadores del gimnasio.</p>
              </div>
            </div>
            {loading ? (
              <p style={{ padding: "2rem", color: "var(--text-secondary)" }}>
                Cargando datos...
              </p>
            ) : (
              <canvas ref={chartRef} height="100" />
            )}
          </article>
        </section>

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;