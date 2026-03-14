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
import { Pencil } from "lucide-react";

function MiGimnasio() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [gym, setGym] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [openHorarios, setOpenHorarios] = useState(false);
  const [openMembresias, setOpenMembresias] = useState(false);
  const [openFotos, setOpenFotos] = useState(false);

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

  useEffect(() => {
    fetchGym();
  }, [id]);

  // ── Auto-avance del slider ──
  useEffect(() => {
    if (!gym?.fotos || gym.fotos.length <= 1) return;
    const interval = setInterval(() => {
      setImgIndex(prev => prev === gym.fotos.length - 1 ? 0 : prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [gym?.fotos]);

  // ── Resetear índice si las fotos cambian ──
  useEffect(() => {
    if (!gym?.fotos) return;
    if (imgIndex >= gym.fotos.length) setImgIndex(0);
  }, [gym, imgIndex]);

  if (loading) {
    return <LoadingScreen message="Cargando gimnasio..." />;
  }

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

      {/* ── Header ── */}
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
            <h1>{gym.nombre}</h1>
            <p className="subtitle">Administra la información de tu gimnasio.</p>
          </div>
        </div>
      </section>

      {/* ── Card principal ── */}
      <section className="service-list">
        <article className="service-profile-card">

          {/* ── Portada con slider ── */}
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
                    >
                      ‹
                    </button>
                    <button
                      className="slider-btn right"
                      onClick={() => setImgIndex(i => i === gym.fotos.length - 1 ? 0 : i + 1)}
                    >
                      ›
                    </button>
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

          {/* ── Info layout ── */}
          <section className="gym-info-layout">

            {/* Descripción */}
            <div className="info-block full">
              <button className="icon-edit-btn" onClick={() => setOpenEdit(true)}>
                <Pencil size={16} />
              </button>
              <h3>Descripción del gimnasio</h3>
              <p>{gym.descripcion}</p>
            </div>

            {/* Contacto */}
            <div className="info-block full">
              <h3>Información de contacto</h3>
              <div className="contact-list">
                <p><strong>Dirección:</strong> {gym.Ubicacion?.direccion}</p>
                <p>{gym.Ubicacion?.municipio}, {gym.Ubicacion?.estado}</p>
                <p><strong>CP:</strong> {gym.Ubicacion?.codigo_postal}</p>
                <p><strong>Teléfono:</strong> {gym.telefono}</p>
              </div>
            </div>

            {/* Horarios */}
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

            {/* Membresías */}
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

      {/* ── Modales ── */}
      {openEdit && (
        <EditGymModal
          gym={gym}
          onClose={() => setOpenEdit(false)}
          onUpdated={fetchGym}
        />
      )}
      {openHorarios && (
        <EditHorariosModal
          gym={gym}
          onClose={() => setOpenHorarios(false)}
          onUpdated={fetchGym}
        />
      )}
      {openMembresias && (
        <EditMembresiasModal
          gym={gym}
          onClose={() => setOpenMembresias(false)}
          onUpdated={fetchGym}
        />
      )}
      {openFotos && (
        <EditFotosModal
          gym={gym}
          onClose={() => setOpenFotos(false)}
          onUpdated={fetchGym}
        />
      )}

    </DashboardLayout>
  );
}

export default MiGimnasio;