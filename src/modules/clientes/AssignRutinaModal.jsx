import { useEffect, useState } from "react";
import api from "../../services/axios";
import "../../styles/rutinas.css";

function AssignRutinaModal({ cliente, onClose, onAssigned }) {

  const [rutinas, setRutinas] = useState([]);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hoy = new Date().toISOString().split("T")[0];
  const maxFecha = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split("T")[0];
  })();

  useEffect(() => {

    const fetchRutinas = async () => {
      try {
        const res = await api.get("/rutinas");
        setRutinas(res.data.rutinas || res.data);
      } catch (err) {
        console.error("Error cargando rutinas:", err);
      }
    };

    fetchRutinas();

  }, []);

  const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");

    if (!rutinaSeleccionada || !fechaLimite) {
      setError("Debes seleccionar una rutina y una fecha límite");
      return;
    }

    if (fechaLimite > maxFecha) {
      setError("La fecha límite no puede ser mayor a 3 meses");
      return;
    }

    if (!cliente?.id_gimnasio) {
      setError("Este cliente no tiene un gimnasio asociado");
      return;
    }

    try {

      setLoading(true);

      const payload = {
        id_rutina: parseInt(rutinaSeleccionada),
        id_usuario: cliente.id,
        id_gimnasio: cliente.id_gimnasio,
        fecha_limite: fechaLimite
      };

      await api.post("/rutinas/asignar", payload);

      onAssigned();
      onClose();

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "No se pudo asignar la rutina"
      );

    } finally {
      setLoading(false);
    }

  };

  return (

    <div className="modal-overlay">
      <div className="modal-card">

        <h2 className="modal-title">Asignar rutina</h2>
        <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {cliente.nombre}
        </span>

        {error && (
          <div className="modal-error" style={{ marginTop: "12px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="modal-grid" style={{ marginTop: "16px" }}>

            <div>
              <label>Rutina *</label>
              {rutinas.length === 0 ? (
                <p className="empty-state">Aún no has creado rutinas.</p>
              ) : (
                <select
                  value={rutinaSeleccionada}
                  onChange={(e) => {
                    setRutinaSeleccionada(e.target.value);
                    setError("");
                  }}
                  required
                >
                  <option value="">Seleccionar rutina</option>
                  {rutinas.map((r, index) => (
                    <option key={`${r.id_rutina}-${index}`} value={r.id_rutina}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label>Fecha límite *</label>
              <input
                type="date"
                value={fechaLimite}
                onChange={(e) => {
                  setFechaLimite(e.target.value);
                  setError("");
                }}
                min={hoy}
                max={maxFecha}
                required
              />
              <span style={{
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                marginTop: "4px",
                display: "block"
              }}>
                Máximo 3 meses desde hoy
              </span>
            </div>

          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Asignando..." : "Asignar"}
            </button>
          </div>

        </form>

      </div>
    </div>

  );

}

export default AssignRutinaModal;