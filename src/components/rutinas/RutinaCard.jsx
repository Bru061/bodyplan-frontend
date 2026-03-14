import { useState } from "react";
import api from "../../services/axios";
import Toast from "../ui/Toast";

function RutinaCard({ rutina, onEdit, clientesCount, refresh, refreshStats }) {

  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const esActiva = rutina.activo;
  const tieneAsignacionesActivas = esActiva && clientesCount > 0;

  const handleIntentarDesactivar = () => {
    if (tieneAsignacionesActivas) {
      setToast(
        `No puedes desactivar esta rutina porque tiene ${clientesCount} cliente${clientesCount > 1 ? "s" : ""} con asignación activa.`
      );
      return;
    }
    setModal(true);
  };

  const handleToggle = async () => {
    setModal(false);
    setLoading(true);

    try {
      if (esActiva) {
        await api.put(`/rutinas/${rutina.id_rutina}/desactivar`);
      } else {
        await api.put(`/rutinas/${rutina.id_rutina}/activar`);
      }
      refresh();
      refreshStats();
    } catch (error) {
      console.error("Error cambiando estado de rutina", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (esActiva ? "No se pudo desactivar la rutina" : "No se pudo activar la rutina");
      setToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <div className="routine-item">

        {modal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">
                {esActiva ? "Desactivar rutina" : "Activar rutina"}
              </h3>
              <p className="modal-body">
                {esActiva
                  ? `¿Deseas desactivar "${rutina.nombre}"? No podrá asignarse a nuevos clientes.`
                  : `¿Deseas activar "${rutina.nombre}"?`}
              </p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setModal(false)}>
                  Cancelar
                </button>
                <button
                  className={esActiva ? "btn btn-danger" : "btn btn-success"}
                  onClick={handleToggle}
                >
                  {esActiva ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2>{rutina.nombre}</h2>
          <p>{rutina.descripcion}</p>
          <p>
            Nivel: {rutina.nivel || "N/A"} ·
            Duración: {rutina.duracion_min || 0} min ·
            Tipo: {rutina.tipo_rutina} ·
            Categoría: {rutina.categoria}
          </p>
          <p>Instrucciones: {rutina.instrucciones}</p>
          <p className="routine-meta">
            Clientes con asignación activa: <strong>{clientesCount}</strong>
          </p>
        </div>

        <div className="routine-actions">
          <button
            className="btn btn-ghost"
            onClick={() => onEdit(rutina)}
            disabled={loading}
          >
            Editar
          </button>
          <button
            className={esActiva ? "btn btn-danger" : "btn btn-success"}
            onClick={esActiva ? handleIntentarDesactivar : () => setModal(true)}
            disabled={loading}
          >
            {loading ? "Procesando..." : esActiva ? "Desactivar" : "Activar"}
          </button>
        </div>

      </div>
    </>
  );
}

export default RutinaCard;