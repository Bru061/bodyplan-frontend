import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import { FiUser, FiEdit2 } from "react-icons/fi";
import api from "../../services/axios";
import Toast from "../../components/ui/Toast";
import ModalPortal from "../../components/ui/ModalPortal";

function AdminPerfil() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [perfilForm, setPerfilForm] = useState({});
  const [perfilErrors, setPerfilErrors] = useState({});
  const [perfilLoading, setPerfilLoading] = useState(false);

  const showToast = (message, type = "success") => setToast({ message, type });

  /**
 * Obtiene los datos del usuario autenticado desde "/user/me"
 * y los guarda en el estado. Registra el error en consola si falla.
 */
  const fetchUser = async () => {
    try {
      const res = await api.get("/user/me");
      setUser(res.data.usuario || res.data);
    } catch (err) {
      console.error("Error cargando perfil", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  /**
 * Inicializa el formulario de edición con los datos actuales del usuario,
 * limpia errores previos y abre el modal.
 */
  const abrirEditarPerfil = () => {
    setPerfilForm({
      nombre: user.nombre || "",
      apellido_paterno: user.apellido_paterno || "",
      apellido_materno: user.apellido_materno || "",
      telefono: user.telefono || ""
    });
    setPerfilErrors({});
    setEditandoPerfil(true);
  };

  /**
 * Valida los campos del formulario antes de enviar:
 *   - nombre, apellido_paterno y apellido_materno: obligatorios, solo letras.
 *   - telefono: opcional, exactamente 10 dígitos si se proporciona.
 *
 * Si hay errores los muestra en el formulario sin hacer la petición.
 * Si es válido, envía PUT a "/user/me" con los datos normalizados,
 * muestra un Toast de resultado y recarga el perfil al éxito.
 */
  const handleGuardarPerfil = async () => {
    const errors = {};
    const onlyLetters = (v) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v.trim());

    if (!perfilForm.nombre.trim())
      errors.nombre = "El nombre es obligatorio";
    else if (!onlyLetters(perfilForm.nombre))
      errors.nombre = "Solo se permiten letras";

    if (!perfilForm.apellido_paterno.trim())
      errors.apellido_paterno = "El apellido paterno es obligatorio";
    else if (!onlyLetters(perfilForm.apellido_paterno))
      errors.apellido_paterno = "Solo se permiten letras";

    if (!perfilForm.apellido_materno.trim())
      errors.apellido_materno = "El apellido materno es obligatorio";
    else if (!onlyLetters(perfilForm.apellido_materno))
      errors.apellido_materno = "Solo se permiten letras";

    if (perfilForm.telefono && !/^\d{10}$/.test(perfilForm.telefono))
      errors.telefono = "El teléfono debe tener 10 dígitos";

    if (Object.keys(errors).length > 0) { setPerfilErrors(errors); return; }

    try {
      setPerfilLoading(true);
      await api.put("/user/me", {
        nombre: perfilForm.nombre.trim(),
        apellido_paterno: perfilForm.apellido_paterno.trim(),
        apellido_materno: perfilForm.apellido_materno.trim(),
        telefono: perfilForm.telefono.trim() || null
      });
      showToast("Perfil actualizado correctamente.");
      setEditandoPerfil(false);
      fetchUser();
    } catch (err) {
      showToast(err?.response?.data?.error || "Error actualizando perfil.", "error");
    } finally {
      setPerfilLoading(false);
    }
  };

  return (
    <AdminLayout>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <section className="page-header">
        <div>
          <p className="eyebrow">Administración</p>
          <h1>Mi perfil</h1>
          <p className="subtitle">Consulta y edita tu información personal.</p>
        </div>
      </section>

      {loading ? (
        <p style={{ color: "var(--text-secondary)", padding: "1rem" }}>Cargando...</p>
      ) : !user ? (
        <p style={{ color: "var(--text-secondary)", padding: "1rem" }}>No se pudo cargar el perfil.</p>
      ) : (
        <article className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="panel-icon-title" style={{ margin: 0 }}>
              <FiUser size={18} /> Información personal
            </h2>
            <button className="btn btn-ghost" onClick={abrirEditarPerfil}>
              <FiEdit2 size={14} /> Editar
            </button>
          </div>

          <div className="panel-body">
            <p><strong>Nombre: </strong>{user.nombre} {user.apellido_paterno} {user.apellido_materno}</p>
            <p><strong>Teléfono: </strong>{user.telefono || "No registrado"}</p>
            <p><strong>Correo: </strong>{user.correo}</p>
            <p><strong>Rol: </strong>{user.rol || "Administrador"}</p>
          </div>
        </article>
      )}

      {editandoPerfil && (
        <ModalPortal>
          <div className="modal-overlay">
            <div className="modal-card">
              <h2 className="modal-title">Editar información personal</h2>

              <div className="modal-form">

                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    value={perfilForm.nombre}
                    onChange={e => {
                      setPerfilForm(prev => ({ ...prev, nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "") }));
                      setPerfilErrors(prev => ({ ...prev, nombre: "" }));
                    }}
                    maxLength={40}
                  />
                  {perfilErrors.nombre && <span className="field-error-msg">{perfilErrors.nombre}</span>}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Apellido paterno *</label>
                    <input
                      value={perfilForm.apellido_paterno}
                      onChange={e => {
                        setPerfilForm(prev => ({ ...prev, apellido_paterno: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "") }));
                        setPerfilErrors(prev => ({ ...prev, apellido_paterno: "" }));
                      }}
                      maxLength={30}
                    />
                    {perfilErrors.apellido_paterno && <span className="field-error-msg">{perfilErrors.apellido_paterno}</span>}
                  </div>

                  <div className="form-group">
                    <label>Apellido materno *</label>
                    <input
                      value={perfilForm.apellido_materno}
                      onChange={e => {
                        setPerfilForm(prev => ({ ...prev, apellido_materno: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "") }));
                        setPerfilErrors(prev => ({ ...prev, apellido_materno: "" }));
                      }}
                      maxLength={30}
                    />
                    {perfilErrors.apellido_materno && <span className="field-error-msg">{perfilErrors.apellido_materno}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Teléfono <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>(opcional)</span></label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={perfilForm.telefono}
                    onChange={e => {
                      setPerfilForm(prev => ({ ...prev, telefono: e.target.value.replace(/\D/g, "").slice(0, 10) }));
                      setPerfilErrors(prev => ({ ...prev, telefono: "" }));
                    }}
                    placeholder="10 dígitos"
                    maxLength={10}
                  />
                  {perfilErrors.telefono && <span className="field-error-msg">{perfilErrors.telefono}</span>}
                </div>

                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>
                  El correo electrónico no se puede modificar desde aquí.
                </p>

              </div>

              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setEditandoPerfil(false)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleGuardarPerfil} disabled={perfilLoading}>
                  {perfilLoading ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>

            </div>
          </div>
        </ModalPortal>
      )}

    </AdminLayout>
  );
}

export default AdminPerfil;