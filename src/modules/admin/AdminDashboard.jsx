import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import { Link } from "react-router-dom";
import api from "../../services/axios";

function AdminDashboard() {

  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resMovimientos, resSuscripciones, resReembolsos] = await Promise.allSettled([
          api.get("/admin/movimientos"),
          api.get("/admin/suscripciones", { params: { estado: "activa" } }),
          api.get("/admin/reembolsos",    { params: { estado: "pendiente_revision" } })
        ]);

        setStats({
          totalCobrado: resMovimientos.status === "fulfilled"
            ? resMovimientos.value.data.resumen?.total_cobrado || 0
            : 0,
          suscripcionesActivas: resSuscripciones.status === "fulfilled"
            ? (resSuscripciones.value.data.suscripciones || []).length
            : 0,
          reembolsosPendientes: resReembolsos.status === "fulfilled"
            ? (resReembolsos.value.data.reembolsos || []).length
            : 0
        });
      } catch (err) {
        console.error("Error cargando stats admin", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>

      <section className="page-header">
        <div>
          <p className="eyebrow">Panel de administración</p>
          <h1>Dashboard</h1>
          <p className="subtitle">Resumen general de la plataforma BodyPlan.</p>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total cobrado</p>
          <p className="admin-stat-value">
            {loading ? "..." : `$${parseFloat(stats?.totalCobrado || 0).toLocaleString("es-MX")}`}
          </p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Suscripciones activas</p>
          <p className="admin-stat-value">{loading ? "..." : stats?.suscripcionesActivas}</p>
        </div>
        <div className="admin-stat-card" style={{ borderLeft: stats?.reembolsosPendientes > 0 ? "4px solid #f59e0b" : undefined }}>
          <p className="admin-stat-label">Reembolsos pendientes</p>
          <p className="admin-stat-value" style={{ color: stats?.reembolsosPendientes > 0 ? "#f59e0b" : undefined }}>
            {loading ? "..." : stats?.reembolsosPendientes}
          </p>
        </div>
      </div>

      {/* ── Accesos rápidos ── */}
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