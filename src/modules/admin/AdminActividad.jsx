import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../services/axios";
import Toast from "../../components/ui/Toast";

const POR_PAGINA = 10;

function TabReembolsos({ showToast }) {

  const [reembolsos, setReembolsos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);

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

  const totalPaginas  = Math.max(1, Math.ceil(reembolsos.length / POR_PAGINA));
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
          <button className="admin-pag-btn" onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}>←</button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
            <button key={n} className={`admin-pag-btn ${pagina === n ? "admin-pag-active" : ""}`} onClick={() => setPagina(n)}>{n}</button>
          ))}
          <button className="admin-pag-btn" onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}>→</button>
          <span className="admin-pag-info">{reembolsos.length} registros</span>
        </div>
      )}
    </div>
  );
}

function TabSuscripciones({ showToast }) {

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroAccion, setFiltroAccion] = useState("");
  const [pagina, setPagina] = useState(1);

  const fetchLogSuscripciones = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/log-suscripciones");
      const payload = res.data?.data || res.data || {};
      const rows = payload.logs || payload.registros || payload.rows || [];
      setTodos(rows);
    } catch (err) {
      console.error("Error cargando log de suscripciones", err);
      showToast?.(err?.response?.data?.message || "No se pudo cargar el log de suscripciones.", "error");
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogSuscripciones(); }, []);
  const accionesDisponibles = [...new Set(todos.map((item) => item.accion).filter(Boolean))];
  const logsFiltrados = filtroAccion
    ? todos.filter((item) => item.accion === filtroAccion)
    : todos;

  useEffect(() => { setPagina(1); }, [filtroAccion, todos.length]);

  const totalPaginas = Math.max(1, Math.ceil(logsFiltrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const logsPaginados = logsFiltrados.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA);

  return (
    <div className="admin-table-panel">
      <div className="admin-table-header">
        <h2>Log de suscripciones ({logsFiltrados.length})</h2>
        <div className="admin-filters">
          <select value={filtroAccion} onChange={(e) => setFiltroAccion(e.target.value)}>
            <option value="">Todas las acciones</option>
            {accionesDisponibles.map((accion) => (
              <option key={accion} value={accion}>{accion}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Acción</th>
              <th>Cliente</th>
              <th>Gimnasio</th>
              <th>Transición</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="admin-empty">Cargando...</td></tr>
            ) : todos.length === 0 ? (
              <tr><td colSpan="5" className="admin-empty">No hay movimientos registrados.</td></tr>
            ) : (
              logsPaginados.map((s, i) => (
                <tr key={s.id_log || s.id_log_suscripcion || `${s.accion}-${s.fecha_log}-${i}`}>
                  <td>
                    <span className={`badge ${
                      s.accion === "INSERT" ? "badge-success" : s.accion === "DELETE" ? "badge-danger" : "badge-secondary"
                    }`}>{s.accion || "—"}</span>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600 }}>{s.nombre_cliente || s.cliente_nombre || "—"}</p>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{s.correo_cliente || s.cliente_correo || "—"}</span>
                  </td>
                  <td>{s.gimnasio_nombre || "—"}</td>
                  <td>
                    {`${s.estado_anterior || "—"} → ${s.estado_nuevo || "—"}`}
                  </td>
                  <td>{s.fecha_log ? new Date(s.fecha_log).toLocaleString("es-MX") : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="admin-paginador">
          <button className="admin-pag-btn" onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={paginaSegura === 1}>←</button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
            <button key={n} className={`admin-pag-btn ${paginaSegura === n ? "admin-pag-active" : ""}`} onClick={() => setPagina(n)}>{n}</button>
          ))}
          <button className="admin-pag-btn" onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={paginaSegura === totalPaginas}>→</button>
          <span className="admin-pag-info">{logsFiltrados.length} registros</span>
        </div>
      )}
    </div>
  );
}

function TabSuscripcionesEstado({ showToast }) {

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [pagina, setPagina] = useState(1);

  const fetchSuscripciones = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/suscripciones", { params: { limit: 9999 } });
      setTodos(res.data?.suscripciones || []);
    } catch (err) {
      console.error("Error cargando suscripciones", err);
      showToast?.(err?.response?.data?.message || "No se pudo cargar suscripciones.", "error");
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuscripciones(); }, []);
  useEffect(() => { setPagina(1); }, [filtroEstado, todos.length]);

  const filtradas = filtroEstado ? todos.filter((s) => s.estado === filtroEstado) : todos;
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const pageItems = filtradas.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA);
  const countEstado = (estado) => todos.filter((s) => s.estado === estado).length;

  return (
    <div className="admin-table-panel">
      <div className="admin-table-header">
        <h2>Suscripciones ({filtradas.length})</h2>
        <div className="admin-filters">
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todas ({todos.length})</option>
            <option value="activa">Activa ({countEstado("activa")})</option>
            <option value="vencida">Vencida ({countEstado("vencida")})</option>
            <option value="cancelada">Cancelada ({countEstado("cancelada")})</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Gimnasio</th>
              <th>Membresía</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="admin-empty">Cargando...</td></tr>
            ) : pageItems.length === 0 ? (
              <tr><td colSpan="6" className="admin-empty">No hay suscripciones con ese estado.</td></tr>
            ) : (
              pageItems.map((s, i) => (
                <tr key={s.id_suscripcion || i}>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600 }}>{s.Usuario?.nombre || s.nombre_cliente || "—"}</p>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{s.Usuario?.correo || s.correo_cliente || "—"}</span>
                  </td>
                  <td>{s.Gimnasio?.nombre || s.gimnasio_nombre || "—"}</td>
                  <td>{s.membresia?.nombre || s.nombre_membresia || "—"}</td>
                  <td>{s.fecha_inicio ? new Date(s.fecha_inicio).toLocaleDateString("es-MX") : "—"}</td>
                  <td>{s.fecha_fin ? new Date(s.fecha_fin).toLocaleDateString("es-MX") : "—"}</td>
                  <td>
                    <span className={`badge ${
                      s.estado === "activa" ? "badge-success" : s.estado === "vencida" ? "badge-danger" : "badge-secondary"
                    }`}>{s.estado || "—"}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="admin-paginador">
          <button className="admin-pag-btn" onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaSegura === 1}>←</button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button key={n} className={`admin-pag-btn ${paginaSegura === n ? "admin-pag-active" : ""}`} onClick={() => setPagina(n)}>{n}</button>
          ))}
          <button className="admin-pag-btn" onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={paginaSegura === totalPaginas}>→</button>
          <span className="admin-pag-info">{filtradas.length} registros</span>
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
        <button
          className={`admin-tab ${tab === "log" ? "admin-tab-active" : ""}`}
          onClick={() => setTab("log")}
        >
          Movimientos
        </button>
      </div>
      {tab === "reembolsos" && <TabReembolsos showToast={showToast} />}
      {tab === "suscripciones" && <TabSuscripcionesEstado showToast={showToast} />}
      {tab === "log" && <TabSuscripciones showToast={showToast} />}

    </AdminLayout>
  );
}

export default AdminActividad;