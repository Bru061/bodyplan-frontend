import { useState, useEffect } from "react";
import api from "../../services/axios";
import ModalPortal from "../../components/ui/ModalPortal";

/**
 * Modal para editar la información básica y ubicación de un gimnasio.
 * Inicializa el formulario con los datos actuales del gimnasio y su ubicación.
 * Aplica filtros de caracteres por campo y valida antes de guardar.
 * Al guardar realiza dos peticiones secuenciales: una para los datos generales
 * y otra para la ubicación. Tras el éxito llama a onUpdated y cierra el modal.
 * Hace scroll automático al primer campo con error al fallar la validación.
 */
function EditGymModal({ gym, onClose, onUpdated }) {

  if (!gym) return null;

  const ubicacion = gym.Ubicacion || {};

  const [form, setForm] = useState({
    nombre: gym.nombre  || "",
    descripcion: gym.descripcion || "",
    telefono: gym.telefono || "",
    direccion: ubicacion.direccion || "",
    municipio: ubicacion.municipio || "",
    estado: ubicacion.estado || "",
    pais: ubicacion.pais || "México",
    codigo_postal: ubicacion.codigo_postal || ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const keys = Object.keys(errors);
    if (keys.length === 0) return;
    const field = document.querySelector(`[name="${keys[0]}"]`);
    if (!field) return;
    const offset = window.scrollY + field.getBoundingClientRect().top - 120;
    window.scrollTo({ top: offset, behavior: "smooth" });
    field.focus?.();
  }, [errors]);

  const onlyNumbers = (v, max) => v.replace(/[^0-9]/g, "").slice(0, max);
  const onlyLetters = (v, max) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, max);
  const lettersNumbers = (v, max) => v.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, max);

  /**
 * Actualiza un campo específico del formulario y limpia su error si existía.
 */
  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  /**
 * Valida todos los campos requeridos (nombre, descripción, teléfono de 10 dígitos,
 * dirección, municipio, estado y CP de 5 dígitos). Si hay errores los muestra
 * en el formulario. Si son válidos envía PUT a "/gym/:id" y PUT a "/gym/:id/ubicacion"
 * de forma secuencial. Muestra el error del servidor si alguna petición falla.
 */
  const handleSave = async () => {
    const newErrors = {};
    setError("");

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
    if (!form.telefono.trim()) newErrors.telefono = "El teléfono es obligatorio";
    else if (form.telefono.length !== 10) newErrors.telefono = "Debe tener 10 dígitos";
    if (!form.direccion.trim()) newErrors.direccion = "La dirección es obligatoria";
    if (!form.municipio.trim()) newErrors.municipio = "El municipio es obligatorio";
    if (!form.estado.trim()) newErrors.estado = "El estado es obligatorio";
    if (!form.codigo_postal.trim()) newErrors.codigo_postal = "El código postal es obligatorio";
    else if (form.codigo_postal.length !== 5) newErrors.codigo_postal = "Debe tener 5 dígitos";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      setLoading(true);
      await api.put(`/gym/${gym.id_gimnasio}`, {
        nombre: form.nombre,
        descripcion: form.descripcion,
        telefono: form.telefono
      });
      await api.put(`/gym/${gym.id_gimnasio}/ubicacion`, {
        direccion: form.direccion,
        municipio: form.municipio,
        estado: form.estado,
        pais: form.pais,
        codigo_postal: form.codigo_postal
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Error al actualizar el gimnasio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="modal-overlay">
        <div className="modal-card">

        <div className="modal-header">
          <h2>Editar gimnasio</h2>
          <p>Actualiza la información principal de tu negocio</p>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-form">

          <div className="field-group">
            <label>Nombre del gimnasio *</label>
            <input
              name="nombre"
              type="text"
              maxLength={50}
              value={form.nombre}
              className={errors.nombre ? "field-error" : ""}
              onChange={e => setField("nombre", lettersNumbers(e.target.value, 50))}
            />
            {errors.nombre && <span className="field-error-msg">{errors.nombre}</span>}
          </div>

          <div className="field-group">
            <label>Descripción *</label>
            <div className="textarea-wrapper">
              <textarea
                name="descripcion"
                maxLength={255}
                value={form.descripcion}
                className={errors.descripcion ? "field-error" : ""}
                onChange={e => setField("descripcion", e.target.value.slice(0, 255))}
              />
              <span className="char-counter">{form.descripcion.length}/255</span>
            </div>
            {errors.descripcion && <span className="field-error-msg">{errors.descripcion}</span>}
          </div>

          <div className="field-group">
            <label>Teléfono *</label>
            <input
              name="telefono"
              maxLength={10}
              value={form.telefono}
              className={errors.telefono ? "field-error" : ""}
              onChange={e => setField("telefono", onlyNumbers(e.target.value, 10))}
            />
            {errors.telefono && <span className="field-error-msg">{errors.telefono}</span>}
          </div>

          <h3 className="section-title">Ubicación</h3>

          <div className="grid-2">

            <div className="field-group">
              <label>Dirección *</label>
              <input
                name="direccion"
                maxLength={50}
                value={form.direccion}
                className={errors.direccion ? "field-error" : ""}
                onChange={e => setField("direccion", lettersNumbers(e.target.value, 50))}
              />
              {errors.direccion && <span className="field-error-msg">{errors.direccion}</span>}
            </div>

            <div className="field-group">
              <label>Municipio *</label>
              <input
                name="municipio"
                maxLength={20}
                value={form.municipio}
                className={errors.municipio ? "field-error" : ""}
                onChange={e => setField("municipio", onlyLetters(e.target.value, 20))}
              />
              {errors.municipio && <span className="field-error-msg">{errors.municipio}</span>}
            </div>

            <div className="field-group">
              <label>Estado *</label>
              <input
                name="estado"
                maxLength={20}
                value={form.estado}
                className={errors.estado ? "field-error" : ""}
                onChange={e => setField("estado", onlyLetters(e.target.value, 20))}
              />
              {errors.estado && <span className="field-error-msg">{errors.estado}</span>}
            </div>

            <div className="field-group">
              <label>Código postal *</label>
              <input
                name="codigo_postal"
                maxLength={5}
                value={form.codigo_postal}
                className={errors.codigo_postal ? "field-error" : ""}
                onChange={e => setField("codigo_postal", onlyNumbers(e.target.value, 5))}
              />
              {errors.codigo_postal && <span className="field-error-msg">{errors.codigo_postal}</span>}
            </div>

          </div>

        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

      </div>
    </div>
    </ModalPortal>
  );
}

export default EditGymModal;;