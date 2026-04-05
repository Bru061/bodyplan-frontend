import { useEffect, useState } from "react";
import api from "../../services/axios";
import Toast from "../../components/ui/Toast";
import ModalPortal from "../../components/ui/ModalPortal";

/**
 * Modal para editar las membresías de un gimnasio.
 * Inicializa el formulario con las membresías existentes o con una fila vacía.
 * Valida nombres únicos, precios y duraciones mayores a 0, y descripción obligatoria.
 * Al guardar crea (POST) o actualiza (PUT) cada membresía individualmente.
 * La eliminación desactiva la membresía en el backend (PATCH /desactivar)
 * antes de quitarla del estado local. Bloquea si solo queda una membresía.
 */
function EditMembresiasModal({ gym, onClose, onUpdated }) {

  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => setToast({ message, type });

  const noSpecial  = (v, max) => v.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, max);
  const onlyNumbers = (v) => v.replace(/[^0-9]/g, "");

  useEffect(() => {
    if (!gym) return;
    if (gym.membresias?.length > 0) {
      setMembresias(gym.membresias.map(m => ({
        id: m.id_membresia,
        nombre: m.nombre,
        precio: m.precio,
        duracion: m.duracion_dias,
        descripcion: m.descripcion || "",
        activo: m.activo ?? true
      })));
    } else {
      setMembresias([{ id: null, nombre: "", precio: "", duracion: "", descripcion: "", activo: true }]);
    }
  }, [gym]);

  /**
 * Actualiza el campo indicado de la membresía en el índice dado.
 * Limpia el error asociado a ese campo e índice si existía.
 */
  const handleChange = (index, field, value) => {
    setMembresias(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
    const key = `${field}-${index}`;
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
  };

  /**
 * Agrega una membresía nueva vacía al arreglo de estado.
 */
  const addMembresia = () => {
    setMembresias(prev => [
      ...prev,
      { id: null, nombre: "", precio: "", duracion: "", descripcion: "", activo: true }
    ]);
  };

  /**
 * Desactiva la membresía en el backend si tiene id (PATCH /desactivar)
 * y la elimina del estado local. Bloquea si solo queda una membresía.
 */
  const deleteMembresia = async (index) => {
    if (membresias.length === 1) { showToast("Debe existir al menos una membresía."); return; }
    const m = membresias[index];
    if (m.id) {
      try {
        await api.patch(`/gym/membresias/${m.id}/desactivar`);
      } catch (err) {
        console.error(err);
        showToast("No se pudo eliminar la membresía.");
        return;
      }
    }
    setMembresias(prev => prev.filter((_, i) => i !== index));
  };

  /**
 * Valida nombre (único, máx. 15 chars), precio > 0, duración > 0
 * y descripción obligatoria (máx. 200 chars). Si hay errores los muestra
 * por campo e índice. Si son válidos itera enviando POST para nuevas
 * membresías y PUT para las existentes. Muestra Toast de error si falla.
 */
  const handleSave = async () => {
    const newErrors = {};
    const nombres = new Set();

    membresias.forEach((m, i) => {
      if (!m.nombre.trim()) newErrors[`nombre-${i}`] = "El nombre es obligatorio";
      if (!m.precio || Number(m.precio) < 1) newErrors[`precio-${i}`] = "El precio debe ser mayor a 0";
      if (!m.duracion || Number(m.duracion) < 1) newErrors[`duracion-${i}`] = "La duración debe ser mayor a 0";
      if (m.nombre && nombres.has(m.nombre.toLowerCase())) newErrors[`nombre-${i}`] = "Nombre repetido";
      if (m.nombre.length > 15) newErrors[`nombre-${i}`] = "Máximo 15 caracteres";
      if (!m.descripcion?.trim()) newErrors[`descripcion-${i}`] = "La descripción es obligatoria";
      if (m.descripcion?.length > 200) newErrors[`descripcion-${i}`] = "Máximo 200 caracteres";
      nombres.add(m.nombre.toLowerCase());
    });

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      setLoading(true);
      for (const m of membresias) {
        if (!m.id) {
          await api.post(`/gym/${gym.id_gimnasio}/membresias`, {
            nombre: m.nombre, precio: Number(m.precio),
            duracion_dias: Number(m.duracion), descripcion: m.descripcion?.trim() || ""
          });
        } else {
          await api.put(`/gym/membresias/${m.id}`, {
            nombre: m.nombre, precio: Number(m.precio),
            duracion_dias: Number(m.duracion), descripcion: m.descripcion?.trim() || ""
          });
        }
      }
      onUpdated();
      onClose();
    } catch (err) {
      showToast("Error al guardar las membresías.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ModalPortal>
      <div className="modal-overlay">
        <div className="modal-card modal-lg">

          <h2 className="modal-title">Editar membresías</h2>

          <div className="membresias-list">
            {membresias.map((m, i) => (
              <div key={i} className="field-row membresia-row">

                <div className="field-group">
                  <label>Nombre *</label>
                  <input
                    maxLength={15}
                    value={m.nombre}
                    onChange={e => handleChange(i, "nombre", noSpecial(e.target.value, 15))}
                  />
                  {errors[`nombre-${i}`] && <span className="field-error-msg">{errors[`nombre-${i}`]}</span>}
                </div>

                <div className="field-group">
                  <label>Precio *</label>
                  <input
                    type="number"
                    min="1"
                    value={m.precio}
                    onChange={e => {
                      let v = onlyNumbers(e.target.value);
                      if (v !== "" && parseInt(v) < 1) v = "1";
                      handleChange(i, "precio", v);
                    }}
                  />
                  {errors[`precio-${i}`] && <span className="field-error-msg">{errors[`precio-${i}`]}</span>}
                </div>

                <div className="field-group">
                  <label>Duración días *</label>
                  <input
                    type="number"
                    min="1"
                    value={m.duracion}
                    onChange={e => {
                      let v = onlyNumbers(e.target.value);
                      if (v !== "" && parseInt(v) < 1) v = "1";
                      handleChange(i, "duracion", v);
                    }}
                  />
                  {errors[`duracion-${i}`] && <span className="field-error-msg">{errors[`duracion-${i}`]}</span>}
                </div>

                <div className="field-group">
                  <label>Descripción *</label>
                  <div className="textarea-wrapper">
                    <input
                      maxLength={200}
                      className="desc-input"
                      value={m.descripcion}
                      onChange={e => handleChange(i, "descripcion", e.target.value.slice(0, 200))}
                    />
                    <span className="char-counter">{(m.descripcion || "").length}/200</span>
                  </div>
                  {errors[`descripcion-${i}`] && <span className="field-error-msg">{errors[`descripcion-${i}`]}</span>}
                </div>

                <div className="delete-row">
                  <button type="button" className="btn btn-danger" onClick={() => deleteMembresia(i)}>
                    Eliminar
                  </button>
                </div>

              </div>
            ))}
          </div>

          <button className="btn-link-add" onClick={addMembresia}>+ Agregar membresía</button>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>

        </div>
      </div>
      </ModalPortal>
    </>
  );
}

export default EditMembresiasModal;