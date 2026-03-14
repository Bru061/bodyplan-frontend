import DashboardLayout from "../../layout/DashboardLayout";
import "../../styles/dashboard.css";
import { useDashboardData } from "./hooks/useDashboardData";
import { useEffect, useRef, useState } from "react";
import { getMyGym } from "../../services/gymService";
import { useAuth } from "../../core/context/AuthContext";
import Chart from "chart.js/auto";

function Dashboard() {

  const [meses, setMeses] = useState(6);
  const { dashboard, loading } = useDashboardData(meses);
  const { user } = useAuth();
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

  // ── Gráfica de líneas ──
  useEffect(() => {
    if (loading || !chartRef.current) return;

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

  }, [loading, dashboard.chartData]);

  return (
    <DashboardLayout>

      {/* ── Métricas principales */}
      <section className="metrics-grid" aria-label="Indicadores">

        <article className="metric-card">
          <p className="metric-title">Clientes activos</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.clientesActivos}</p>
          <p className="metric-sub">Con membresía vigente</p>
        </article>

        <article className="metric-card">
          <p className="metric-title">Clientes inactivos</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.clientesInactivos}</p>
          <p className="metric-sub">Sin membresía activa</p>
        </article>

        <article className="metric-card">
          <p className="metric-title">Membresías activas</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.membresiasActivas}</p>
          <p className="metric-sub">Membresías vigentes</p>
        </article>

        <article className="metric-card">
          <p className="metric-title">Rutinas creadas</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.rutinas}</p>
          <p className="metric-sub">Rutinas registradas</p>
        </article>

        <article className="metric-card">
          <p className="metric-title">Gimnasios</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.gimnasios}</p>
          <p className="metric-sub">Gimnasios activos</p>
        </article>

      </section>

      {/* ── Métricas secundarias */}
      <section className="metrics-grid metrics-grid-3" aria-label="Indicadores adicionales">

        <article className="metric-card metric-card-highlight">
          <p className="metric-title">Nuevos este mes</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.clientesNuevosMes}</p>
          <p className="metric-sub">Inscritos en el mes actual</p>
        </article>

        <article className={`metric-card ${
          !loading && dashboard.metrics.membresiasPorVencer > 0 ? "metric-card-warning" : ""
        }`}>
          <p className="metric-title">Por vencer</p>
          <p className="metric-value">{loading ? "..." : dashboard.metrics.membresiasPorVencer}</p>
          <p className="metric-sub">Vencen en 15 días</p>
        </article>

        <article className="metric-card">
          <p className="metric-title">Gym más activo</p>
          <p className="metric-value metric-value-sm">
            {loading ? "..." : dashboard.metrics.gimnasioTop}
          </p>
          <p className="metric-sub">Más clientes registrados</p>
        </article>

      </section>

      {/* ── Gráfica ── */}
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

          {loading ? (
            <p style={{ padding: "2rem", color: "var(--text-secondary)" }}>
              Cargando datos...
            </p>
          ) : (
            <canvas ref={chartRef} height="100" />
          )}
        </article>
      </section>

    </DashboardLayout>
  );
}

export default Dashboard;