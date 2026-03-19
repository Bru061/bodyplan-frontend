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
  const [filtro, setFiltro] = useState("");

  const showToast = (message, type = "success") => setToast({ message, type });

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

  const referenciasFiltradas = referencias.filter(r => {
    if (filtro === "verificado") return r.verificado === true;
    if (filtro === "pendiente")  return r.verificado === false;
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
              <option value="pendiente">Pendientes</option>
              <option value="verificado">Verificadas</option>
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
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="admin-empty">Cargando...</td></tr>
              ) : referenciasFiltradas.length === 0 ? (
                <tr><td colSpan="6" className="admin-empty">No hay referencias con ese filtro.</td></tr>
              ) : (
                referenciasFiltradas.map(ref => (
                  <tr key={ref.id_referencia}>
                    <td>
                      <p style={{ margin: 0, fontWeight: 600 }}>{ref.Usuario?.nombre}</p>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{ref.Usuario?.correo}</span>
                    </td>
                    <td style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>
                      {ref.clabe}
                    </td>
                    <td>{ref.banco}</td>
                    <td>{ref.titular}</td>
                    <td>
                      {ref.verificado ? (
                        <span className="badge badge-success">Verificada</span>
                      ) : (
                        <span className="badge badge-secondary">Pendiente</span>
                      )}
                    </td>
                    <td>
                      {!ref.verificado && (
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}
                          onClick={() => handleVerificar(ref)}
                          disabled={verificando === ref.id_referencia}
                        >
                          {verificando === ref.id_referencia ? "Verificando..." : "Verificar"}
                        </button>
                      )}
                    </td>
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

export default AdminReferencias;