import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../services/axios";
import Toast from "../../components/ui/Toast";
import ModalPortal from "../../components/ui/ModalPortal";

const POR_PAGINA = 10;
function TabMovimientos() {

  const [todos, setTodos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState({
    tipo_pago: "", estado: "", fecha_inicio: "", fecha_fin: ""
  });
  const POR_PAGINA = 10;

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/movimientos", { params: { limit: 9999 } });
      setTodos(res.data.pagos   || []);
      setResumen(res.data.resumen || null);
    } catch (err) {
      console.error("Error cargando movimientos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovimientos(); }, []);

  useEffect(() => {
    let resultado = [...todos];

    if (filtros.tipo_pago)
      resultado = resultado.filter(m => m.tipo_pago === filtros.tipo_pago);
    if (filtros.estado)
      resultado = resultado.filter(m => m.estado === filtros.estado);
    if (filtros.fecha_inicio)
      resultado = resultado.filter(m => m.fecha_pago >= filtros.fecha_inicio);
    if (filtros.fecha_fin)
      resultado = resultado.filter(m => m.fecha_pago <= filtros.fecha_fin + "T23:59:59");

    setMovimientos(resultado);
    setPagina(1);
  }, [filtros, todos]);

  const handleFiltro = (e) =>
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const totalPaginas   = Math.ceil(movimientos.length / POR_PAGINA);
  const movimientosPag = movimientos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <>
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

      <div className="admin-table-panel">
        <div className="admin-table-header">
          <h2>Pagos ({movimientos.length})</h2>
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
            <input type="date" name="fecha_inicio" value={filtros.fecha_inicio} onChange={handleFiltro} title="Fecha inicio" />
            <input type="date" name="fecha_fin"    value={filtros.fecha_fin}    onChange={handleFiltro} title="Fecha fin" />
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
                movimientosPag.map((m, i) => (
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
                        m.estado === "pagado"        ? "badge-success"
                        : m.estado === "reembolsado" ? "badge-secondary"
                        : "badge-danger"
                      }`}>{m.estado}</span>
                    </td>
                    <td>{m.fecha_pago ? new Date(m.fecha_pago).toLocaleDateString("es-MX") : "—"}</td>
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
            <span className="admin-pag-info">{movimientos.length} registros</span>
          </div>
        )}
      </div>
    </>
  );
}

function TabBalance({ showToast }) {

  const [balance, setBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionados, setSeleccionados] = useState([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/balance");
      setBalance(res.data.balance || []);
    } catch (err) {
      showToast("Error cargando balance.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBalance(); }, []);

  const handleTransferir = async () => {
    try {
      setProcesando(true);
      await api.patch("/admin/pagos/transferido", { ids_pagos: seleccionados });
      showToast(`${seleccionados.length} pago${seleccionados.length > 1 ? "s" : ""} marcado${seleccionados.length > 1 ? "s" : ""} como transferido${seleccionados.length > 1 ? "s" : ""}.`);
      setSeleccionados([]);
      setConfirmModal(false);
      fetchBalance();
    } catch (err) {
      showToast(err?.response?.data?.message || "Error marcando transferencia.", "error");
    } finally {
      setProcesando(false);
    }
  };

  const totalPendiente = balance.reduce((acc, g) => acc + (g.pendiente_transferir || 0), 0);

  return (
    <>
      <div className="admin-stats" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total pendiente global</p>
          <p className="admin-stat-value">${totalPendiente.toLocaleString("es-MX")} MXN</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Gimnasios con saldo pendiente</p>
          <p className="admin-stat-value">{balance.filter(g => g.pendiente_transferir > 0).length}</p>
        </div>
      </div>

      {seleccionados.length > 0 && (
        <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={() => setConfirmModal(true)}>
            Marcar {seleccionados.length} pago{seleccionados.length > 1 ? "s" : ""} como transferido{seleccionados.length > 1 ? "s" : ""}
          </button>
        </div>
      )}

      {loading ? (
        <p className="empty-state">Cargando balance...</p>
      ) : balance.length === 0 ? (
        <p className="empty-state">No hay pagos pendientes de transferir.</p>
      ) : (
        <div className="admin-table-panel">
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Gimnasio</th>
                  <th>Proveedor</th>
                  <th>CLABE</th>
                  <th>Total generado</th>
                  <th>Transferido</th>
                  <th>Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {balance.map((g, i) => (
                  <tr key={g.id_gimnasio ?? i}>
                    <td><p style={{ margin: 0, fontWeight: 600 }}>{g.nombre_gimnasio}</p></td>
                    <td>
                      <p style={{ margin: 0, fontWeight: 600 }}>{g.proveedor?.nombre}</p>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{g.proveedor?.correo}</span>
                    </td>
                    <td>
                      {g.referencia_bancaria ? (
                        <div>
                          <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.82rem" }}>{g.referencia_bancaria.clabe}</p>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            {g.referencia_bancaria.banco} — {g.referencia_bancaria.titular}
                          </span>
                          <span className={`badge ${g.referencia_bancaria.verificado ? "badge-success" : "badge-secondary"}`} style={{ marginLeft: 6, fontSize: "0.7rem" }}>
                            {g.referencia_bancaria.verificado ? "✓ Verificada" : "Pendiente"}
                          </span>
                        </div>
                      ) : (
                        <span className="badge badge-danger">Sin CLABE</span>
                      )}
                    </td>
                    <td>${parseFloat(g.total_generado || 0).toLocaleString("es-MX")}</td>
                    <td>${parseFloat(g.total_transferido || 0).toLocaleString("es-MX")}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: g.pendiente_transferir > 0 ? "#dc2626" : "#16a34a" }}>
                        ${parseFloat(g.pendiente_transferir || 0).toLocaleString("es-MX")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirmModal && (
        <ModalPortal>
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">Confirmar transferencia</h3>
              <p className="modal-body">
                ¿Confirmas que ya realizaste la transferencia de{" "}
                <strong>{seleccionados.length} pago{seleccionados.length > 1 ? "s" : ""}</strong>?
                Esta acción no se puede deshacer.
              </p>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setConfirmModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleTransferir} disabled={procesando}>
                  {procesando ? "Procesando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}

function AdminFinanzas() {

  const [tab, setTab]     = useState("movimientos");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  return (
    <AdminLayout>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <section className="page-header">
        <div>
          <p className="eyebrow">Finanzas</p>
          <h1>Movimientos y balance</h1>
          <p className="subtitle">Historial de pagos y saldos pendientes de transferir a proveedores.</p>
        </div>
      </section>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === "movimientos" ? "admin-tab-active" : ""}`} onClick={() => setTab("movimientos")}>
          Movimientos
        </button>
        <button className={`admin-tab ${tab === "balance" ? "admin-tab-active" : ""}`} onClick={() => setTab("balance")}>
          Balance
        </button>
      </div>

      {tab === "movimientos" ? <TabMovimientos /> : <TabBalance showToast={showToast} />}

    </AdminLayout>
  );
}

export default AdminFinanzas;