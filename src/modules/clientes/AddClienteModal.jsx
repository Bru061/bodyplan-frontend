import { useState } from "react";
import api from "../../services/axios";
import ModalPortal from "../../components/ui/ModalPortal";

/**
 * Modal para registrar un nuevo cliente e inscribirlo en un gimnasio
 * con una membresía seleccionada. Aplica filtros de caracteres en los
 * campos de nombre y apellidos, y valida el correo en tiempo real al
 * perder el foco y al momento del submit.
 */
function AddClienteModal({ gimnasios, membresias, fetchMembresias, onClose, onCreated }) {

  const [form, setForm] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    correo: "",
    id_gimnasio: "",
    id_membresia: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onlyLetters = (v) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  const onlyLettersNoSpace = (v) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "");

  /**
 * Actualiza el campo correspondiente del formulario.
 * Convierte id_membresia a número al actualizar. Limpia el error
 * del campo si existía alguno previo.
 */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "id_membresia" ? Number(value) : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  /**
 * Valida el formato del correo al perder el foco del campo.
 * Muestra error de formato si el valor no cumple el patrón básico de email.
 */
  const handleCorreoBlur = () => {
    if (form.correo && !/^\S+@\S+\.\S+$/.test(form.correo))
      setErrors(prev => ({ ...prev, correo: "Correo inválido" }));
  };

  /**
 * Actualiza el gimnasio seleccionado, limpia la membresía elegida
 * y dispara fetchMembresias para cargar las membresías del nuevo gimnasio.
 */
  const handleGymChange = async (e) => {
    const id = Number(e.target.value);
    setForm(prev => ({ ...prev, id_gimnasio: id, id_membresia: "" }));
    if (errors.id_gimnasio) setErrors(prev => ({ ...prev, id_gimnasio: "" }));
    if (id) await fetchMembresias(id);
  };

  /**
 * Valida todos los campos requeridos antes de enviar.
 * Si hay errores los muestra en el formulario sin hacer petición.
 * Si es válido, envía POST a "/gym/clientes/inscribir" con los datos normalizados.
 * Al éxito llama a onCreated y cierra el modal.
 * Muestra el error del servidor si la petición falla.
 */
  const handleSubmit = async () => {
    const newErrors = {};

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.apellido_paterno.trim()) newErrors.apellido_paterno = "El apellido paterno es obligatorio";
    if (!form.apellido_materno.trim()) newErrors.apellido_materno = "El apellido materno es obligatorio";
    if (!form.correo.trim()) newErrors.correo = "El correo es obligatorio";
    else if (!/^\S+@\S+\.\S+$/.test(form.correo)) newErrors.correo = "Correo inválido";
    if (!form.id_gimnasio) newErrors.id_gimnasio = "Debes seleccionar un gimnasio";
    if (!form.id_membresia) newErrors.id_membresia = "Debes seleccionar una membresía";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      setLoading(true);
      setError("");
      await api.post("/gym/clientes/inscribir", {
        nombre: form.nombre.trim(),
        apellido_paterno: form.apellido_paterno.trim(),
        apellido_materno: form.apellido_materno.trim(),
        correo: form.correo.trim(),
        id_gimnasio: Number(form.id_gimnasio),
        id_membresia: Number(form.id_membresia)
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error creando cliente"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="modal-overlay">
        <div className="modal-card modal-lg">

          <h2 className="modal-title">Registrar cliente</h2>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-form">

            <div className="modal-grid">

              <div className="form-group">
                <label>Nombre *</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={e => handleChange({ target: { name: "nombre", value: onlyLetters(e.target.value) } })}
                />
                {errors.nombre && <span className="field-error-msg">{errors.nombre}</span>}
              </div>

              <div className="form-group">
                <label>Apellido paterno *</label>
                <input
                  name="apellido_paterno"
                  value={form.apellido_paterno}
                  onChange={e => handleChange({ target: { name: "apellido_paterno", value: onlyLettersNoSpace(e.target.value) } })}
                />
                {errors.apellido_paterno && <span className="field-error-msg">{errors.apellido_paterno}</span>}
              </div>

              <div className="form-group">
                <label>Apellido materno *</label>
                <input
                  name="apellido_materno"
                  value={form.apellido_materno}
                  onChange={e => handleChange({ target: { name: "apellido_materno", value: onlyLettersNoSpace(e.target.value) } })}
                />
                {errors.apellido_materno && <span className="field-error-msg">{errors.apellido_materno}</span>}
              </div>

              <div className="form-group">
                <label>Correo *</label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  onBlur={handleCorreoBlur}
                />
                {errors.correo && <span className="field-error-msg">{errors.correo}</span>}
              </div>

            </div>

            <div className="form-group">
              <label>Gimnasio *</label>
              <select name="id_gimnasio" value={form.id_gimnasio ?? ""} onChange={handleGymChange}>
                <option value="">Seleccionar</option>
                {gimnasios.map(g => (
                  <option key={g.id_gimnasio} value={g.id_gimnasio}>{g.nombre}</option>
                ))}
              </select>
              {errors.id_gimnasio && <span className="field-error-msg">{errors.id_gimnasio}</span>}
            </div>

            <div className="form-group">
              <label>Membresía *</label>
              <select
                name="id_membresia"
                value={form.id_membresia ?? ""}
                onChange={handleChange}
                disabled={!form.id_gimnasio}
              >
                <option value="">
                  {form.id_gimnasio ? "Seleccionar membresía" : "Primero selecciona un gimnasio"}
                </option>
                {membresias.map(m => (
                  <option key={m.id_membresia} value={m.id_membresia}>
                    {m.nombre} — ${m.precio}
                  </option>
                ))}
              </select>
              {errors.id_membresia && <span className="field-error-msg">{errors.id_membresia}</span>}
            </div>

          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Crear cliente"}
            </button>
          </div>

        </div>
      </div>
    </ModalPortal>
  );
}

export default AddClienteModal;