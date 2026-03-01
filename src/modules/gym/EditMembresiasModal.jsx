import { useEffect, useState } from "react";
import api from "../../services/axios";

function EditMembresiasModal({ gym, onClose, onUpdated }) {

  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(false);

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

    const copia = membresias.filter((_, i) => i !== index);
    setMembresias(copia);
  };

  // ================= GUARDAR =================
  const handleSave = async () => {
    try {
      setLoading(true);

      for (const m of membresias) {

        // NUEVA
        if (!m.id) {
          await api.post(`/gym/${gym.id_gimnasio}/membresias`, {
            nombre: m.nombre,
            precio: Number(m.precio),
            duracion_dias: Number(m.duracion),
            descripcion: m.descripcion
          });
        }

        // EDITAR
        else {
          await api.put(`/gym/membresias/${m.id}`, {
            nombre: m.nombre,
            precio: Number(m.precio),
            duracion_dias: Number(m.duracion),
            descripcion: m.descripcion
          });
        }
      }

      onUpdated();
      onClose();

    } catch (err) {
      console.error("Error guardando membresías", err.response?.data || err);
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

        {/* LISTA */}
        <div className="horario-row">

          {membresias.map((m, i) => (
            <div key={i} className="field-row">

            <div className="field-group">
              <label>Nombre</label>
              <input
                placeholder="Nombre"
                value={m.nombre}
                onChange={(e)=>handleChange(i,"nombre",e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Precio</label>
              <input
                type="number"
                placeholder="Precio"
                value={m.precio}
                onChange={(e)=>handleChange(i,"precio",e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Duración días</label>
              <input
                type="number"
                placeholder="Duración días"
                value={m.duracion}
                onChange={(e)=>handleChange(i,"duracion",e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Descripción</label>
              <input
                className="desc-input"
                placeholder="Descripción (opcional)"
                value={m.descripcion}
                onChange={(e)=>handleChange(i,"descripcion",e.target.value)}
              />
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