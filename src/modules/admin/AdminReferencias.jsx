import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../services/axios";
import Toast from "../../components/ui/Toast";
import ModalPortal from "../../components/ui/ModalPortal";

function AdminReferencias() {

  const [referencias, setReferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [verificando, setVerificando] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [filtro, setFiltro] = useState("");

  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  /**
 * Obtiene todas las referencias bancarias desde "/admin/referencias"
 * y actualiza el listado. Muestra un Toast de error si falla.
 */
  const fetchReferencias = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/referencias");
      setReferencias(res.data.referencias || []);
    } catch (err) {
      showToast("Error cargando referencias.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReferencias(); }, []);

  /**
 * Marca una CLABE como verificada mediante PATCH a
 * "/admin/referencias/:id/verificar". Gestiona el estado de carga
 * individual por referencia (verificando) y recarga el listado al terminar.
 * Muestra Toast de éxito o error según el resultado.
 */
  const handleVerificar = async (ref) => {
    try {
      setVerificando(ref.id_referencia);
      await api.patch(`/admin/referencias/${ref.id_referencia}/verificar`);
      showToast(`CLABE de ${ref.Usuario?.nombre} verificada correctamente.`);
      fetchReferencias();
    } catch (err) {
      showToast(err?.response?.data?.message || "Error verificando CLABE.", "error");
    } finally {
      setVerificando(null);
    }
  };

  /**
 * Activa o desactiva una referencia bancaria según su estado actual,
 * llamando a "/admin/referencias/:id/activar" o "/desactivar".
 * Gestiona el estado de carga individual (toggling), cierra el modal
 * de confirmación y recarga el listado. Muestra Toast con el resultado.
 */
  const handleToggleActivo = async (ref) => {
    try {
      setToggling(ref.id_referencia);
      if (ref.activo) {
        await api.patch(`/admin/referencias/${ref.id_referencia}/desactivar`);
        showToast(`CLABE de ${ref.Usuario?.nombre} desactivada.`);
      } else {
        await api.patch(`/admin/referencias/${ref.id_referencia}/activar`);
        showToast(`CLABE de ${ref.Usuario?.nombre} activada.`);
      }
      setConfirmModal(null);
      fetchReferencias();
    } catch (err) {
      showToast(err?.response?.data?.message || "Error actualizando estado.", "error");
    } finally {
      setToggling(null);
    }
  };

  /**
 * Filtra el listado completo de referencias según el filtro activo:
 * verificado, pendiente, activo o inactivo.
 * Sin filtro retorna todas las referencias.
 */
  const referenciasFiltradas = referencias.filter(r => {
    if (filtro === "verificado") return r.verificado === true;
    if (filtro === "pendiente") return r.verificado === false;
    if (filtro === "activo") return r.activo === true;
    if (filtro === "inactivo") return r.activo === false;
    return true;
  });

  const pendientes = referencias.filter(r => !r.verificado).length;

  return (
    <AdminLayout>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <section className="page-header">
        <div>
          <p className="eyebrow">Finanzas</p>
          <h1>Referencias bancarias (CLABE)</h1>
          <p className="subtitle">Verifica las CLABEs registradas por los proveedores.</p>
        </div>
        {pendientes > 0 && (
          <span style={{
            background: "#fef3c7", color: "#92400e",
            border: "1px solid #fde68a", borderRadius: "10px",
            padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 600
          }}>
            ⏳ {pendientes} pendiente{pendientes > 1 ? "s" : ""} de verificación
          </span>
        )}
      </section>

      <div className="admin-table-panel">
        <div className="admin-table-header">
          <h2>CLABEs registradas ({referenciasFiltradas.length})</h2>
          <div className="admin-filters">
            <select value={filtro} onChange={e => setFiltro(e.target.value)}>
              <option value="">Todas</option>
              <option value="pendiente">Pendientes de verificar</option>
              <option value="verificado">Verificadas</option>
              <option value="activo">Activas</option>
              <option value="inactivo">Inactivas</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>CLABE</th>
                <th>Banco</th>
                <th>Titular</th>
                <th>Verificación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="admin-empty">Cargando...</td></tr>
              ) : referenciasFiltradas.length === 0 ? (
                <tr><td colSpan="7" className="admin-empty">No hay referencias con ese filtro.</td></tr>
              ) : (
                referenciasFiltradas.map(ref => (
                  <tr key={ref.id_referencia}>

                    <td>
                      <p style={{ margin: 0, fontWeight: 600 }}>{ref.Usuario?.nombre}</p>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{ref.Usuario?.correo}</span>
                    </td>

                    <td style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>
                      {ref.numero_cuenta || ref.clabe || "—"}
                    </td>

                    <td>{ref.banco}</td>
                    <td>{ref.titular}</td>

                    <td>
                      {ref.verificado ? (
                        <span className="badge badge-success">✓ Verificada</span>
                      ) : (
                        <span className="badge badge-secondary">⏳ Pendiente</span>
                      )}
                    </td>

                    <td>
                      {ref.activo ? (
                        <span className="badge badge-success">Activa</span>
                      ) : (
                        <span className="badge badge-danger">Inactiva</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {!ref.verificado && (
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}
                            onClick={() => handleVerificar(ref)}
                            disabled={verificando === ref.id_referencia || toggling === ref.id_referencia}
                          >
                            {verificando === ref.id_referencia ? "Verificando..." : "Verificar"}
                          </button>
                        )}

                        <button
                          className={ref.activo ? "btn btn-danger" : "btn btn-success"}
                          style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}
                          onClick={() => ref.activo ? setConfirmModal(ref) : handleToggleActivo(ref)}
                          disabled={toggling === ref.id_referencia || verificando === ref.id_referencia}
                        >
                          {toggling === ref.id_referencia
                            ? "Procesando..."
                            : ref.activo ? "Desactivar" : "Activar"
                          }
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmModal && (
        <ModalPortal>
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">Desactivar CLABE</h3>
              <p className="modal-body">
                ¿Deseas desactivar la CLABE <strong>{confirmModal.numero_cuenta || confirmModal.clabe}</strong> de{" "}
                <strong>{confirmModal.Usuario?.nombre}</strong>?
                El proveedor no podrá recibir transferencias mientras esté inactiva.
              </p>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setConfirmModal(null)}>
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleToggleActivo(confirmModal)}
                  disabled={toggling === confirmModal.id_referencia}
                >
                  {toggling === confirmModal.id_referencia ? "Procesando..." : "Desactivar"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

    </AdminLayout>
  );
}

export default AdminReferencias;