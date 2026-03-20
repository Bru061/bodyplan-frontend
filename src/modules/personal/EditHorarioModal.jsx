import { useState } from "react";
import api from "../../services/axios";
import ModalPortal from "../../components/ui/ModalPortal";

function EditHorarioModal({ data, onClose, onUpdated }) {

  const [form, setForm] = useState({
    hora_entrada: data.hora_entrada?.slice(0, 5) || "",
    hora_salida:  data.hora_salida?.slice(0, 5)  || ""
  });

  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const horaEsValida = (entrada, salida) => {
    if (!entrada || !salida) return { valida: false, msg: "" };
    const [h1, m1] = entrada.split(":").map(Number);
    const [h2, m2] = salida.split(":").map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff <= 0)   return { valida: false, msg: "La hora de salida debe ser mayor a la entrada" };
    if (diff < 180)  return { valida: false, msg: "El turno debe ser de mínimo 3 horas" };
    return { valida: true, msg: "" };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!form.hora_entrada) newErrors.hora_entrada = "Indica la hora de entrada";
    if (!form.hora_salida)  newErrors.hora_salida  = "Indica la hora de salida";
    if (form.hora_entrada && form.hora_salida) {
      const { valida, msg } = horaEsValida(form.hora_entrada, form.hora_salida);
      if (!valida) newErrors.hora_salida = msg;
    }

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      setLoading(true);
      setError("");

      const toTime = (t) => t.length === 5 ? t + ":00" : t;

      await api.put(
        `/personal/${data.personalId}/gimnasios/${data.gimnasioId}/${data.dia}`,
        {
          hora_entrada: toTime(form.hora_entrada),
          hora_salida:  toTime(form.hora_salida)
        }
      );

      onUpdated();
      onClose();

    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Error actualizando horario"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="modal-overlay">
        <div className="modal-card">

          <h2 className="modal-title">Editar horario</h2>

          <span style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
            {data.dia}
          </span>

          {error && <div className="modal-error" style={{ marginTop: "12px" }}>{error}</div>}

          <div className="modal-form" style={{ marginTop: "1rem" }}>
            <div className="modal-grid">

              <div className="form-group">
                <label>Hora entrada *</label>
                <input
                  type="time"
                  name="hora_entrada"
                  value={form.hora_entrada}
                  onChange={handleChange}
                />
                {errors.hora_entrada && <span className="field-error-msg">{errors.hora_entrada}</span>}
              </div>

              <div className="form-group">
                <label>Hora salida *</label>
                <input
                  type="time"
                  name="hora_salida"
                  value={form.hora_salida}
                  onChange={handleChange}
                />
                {errors.hora_salida && <span className="field-error-msg">{errors.hora_salida}</span>}
              </div>

            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>

        </div>
      </div>
    </ModalPortal>
  );
}

export default EditHorarioModal;