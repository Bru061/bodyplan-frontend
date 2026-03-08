import { useState, useEffect } from "react";
import SuperAdminLayout from "../../layout/AdminLayout";
import { Link } from "react-router-dom";
import { MdOutlineCalendarMonth, MdFileDownload } from "react-icons/md";
import "../../styles/admin.css";

function AdminDashboard() {

  const [stats, setStats] = useState({
    totalGyms: 0,
    activeGyms: 0,
    blockedGyms: 0,
    ingresos: 0
  });

  const [finance, setFinance] = useState({
    suscripciones: 0,
    totalRecibido: 0,
    pagosVencidos: 0
  });

  const [actividad, setActividad] = useState([]);

  const [alertas, setAlertas] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Aquí se conectará el backend después
    // ejemplo futuro:
    // api.get("/admin/dashboard")

    setLoading(false);

  }, []);

  if (loading) {
    return (
      <SuperAdminLayout>
        <h2 style={{ padding: 40 }}>Cargando dashboard...</h2>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>

      <section className="page-header">
        <div>
          <p className="eyebrow">Control global de plataforma</p>
          <h1>Dashboard superadministrador</h1>
          <p className="subtitle">
            Monitorea gimnasios, ingresos y eventos críticos de BodyPlan.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary">
            <MdFileDownload />
            Exportar reporte
          </button>

          <button className="btn btn-ghost">
            <MdOutlineCalendarMonth />
            Periodo
          </button>
        </div>
      </section>

      {/* STATS */}

      <section className="stats-grid">

        <article className="stat-card">
          <p className="stat-label">Total gimnasios</p>
          <p className="stat-value">{stats.totalGyms}</p>
        </article>

        <article className="stat-card">
          <p className="stat-label">Gimnasios activos</p>
          <p className="stat-value">{stats.activeGyms}</p>
        </article>

        <article className="stat-card">
          <p className="stat-label">Gimnasios bloqueados</p>
          <p className="stat-value">{stats.blockedGyms}</p>
        </article>

        <article className="stat-card">
          <p className="stat-label">Ingresos globales</p>
          <p className="stat-value">${stats.ingresos}</p>
        </article>

      </section>

      {/* CONTENT */}

      <section className="content-grid">

        {/* FINANZAS */}

        <article className="panel">
          <div className="panel-header">
            <h2>Resumen financiero</h2>
            <Link to="/admin/finanzas" className="inline-link">
              Ver finanzas
            </Link>
          </div>

          <div className="finance-list">
            <p>
              <span>Suscripciones vigentes</span>
              <strong>{finance.suscripciones}</strong>
            </p>

            <p>
              <span>Total recibido</span>
              <strong>${finance.totalRecibido}</strong>
            </p>

            <p>
              <span>Pagos vencidos</span>
              <strong>{finance.pagosVencidos}</strong>
            </p>
          </div>

        </article>

        {/* ACTIVIDAD */}

        <article className="panel">
          <div className="panel-header">
            <h2>Actividad reciente</h2>
            <Link to="/admin/actividad" className="inline-link">
              Ver actividad
            </Link>
          </div>

          {actividad.length === 0 ? (
            <p className="empty-state">No hay actividad reciente</p>
          ) : (
            <ul className="activity-list">
              {actividad.map((a, index) => (
                <li key={index}>
                  <span className={`badge badge-${a.tipo}`}>
                    {a.tipo}
                  </span>
                  {a.descripcion}
                  <span className="time">{a.tiempo}</span>
                </li>
              ))}
            </ul>
          )}

        </article>

      </section>

      {/* ALERTAS */}

      <section className="panel table-panel">

        <div className="panel-header">
          <h2>Gimnasios con alertas críticas</h2>
          <Link to="/admin/gimnasios" className="inline-link">
            Gestionar gimnasios
          </Link>
        </div>

        <div className="table-wrap">

          <table>

            <thead>
              <tr>
                <th>Gimnasio</th>
                <th>Estado</th>
                <th>Plan</th>
                <th>Último pago</th>
                <th>Alerta</th>
              </tr>
            </thead>

            <tbody>

              {alertas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-table">
                    No hay alertas críticas
                  </td>
                </tr>
              ) : (
                alertas.map((g) => (
                  <tr key={g.id}>
                    <td>{g.nombre}</td>
                    <td>
                      <span className={`badge badge-${g.estado}`}>
                        {g.estado}
                      </span>
                    </td>
                    <td>{g.plan}</td>
                    <td>{g.ultimoPago}</td>
                    <td>{g.alerta}</td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </section>

    </SuperAdminLayout>
  );
}

export default AdminDashboard;