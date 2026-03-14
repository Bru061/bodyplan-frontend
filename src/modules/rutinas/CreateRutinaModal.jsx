import { useState } from "react";
import api from "../../services/axios";
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

    if (name === "duracion_min") {
      value = value.replace(/[^0-9]/g, "").slice(0, 3);
    }

    if (name === "calorias_estimadas") {
      value = value.replace(/[^0-9]/g, "").slice(0, 4);
    }

    if (name === "objetivo") {
      value = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");
    }

    if (name === "nombre") {
      value = value.slice(0, 20);
    }

    if (name === "descripcion") {
      value = value.slice(0, 100);
    }

    if (name === "instrucciones") {
      value = value.slice(0, 255);
    }

    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {

    const newErrors = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (form.nombre.length > 20) {
      newErrors.nombre = "Máximo 20 caracteres";
    }

    if (!form.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    } else if (form.descripcion.length > 100) {
      newErrors.descripcion = "Máximo 100 caracteres";
    }

    if (!form.objetivo.trim()) {
      newErrors.objetivo = "El objetivo es obligatorio";
    }

    if (!form.equipamiento.trim()) {
      newErrors.equipamiento = "El equipamiento es obligatorio";
    }

    if (!form.categoria) {
      newErrors.categoria = "La categoría es obligatoria";
    }

    if (!form.tipo_rutina) {
      newErrors.tipo_rutina = "El tipo es obligatorio";
    }

    if (!form.nivel) {
      newErrors.nivel = "El nivel es obligatorio";
    }

    if (!form.duracion_min) {
      newErrors.duracion_min = "La duración es obligatoria";
    } else if (isNaN(Number(form.duracion_min))) {
      newErrors.duracion_min = "Duración inválida";
    } else if (Number(form.duracion_min) <= 0) {
      newErrors.duracion_min = "La duración debe ser mayor a 0";
    } else if (Number(form.duracion_min) > 300) {
      newErrors.duracion_min = "La duración máxima es 300 minutos";
    }

    if (!form.calorias_estimadas) {
      newErrors.calorias_estimadas = "Las calorías son obligatorias";
    } else if (isNaN(Number(form.calorias_estimadas))) {
      newErrors.calorias_estimadas = "Valor inválido";
    } else if (Number(form.calorias_estimadas) <= 0) {
      newErrors.calorias_estimadas = "Las calorías deben ser mayor a 0";
    } else if (Number(form.calorias_estimadas) > 5000) {
      newErrors.calorias_estimadas = "Máximo 5000 calorías";
    }

    if (!form.instrucciones.trim()) {
      newErrors.instrucciones = "Las instrucciones son obligatorias";
    } else if (form.instrucciones.length > 255) {
      newErrors.instrucciones = "Máximo 255 caracteres";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
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
        es_premium: 0,
        equipamiento: form.equipamiento.trim(),
        calorias_estimadas: parseInt(form.calorias_estimadas, 10),
        instrucciones: form.instrucciones.trim(),
        duracion_min: parseInt(form.duracion_min, 10)
      };

      await api.post(
        "/rutinas",
        JSON.stringify(payload),
        {
          headers: { "Content-Type": "application/json" },
          transformRequest: [(data) => data]
        }
      );

      onCreated();
      onClose();

    } catch (err) {

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "No se pudo crear la rutina";

      setApiError(msg);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="modal-overlay">
      <div className="modal-card">

        <h2>Crear rutina</h2>

        {apiError && (
          <p className="error-text" style={{ marginBottom: "15px" }}>
            {apiError}
          </p>
        )}

        <form onSubmit={handleSubmit}>

          <label>Nombre *</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            maxLength={20}
          />
          {errors.nombre && (
            <p className="error-text">{errors.nombre}</p>
          )}

          <label>Descripción *</label>
          <div className="textarea-wrapper">
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              maxLength={100}
            />
            <span className="char-counter">
              {form.descripcion.length}/100
            </span>
          </div>
          {errors.descripcion && (
            <p className="error-text">{errors.descripcion}</p>
          )}

          <label>Objetivo *</label>
          <input
            name="objetivo"
            value={form.objetivo}
            onChange={handleChange}
          />
          {errors.objetivo && (
            <p className="error-text">{errors.objetivo}</p>
          )}

          <div className="form-grid">

            <div className="form-group">
              <label>Categoría *</label>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
              >
                <option value="">Seleccionar</option>
                <option value="fuerza">Fuerza</option>
                <option value="hipertrofia">Hipertrofia</option>
                <option value="resistencia">Resistencia</option>
                <option value="cardio">Cardio</option>
                <option value="funcional">Funcional</option>
              </select>
              {errors.categoria && (
                <p className="error-text">{errors.categoria}</p>
              )}
            </div>

            <div className="form-group">
              <label>Nivel *</label>
              <select
                name="nivel"
                value={form.nivel}
                onChange={handleChange}
              >
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
              {errors.nivel && (
                <p className="error-text">{errors.nivel}</p>
              )}
            </div>

            <div className="form-group">
              <label>Tipo rutina *</label>
              <select
                name="tipo_rutina"
                value={form.tipo_rutina}
                onChange={handleChange}
              >
                <option value="gimnasio">Gimnasio</option>
                <option value="casa">Casa</option>
              </select>
              {errors.tipo_rutina && (
                <p className="error-text">{errors.tipo_rutina}</p>
              )}
            </div>

            <div className="form-group">
              <label>Duración (min) *</label>
              <input
                type="text"
                inputMode="numeric"
                name="duracion_min"
                value={form.duracion_min}
                onChange={handleChange}
                maxLength={3}
              />
              {errors.duracion_min && (
                <p className="error-text">{errors.duracion_min}</p>
              )}
            </div>

            <div className="form-group">
              <label>Equipamiento *</label>
              <input
                name="equipamiento"
                value={form.equipamiento}
                onChange={handleChange}
              />
              {errors.equipamiento && (
                <p className="error-text">{errors.equipamiento}</p>
              )}
            </div>

            <div className="form-group">
              <label>Calorías estimadas *</label>
              <input
                type="text"
                inputMode="numeric"
                name="calorias_estimadas"
                value={form.calorias_estimadas}
                onChange={handleChange}
                maxLength={4}
              />
              {errors.calorias_estimadas && (
                <p className="error-text">{errors.calorias_estimadas}</p>
              )}
            </div>

          </div>

          <label>Instrucciones *</label>
          <div className="textarea-wrapper">
            <textarea
              name="instrucciones"
              value={form.instrucciones}
              onChange={handleChange}
              maxLength={255}
            />
            <span className="char-counter">
              {form.instrucciones.length}/255
            </span>
          </div>
          {errors.instrucciones && (
            <p className="error-text">{errors.instrucciones}</p>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Crear rutina"}
            </button>
          </div>

        </form>

      </div>
    </div>

  );

}

export default CreateRutinaModal;