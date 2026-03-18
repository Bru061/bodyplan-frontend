import { useState } from "react";
import api from "../../services/axios";
import ModalPortal from "../../components/ui/ModalPortal";
import "../../styles/rutinas.css";

function CreateRutinaModal({ onClose, onCreated }) {

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

  const validate = () => {
    const e = {};

    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    else if (form.nombre.length > 20) e.nombre = "Máximo 20 caracteres";

    if (!form.descripcion.trim()) e.descripcion = "La descripción es obligatoria";
    else if (form.descripcion.length > 100) e.descripcion = "Máximo 100 caracteres";

    if (!form.objetivo.trim()) e.objetivo = "El objetivo es obligatorio";
    if (!form.equipamiento.trim()) e.equipamiento = "El equipamiento es obligatorio";
    if (!form.categoria) e.categoria = "La categoría es obligatoria";
    if (!form.tipo_rutina) e.tipo_rutina = "El tipo es obligatorio";
    if (!form.nivel) e.nivel = "El nivel es obligatorio";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        objetivo: form.objetivo.trim(),
        categoria: form.categoria,
        nivel: form.nivel,
        tipo_rutina: form.tipo_rutina,
        tipo: form.tipo_rutina,
        es_premium: 0,
        es_personalizada: false,
        equipamiento: form.equipamiento.trim(),
        calorias_estimadas: parseInt(form.calorias_estimadas, 10),
        instrucciones: form.instrucciones.trim(),
        duracion_min: parseInt(form.duracion_min, 10)
      };

      await api.post("/rutinas", payload);

      onCreated();
      onClose();

    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "No se pudo crear la rutina"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="modal-overlay">
        <div className="modal-card">

          <h2 className="modal-title">Crear rutina</h2>

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
                {errors.nivel && <span className="field-error-msg">{errors.nivel}</span>}
              </div>

              <div className="form-group">
                <label>Tipo rutina *</label>
                <select name="tipo_rutina" value={form.tipo_rutina} onChange={handleChange}>
                  <option value="gimnasio">Gimnasio</option>
                  <option value="casa">Casa</option>
                </select>
                {errors.tipo_rutina && <span className="field-error-msg">{errors.tipo_rutina}</span>}
              </div>

              <div className="form-group">
                <label>Duración (min) *</label>
                <input type="text" inputMode="numeric" name="duracion_min" value={form.duracion_min} onChange={handleChange} maxLength={3} />
                {errors.duracion_min && <span className="field-error-msg">{errors.duracion_min}</span>}
              </div>

              <div className="form-group">
                <label>Equipamiento *</label>
                <input
                  name="equipamiento"
                  value={form.equipamiento}
                  maxLength={50}
                  onChange={handleChange} />
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
                {loading ? "Guardando..." : "Crear rutina"}
              </button>
            </div>

          </form>

        </div>
      </div>
    </ModalPortal>
  );
}

export default CreateRutinaModal;