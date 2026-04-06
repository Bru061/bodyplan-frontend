import { useState } from "react";
import api from "../../services/axios";
import ModalPortal from "../../components/ui/ModalPortal";

/**
 * Modal para editar los datos de un instructor existente.
 * Inicializa el formulario con los datos actuales del instructor.
 * Aplica los mismos filtros de caracteres que CreatePersonalModal.
 * Verifica duplicados de nombre completo excluyendo al propio instructor
 * antes de enviar la actualización.
 */
function EditPersonalModal({ personal, onClose, onUpdated }) {

  const [form, setForm] = useState({
    nombre: personal.nombre           || "",
    apellido_paterno: personal.apellido_paterno || "",
    apellido_materno: personal.apellido_materno || ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onlyLetters = (v) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  const onlyLettersNoSpace = (v) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "");

  /**
 * Actualiza el campo del formulario aplicando filtros de caracteres
 * y límites de longitud según el campo. Limpia el error si existía.
 */
  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "nombre") v = onlyLetters(value).slice(0, 40);
    if (name === "apellido_paterno") v = onlyLettersNoSpace(value).slice(0, 30);
    if (name === "apellido_materno") v = onlyLettersNoSpace(value).slice(0, 30);

    setForm(prev => ({ ...prev, [name]: v }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  /**
 * Valida nombre y apellido paterno. Obtiene el listado de instructores
 * excluyendo al propio instructor editado y verifica que el nuevo nombre
 * completo no esté duplicado. Si es válido, envía PUT a "/personal/:id".
 * Al éxito llama a onUpdated y cierra el modal.
 * Muestra el error del servidor si la petición falla.
 */
  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.apellido_paterno.trim()) newErrors.apellido_paterno = "El apellido paterno es obligatorio";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      setLoading(true);
      setError("");

      const existenteRes = await api.get("/personal");
      const existentes = (existenteRes.data.personal || []).filter((p) => p.id_personal !== personal.id_personal);
      const nombreCompletoNuevo = [form.nombre, form.apellido_paterno, form.apellido_materno]
        .filter(Boolean)
        .join(" ")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      const duplicado = existentes.some((p) => [p.nombre, p.apellido_paterno, p.apellido_materno]
        .filter(Boolean)
        .join(" ")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ") === nombreCompletoNuevo);

      if (duplicado) {
        setError("Ya existe un instructor con ese nombre completo.");
        setLoading(false);
        return;
      }
      
      await api.put(`/personal/${personal.id_personal}`, {
        nombre: form.nombre.trim(),
        apellido_paterno: form.apellido_paterno.trim(),
        apellido_materno: form.apellido_materno.trim() || null
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || "Error actualizando instructor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="modal-overlay">
        <div className="modal-card">

          <h2 className="modal-title">Editar instructor</h2>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-form">

            <div className="form-group">
              <label>Nombre *</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                maxLength={40}
              />
              {errors.nombre && <span className="field-error-msg">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label>Apellido paterno *</label>
              <input
                name="apellido_paterno"
                value={form.apellido_paterno}
                onChange={handleChange}
                maxLength={30}
              />
              {errors.apellido_paterno && <span className="field-error-msg">{errors.apellido_paterno}</span>}
            </div>

            <div className="form-group">
              <label>Apellido materno <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>(opcional)</span></label>
              <input
                name="apellido_materno"
                value={form.apellido_materno}
                onChange={handleChange}
                maxLength={30}
              />
            </div>

          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>

        </div>
      </div>
    </ModalPortal>
  );
}

export default EditPersonalModal;