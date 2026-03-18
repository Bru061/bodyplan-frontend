import DashboardLayout from "../../layout/DashboardLayout";
import "../../styles/clientes.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/axios";
import LoadingScreen from "../../components/ui/LoadingScreen";
import ModalPortal from "../../components/ui/ModalPortal";
import AssignRutinaModal from "./AssignRutinaModal";

function DetalleCliente() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [rutinas, setRutinas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [gymError, setGymError] = useState("");

  const fetchRutinasCliente = async () => {
    try {
      const res = await api.get("/rutinas");
      const todasRutinas = res.data.rutinas || [];
      const rutinasCliente = [];

      for (const rutina of todasRutinas) {
        try {
          const r = await api.get(`/rutinas/${rutina.id_rutina}/clientes`);
          const asignaciones = r.data.clientes || [];

          const pertenece = asignaciones.find(a =>
            a.id_usuario === cliente?.id ||
            a.Usuario?.id_usuario === cliente?.id
          );

          if (pertenece) {
            const enc = pertenece.encargado;
            const encargadoNombre = enc
              ? [enc.nombre, enc.apellido_paterno].filter(Boolean).join(" ")
              : null;

            rutinasCliente.push({
              ...rutina,
              estado: pertenece.estado,
              id_asignacion: pertenece.id_usuario_rutina,
              encargadoNombre
            });
          }
        } catch (err) {
          console.error("Error obteniendo clientes de rutina", err);
        }
      }

      setRutinas(rutinasCliente);
    } catch (err) {
      console.error("Error cargando rutinas del cliente", err);
    }
  };

  useEffect(() => {
    const cargarCliente = async () => {
      try {
        const res = await api.get(`/clientes/${id}`);
        const data = res.data.cliente;
        const usuario = data.usuario;
        const suscripcion = data.suscripciones?.find(s => s.estado === "activa");

        setHistorial(data.suscripciones || []);
        setCliente({
          id: usuario.id_usuario,
          id_gimnasio: suscripcion?.gimnasio?.id_gimnasio,
          nombre: usuario.nombre,
          email: usuario.correo,
          telefono: usuario.telefono,
          gimnasio: suscripcion?.gimnasio?.nombre || "Sin gimnasio",
          fechaRegistro: suscripcion
            ? new Date(suscripcion.fecha_inicio).toLocaleDateString()
            : "Sin registro",
          membresia: suscripcion?.membresia?.nombre || "Sin membresía",
          estado: suscripcion?.estado === "activa" ? "Activo" : "Inactivo"
        });
      } catch (error) {
        console.error("Error cargando cliente", error);
      }
    };
    cargarCliente();
  }, [id]);

  useEffect(() => {
    if (cliente) fetchRutinasCliente();
  }, [cliente]);

  const handleCancelar = async () => {
    if (!confirmModal) return;
    try {
      setCancelando(true);
      setCancelError("");
      await api.delete(`/rutinas/asignacion/${confirmModal.id_asignacion}`);
      setConfirmModal(null);
      await fetchRutinasCliente();
    } catch (err) {
      setCancelError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error cancelando la rutina"
      );
    } finally {
      setCancelando(false);
    }
  };

  if (!cliente) return <LoadingScreen message="Cargando información del cliente..." />;

  const rutinasCompletadas = rutinas.filter(r => r.estado === "completada").length;

  return (
    <DashboardLayout>

      <section className="page-header">
        <div className="page-header-row">
          <button className="back-button" onClick={() => navigate(-1)}>←</button>
          <div>
            <p className="eyebrow">Detalle de cliente</p>
            <h1>{cliente.nombre}</h1>
            <p className="subtitle">Información general, membresía y rutinas asignadas.</p>
          </div>
        </div>
      </section>

      <section className="client-grid">

        <article className="panel client-info">
          <h2>Información del cliente</h2>
          <div className="info-row"><span>Correo</span><span>{cliente.email}</span></div>
          <div className="info-row"><span>Teléfono</span><span>{cliente.telefono || "No registrado"}</span></div>
          <div className="info-row"><span>Gimnasio</span><span>{cliente.gimnasio}</span></div>
          <div className="info-row"><span>Miembro desde</span><span>{cliente.fechaRegistro}</span></div>
          <div className="info-row"><span>Membresía</span><span>{cliente.membresia}</span></div>
          <div className="info-row">
            <span>Estado</span>
            <span className={`badge ${cliente.estado === "Activo" ? "badge-success" : "badge-danger"}`}>
              {cliente.estado}
            </span>
          </div>
        </article>

        <article className="panel client-stats">
          <h2>Actividad</h2>
          <div className="stat-box">
            <p className="stat-number">{rutinas.length}</p>
            <span>Rutinas asignadas</span>
          </div>
          <div className="stat-box">
            <p className="stat-number">{rutinasCompletadas}</p>
            <span>Rutinas completadas</span>
          </div>
        </article>

      </section>

      <article className="panel">
        <h2>Historial de suscripciones</h2>
        {historial.length === 0 ? (
          <p className="empty-state">Este cliente no tiene suscripciones registradas.</p>
        ) : (
          historial.map((s, index) => (
            <div className="row-item" key={index}>
              <div>
                <strong>{s.gimnasio.nombre}</strong> — {s.membresia?.nombre || "Sin membresía"}
                <p>Inicio: {new Date(s.fecha_inicio).toLocaleDateString()}</p>
              </div>
              <span className={`badge ${s.estado === "activa" ? "badge-success" : "badge-danger"}`}>
                {s.estado}
              </span>
            </div>
          ))
        )}
      </article>

      <article className="panel routines-panel">
        <div className="panel-head">
          <h2>Rutinas asignadas</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!cliente.id_gimnasio) {
                setGymError("El cliente no tiene gimnasio activo");
                return;
              }
              setGymError("");
              setShowAssignModal(true);
            }}
          >
            Asignar rutina
          </button>
        </div>

        {gymError && (
          <div className="modal-error" style={{ marginBottom: "12px" }}>{gymError}</div>
        )}

        {rutinas.length === 0 ? (
          <p className="empty-state">Este cliente aún no tiene rutinas asignadas.</p>
        ) : (
          rutinas.map(rutina => (
            <div className="routine-card" key={rutina.id_asignacion ?? rutina.id_rutina}>
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

                {rutina.encargadoNombre && (
                  <p className="routine-instructor">
                    👤 Instructor: <strong>{rutina.encargadoNombre}</strong>
                  </p>
                )}
              </div>

              <div className="routine-card-actions">
                <span className="badge badge-secondary">{rutina.estado}</span>
                {(rutina.estado === "pendiente" || rutina.estado === "iniciada") && (
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setCancelError("");
                      setConfirmModal({ id_asignacion: rutina.id_asignacion, nombre: rutina.nombre });
                    }}
                  >
                    Cancelar rutina
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </article>

      {showAssignModal && (
        <AssignRutinaModal
          cliente={cliente}
          onClose={() => setShowAssignModal(false)}
          onAssigned={fetchRutinasCliente}
        />
      )}

      {confirmModal && (
        <ModalPortal>
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">Cancelar rutina</h3>
              <p className="modal-body">
                ¿Estás seguro de que deseas cancelar la rutina
                <strong> {confirmModal.nombre}</strong> para este cliente?
                Esta acción no se puede deshacer.
              </p>
              {cancelError && (
                <div className="modal-error" style={{ marginBottom: "12px" }}>{cancelError}</div>
              )}
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => { setConfirmModal(null); setCancelError(""); }}
                  disabled={cancelando}
                >
                  Volver
                </button>
                <button className="btn btn-danger" onClick={handleCancelar} disabled={cancelando}>
                  {cancelando ? "Cancelando..." : "Sí, cancelar"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

    </DashboardLayout>
  );
}

export default DetalleCliente;