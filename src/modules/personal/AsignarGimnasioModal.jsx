import { useState, useEffect } from "react";
import api from "../../services/axios";
import ModalPortal from "../../components/ui/ModalPortal";

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

function AsignarGimnasioModal({ personal, onClose, onAsignado }) {

  const [gimnasios, setGimnasios] = useState([]);
  const [form, setForm] = useState({
    id_gimnasio: "",
    dia_semana:  "",
    hora_entrada: "",
    hora_salida:  ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGimnasios = async () => {
      try {
        const res = await api.get("/gym");
        setGimnasios(res.data.gimnasios || []);
      } catch (err) {
        console.error("Error cargando gimnasios", err);
      }
    };
    fetchGimnasios();
  }, []);

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

    if (!form.id_gimnasio) newErrors.id_gimnasio = "Selecciona un gimnasio";
    if (!form.dia_semana)  newErrors.dia_semana  = "Selecciona un día";
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

      await api.post(`/personal/${personal.id_personal}/gimnasios`, {
        id_gimnasio:  Number(form.id_gimnasio),
        dia_semana:   form.dia_semana,
        hora_entrada: toTime(form.hora_entrada),
        hora_salida:  toTime(form.hora_salida)
      });

      onAsignado();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Error asignando al gimnasio"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="modal-overlay">
        <div className="modal-card">

          <h2 className="modal-title">Asignar a gimnasio</h2>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
            {[personal.nombre, personal.apellido_paterno].filter(Boolean).join(" ")}
          </span>

          {error && <div className="modal-error" style={{ marginTop: "12px" }}>{error}</div>}

          <div className="modal-form" style={{ marginTop: "1rem" }}>

            <div className="form-group">
              <label>Gimnasio *</label>
              <select name="id_gimnasio" value={form.id_gimnasio} onChange={handleChange}>
                <option value="">Seleccionar gimnasio</option>
                {gimnasios.map(g => (
                  <option key={g.id_gimnasio} value={g.id_gimnasio}>{g.nombre}</option>
                ))}
              </select>
              {errors.id_gimnasio && <span className="field-error-msg">{errors.id_gimnasio}</span>}
            </div>

            <div className="form-group">
              <label>Día *</label>
              <select name="dia_semana" value={form.dia_semana} onChange={handleChange}>
                <option value="">Seleccionar día</option>
                {DIAS.map(d => <option key={d}>{d}</option>)}
              </select>
              {errors.dia_semana && <span className="field-error-msg">{errors.dia_semana}</span>}
            </div>

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

            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
              Para asignar varios días repite el proceso una vez por cada día.
            </p>

          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Asignando..." : "Asignar"}
            </button>
          </div>

        </div>
      </div>
    </ModalPortal>
  );
}

export default AsignarGimnasioModal;