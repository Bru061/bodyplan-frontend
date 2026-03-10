import { useState } from "react";
import api from "../../services/axios";
import "../../styles/rutinas.css";

function CreateRutinaModal({ onClose,onCreated }){

  const [loading,setLoading] = useState(false);
  const [errors,setErrors] = useState({});
  const [apiError,setApiError] = useState("");

  const cleanObjetivo = (value) =>
    value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g,"");

  const [form,setForm] = useState({
    nombre:"",
    descripcion:"",
    objetivo:"",
    categoria:"",
    nivel:"principiante",
    tipo_rutina:"gimnasio",
    equipamiento:"",
    calorias_estimadas:"",
    duracion_min:"",
    instrucciones:""
  });

  const handleChange = (e)=>{

    const {name,value} = e.target;

    setForm(prev=>({
      ...prev,
      [name]:value
    }));

    setErrors(prev=>({
      ...prev,
      [name]:null
    }));

  };

  const handleSubmit = async (e)=>{

    setApiError("");

    e.preventDefault();

    if(!validate()){
      return;
    }

    try{
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
        calorias_estimadas: form.calorias_estimadas
          ? parseInt(form.calorias_estimadas,10)
          : null,
        instrucciones: form.instrucciones.trim(),
        duracion_min: form.duracion_min
          ? parseInt(form.duracion_min,10)
          : null
      };

    console.log("Payload:", payload);

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
    }catch(err){

    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "No se pudo crear la rutina";

    setApiError(msg);


    }finally{

      setLoading(false);

    }

  };

  const validate = () => {

    let newErrors = {};

    if(!form.nombre.trim()){
      newErrors.nombre = "El nombre es obligatorio";
    }
    else if(form.nombre.length > 20){
      newErrors.nombre = "Máximo 20 caracteres";
    }

    if(!form.descripcion.trim()){
      newErrors.descripcion = "La descripción es obligatoria";
    }
    else if(form.descripcion.length > 100){
      newErrors.descripcion = "Máximo 100 caracteres";
    }

    if(!form.duracion_min){
      newErrors.duracion_min = "La duración es obligatoria";
    }
    else if(form.duracion_min <= 0){
      newErrors.duracion_min = "La duración debe ser mayor a 0";
    }

    if(!form.instrucciones.trim()){
      newErrors.instrucciones = "Las instrucciones son obligatorias";
    }
    else if(form.instrucciones.length > 255){
      newErrors.instrucciones = "Máximo 255 caracteres";
    }

    if(isNaN(form.duracion_min)){
      newErrors.duracion_min = "Duración inválida";
    }

  if(!form.objetivo.trim()){
    newErrors.objetivo = "El objetivo es obligatorio";
  }

  if(!form.equipamiento.trim()){
    newErrors.equipamiento = "El equipamiento es obligatorio";
  }

  if(!form.calorias_estimadas){
    newErrors.calorias_estimadas = "Las calorías son obligatorias";
  }
  else if(form.calorias_estimadas < 0){
    newErrors.calorias_estimadas = "Las calorías no pueden ser negativas";
  }

  if (!form.categoria)
  newErrors.categoria = "La categoría es obligatoria";

  if (!form.tipo)
    newErrors.tipo = "El tipo es obligatorio";

  if (!form.nivel)
    newErrors.nivel = "El nivel es obligatorio";

  if (Object.keys(newErrors).length > 0){
    setErrors(newErrors);
    return;
  }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

  return(

    <div className="modal-overlay">

      <div className="modal-card">

        <h2>Crear rutina</h2>

        {apiError && (
          <p className="error-text" style={{marginBottom:"15px"}}>
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
            onChange={(e)=>
              setForm({
                ...form,
                objetivo: cleanObjetivo(e.target.value)
              })
            }
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
          </div>

          <div className="form-group">
          <label>Duración (min) *</label>
          <input
            type="number"
            name="duracion_min"
            value={form.duracion_min}
            onChange={handleChange}
            min="1"
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
            type="number"
            name="calorias_estimadas"
            value={form.calorias_estimadas}
            onChange={handleChange}
            min="0"
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