import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import { Link } from "react-router-dom";
import api from "../../services/axios";

function AdminDashboard() {

  const [stats, setStats]   = useState(null);
  const [mesesIngresos, setMesesIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anio, setAnio] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resIngresos, resResumenGimnasios, resReembolsos] = await Promise.allSettled([
          api.get("/admin/ingresos-mensuales", { params: { anio } }),
          api.get("/admin/resumen-gimnasios", { params: { limit: 200 } }),
          api.get("/admin/reembolsos", { params: { estado: "pendiente_revision" } })
        ]);

        const meses = resIngresos.status === "fulfilled"
          ? (resIngresos.value.data.meses || [])
          : [];
        const resumenIngresos = resIngresos.status === "fulfilled"
          ? (resIngresos.value.data.resumen || {})
          : {};
        const gimnasios = resResumenGimnasios.status === "fulfilled"
          ? (resResumenGimnasios.value.data.gimnasios || [])
          : [];
        const clientesActivos = gimnasios.reduce((acc, gym) => acc + Number(gym.clientes_activos || 0), 0);

        setStats({
          montoTotal: Number(resumenIngresos.monto_total || 0),
          gananciaNeta: Number(resumenIngresos.ganancia_neta || 0),
          comisionPlataforma: Number(resumenIngresos.comision_plataforma || 0),
          gimnasiosRegistrados: gimnasios.length,
          clientesActivos,
          calificacionPromedio: Number(gimnasios.reduce((acc, gym) => acc + Number(gym.promedio_calificacion || gym.calificacion_promedio || 0), 0) / (gimnasios.length || 1)),
          reembolsosPendientes: resReembolsos.status === "fulfilled"
            ? (resReembolsos.value.data.reembolsos || []).length
            : 0
        });
        setMesesIngresos(meses.slice(-6));
      } catch (err) {
        console.error("Error cargando stats admin", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [anio]);

  return (
    <AdminLayout>

      <section className="page-header">
        <div>
          <p className="eyebrow">Panel de administración</p>
          <h1>Dashboard</h1>
          <p className="subtitle">Resumen general de la plataforma BodyPlan.</p>
        </div>
      </section>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Ingresos históricos</p>
          <p className="admin-stat-value">
            {loading ? "..." : `$${parseFloat(stats?.montoTotal || 0).toLocaleString("es-MX")}`}
          </p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Ganancia neta</p>
          <p className="admin-stat-value">{loading ? "..." : `$${parseFloat(stats?.gananciaNeta || 0).toLocaleString("es-MX")}`}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Comisión plataforma</p>
          <p className="admin-stat-value">{loading ? "..." : `$${parseFloat(stats?.comisionPlataforma || 0).toLocaleString("es-MX")}`}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Gimnasios registrados</p>
          <p className="admin-stat-value">{loading ? "..." : stats?.gimnasiosRegistrados}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Clientes activos</p>
          <p className="admin-stat-value">{loading ? "..." : stats?.clientesActivos}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Calificación promedio</p>
          <p className="admin-stat-value">{loading ? "..." : Number(stats?.calificacionPromedio || 0).toFixed(2)}</p>
        </div>
        <div className="admin-stat-card" style={{ borderLeft: stats?.reembolsosPendientes > 0 ? "4px solid #f59e0b" : undefined }}>
          <p className="admin-stat-label">Reembolsos pendientes</p>
          <p className="admin-stat-value" style={{ color: stats?.reembolsosPendientes > 0 ? "#f59e0b" : undefined }}>
            {loading ? "..." : stats?.reembolsosPendientes}
          </p>
        </div>
      </div>

      <div className="admin-table-panel" style={{ marginBottom: "1rem" }}>
        <div className="admin-table-header">
          <h2>Ingresos por mes (últimos 6)</h2>
          <div className="admin-filters">
            <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Periodo</th>
                <th>Total pagos</th>
                <th>Monto total</th>
                <th>Comisión plataforma</th>
                <th>Comisión Stripe</th>
                <th>Ganancia neta</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="admin-empty">Cargando...</td></tr>
              ) : mesesIngresos.length === 0 ? (
                <tr><td colSpan="6" className="admin-empty">Sin datos mensuales.</td></tr>
              ) : (
                mesesIngresos.map((mes, index) => (
                  <tr key={`${mes.anio || "anio"}-${mes.mes || "mes"}-${index}`}>
                    <td>{`${mes.anio || "—"}-${String(mes.mes || "—").padStart(2, "0")}`}</td>
                    <td>{mes.total_pagos || 0}</td>
                    <td>${parseFloat(mes.monto_total || 0).toLocaleString("es-MX")}</td>
                    <td>${parseFloat(mes.comision_plataforma || 0).toLocaleString("es-MX")}</td>
                    <td>${parseFloat(mes.comision_stripe || 0).toLocaleString("es-MX")}</td>
                    <td>${parseFloat(mes.ganancia_neta || 0).toLocaleString("es-MX")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      <div className="content-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>

        <Link to="/admin/planes" style={{ textDecoration: "none" }}>
          <div className="panel" style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <h2 style={{ margin: "0 0 0.5rem" }}>Gestión de planes</h2>
            <p className="subtitle" style={{ margin: 0 }}>Crea y edita los planes de la plataforma.</p>
          </div>
        </Link>

        <Link to="/admin/movimientos" style={{ textDecoration: "none" }}>
          <div className="panel" style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <h2 style={{ margin: "0 0 0.5rem" }}>Movimientos</h2>
            <p className="subtitle" style={{ margin: 0 }}>Historial de pagos y transacciones.</p>
          </div>
        </Link>

        <Link to="/admin/reembolsos" style={{ textDecoration: "none" }}>
          <div className="panel" style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <h2 style={{ margin: "0 0 0.5rem" }}>Reembolsos</h2>
            <p className="subtitle" style={{ margin: 0 }}>Aprueba o rechaza solicitudes pendientes.</p>
          </div>
        </Link>

        <Link to="/admin/suscripciones" style={{ textDecoration: "none" }}>
          <div className="panel" style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <h2 style={{ margin: "0 0 0.5rem" }}>Suscripciones</h2>
            <p className="subtitle" style={{ margin: 0 }}>Membresías activas en todos los gimnasios.</p>
          </div>
        </Link>

      </div>

    </AdminLayout>
  );
}

export default AdminDashboard;