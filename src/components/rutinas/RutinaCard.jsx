import { useState, useEffect } from "react";
import api from "../../services/axios";
import Toast from "../ui/Toast";
import ModalPortal from "../ui/ModalPortal";

function RutinaCard({ rutina, onEdit, clientesCount, refresh, refreshStats }) {

  const tipo = (rutina.tipo_rutina || "").toString().toLowerCase();
  const esPersonalizada = tipo.includes("personal");

  if (esPersonalizada && clientesCount === 0) {
    return null;
  }

  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [instructores, setInstructores] = useState([]);
  const [clientesAsignados, setClientesAsignados] = useState([]);
  const esActiva = rutina.activo;
  const tieneAsignacionesActivas = esActiva && clientesCount > 0;

  useEffect(() => {
    const fetchInstructores = async () => {
      try {
        const res = await api.get(`/rutinas/${rutina.id_rutina}/clientes`);
        const asignaciones = res.data?.clientes || [];
        const mapa = {};
        const clientesMap = {};
        for (const a of asignaciones) {
          if (a.encargado && !mapa[a.encargado.id_personal]) {
            mapa[a.encargado.id_personal] = [
              a.encargado.nombre,
              a.encargado.apellido_paterno
            ].filter(Boolean).join(" ");
          }
          const cliente = a.cliente || a.usuario || a.Cliente || a.Usuario || null;
          const nombreCliente = [cliente?.nombre, cliente?.apellido_paterno].filter(Boolean).join(" ").trim();
          if (nombreCliente) clientesMap[nombreCliente.toLowerCase()] = nombreCliente;
        }
        setInstructores(Object.values(mapa));
        setClientesAsignados(Object.values(clientesMap));
      } catch (err) {
      }
    };

    if (esActiva) fetchInstructores();
  }, [rutina.id_rutina, esActiva]);

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
          <ModalPortal>
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
          </ModalPortal>
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

          {clientesAsignados.length > 0 && (
            <p className="routine-instructor">
              👥 Clientes: <strong>{clientesAsignados.slice(0, 4).join(", ")}{clientesAsignados.length > 4 ? ` +${clientesAsignados.length - 4}` : ""}</strong>
            </p>
          )}          

          {instructores.length > 0 && (
            <p className="routine-instructor">
              👤 {instructores.length === 1 ? "Instructor:" : "Instructores:"}{" "}
              <strong>{instructores.join(", ")}</strong>
            </p>
          )}
        </div>

        <div className="routine-actions">
          <button className="btn btn-ghost" onClick={() => onEdit(rutina)} disabled={loading}>
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
