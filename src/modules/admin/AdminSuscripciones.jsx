import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../services/axios";

function AdminSuscripciones() {

  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filtroEstado, setFiltroEstado]   = useState("activa");

  const fetchSuscripciones = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroEstado) params.estado = filtroEstado;
      const res = await api.get("/admin/suscripciones", { params });
      setSuscripciones(res.data.suscripciones || []);
    } catch (err) {
      console.error("Error cargando suscripciones", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuscripciones(); }, [filtroEstado]);

  return (
    <AdminLayout>

      <section className="page-header">
        <div>
          <p className="eyebrow">Finanzas</p>
          <h1>Suscripciones</h1>
          <p className="subtitle">Membresías activas y vencidas de los clientes en todos los gimnasios.</p>
        </div>
      </section>

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
                suscripciones.map(s => (
                  <tr key={s.id_suscripcion}>
                    <td>#{s.id_suscripcion}</td>
                    <td>
                      <p style={{ margin: 0, fontWeight: 600 }}>{s.Usuario?.nombre}</p>
                    </td>
                    <td>{s.Gimnasio?.nombre || "—"}</td>
                    <td>{s.membresia?.nombre || "—"}</td>
                    <td>
                      {s.fecha_fin
                        ? new Date(s.fecha_fin).toLocaleDateString("es-MX", {
                            day: "numeric", month: "short", year: "numeric"
                          })
                        : "—"}
                    </td>
                    <td>
                      <span className={`badge ${
                        s.estado === "activa"    ? "badge-success"
                        : s.estado === "vencida"   ? "badge-danger"
                        : "badge-secondary"
                      }`}>
                        {s.estado}
                      </span>
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

export default AdminSuscripciones;