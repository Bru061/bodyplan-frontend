import { useEffect, useState } from "react";
import api from "../../services/axios";
import Toast from "../../components/ui/Toast";
import ModalPortal from "../../components/ui/ModalPortal";

/**
 * Modal para editar los horarios de un gimnasio.
 * Inicializa el formulario con los horarios existentes o con una fila vacía
 * si el gimnasio no tiene horarios registrados.
 * Valida días únicos, campos completos y que la hora de cierre sea mayor
 * a la apertura. Los errores se gestionan por clave "campo-índice".
 * Al guardar crea (POST) o actualiza (PUT) cada horario individualmente.
 */
function EditHorariosModal({ gym, onClose, onUpdated }) {

  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => setToast({ message, type });

  useEffect(() => {
    if (!gym) return;
    if (gym.horarios?.length > 0) {
      setHorarios(gym.horarios.map(h => ({
        id_horario: h.id_horario,
        dia: h.dia_semana,
        apertura: h.hora_apertura?.slice(0, 5),
        cierre: h.hora_cierre?.slice(0, 5)
      })));
    } else {
      setHorarios([{ id_horario: null, dia: "", apertura: "", cierre: "" }]);
    }
  }, [gym]);

  /**
 * Actualiza el campo indicado del horario en el índice dado.
 * Limpia el error asociado a ese campo e índice si existía.
 */
  const handleChange = (index, field, value) => {
    setHorarios(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
    const key = `${field}-${index}`;
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
  };

  /**
 * Agrega un horario nuevo con valores predeterminados (Lunes, 06:00–22:00).
 */
  const addHorario = () => {
    setHorarios(prev => [
      ...prev,
      { id_horario: null, dia: "Lunes", apertura: "06:00", cierre: "22:00" }
    ]);
  };

  /**
 * Elimina el horario en el índice indicado. Si tiene id_horario llama a
 * DELETE "/gym/horarios/:id" antes de quitarlo del estado local.
 * Bloquea la eliminación si solo queda un horario.
 */
  const deleteHorario = async (index) => {
    if (horarios.length === 1) { showToast("Debe existir al menos un horario."); return; }
    const h = horarios[index];
    if (h.id_horario) {
      try {
        await api.delete(`/gym/horarios/${h.id_horario}`);
      } catch (err) {
        console.error(err);
        showToast("No se pudo eliminar el horario.");
        return;
      }
    }
    setHorarios(prev => prev.filter((_, i) => i !== index));
  };

  /**
 * Verifica que la hora de cierre sea estrictamente mayor a la de apertura.
 */
  const horaEsValida = (a, c) => {
    const [h1, m1] = a.split(":").map(Number);
    const [h2, m2] = c.split(":").map(Number);
    return (h2 * 60 + m2) > (h1 * 60 + m1);
  };

  /**
 * Valida todos los horarios verificando campos completos, días únicos y
 * validez de horarios. Si hay errores los muestra por campo e índice.
 * Si son válidos itera sobre los horarios enviando POST para nuevos
 * y PUT para existentes, normalizando el formato de hora a "HH:MM:SS".
 * Muestra Toast de error si alguna petición falla.
 */
  const handleSave = async () => {
    const newErrors = {};

    if (horarios.length === 0) { showToast("Debe existir al menos un horario."); return; }

    const diasUsados = new Set();
    horarios.forEach((h, i) => {
      if (!h.dia) newErrors[`dia-${i}`] = "Selecciona un día";
      if (!h.apertura) newErrors[`apertura-${i}`] = "Selecciona hora de apertura";
      if (!h.cierre) newErrors[`cierre-${i}`] = "Selecciona hora de cierre";
      if (h.apertura && h.cierre && !horaEsValida(h.apertura, h.cierre))
        newErrors[`cierre-${i}`] = "La hora de cierre debe ser mayor";
      if (h.dia) {
        if (diasUsados.has(h.dia)) newErrors[`dia-${i}`] = "Este día ya está registrado";
        diasUsados.add(h.dia);
      }
    });

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      setLoading(true);
      for (const h of horarios) {
        const apertura = h.apertura.length === 5 ? h.apertura + ":00" : h.apertura;
        const cierre = h.cierre.length === 5 ? h.cierre + ":00" : h.cierre;
        if (!h.id_horario) {
          await api.post(`/gym/${gym.id_gimnasio}/horarios`, { dia_semana: h.dia, hora_apertura: apertura, hora_cierre: cierre });
        } else {
          await api.put(`/gym/${gym.id_gimnasio}/horarios/${h.id_horario}`, { dia_semana: h.dia, hora_apertura: apertura, hora_cierre: cierre });
        }
      }
      onUpdated();
      onClose();
    } catch (err) {
      showToast(err?.response?.data?.error || "Error al guardar los horarios.");
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

          <h2 className="modal-title">Editar horarios</h2>

          <div className="horarios-scroll">
            {horarios.map((h, index) => (
              <div key={index} className="horario-row">
                <div className="field-row">

                  <div className="field-group">
                    <label>Día *</label>
                    <select
                      value={h.dia}
                      onChange={e => handleChange(index, "dia", e.target.value)}
                    >
                      <option value="">Seleccionar día</option>
                      {["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"].map(d => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    {errors[`dia-${index}`] && <span className="field-error-msg">{errors[`dia-${index}`]}</span>}
                  </div>

                  <div className="field-group">
                    <label>Apertura *</label>
                    <input
                      type="time"
                      value={h.apertura}
                      onChange={e => handleChange(index, "apertura", e.target.value)}
                    />
                    {errors[`apertura-${index}`] && <span className="field-error-msg">{errors[`apertura-${index}`]}</span>}
                  </div>

                  <div className="field-group">
                    <label>Cierre *</label>
                    <input
                      type="time"
                      value={h.cierre}
                      onChange={e => handleChange(index, "cierre", e.target.value)}
                    />
                    {errors[`cierre-${index}`] && <span className="field-error-msg">{errors[`cierre-${index}`]}</span>}
                  </div>

                  <div className="delete-row">
                    <button className="btn btn-danger" onClick={() => deleteHorario(index)}>
                      Eliminar
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>

          <button className="btn-link-add" onClick={addHorario}>+ Agregar horario</button>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>

        </div>
      </div>
      </ModalPortal>
    </>
  );
}

export default EditHorariosModal;