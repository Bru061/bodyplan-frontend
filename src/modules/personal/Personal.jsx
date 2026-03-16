import { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import api from "../../services/axios";
import "../../styles/personal.css";
import { FiPlus, FiEdit2, FiTrash2, FiUserPlus } from "react-icons/fi";
import { MdPerson } from "react-icons/md";
import Toast from "../../components/ui/Toast";
import ModalPortal from "../../components/ui/ModalPortal";
import CreatePersonalModal from "./CreatePersonalModal";
import EditPersonalModal from "./EditPersonalModal";
import AsignarGimnasioModal from "./AsignarGimnasioModal";

// ── Iniciales del nombre ──
const getInitials = (p) =>
  `${p.nombre?.[0] ?? ""}${p.apellido_paterno?.[0] ?? ""}`.toUpperCase();

// ── Nombre completo ──
const getNombre = (p) =>
  [p.nombre, p.apellido_paterno, p.apellido_materno].filter(Boolean).join(" ");

function Personal() {

  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("activos");
  const [seleccionado, setSeleccionado] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Modales ──
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAsignar, setShowAsignar] = useState(false);
  const [editHorario, setEditHorario] = useState(null); // { personal, gimnasioId, dia, entrada, salida }

  // ── Modal confirmación desactivar ──
  const [confirmModal, setConfirmModal] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchPersonal = async () => {
    try {
      setLoading(true);
      const res = await api.get("/personal");
      setPersonal(res.data.personal || []);
    } catch (err) {
      console.error("Error cargando personal", err);
      showToast("Error cargando el personal.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonal();
  }, []);

  const [rutinasInstructor, setRutinasInstructor] = useState([]);
  const [loadingRutinas, setLoadingRutinas] = useState(false);

  const fetchRutinasInstructor = async (personalId) => {
    try {
      setLoadingRutinas(true);
      const res = await api.get("/rutinas");
      const todas = res.data.rutinas || [];
      const resultado = [];

      for (const r of todas) {
        const clientesRes = await api.get(`/rutinas/${r.id_rutina}/clientes`);
        const asignaciones = clientesRes.data?.clientes || [];
        const tieneEsteInstructor = asignaciones.some(
          a => a.encargado?.id_personal === personalId
        );
        if (tieneEsteInstructor) resultado.push(r);
      }

      setRutinasInstructor(resultado);
    } catch (err) {
      console.error("Error cargando rutinas del instructor", err);
    } finally {
      setLoadingRutinas(false);
    }
  };

  // ── Cargar rutinas al cambiar el seleccionado ──
  useEffect(() => {
    if (seleccionado) {
      fetchRutinasInstructor(seleccionado.id_personal);
    } else {
      setRutinasInstructor([]);
    }
  }, [seleccionado?.id_personal]);

  const activos    = personal.filter(p => p.activo !== false);
  const inactivos  = personal.filter(p => p.activo === false);
  const listaActual = tab === "activos" ? activos : inactivos;

  // ── Desactivar / activar ──
  const handleToggle = async () => {
    if (!confirmModal) return;
    const { item, accion } = confirmModal;

    // ── Bloquear desactivación si tiene rutinas activas ──
    if (accion === "desactivar" && rutinasInstructor.length > 0) {
      showToast(
        `No puedes desactivar a ${getNombre(item)} porque supervisa ${rutinasInstructor.length} rutina${rutinasInstructor.length > 1 ? "s" : ""} activa${rutinasInstructor.length > 1 ? "s" : ""}.`,
        "error"
      );
      setConfirmModal(null);
      return;
    }

    try {
      setConfirmLoading(true);
      const endpoint = accion === "desactivar"
        ? `/personal/${item.id_personal}/desactivar`
        : `/personal/${item.id_personal}/activar`;
      await api.patch(endpoint);
      showToast(`Instructor ${accion === "desactivar" ? "desactivado" : "activado"} correctamente.`);
      setConfirmModal(null);
      if (seleccionado?.id_personal === item.id_personal) setSeleccionado(null);
      await fetchPersonal();
    } catch (err) {
      console.error(err);
      showToast("No se pudo cambiar el estado.", "error");
    } finally {
      setConfirmLoading(false);
    }
  };

  // ── Eliminar horario de un día ──
  const handleEliminarDia = async (personalId, gimnasioId, dia) => {
    try {
      await api.delete(`/personal/${personalId}/gimnasios/${gimnasioId}/${dia}`);
      showToast("Horario eliminado correctamente.");
      await fetchPersonal();
    } catch (err) {
      console.error(err);
      showToast("No se pudo eliminar el horario.", "error");
    }
  };

  return (
    <DashboardLayout>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <section className="page-header">
        <div>
          <p className="eyebrow">Gestión de personal</p>
          <h1>Instructores</h1>
          <p className="subtitle">
            Administra tu equipo de instructores y sus horarios por gimnasio.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <FiPlus /> Agregar instructor
        </button>
      </section>

      {/* ── Layout split ── */}
      <div className="personal-layout">

        {/* ── Lista ── */}
        <div className="personal-list">
          <div className="personal-tabs">
            <button
              className={`personal-tab ${tab === "activos" ? "active" : ""}`}
              onClick={() => setTab("activos")}
            >
              Activos ({activos.length})
            </button>
            <button
              className={`personal-tab ${tab === "inactivos" ? "active" : ""}`}
              onClick={() => setTab("inactivos")}
            >
              Inactivos ({inactivos.length})
            </button>
          </div>

          <div className="personal-items">
            {loading ? (
              <p className="personal-empty">Cargando...</p>
            ) : listaActual.length === 0 ? (
              <p className="personal-empty">
                No hay instructores {tab === "activos" ? "activos" : "inactivos"}.
              </p>
            ) : (
              listaActual.map(p => (
                <div
                  key={p.id_personal}
                  className={`personal-item ${seleccionado?.id_personal === p.id_personal ? "selected" : ""}`}
                  onClick={() => setSeleccionado(p)}
                >
                  <div className="personal-item-avatar">{getInitials(p)}</div>
                  <div className="personal-item-info">
                    <p className="personal-item-name">{getNombre(p)}</p>
                    <p className="personal-item-gyms">
                      {p.horarios?.length > 0
                        ? `${[...new Set(p.horarios.map(h => h.id_gimnasio))].length} gimnasio(s) asignado(s)`
                        : "Sin gimnasio asignado"}
                    </p>
                  </div>
                  <div className="personal-item-badge">
                    <span className={`badge ${p.activo !== false ? "badge-success" : "badge-danger"}`}>
                      {p.activo !== false ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Panel detalle ── */}
        <div className="personal-detail">
          {!seleccionado ? (
            <div className="personal-detail-empty">
              <MdPerson size={40} color="var(--border)" />
              <p>Selecciona un instructor para ver su detalle</p>
            </div>
          ) : (
            <>
              <div className="personal-detail-header">
                <div className="personal-detail-header-left">
                  <div className="personal-detail-avatar">{getInitials(seleccionado)}</div>
                  <div>
                    <p className="personal-detail-name">{getNombre(seleccionado)}</p>
                    <span className={`badge ${seleccionado.activo !== false ? "badge-success" : "badge-danger"}`}>
                      {seleccionado.activo !== false ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                <div className="personal-detail-actions">
                  <button
                    className="btn btn-ghost"
                    title="Editar datos"
                    onClick={() => setShowEdit(true)}
                  >
                    <FiEdit2 size={15} /> Editar
                  </button>
                  <button
                    className="btn btn-ghost"
                    title="Asignar a gimnasio"
                    onClick={() => setShowAsignar(true)}
                  >
                    <FiUserPlus size={15} /> Asignar gimnasio
                  </button>
                  <button
                    className={`btn ${seleccionado.activo !== false ? "btn-danger" : "btn-success"}`}
                    onClick={() => setConfirmModal({
                      item: seleccionado,
                      accion: seleccionado.activo !== false ? "desactivar" : "activar"
                    })}
                  >
                    {seleccionado.activo !== false ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>

              <div className="personal-detail-body">

                {/* ── Horarios agrupados por gimnasio ── */}
                {!seleccionado.horarios || seleccionado.horarios.length === 0 ? (
                  <p className="personal-no-gyms">
                    Este instructor aún no está asignado a ningún gimnasio.
                  </p>
                ) : (
                  (() => {
                    // Agrupar horarios por gimnasio
                    const porGimnasio = seleccionado.horarios.reduce((acc, h) => {
                      const key = h.id_gimnasio;
                      if (!acc[key]) acc[key] = { nombre: h.Gimnasio?.nombre || `Gimnasio ${key}`, dias: [] };
                      acc[key].dias.push(h);
                      return acc;
                    }, {});

                    return Object.entries(porGimnasio).map(([gymId, { nombre, dias }]) => (
                      <div key={gymId} className="personal-gym-section">
                        <div className="personal-gym-title">
                          <span>{nombre}</span>
                          <button onClick={() => setShowAsignar(true)}>+ Agregar día</button>
                        </div>
                        {dias.map((h, i) => (
                          <div key={i} className="personal-horario-row">
                            <span className="personal-horario-dia">{h.dia_semana}</span>
                            <span className="personal-horario-horas">
                              {h.hora_entrada?.slice(0, 5)} — {h.hora_salida?.slice(0, 5)}
                            </span>
                            <div className="personal-horario-actions">
                              <button
                                className="icon-btn"
                                title="Eliminar este día"
                                onClick={() => handleEliminarDia(seleccionado.id_personal, gymId, h.dia_semana)}
                              >
                                <FiTrash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ));
                  })()
                )}

                {/* ── Rutinas que supervisa ── */}
                <div className="personal-gym-section" style={{ marginTop: "1.5rem" }}>
                  <div className="personal-gym-title">
                    <span>Rutinas que supervisa</span>
                  </div>
                  {loadingRutinas ? (
                    <p className="personal-no-gyms">Cargando...</p>
                  ) : rutinasInstructor.length === 0 ? (
                    <p className="personal-no-gyms">No supervisa ninguna rutina actualmente.</p>
                  ) : (
                    rutinasInstructor.map(r => (
                      <div key={r.id_rutina} className="personal-horario-row">
                        <span style={{ flex: 1, fontWeight: 600, fontSize: "0.88rem" }}>
                          {r.nombre}
                        </span>
                        <span className="personal-horario-horas">
                          {r.tipo_rutina} · {r.nivel || "N/A"} · {r.duracion_min || 0} min
                        </span>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </>
          )}
        </div>

      </div>

      {/* ── Modales ── */}
      {showCreate && (
        <CreatePersonalModal
          onClose={() => setShowCreate(false)}
          onCreated={async () => {
            await fetchPersonal();
            showToast("Instructor creado correctamente.");
          }}
        />
      )}

      {showEdit && seleccionado && (
        <EditPersonalModal
          personal={seleccionado}
          onClose={() => setShowEdit(false)}
          onUpdated={async () => {
            await fetchPersonal();
            showToast("Instructor actualizado correctamente.");
          }}
        />
      )}

      {showAsignar && seleccionado && (
        <AsignarGimnasioModal
          personal={seleccionado}
          onClose={() => setShowAsignar(false)}
          onAsignado={async () => {
            await fetchPersonal();
            showToast("Horario asignado correctamente.");
          }}
        />
      )}

      {/* ── Modal confirmación toggle ── */}
      {confirmModal && (
        <ModalPortal>
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">
                {confirmModal.accion === "desactivar" ? "Desactivar instructor" : "Activar instructor"}
              </h3>
              <p className="modal-body">
                {confirmModal.accion === "desactivar"
                  ? `¿Deseas desactivar a ${getNombre(confirmModal.item)}?`
                  : `¿Deseas activar a ${getNombre(confirmModal.item)}?`}
              </p>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setConfirmModal(null)}>
                  Cancelar
                </button>
                <button
                  className={confirmModal.accion === "desactivar" ? "btn btn-danger" : "btn btn-success"}
                  onClick={handleToggle}
                  disabled={confirmLoading}
                >
                  {confirmLoading ? "Procesando..." : confirmModal.accion === "desactivar" ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

    </DashboardLayout>
  );
}

export default Personal;