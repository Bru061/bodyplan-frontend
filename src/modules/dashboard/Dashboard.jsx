import DashboardLayout from "../../layout/DashboardLayout";
import '../../styles/dashboard.css'
import { Link } from "react-router-dom";

function Dashboard() {
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
                <p className="metric-value">128</p>
                <p className="metric-sub metric-positive">+6.2% vs mes anterior</p>
              </article>
              <article className="metric-card">
                <p className="metric-title">Clientes inactivos</p>
                <p className="metric-value">14</p>
                <p className="metric-sub">Sin cambios esta semana</p>
              </article>
              <article className="metric-card">
                <p className="metric-title">Membresías activas</p>
                <p className="metric-value">96</p>
                <p className="metric-sub">Básica: 48 · Pro: 32 · Premium: 16</p>
              </article>
              <article className="metric-card">
                <p className="metric-title">Rutinas creadas</p>
                <p className="metric-value">42</p>
                <p className="metric-sub">8 nuevas en los últimos 30 días</p>
              </article>
              <article className="metric-card">
                <p className="metric-title">Servicios publicados</p>
                <p className="metric-value">11</p>
                <p className="metric-sub">9 activos · 2 pausados</p>
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
                  <li>
                    <span className="status-dot warning"></span>
                    3 membresías vencen en menos de 48 horas.
                  </li>
                  <li>
                    <span className="status-dot info"></span>
                    2 pagos pendientes de conciliación.
                  </li>
                  <li>
                    <span className="status-dot danger"></span>
                    Servicio “Entrenamiento funcional” está inactivo.
                  </li>
                </ul>
              </article>
            </section>
          </div>
        </DashboardLayout>
    )
}

export default Dashboard