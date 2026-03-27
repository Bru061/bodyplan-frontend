import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../services/axios";
import ModalPortal from "../../components/ui/ModalPortal";
import Toast from "../../components/ui/Toast";

const FORM_INICIAL = {
  nombre: "", precio: "", duracion_dias: "", descripcion: "", tipo_origen: "web"
};

function AdminPlanes() {

  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [planEdit, setPlanEdit] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/planes");
      setPlanes(res.data.planes || []);
    } catch (err) {
      showToast("Error cargando planes.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlanes(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.precio) e.precio = "El precio es obligatorio";
    if (!form.duracion_dias) e.duracion_dias = "La duración es obligatoria";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      const payload = {
        nombre: form.nombre.trim(),
        precio: parseFloat(form.precio),
        duracion_dias: parseInt(form.duracion_dias),
        descripcion: form.descripcion.trim(),
        tipo_origen: form.tipo_origen
      };

      if (modal === "editar" && planEdit) {
        await api.put(`/admin/planes/${planEdit.id_plan}`, payload);
        showToast("Plan actualizado correctamente.");
      } else {
        await api.post("/admin/planes", payload);
        showToast("Plan creado correctamente.");
      }

      setModal(null);
      fetchPlanes();
    } catch (err) {
      showToast(err?.response?.data?.message || "Error guardando plan.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!confirmToggle) return;
    try {
      const endpoint = confirmToggle.activo
        ? `/admin/planes/${confirmToggle.id_plan}/desactivar`
        : `/admin/planes/${confirmToggle.id_plan}/activar`;
      await api.patch(endpoint);
      showToast(`Plan ${confirmToggle.activo ? "desactivado" : "activado"} correctamente.`);
      setConfirmToggle(null);
      fetchPlanes();
    } catch (err) {
      showToast("Error cambiando estado del plan.", "error");
    }
  };

  const abrirEditar = (plan) => {
    setPlanEdit(plan);
    setForm({
      nombre: plan.nombre,
      precio: plan.precio,
      duracion_dias: plan.duracion_dias,
      descripcion: plan.descripcion || "",
      tipo_origen: plan.tipo_origen || "web"
    });
    setErrors({});
    setModal("editar");
  };

  const abrirCrear = () => {
    setPlanEdit(null);
    setForm(FORM_INICIAL);
    setErrors({});
    setModal("crear");
  };

  return (
    <AdminLayout>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <section className="page-header">
        <div>
          <p className="eyebrow">Administración</p>
          <h1>Gestión de planes</h1>
          <p className="subtitle">Crea, edita y activa/desactiva los planes de la plataforma.</p>
        </div>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo plan</button>
      </section>

      {loading ? (
        <p className="empty-state">Cargando planes...</p>
      ) : planes.length === 0 ? (
        <p className="empty-state">No hay planes registrados.</p>
      ) : (
        <div className="admin-table-panel">
          <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Duración</th>
                <th>Origen</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.map(plan => (
                <tr key={plan.id_plan}>
                  <td>{plan.nombre}</td>
                  <td>{plan.descripcion || "Sin descripción"}</td>
                  <td>{plan.duracion_dias} días</td>
                  <td>{plan.tipo_origen}</td>
                  <td>
                    ${parseFloat(plan.precio).toLocaleString("es-MX")}
                  </td>
                  <td>
                    <span className={`badge ${plan.activo ? "badge-success" : "badge-danger"}`}>
                      {plan.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn btn-ghost" onClick={() => abrirEditar(plan)}>
                      Editar
                    </button>
                    <button
                      className={`btn ${plan.activo ? "btn-danger" : "btn-success"}`}
                      onClick={() => setConfirmToggle(plan)}
                    >
                      {plan.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {modal && (
        <ModalPortal>
          <div className="modal-overlay">
            <div className="modal-card">
              <h2 className="modal-title">{modal === "crear" ? "Nuevo plan" : "Editar plan"}</h2>

              <div className="modal-form">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange} />
                  {errors.nombre && <span className="field-error-msg">{errors.nombre}</span>}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Precio (MXN) *</label>
                    <input type="number" name="precio" value={form.precio} onChange={handleChange} min="0" />
                    {errors.precio && <span className="field-error-msg">{errors.precio}</span>}
                  </div>
                  <div className="form-group">
                    <label>Duración (días) *</label>
                    <input type="number" name="duracion_dias" value={form.duracion_dias} onChange={handleChange} min="1" />
                    {errors.duracion_dias && <span className="field-error-msg">{errors.duracion_dias}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción corta del plan" />
                </div>

                <div className="form-group">
                  <label>Tipo origen</label>
                  <select name="tipo_origen" value={form.tipo_origen} onChange={handleChange}>
                    <option value="web">Web</option>
                    <option value="app">App</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleGuardar} disabled={saving}>
                  {saving ? "Guardando..." : modal === "crear" ? "Crear plan" : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {confirmToggle && (
        <ModalPortal>
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">
                {confirmToggle.activo ? "Desactivar plan" : "Activar plan"}
              </h3>
              <p className="modal-body">
                ¿Deseas {confirmToggle.activo ? "desactivar" : "activar"} el plan <strong>{confirmToggle.nombre}</strong>?
              </p>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setConfirmToggle(null)}>Cancelar</button>
                <button
                  className={`btn ${confirmToggle.activo ? "btn-danger" : "btn-success"}`}
                  onClick={handleToggle}
                >
                  {confirmToggle.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

    </AdminLayout>
  );
}

export default AdminPlanes;