import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../services/axios";
import Toast from "../../components/ui/Toast";
import ModalPortal from "../../components/ui/ModalPortal";

function TabMovimientos() {

  const [movimientos, setMovimientos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo_pago: "", estado: "", fecha_inicio: "", fecha_fin: ""
  });

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtros.tipo_pago) params.tipo_pago = filtros.tipo_pago;
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.fecha_inicio) params.fecha_inicio = filtros.fecha_inicio;
      if (filtros.fecha_fin) params.fecha_fin = filtros.fecha_fin;
      const res = await api.get("/admin/movimientos", { params });
      setMovimientos(res.data.pagos || []);
      setResumen(res.data.resumen || null);
    } catch (err) {
      console.error("Error cargando movimientos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovimientos(); }, []);

  const handleFiltro = (e) =>
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
            <input type="date" name="fecha_inicio" value={filtros.fecha_inicio} onChange={handleFiltro} title="Fecha inicio" />
            <input type="date" name="fecha_fin"    value={filtros.fecha_fin}    onChange={handleFiltro} title="Fecha fin" />
            <button className="btn btn-primary" onClick={fetchMovimientos} style={{ fontSize: "0.85rem" }}>
              Aplicar
            </button>
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
      const res = await api.get("/admin/balance/detallado");
      setBalance(res.data.balance || []);
    } catch (err) {
      showToast("Error cargando balance.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBalance(); }, []);

  const togglePago = (id) =>
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );

  const toggleTodos = (pagos) => {
    const ids = pagos.map(p => p.id_pago);
    const todos = ids.every(id => seleccionados.includes(id));
    setSeleccionados(prev =>
      todos ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]
    );
  };

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

  const totalGlobal = balance.reduce((acc, p) => acc + (p.total_pendiente || 0), 0);

  return (
    <>
      <div className="admin-stats" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total pendiente global</p>
          <p className="admin-stat-value">${totalGlobal.toLocaleString("es-MX")} MXN</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Proveedores con saldo pendiente</p>
          <p className="admin-stat-value">{balance.filter(p => p.total_pendiente > 0).length}</p>
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
        balance.map((prov, i) => (
          <div key={i} className="admin-table-panel" style={{ marginBottom: "1.5rem" }}>
            <div className="admin-table-header">
              <div>
                <h2>{prov.nombre_proveedor}</h2>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{prov.correo_proveedor}</span>
              </div>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--primary-hover)" }}>
                ${(prov.total_pendiente || 0).toLocaleString("es-MX")} MXN pendiente
              </span>
            </div>

            {prov.gimnasios?.map((gym, j) => (
              <div key={j}>
                <div style={{ padding: "0.6rem 1.25rem", background: "#f8fafc", borderBottom: "1px solid var(--border)", fontSize: "0.85rem", fontWeight: 600, color: "var(--primary-hover)" }}>
                  {gym.nombre_gimnasio} — ${(gym.subtotal_pendiente || 0).toLocaleString("es-MX")} MXN
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>
                          <input
                            type="checkbox"
                            onChange={() => toggleTodos(gym.pagos_pendientes)}
                            checked={gym.pagos_pendientes?.every(p => seleccionados.includes(p.id_pago))}
                          />
                        </th>
                        <th>Cliente</th>
                        <th>Membresía</th>
                        <th>Monto base</th>
                        <th>Monto proveedor</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!gym.pagos_pendientes?.length ? (
                        <tr><td colSpan="6" className="admin-empty">Sin pagos pendientes</td></tr>
                      ) : (
                        gym.pagos_pendientes.map((pago, k) => (
                          <tr key={k}>
                            <td>
                              <input
                                type="checkbox"
                                checked={seleccionados.includes(pago.id_pago)}
                                onChange={() => togglePago(pago.id_pago)}
                              />
                            </td>
                            <td>
                              <p style={{ margin: 0, fontWeight: 600 }}>{pago.cliente}</p>
                              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{pago.correo_cliente}</span>
                            </td>
                            <td>{pago.membresia}</td>
                            <td>${parseFloat(pago.monto_base || 0).toLocaleString("es-MX")}</td>
                            <td>${parseFloat(pago.monto_proveedor || 0).toLocaleString("es-MX")}</td>
                            <td>{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString("es-MX") : "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ))
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
        <button
          className={`admin-tab ${tab === "movimientos" ? "admin-tab-active" : ""}`}
          onClick={() => setTab("movimientos")}
        >
          Movimientos
        </button>
        <button
          className={`admin-tab ${tab === "balance" ? "admin-tab-active" : ""}`}
          onClick={() => setTab("balance")}
        >
          Balance
        </button>
      </div>

      {tab === "movimientos" ? <TabMovimientos /> : <TabBalance showToast={showToast} />}

    </AdminLayout>
  );
}

export default AdminFinanzas;