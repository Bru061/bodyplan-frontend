import { useState, useEffect } from "react";
import api from "../../services/axios";
import ModalPortal from "../../components/ui/ModalPortal";
import "../../styles/rutinas.css";

/**
 * Modal para editar una rutina existente. Inicializa el formulario con los
 * datos actuales de la rutina al montar o al cambiar la prop rutina.
 * Aplica los mismos filtros y validaciones que CreateRutinaModal.
 * Envía PUT a "/rutinas/:id" con los datos actualizados.
 */
function EditRutinaModal({ rutina, onClose, onUpdated }) {

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    objetivo: "",
    categoria: "",
    nivel: "principiante",
    tipo_rutina: "gimnasio",
    equipamiento: "",
    calorias_estimadas: "",
    duracion_min: "",
    instrucciones: ""
  });

  useEffect(() => {
    if (rutina) {
      setForm({
        nombre: rutina.nombre || "",
        descripcion: rutina.descripcion || "",
        objetivo: rutina.objetivo || "",
        categoria: rutina.categoria || "",
        nivel: rutina.nivel || "principiante",
        tipo_rutina: rutina.tipo_rutina || "gimnasio",
        equipamiento: rutina.equipamiento || "",
        calorias_estimadas: rutina.calorias_estimadas || "",
        duracion_min: rutina.duracion_min || "",
        instrucciones: rutina.instrucciones || ""
      });
    }
  }, [rutina]);

  /**
 * Aplica los mismos filtros de caracteres y límites de longitud que
 * CreateRutinaModal. Limpia el error del campo al detectar cualquier cambio.
 */
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "duracion_min") value = value.replace(/[^0-9]/g, "").slice(0, 3);
    if (name === "calorias_estimadas") value = value.replace(/[^0-9]/g, "").slice(0, 4);
    if (name === "objetivo") value = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");
    if (name === "nombre") value = value.slice(0, 20);
    if (name === "descripcion") value = value.slice(0, 100);
    if (name === "instrucciones") value = value.slice(0, 255);

    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  /**
 * Valida los mismos campos que CreateRutinaModal con idénticas reglas.
 * Actualiza el estado de errores y retorna si el formulario es válido.
 */
  const validate = () => {
    const e = {};

    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    else if (form.nombre.length > 20) e.nombre = "Máximo 20 caracteres";

    if (!form.descripcion.trim()) e.descripcion = "La descripción es obligatoria";
    else if (form.descripcion.length > 100) e.descripcion = "Máximo 100 caracteres";

    if (!form.objetivo.trim()) e.objetivo = "El objetivo es obligatorio";
    if (!form.categoria) e.categoria = "Selecciona una categoría";
    if (!form.equipamiento.trim()) e.equipamiento = "El equipamiento es obligatorio";

    if (!form.duracion_min) e.duracion_min = "La duración es obligatoria";
    else if (Number(form.duracion_min) <= 0) e.duracion_min = "Debe ser mayor a 0";
    else if (Number(form.duracion_min) > 300) e.duracion_min = "Máximo 300 minutos";

    if (!form.calorias_estimadas) e.calorias_estimadas = "Las calorías son obligatorias";
    else if (Number(form.calorias_estimadas) <= 0) e.calorias_estimadas = "Debe ser mayor a 0";
    else if (Number(form.calorias_estimadas) > 5000) e.calorias_estimadas = "Máximo 5000";

    if (!form.instrucciones.trim()) e.instrucciones = "Las instrucciones son obligatorias";
    else if (form.instrucciones.length > 255) e.instrucciones = "Máximo 255 caracteres";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /**
 * Valida el formulario y envía PUT a "/rutinas/:id" con los datos normalizados.
 * Al éxito llama a onUpdated y cierra el modal.
 * Muestra el error del servidor si la petición falla.
 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    try {
      setLoading(true);
      await api.put(`/rutinas/${rutina.id_rutina}`, {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        objetivo: form.objetivo.trim(),
        categoria: form.categoria,
        nivel: form.nivel,
        tipo_rutina: form.tipo_rutina,
        equipamiento: form.equipamiento.trim(),
        calorias_estimadas: parseInt(form.calorias_estimadas, 10),
        instrucciones: form.instrucciones.trim(),
        duracion_min: parseInt(form.duracion_min, 10)
      });
      onUpdated();
      onClose();
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "No se pudo actualizar la rutina"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="modal-overlay">
        <div className="modal-card">

          <h2 className="modal-title">Editar rutina</h2>

          {apiError && <div className="modal-error">{apiError}</div>}

          <form onSubmit={handleSubmit} className="modal-form">

            <div className="form-group">
              <label>Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} maxLength={20} />
              {errors.nombre && <span className="field-error-msg">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label>Descripción *</label>
              <div className="textarea-wrapper">
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} maxLength={100} />
                <span className="char-counter">{form.descripcion.length}/100</span>
              </div>
              {errors.descripcion && <span className="field-error-msg">{errors.descripcion}</span>}
            </div>

            <div className="form-group">
              <label>Objetivo *</label>
              <input
                name="objetivo"
                value={form.objetivo}
                maxLength={50}
                onChange={handleChange} />
              {errors.objetivo && <span className="field-error-msg">{errors.objetivo}</span>}
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>Categoría *</label>
                <select name="categoria" value={form.categoria} onChange={handleChange}>
                  <option value="">Seleccionar</option>
                  <option value="fuerza">Fuerza</option>
                  <option value="hipertrofia">Hipertrofia</option>
                  <option value="resistencia">Resistencia</option>
                  <option value="cardio">Cardio</option>
                  <option value="funcional">Funcional</option>
                </select>
                {errors.categoria && <span className="field-error-msg">{errors.categoria}</span>}
              </div>

              <div className="form-group">
                <label>Nivel *</label>
                <select name="nivel" value={form.nivel} onChange={handleChange}>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tipo rutina *</label>
                <select name="tipo_rutina" value={form.tipo_rutina} onChange={handleChange}>
                  <option value="gimnasio">Gimnasio</option>
                  <option value="casa">Casa</option>
                </select>
              </div>

              <div className="form-group">
                <label>Duración (min) *</label>
                <input type="text" inputMode="numeric" name="duracion_min" value={form.duracion_min} onChange={handleChange} maxLength={3} />
                {errors.duracion_min && <span className="field-error-msg">{errors.duracion_min}</span>}
              </div>

              <div className="form-group">
                <label>Equipamiento *</label>
                <input name="equipamiento" value={form.equipamiento} onChange={handleChange} />
                {errors.equipamiento && <span className="field-error-msg">{errors.equipamiento}</span>}
              </div>

              <div className="form-group">
                <label>Calorías estimadas *</label>
                <input type="text" inputMode="numeric" name="calorias_estimadas" value={form.calorias_estimadas} onChange={handleChange} maxLength={4} />
                {errors.calorias_estimadas && <span className="field-error-msg">{errors.calorias_estimadas}</span>}
              </div>

            </div>

            <div className="form-group">
              <label>Instrucciones *</label>
              <div className="textarea-wrapper">
                <textarea name="instrucciones" value={form.instrucciones} onChange={handleChange} maxLength={255} />
                <span className="char-counter">{form.instrucciones.length}/255</span>
              </div>
              {errors.instrucciones && <span className="field-error-msg">{errors.instrucciones}</span>}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>

          </form>

        </div>
      </div>
    </ModalPortal>
  );
}

export default EditRutinaModal;