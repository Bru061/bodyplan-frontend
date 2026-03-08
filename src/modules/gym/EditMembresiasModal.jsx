import { useEffect, useState } from "react";
import api from "../../services/axios";

function EditMembresiasModal({ gym, onClose, onUpdated }) {

  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const noSpecial = (value, max) => value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, max);
  const onlyNumbers = (value) => value.replace(/[^0-9]/g, "");

  // ================= CARGAR EXISTENTES =================
  useEffect(() => {
    if (!gym) return;

    if (gym.membresias && gym.membresias.length > 0) {
      setMembresias(
        gym.membresias.map(m => ({
          id: m.id_membresia,
          nombre: m.nombre,
          precio: m.precio,
          duracion: m.duracion_dias,
          descripcion: m.descripcion || "",
          activo: m.activo ?? true
        }))
      );
    } else {
      setMembresias([
        { id: null, nombre: "", precio: "", duracion: "", descripcion: "", activo: true }
      ]);
    }
  }, [gym]);

  // ================= CAMBIOS INPUT =================
  const handleChange = (index, field, value) => {

    const copia = [...membresias];
    copia[index][field] = value;
    setMembresias(copia);

    const key = `${field}-${index}`;

    if(errors[key]){
      setErrors(prev=>({
        ...prev,
        [key]: ""
      }));
    }

  };

  // ================= AGREGAR =================
  const addMembresia = () => {
    setMembresias([
      ...membresias,
      { id: null, nombre: "", precio: "", duracion: "", descripcion: "", activo: true }
    ]);
  };

  // ================= ELIMINAR =================
  const deleteMembresia = async (index) => {
    const m = membresias[index];

    if (m.id) {
      try {
        await api.patch(`/gym/membresias/${m.id}/desactivar`);
      } catch (err) {
        console.error("Error desactivando membresía", err);
      }
    }

    if(membresias.length === 1){
      alert("Debe existir al menos una membresía");
      return;
    }
  

    const copia = membresias.filter((_, i) => i !== index);
    setMembresias(copia);
  };

  // ================= GUARDAR =================
const handleSave = async () => {

  let newErrors = {};
  let nombres = new Set();

  membresias.forEach((m,i)=>{

    if (!m.nombre.trim())
      newErrors[`nombre-${i}`] = "El nombre es obligatorio";

    if (!m.precio || Number(m.precio) < 1)
      newErrors[`precio-${i}`] = "El precio debe ser mayor a 0";

    if (!m.duracion || Number(m.duracion) < 1)
      newErrors[`duracion-${i}`] = "La duración debe ser mayor a 0";

    if (m.nombre && nombres.has(m.nombre.toLowerCase()))
      newErrors[`nombre-${i}`] = "Nombre de membresía repetido";

    if (m.nombre.length > 15)
      newErrors[`nombre-${i}`] = "Máximo 15 caracteres";

    if (!m.descripcion || !m.descripcion.trim())
      newErrors[`descripcion-${i}`] = "La descripción es obligatoria";

    if (m.descripcion && m.descripcion.length > 100)
      newErrors[`descripcion-${i}`] = "Máximo 100 caracteres";

    nombres.add(m.nombre.toLowerCase());

  });

  if(Object.keys(newErrors).length > 0){
    setErrors(newErrors);
    return;
  }

  try {
    setLoading(true);

    for (const m of membresias) {

      if (!m.id) {
        await api.post(`/gym/${gym.id_gimnasio}/membresias`, {
          nombre: m.nombre,
          precio: Number(m.precio),
          duracion_dias: Number(m.duracion),
          descripcion: m.descripcion?.trim() || ""
        });
      } else {
        await api.put(`/gym/membresias/${m.id}`, {
          nombre: m.nombre,
          precio: Number(m.precio),
          duracion_dias: Number(m.duracion),
          descripcion: m.descripcion?.trim() || ""
        });
      }
    }

    onUpdated();
    onClose();

  } catch (err) {
    alert("Error al guardar membresías");
  } finally {
    setLoading(false);
  }
};

  // ================= UI =================
  return (
    <div className="modal-overlay">

      <div className="modal-card modal-lg">

        <h2 className="modal-title">Editar membresías</h2>
        {error && (
          <div className="modal-error">{error}</div>
        )}

        {/* LISTA */}
        <div className="horario-row">

          {membresias.map((m, i) => (
            <div key={i} className="field-row">

            <div className="field-group">
              <label>Nombre *</label>
              <input
                maxLength={15}
                value={m.nombre}
                onChange={(e)=>{
                  const limpio = noSpecial(e.target.value, 15);
                  handleChange(i,"nombre",limpio);
                }}
              />
              {errors[`nombre-${i}`] && (
                <p className="text-red-500 text-sm">{errors[`nombre-${i}`]}</p>
              )}
            </div>

            <div className="field-group">
              <label>Precio *</label>
              <input
                type="number"
                min="1"
                value={m.precio}
                onChange={(e)=>{
                  let v = onlyNumbers(e.target.value);
                  if(v !== "" && parseInt(v) < 1) v = 1;
                  handleChange(i,"precio",v);
                }}
              />
              {errors[`precio-${i}`] && (
                <p className="text-red-500 text-sm">{errors[`precio-${i}`]}</p>
              )}
            </div>

            <div className="field-group">
              <label>Duración días *</label>
              <input
                type="number"
                min="1"
                value={m.duracion}
                onChange={(e)=>{
                  let v = onlyNumbers(e.target.value);
                  if(v !== "" && parseInt(v) < 1) v = 1;
                  handleChange(i,"duracion",v);
                }}
              />
              {errors[`duracion-${i}`] && (
                <p className="text-red-500 text-sm">{errors[`duracion-${i}`]}</p>
              )}
            </div>

            <div className="field-group">
              <label>Descripción *</label>
              <div className="textarea-wrapper">
              <input
                maxLength={100}
                className="desc-input"
                value={m.descripcion}
                onChange={(e)=>{
                  const v = e.target.value.slice(0, 100);
                  handleChange(i,"descripcion",v);
                }}
              />
              <span className="char-counter">
                {(m.descripcion || "").length}/100
              </span>
              </div>
              {errors[`descripcion-${i}`] && (
                <p className="text-red-500 text-sm">{errors[`descripcion-${i}`]}</p>
              )}
            </div>
            
            <div className="delete-row">
              <button
                type="button"
                className="btn btn-danger"
                onClick={()=>deleteMembresia(i)}
              >
                Eliminar
              </button>
            </div>

            </div>
          ))}

        </div>

        <button className="btn-link-add" onClick={addMembresia}>
          + Agregar membresía
        </button>

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>

          <button className="btn-primary" onClick={handleSave}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditMembresiasModal;