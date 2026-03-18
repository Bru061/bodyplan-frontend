import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../services/axios";
import ModalPortal from "../../components/ui/ModalPortal";
import Toast from "../../components/ui/Toast";

function AdminReembolsos() {

  const [reembolsos, setReembolsos] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("pendiente_revision");
  const [toast, setToast]           = useState(null);
  const [modalRechazar, setModalRechazar] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [motivoError, setMotivoError]     = useState("");
  const [procesando, setProcesando]       = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchReembolsos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;
      const res = await api.get("/admin/reembolsos", { params });
      setReembolsos(res.data.reembolsos || []);
    } catch (err) {
      showToast("Error cargando reembolsos.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReembolsos(); }, [filtroEstado]);

  const handleAprobar = async (id) => {
    try {
      setProcesando(id);
      await api.patch(`/admin/reembolsos/${id}/aprobar`);
      showToast("Reembolso aprobado correctamente.");
      fetchReembolsos();
    } catch (err) {
      showToast(err?.response?.data?.message || "Error aprobando reembolso.", "error");
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      setMotivoError("El motivo de rechazo es obligatorio");
      return;
    }
    try {
      setProcesando(modalRechazar.id_reembolso);
      await api.patch(`/admin/reembolsos/${modalRechazar.id_reembolso}/rechazar`, {
        motivo_rechazo: motivoRechazo.trim()
      });
      showToast("Reembolso rechazado.");
      setModalRechazar(null);
      setMotivoRechazo("");
      fetchReembolsos();
    } catch (err) {
      showToast(err?.response?.data?.message || "Error rechazando reembolso.", "error");
    } finally {
      setProcesando(null);
    }
  };

  const estadoBadge = (estado) => {
    const map = {
      pendiente_revision: "badge-secondary",
      aprobado:           "badge-success",
      aprobado_auto:      "badge-success",
      rechazado:          "badge-danger"
    };
    return map[estado] || "badge-secondary";
  };

  return (
    <AdminLayout>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <section className="page-header">
        <div>
          <p className="eyebrow">Finanzas</p>
          <h1>Reembolsos</h1>
          <p className="subtitle">Revisa y gestiona las solicitudes de reembolso.</p>
        </div>
      </section>

      <div className="admin-table-panel">
        <div className="admin-table-header">
          <h2>Solicitudes</h2>
          <div className="admin-filters">
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pendiente_revision">Pendiente revisión</option>
              <option value="aprobado">Aprobado</option>
              <option value="aprobado_auto">Aprobado automático</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="admin-empty">Cargando...</td></tr>
              ) : reembolsos.length === 0 ? (
                <tr><td colSpan="7" className="admin-empty">No hay solicitudes con ese estado.</td></tr>
              ) : (
                reembolsos.map(r => (
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
                        <span style={{ fontSize: "0.75rem", color: "#dc2626" }}>
                          Rechazo: {r.motivo_rechazo}
                        </span>
                      )}
                    </td>
                    <td><span className={`badge ${estadoBadge(r.estado)}`}>{r.estado}</span></td>
                    <td>{r.fecha_solicitud ? new Date(r.fecha_solicitud).toLocaleDateString("es-MX") : "—"}</td>
                    <td>
                      {r.estado === "pendiente_revision" && (
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button
                            className="btn btn-success"
                            style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}
                            onClick={() => handleAprobar(r.id_reembolso)}
                            disabled={procesando === r.id_reembolso}
                          >
                            Aprobar
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}
                            onClick={() => { setModalRechazar(r); setMotivoRechazo(""); setMotivoError(""); }}
                            disabled={procesando === r.id_reembolso}
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalRechazar && (
        <ModalPortal>
          <div className="modal-overlay">
            <div className="modal-card">
              <h2 className="modal-title">Rechazar reembolso</h2>
              <p className="modal-body">
                Solicitud #{modalRechazar.id_reembolso} de <strong>{modalRechazar.Usuario?.nombre}</strong>.
                Indica el motivo del rechazo.
              </p>
              <div className="modal-form">
                <div className="form-group">
                  <label>Motivo de rechazo *</label>
                  <textarea
                    value={motivoRechazo}
                    onChange={e => { setMotivoRechazo(e.target.value); setMotivoError(""); }}
                    placeholder="Ej. Membresía utilizada por más de 48 horas"
                    rows={3}
                  />
                  {motivoError && <span className="field-error-msg">{motivoError}</span>}
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setModalRechazar(null)}>Cancelar</button>
                <button
                  className="btn btn-danger"
                  onClick={handleRechazar}
                  disabled={procesando === modalRechazar.id_reembolso}
                >
                  {procesando === modalRechazar.id_reembolso ? "Rechazando..." : "Confirmar rechazo"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

    </AdminLayout>
  );
}

export default AdminReembolsos;