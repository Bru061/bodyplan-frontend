import { useEffect, useState } from "react";
import api from "../../services/axios";

function EditHorariosModal({ gym, onClose, onUpdated }) {

  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);

// CARGAR HORARIOS EXISTENTES
useEffect(() => {
  if (!gym) return;

  if (gym.horarios && gym.horarios.length > 0) {
    setHorarios(
      gym.horarios.map(h => ({
        id_horario: h.id_horario, 
        dia: h.dia_semana,
        apertura: h.hora_apertura?.slice(0,5),
        cierre: h.hora_cierre?.slice(0,5)
      }))
    );
  } else {
    setHorarios([{ dia: "", apertura: "", cierre: "" }]);
  }

}, [gym]);

// CAMBIOS INPUT
const handleChange = (index, field, value) => {
    const copia = [...horarios];
    copia[index][field] = value;
    setHorarios(copia);
  };


  // AGREGAR HORARIO
  const addHorario = () => {
    setHorarios([
      ...horarios,
      {
        id_horario: null,
        dia: "Lunes",
        apertura: "06:00",
        cierre: "22:00",
        nuevo: true
      }
    ]);
  };

  const deleteHorario = async (index) => {
    const h = horarios[index];


    if (h.id_horario) {
      try {
        await api.delete(`/gym/horarios/${h.id_horario}`);
      } catch (err) {
        console.error("Error eliminando horario", err);
      }
    }

    const copia = horarios.filter((_, i) => i !== index);
    setHorarios(copia);
  };

const handleSave = async () => {
  try {
    setLoading(true);

    for (const h of horarios) {

      const apertura = h.apertura.length === 5 ? h.apertura + ":00" : h.apertura;
      const cierre = h.cierre.length === 5 ? h.cierre + ":00" : h.cierre;

      // NUEVO
      if (h.id_horario === null) {
        await api.post(`/gym/${gym.id_gimnasio}/horarios`, {
          dia_semana: h.dia,
          hora_apertura: apertura,
          hora_cierre: cierre
        });
      }

      // EDITAR
      else {
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
    console.error("Error guardando horarios", err.response?.data || err);
    alert("Error al guardar horarios");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-lg">

        <h2 className="modal-title">Editar horarios</h2>

        <div className="horario-row">

          {horarios.map((h, index) => (
            <div key={index} className="field-row">

            <div className="field-group">
              <label>Día</label>
              <select
                value={h.dia}
                onChange={e => handleChange(index, "dia", e.target.value)}
              >
                <option>Lunes</option>
                <option>Martes</option>
                <option>Miercoles</option>
                <option>Jueves</option>
                <option>Viernes</option>
                <option>Sabado</option>
                <option>Domingo</option>
              </select>
            </div>

            <div className="field-group">
              <label>Apertura</label>
              <input
                type="time"
                value={h.apertura}
                onChange={e => handleChange(index, "apertura", e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Cierre</label>
              <input
                type="time"
                value={h.cierre}
                onChange={e => handleChange(index, "cierre", e.target.value)}
              />
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

        {/* AGREGAR */}
        <button
          className="btn-link-add"
          onClick={addHorario}
        >
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
  );
}

export default EditHorariosModal;