import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../services/axios";
import Toast from "../../components/ui/Toast";
import ModalPortal from "../../components/ui/ModalPortal";

function TabReembolsos({ showToast }) {

  const [reembolsos, setReembolsos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 10;

  const fetchReembolsos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/reembolsos");
      setReembolsos(res.data.reembolsos || []);
      setPagina(1);
    } catch (err) {
      showToast("Error cargando reembolsos.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReembolsos(); }, []);

  const totalPaginas  = Math.ceil(reembolsos.length / POR_PAGINA);
  const reembolsosPag = reembolsos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const estadoBadge = (estado) => ({
    pendiente_revision: "badge-secondary",
    aprobado: "badge-success",
    aprobado_auto: "badge-success",
    rechazado: "badge-danger"
  }[estado] || "badge-secondary");

  return (
    <div className="admin-table-panel">
      <div className="admin-table-header">
        <h2>Solicitudes de reembolso ({reembolsos.length})</h2>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Monto pago</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="admin-empty">Cargando...</td></tr>
            ) : reembolsos.length === 0 ? (
              <tr><td colSpan="6" className="admin-empty">No hay solicitudes de reembolso.</td></tr>
            ) : (
              reembolsosPag.map(r => (
                <tr key={r.id_reembolso}>
                  <td>#{r.id_reembolso}</td>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600 }}>{r.Usuario?.nombre}</p>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{r.Usuario?.correo}</span>
                  </td>
                  <td>
                    <p style={{ margin: 0 }}>${parseFloat(r.Pago?.monto || 0).toLocaleString("es-MX")}</p>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      Stripe: ${parseFloat(r.Pago?.monto_comision_stripe || 0).toLocaleString("es-MX")}
                    </span>
                  </td>
                  <td>
                    <p className="reembolso-motivo" title={r.motivo}>{r.motivo}</p>
                    {r.motivo_rechazo && (
                      <span style={{ fontSize: "0.75rem", color: "#dc2626" }}>Rechazo: {r.motivo_rechazo}</span>
                    )}
                  </td>
                  <td><span className={`badge ${estadoBadge(r.estado)}`}>{r.estado}</span></td>
                  <td>{r.fecha_solicitud ? new Date(r.fecha_solicitud).toLocaleDateString("es-MX") : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="admin-paginador">
          <button
            className="admin-pag-btn"
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={pagina === 1}
          >←</button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              className={`admin-pag-btn ${pagina === n ? "admin-pag-active" : ""}`}
              onClick={() => setPagina(n)}
            >{n}</button>
          ))}
          <button
            className="admin-pag-btn"
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
          >→</button>
          <span className="admin-pag-info">{reembolsos.length} registros</span>
        </div>
      )}
    </div>
  );
}

function TabSuscripciones() {

  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filtroEstado, setFiltroEstado]   = useState("activa");

  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 10;

  const fetchSuscripciones = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;
      const res = await api.get("/admin/suscripciones", { params });
      setSuscripciones(res.data.suscripciones || []);
      setPagina(1);
    } catch (err) {
      console.error("Error cargando suscripciones", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuscripciones(); }, [filtroEstado]);

  const totalPaginas    = Math.ceil(suscripciones.length / POR_PAGINA);
  const suscripcionesPag = suscripciones.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <div className="admin-table-panel">
      <div className="admin-table-header">
        <h2>Suscripciones ({suscripciones.length})</h2>
        <div className="admin-filters">
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todas</option>
            <option value="activa">Activas</option>
            <option value="vencida">Vencidas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Gimnasio</th>
              <th>Membresía</th>
              <th>Fecha fin</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="admin-empty">Cargando...</td></tr>
            ) : suscripciones.length === 0 ? (
              <tr><td colSpan="6" className="admin-empty">No hay suscripciones con ese estado.</td></tr>
            ) : (
              suscripcionesPag.map(s => (
                <tr key={s.id_suscripcion}>
                  <td>#{s.id_suscripcion}</td>
                  <td><p style={{ margin: 0, fontWeight: 600 }}>{s.Usuario?.nombre}</p></td>
                  <td>{s.Gimnasio?.nombre || "—"}</td>
                  <td>{s.membresia?.nombre || "—"}</td>
                  <td>
                    {s.fecha_fin
                      ? new Date(s.fecha_fin).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td>
                    <span className={`badge ${
                      s.estado === "activa"    ? "badge-success"
                      : s.estado === "vencida" ? "badge-danger"
                      : "badge-secondary"
                    }`}>{s.estado}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="admin-paginador">
          <button
            className="admin-pag-btn"
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={pagina === 1}
          >←</button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              className={`admin-pag-btn ${pagina === n ? "admin-pag-active" : ""}`}
              onClick={() => setPagina(n)}
            >{n}</button>
          ))}
          <button
            className="admin-pag-btn"
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
          >→</button>
          <span className="admin-pag-info">{suscripciones.length} registros</span>
        </div>
      )}
    </div>
  );
}

function AdminActividad() {

  const [tab, setTab]     = useState("reembolsos");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  return (
    <AdminLayout>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <section className="page-header">
        <div>
          <p className="eyebrow">Actividad</p>
          <h1>Reembolsos y suscripciones</h1>
          <p className="subtitle">Historial de reembolsos automáticos y membresías activas.</p>
        </div>
      </section>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === "reembolsos" ? "admin-tab-active" : ""}`}
          onClick={() => setTab("reembolsos")}
        >
          Reembolsos
        </button>
        <button
          className={`admin-tab ${tab === "suscripciones" ? "admin-tab-active" : ""}`}
          onClick={() => setTab("suscripciones")}
        >
          Suscripciones
        </button>
      </div>

      {tab === "reembolsos"
        ? <TabReembolsos showToast={showToast} />
        : <TabSuscripciones />
      }

    </AdminLayout>
  );
}

export default AdminActividad;