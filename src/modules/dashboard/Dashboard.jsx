import DashboardLayout from "../../layout/DashboardLayout";
import '../../styles/dashboard.css'
import { Link } from "react-router-dom";
import { useDashboardData } from "./hooks/useDashboardData"

function Dashboard() {
  const { dashboard, loading } = useDashboardData();
    return (
        <DashboardLayout>
          <div className="dashboard-container">
            <section className="page-header">
              <div>
                <p className="eyebrow">Panel Administrativo</p>
                <h1>Dashboard ejecutivo</h1>
                <p className="subtitle">Resumen operativo para tomar decisiones rápidas del gimnasio.</p>
              </div>
              <div className="quick-actions">
                <Link className="btn btn-primary" to="/rutinas">Crear rutina</Link>
                <Link className="btn btn-primary" to="/servicios">Agregar servicio</Link>
                <Link className="btn btn-primary" to="/reseñas">Ver reseñas</Link>
              </div>
            </section>

            <section className="metrics-grid" aria-label="Indicadores">
              <article className="metric-card">
                <p className="metric-title">Clientes activos</p>
                <p className="metric-value">
                  {loading ? "..." : dashboard.metrics.clientesActivos}
                </p>
                <p className="metric-sub">
                  {loading ? "" : dashboard.descriptions.clientesActivos}
                </p>
              </article>
              <article className="metric-card">
                <p className="metric-title">Clientes inactivos</p>
                <p className="metric-value">
                  {loading ? "..." : dashboard.metrics.clientesInactivos}
                </p>
                <p className="metric-sub">
                  {loading ? "" : dashboard.descriptions.clientesInactivos}
                </p>
              </article>
              <article className="metric-card">
                <p className="metric-title">Membresías activas</p>
                <p className="metric-value">
                  {loading ? "..." : dashboard.metrics.membresiasActivas}
                </p>
                <p className="metric-sub">
                  {loading ? "" : dashboard.descriptions.membresiasActivas}
                </p>
              </article>
              <article className="metric-card">
                <p className="metric-title">Rutinas creadas</p>
                <p className="metric-value">
                  {loading ? "..." : dashboard.metrics.rutinas}
                </p>
                <p className="metric-sub">
                  {loading ? "" : dashboard.descriptions.rutinas}
                </p>
              </article>
              <article className="metric-card">
                <p className="metric-title">Servicios publicados</p>
                <p className="metric-value">
                  {loading ? "..." : dashboard.metrics.servicios}
                </p>
                <p className="metric-sub">
                  {loading ? "" : dashboard.descriptions.servicios}
                </p>
              </article>
            </section>

            <section className="content-grid">
              <article className="panel chart-panel">
                <div className="panel-header">
                  <div>
                    <h2>Ingresos estimados por periodo</h2>
                    <p>Comparativa de los últimos 6 meses.</p>
                  </div>
                  <div className="filter-buttons" role="group" aria-label="Filtros de periodo">
                    <button className="is-active" type="button">6M</button>
                    <button type="button">12M</button>
                    <button type="button">YTD</button>
                  </div>
                </div>
                <canvas id="overviewChart" height="120"></canvas>
              </article>

              <article className="panel alerts-panel" aria-label="Alertas importantes">
                <h2>Alertas importantes</h2>
                <ul className="alerts-list">
                  {!loading && dashboard.alerts.map((alert, index) => (
                    <li key={index}>
                      <span className={`status-dot ${alert.type}`}></span>
                      {alert.message}
                    </li>
                  ))}
                </ul>
              </article>
            </section>
          </div>
        </DashboardLayout>
    )
}

export default Dashboard