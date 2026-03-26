import { useEffect, useState } from "react";
import EditGymModal from "./EditGymModal";
import EditHorariosModal from "./EditHorariosModal";
import EditMembresiasModal from "./EditMembresiasModal";
import EditFotosModal from "./EditFotosModal";
import DashboardLayout from "../../layout/DashboardLayout";
import "../../styles/gimnasio.css";
import api from "../../services/axios";
import { useParams, useNavigate } from "react-router-dom";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { Pencil, Star } from "lucide-react";
import Toast from "../../components/ui/Toast";

function MiGimnasio() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [gym, setGym]           = useState(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [openEdit, setOpenEdit]           = useState(false);
  const [openHorarios, setOpenHorarios]   = useState(false);
  const [openMembresias, setOpenMembresias] = useState(false);
  const [openFotos, setOpenFotos]         = useState(false);

  // ── Destacado ──
  const [destacando, setDestacando] = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchGym = async () => {
    try {
      if (!id) return;
      const res = await api.get(`/gym/${id}`);
      setGym(res.data.gimnasio);
    } catch (err) {
      console.error("Error cargando gym", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGym(); }, [id]);

  useEffect(() => {
    if (!gym?.fotos || gym.fotos.length <= 1) return;
    const interval = setInterval(() => {
      setImgIndex(prev => prev === gym.fotos.length - 1 ? 0 : prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [gym?.fotos]);

  useEffect(() => {
    if (!gym?.fotos) return;
    if (imgIndex >= gym.fotos.length) setImgIndex(0);
  }, [gym, imgIndex]);

  const handleToggleDestacado = async () => {
    try {
      setDestacando(true);
      const res = await api.patch(`/gym/${id}/destacar`);
      const ahora = res.data.destacado;
      showToast(ahora ? "Gimnasio destacado correctamente." : "Gimnasio quitado de destacados.");
      fetchGym();
    } catch (err) {
      const msg = err?.response?.data?.error || "No se pudo actualizar el estado destacado.";
      showToast(msg, "error");
    } finally {
      setDestacando(false);
    }
  };

  if (loading) return <LoadingScreen message="Cargando gimnasio..." />;

  if (!gym) {
    return (
      <DashboardLayout>
        <div className="gym-empty">
          <h2>No se encontró el gimnasio</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <section className="page-header">
        <div className="page-header-row">
          <button
            className="back-button"
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/mis-gimnasios")}
          >
            ←
          </button>
          <div>
            <p className="eyebrow">Gestión de negocio</p>
            <h1>
              {gym.nombre}
              {gym.destacado && (
                <span className="gym-destacado-badge">
                  <Star size={13} fill="currentColor" /> Destacado
                </span>
              )}
            </h1>
            <p className="subtitle">Administra la información de tu gimnasio.</p>
          </div>
        </div>

        {/* ── Botón destacar ── */}
        <button
          className={gym.destacado ? "btn btn-ghost gym-destacado-btn active" : "btn btn-ghost gym-destacado-btn"}
          onClick={handleToggleDestacado}
          disabled={destacando}
          title={gym.destacado ? "Quitar de destacados" : "Destacar gimnasio (requiere Plan Web activo)"}
        >
          <Star size={15} fill={gym.destacado ? "currentColor" : "none"} />
          {destacando ? "Procesando..." : gym.destacado ? "Quitar destacado" : "Destacar"}
        </button>
      </section>

      <section className="service-list">
        <article className="service-profile-card">

          <section className="cover-card">
            <button className="icon-edit" onClick={() => setOpenFotos(true)}>
              <Pencil size={20} color="#fff" />
            </button>

            {gym.fotos?.length > 0 && gym.fotos[imgIndex] && (
              <>
                <img
                  src={`/uploads/gimnasios/${gym.fotos[imgIndex].url_foto}`}
                  className="cover-image"
                  alt={gym.nombre}
                />

                {gym.fotos.length > 1 && (
                  <>
                    <button
                      className="slider-btn left"
                      onClick={() => setImgIndex(i => i === 0 ? gym.fotos.length - 1 : i - 1)}
                    >‹</button>
                    <button
                      className="slider-btn right"
                      onClick={() => setImgIndex(i => i === gym.fotos.length - 1 ? 0 : i + 1)}
                    >›</button>
                  </>
                )}

                <div className="slider-dots">
                  {gym.fotos.map((_, i) => (
                    <span
                      key={i}
                      className={`dot ${i === imgIndex ? "active" : ""}`}
                      onClick={() => setImgIndex(i)}
                    />
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="gym-info-layout">

            <div className="info-block full">
              <button className="icon-edit-btn" onClick={() => setOpenEdit(true)}>
                <Pencil size={16} />
              </button>
              <h3>Descripción del gimnasio</h3>
              <p>{gym.descripcion}</p>
            </div>

            <div className="info-block full">
              <h3>Información de contacto</h3>
              <div className="contact-list">
                <p><strong>Dirección:</strong> {gym.Ubicacion?.direccion}</p>
                <p>{gym.Ubicacion?.municipio}, {gym.Ubicacion?.estado}</p>
                <p><strong>CP:</strong> {gym.Ubicacion?.codigo_postal}</p>
                <p><strong>Teléfono:</strong> {gym.telefono}</p>
              </div>
            </div>

            <div className="info-block">
              <button className="icon-edit-btn" onClick={() => setOpenHorarios(true)}>
                <Pencil size={16} />
              </button>
              <h3>Horarios</h3>
              {gym.horarios?.length === 0
                ? <p>No hay horarios registrados.</p>
                : (
                  <div className="list">
                    {gym.horarios?.map((h, i) => (
                      <div key={i} className="row-item">
                        <strong>{h.dia_semana}</strong>
                        <span>{h.hora_apertura} — {h.hora_cierre}</span>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>

            <div className="info-block">
              <button className="icon-edit-btn" onClick={() => setOpenMembresias(true)}>
                <Pencil size={16} />
              </button>
              <h3>Membresías</h3>
              {gym.membresias?.length === 0
                ? <p>No hay membresías registradas.</p>
                : (
                  <div className="list">
                    {gym.membresias?.map((m, i) => (
                      <div key={i} className="memb-card">
                        <div className="memb-main">
                          <strong>{m.nombre}</strong>
                          <span>${m.precio} / {m.duracion_dias} días</span>
                        </div>
                        {m.descripcion && (
                          <p className="memb-desc">{m.descripcion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              }
            </div>

          </section>

        </article>
      </section>

      {openEdit && (
        <EditGymModal gym={gym} onClose={() => setOpenEdit(false)} onUpdated={fetchGym} />
      )}
      {openHorarios && (
        <EditHorariosModal gym={gym} onClose={() => setOpenHorarios(false)} onUpdated={fetchGym} />
      )}
      {openMembresias && (
        <EditMembresiasModal gym={gym} onClose={() => setOpenMembresias(false)} onUpdated={fetchGym} />
      )}
      {openFotos && (
        <EditFotosModal gym={gym} onClose={() => setOpenFotos(false)} onUpdated={fetchGym} />
      )}

    </DashboardLayout>
  );
}

export default MiGimnasio;