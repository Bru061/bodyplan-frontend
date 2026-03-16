import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../services/axios";

function AdminMovimientos() {

  const [movimientos, setMovimientos] = useState([]);
  const [resumen, setResumen]         = useState(null);
  const [loading, setLoading]         = useState(true);

  const [filtros, setFiltros] = useState({
    tipo_pago:   "",
    estado:      "",
    fecha_inicio: "",
    fecha_fin:   ""
  });

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtros.tipo_pago)    params.tipo_pago    = filtros.tipo_pago;
      if (filtros.estado)       params.estado       = filtros.estado;
      if (filtros.fecha_inicio) params.fecha_inicio = filtros.fecha_inicio;
      if (filtros.fecha_fin)    params.fecha_fin    = filtros.fecha_fin;

      const res = await api.get("/admin/movimientos", { params });
      setMovimientos(res.data.pagos    || []);
      setResumen(res.data.resumen      || null);
    } catch (err) {
      console.error("Error cargando movimientos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovimientos(); }, []);

  const handleFiltro = (e) => {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <AdminLayout>

      <section className="page-header">
        <div>
          <p className="eyebrow">Finanzas</p>
          <h1>Movimientos y pagos</h1>
          <p className="subtitle">Historial de todos los pagos procesados en la plataforma.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchMovimientos}>
          Aplicar filtros
        </button>
      </section>

      {/* ── Resumen ── */}
      {resumen && (
        <div className="admin-stats">
          <div className="admin-stat-card">
            <p className="admin-stat-label">Total cobrado</p>
            <p className="admin-stat-value">${resumen.total_cobrado?.toLocaleString("es-MX")}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Comisión plataforma</p>
            <p className="admin-stat-value">${resumen.total_comision_plataforma?.toLocaleString("es-MX")}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Comisión Stripe</p>
            <p className="admin-stat-value">${resumen.total_comision_stripe?.toLocaleString("es-MX")}</p>
          </div>
        </div>
      )}

      {/* ── Tabla ── */}
      <div className="admin-table-panel">
        <div className="admin-table-header">
          <h2>Pagos</h2>
          <div className="admin-filters">
            <select name="tipo_pago" value={filtros.tipo_pago} onChange={handleFiltro}>
              <option value="">Todos los tipos</option>
              <option value="membresia">Membresía</option>
              <option value="plataforma">Plataforma</option>
            </select>
            <select name="estado" value={filtros.estado} onChange={handleFiltro}>
              <option value="">Todos los estados</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="reembolsado">Reembolsado</option>
            </select>
            <input
              type="date" name="fecha_inicio"
              value={filtros.fecha_inicio} onChange={handleFiltro}
              title="Fecha inicio"
            />
            <input
              type="date" name="fecha_fin"
              value={filtros.fecha_fin} onChange={handleFiltro}
              title="Fecha fin"
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Gimnasio</th>
                <th>Monto base</th>
                <th>Comisión Stripe</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="admin-empty">Cargando...</td></tr>
              ) : movimientos.length === 0 ? (
                <tr><td colSpan="7" className="admin-empty">No hay movimientos con esos filtros.</td></tr>
              ) : (
                movimientos.map((m, i) => (
                  <tr key={m.id_pago ?? i}>
                    <td>#{m.id_pago}</td>
                    <td>
                      <p style={{ margin: 0, fontWeight: 600 }}>{m.Usuario?.nombre}</p>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{m.Usuario?.correo}</span>
                    </td>
                    <td>{m.Gimnasio?.nombre || "—"}</td>
                    <td>${parseFloat(m.monto_base || 0).toLocaleString("es-MX")}</td>
                    <td>${parseFloat(m.monto_comision_stripe || 0).toLocaleString("es-MX")}</td>
                    <td>
                      <span className={`badge ${
                        m.estado === "pagado"      ? "badge-success"
                        : m.estado === "reembolsado" ? "badge-secondary"
                        : "badge-danger"
                      }`}>
                        {m.estado}
                      </span>
                    </td>
                    <td>{m.fecha_pago ? new Date(m.fecha_pago).toLocaleDateString("es-MX") : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  );
}

export default AdminMovimientos;