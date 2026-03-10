import { useState, useEffect } from "react";
import api from "../../services/axios";
import "../../styles/rutinas.css";

function EditRutinaModal({ rutina, onClose, onUpdated }) {

  const [loading,setLoading] = useState(false);
  const [errors,setErrors] = useState({});

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

  // Cargar datos de la rutina seleccionada
  useEffect(()=>{

    if(rutina){

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

  },[rutina]);

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

  const validate = ()=>{

    let newErrors = {};

    if(!form.nombre.trim()){
      newErrors.nombre = "El nombre es obligatorio";
    } else if(form.nombre.length > 20){
      newErrors.nombre = "Máximo 20 caracteres";
    }

    if(!form.descripcion.trim()){
      newErrors.descripcion = "La descripción es obligatoria";
    }

    if(!form.objetivo.trim()){
      newErrors.objetivo = "El objetivo es obligatorio";
    }

    if(!form.categoria){
      newErrors.categoria = "Selecciona una categoría";
    }

    if(!form.duracion_min){
      newErrors.duracion_min = "La duración es obligatoria";
    }

    if(!form.equipamiento.trim()){
      newErrors.equipamiento = "El equipamiento es obligatorio";
    }

    if(!form.calorias_estimadas){
      newErrors.calorias_estimadas = "Las calorías son obligatorias";
    }

    if(!form.instrucciones.trim()){
      newErrors.instrucciones = "Las instrucciones son obligatorias";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

  const handleSubmit = async (e)=>{

    e.preventDefault();

    if(!validate()) return;

    try{

      setLoading(true);

      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        objetivo: form.objetivo.trim(),
        categoria: form.categoria,
        nivel: form.nivel,
        tipo_rutina: form.tipo_rutina,
        equipamiento: form.equipamiento.trim(),
        calorias_estimadas: parseInt(form.calorias_estimadas,10),
        instrucciones: form.instrucciones.trim(),
        duracion_min: parseInt(form.duracion_min,10)
      };

      await api.put(`/rutinas/${rutina.id_rutina}`,payload);

      onUpdated();
      onClose();

    }catch(err){

      console.error("Error al actualizar rutina:",err.response?.data || err);

    }finally{

      setLoading(false);

    }

  };

  return(

    <div className="modal-overlay">

      <div className="modal-card">

        <h2>Editar rutina</h2>

        <form onSubmit={handleSubmit}>

          <label>Nombre *</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            maxLength={20}
          />
          {errors.nombre && <p className="error-text">{errors.nombre}</p>}

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
          {errors.descripcion && <p className="error-text">{errors.descripcion}</p>}

          <label>Objetivo *</label>
          <input
            name="objetivo"
            value={form.objetivo}
            onChange={handleChange}
          />
          {errors.objetivo && <p className="error-text">{errors.objetivo}</p>}

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
              {errors.categoria && <p className="error-text">{errors.categoria}</p>}
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
              />
              {errors.duracion_min && <p className="error-text">{errors.duracion_min}</p>}
            </div>

            <div className="form-group">
              <label>Equipamiento *</label>
              <input
                name="equipamiento"
                value={form.equipamiento}
                onChange={handleChange}
              />
              {errors.equipamiento && <p className="error-text">{errors.equipamiento}</p>}
            </div>

            <div>
              <label className="form-group">Calorías estimadas *</label>
              <input
                type="number"
                name="calorias_estimadas"
                value={form.calorias_estimadas}
                onChange={handleChange}
              />
              {errors.calorias_estimadas && <p className="error-text">{errors.calorias_estimadas}</p>}
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
          {errors.instrucciones && <p className="error-text">{errors.instrucciones}</p>}

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
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default EditRutinaModal;