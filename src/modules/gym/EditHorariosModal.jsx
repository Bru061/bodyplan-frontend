import { useEffect, useState } from "react";
import api from "../../services/axios";
import Toast from "../../components/ui/Toast";

function EditHorariosModal({ gym, onClose, onUpdated }) {

  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null); 

  const showToast = (message, type = "error") => setToast({ message, type });

  useEffect(() => {
    const keys = Object.keys(errors);
    if (keys.length === 0) return;

    const field = document.querySelector(`[name="${keys[0]}"]`);
    if (!field) return;

    const rect = field.getBoundingClientRect();
    const offset = window.scrollY + rect.top - 120;
    window.scrollTo({ top: offset, behavior: "smooth" });
    field.focus?.();
  }, [errors]);

  useEffect(() => {
    if (!gym) return;

    if (gym.horarios && gym.horarios.length > 0) {
      setHorarios(
        gym.horarios.map(h => ({
          id_horario: h.id_horario,
          dia: h.dia_semana,
          apertura: h.hora_apertura?.slice(0, 5),
          cierre: h.hora_cierre?.slice(0, 5)
        }))
      );
    } else {
      setHorarios([{ dia: "", apertura: "", cierre: "" }]);
    }
  }, [gym]);

  const handleChange = (index, field, value) => {
    const copia = [...horarios];
    copia[index][field] = value;
    setHorarios(copia);

    const key = `${field}-${index}`;
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: "" }));
    }
  };

  const addHorario = () => {
    setHorarios([
      ...horarios,
      { id_horario: null, dia: "Lunes", apertura: "06:00", cierre: "22:00", nuevo: true }
    ]);
  };

  const deleteHorario = async (index) => {
    if (horarios.length === 1) {
      showToast("Debe existir al menos un horario.");
      return;
    }

    const h = horarios[index];

    if (h.id_horario) {
      try {
        await api.delete(`/gym/horarios/${h.id_horario}`);
      } catch (err) {
        console.error("Error eliminando horario", err);
        showToast("No se pudo eliminar el horario.");
        return;
      }
    }

    setHorarios(horarios.filter((_, i) => i !== index));
  };

  const horaEsValida = (apertura, cierre) => {
    const [h1, m1] = apertura.split(":").map(Number);
    const [h2, m2] = cierre.split(":").map(Number);
    return (h2 * 60 + m2) > (h1 * 60 + m1);
  };

  const handleSave = async () => {
    let newErrors = {};
    setError("");

    if (horarios.length === 0) {
      showToast("Debe existir al menos un horario.");
      return;
    }

    const diasUsados = new Set();

    horarios.forEach((h, i) => {
      if (!h.dia)
        newErrors[`dia-${i}`] = "Selecciona un día";

      if (!h.apertura)
        newErrors[`apertura-${i}`] = "Selecciona hora de apertura";

      if (!h.cierre)
        newErrors[`cierre-${i}`] = "Selecciona hora de cierre";

      if (h.apertura && h.cierre && !horaEsValida(h.apertura, h.cierre))
        newErrors[`cierre-${i}`] = "La hora de cierre debe ser mayor";

      if (h.dia) {
        if (diasUsados.has(h.dia))
          newErrors[`dia-${i}`] = "Este día ya está registrado";
        diasUsados.add(h.dia);
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      for (const h of horarios) {
        const apertura = h.apertura.length === 5 ? h.apertura + ":00" : h.apertura;
        const cierre = h.cierre.length === 5 ? h.cierre + ":00" : h.cierre;

        if (!h.id_horario) {
          await api.post(`/gym/${gym.id_gimnasio}/horarios`, {
            dia_semana: h.dia,
            hora_apertura: apertura,
            hora_cierre: cierre
          });
        } else {
          await api.put(`/gym/${gym.id_gimnasio}/horarios/${h.id_horario}`, {
            dia_semana: h.dia,
            hora_apertura: apertura,
            hora_cierre: cierre
          });
        }
      }

      onUpdated();
      onClose();

    } catch (err) {
      const backendError = err?.response?.data?.error;
      showToast(backendError || "Error al guardar los horarios.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="modal-overlay">
        <div className="modal-card modal-lg">

          <h2 className="modal-title">Editar horarios</h2>

          {error && <div className="modal-error">{error}</div>}

          <div className="horario-row">
            {horarios.map((h, index) => (
              <div key={index} className="field-row">

                <div className="field-group">
                  <label>Día *</label>
                  <select
                    name={`dia-${index}`}
                    value={h.dia}
                    onChange={e => handleChange(index, "dia", e.target.value)}
                  >
                    <option value="">Seleccionar día</option>
                    <option>Lunes</option>
                    <option>Martes</option>
                    <option>Miercoles</option>
                    <option>Jueves</option>
                    <option>Viernes</option>
                    <option>Sabado</option>
                    <option>Domingo</option>
                  </select>
                  {errors[`dia-${index}`] && (
                    <p className="text-red-500 text-sm">{errors[`dia-${index}`]}</p>
                  )}
                </div>

                <div className="field-group">
                  <label>Apertura *</label>
                  <input
                    name={`apertura-${index}`}
                    type="time"
                    value={h.apertura}
                    onChange={e => handleChange(index, "apertura", e.target.value)}
                  />
                  {errors[`apertura-${index}`] && (
                    <p className="text-red-500 text-sm">{errors[`apertura-${index}`]}</p>
                  )}
                </div>

                <div className="field-group">
                  <label>Cierre *</label>
                  <input
                    name={`cierre-${index}`}
                    type="time"
                    value={h.cierre}
                    onChange={e => handleChange(index, "cierre", e.target.value)}
                  />
                  {errors[`cierre-${index}`] && (
                    <p className="text-red-500 text-sm">{errors[`cierre-${index}`]}</p>
                  )}
                </div>

                <div className="delete-row">
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteHorario(index)}
                  >
                    Eliminar
                  </button>
                </div>

              </div>
            ))}
          </div>

          <button className="btn-link-add" onClick={addHorario}>
            + Agregar horario
          </button>

          <div className="modal-actions">
            <button className="btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default EditHorariosModal;