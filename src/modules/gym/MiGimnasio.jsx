import { useEffect, useState } from "react";
import EditGymModal from "./EditGymModal";
import EditHorariosModal from "./EditHorariosModal";
import EditMembresiasModal from "./EditMembresiasModal";
import EditFotosModal from "./EditFotosModal"
import DashboardLayout from "../../layout/DashboardLayout";
import "../../styles/gimnasio.css";
import api from "../../services/axios";
import { FiEdit, FiTrash2, FiStar } from "react-icons/fi";

function MiGimnasio() {

  const [gym, setGym] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [openHorarios, setOpenHorarios] = useState(false);
  const [openMembresias, setOpenMembresias] = useState(false);
  const [openFotos, setOpenFotos] = useState(false);


  const fetchGym = async () => {
    try {
      const res = await api.get("/gym");
      const g = res.data.gimnasios?.[0] || null;

      setGym(g);

    } catch (err) {
      console.error("Error cargando gym", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGym();
  }, []);

  useEffect(() => {
    if (!gym?.fotos || gym.fotos.length <= 1) return;

    const interval = setInterval(() => {
      setImgIndex(prev =>
        prev === gym.fotos.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [gym?.fotos]);

  useEffect(() => {
    if (!gym?.fotos) return;

    if (imgIndex >= gym.fotos.length) {
      setImgIndex(0);
    }
  }, [gym, imgIndex]);


  // 🔽 DESPUÉS DE TODOS LOS HOOKS
  if (loading) return <DashboardLayout><p>Cargando...</p></DashboardLayout>;

  if (!gym) {
    return (
      <DashboardLayout>
        <p>No tienes gimnasio aún</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <section className="page-header">
        <div>
          <p className="eyebrow">Gestión de negocio</p>
          <h1>Mi gimnasio</h1>
          <p className="subtitle">
            Administra la información de tu gimnasio.
          </p>
        </div>

        <div className="page-header-actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            console.log("CLICK EDIT");
            setOpenEdit(true);
          }}
        >
          <FiEdit size={18} />
          Editar información
        </button>

        <button
          className="btn btn-primary"
          onClick={()=>setOpenHorarios(true)}
        >
          <FiEdit size={18} />
          Editar horarios
        </button>

        <button
          className="btn btn-primary"
          onClick={()=>setOpenMembresias(true)}
        >
          <FiEdit size={18} />
          Editar membresías
        </button>

        <button
          className="btn btn-primary"
          onClick={()=>setOpenFotos(true)}
        >
          <FiEdit size={18} />
          Editar fotos
        </button>

      </div>

      </section>

      <section className="service-list">

        <article className="service-profile-card">

          {/* PORTADA */}
        <section className="cover-card">

          {gym.fotos?.length > 0 && gym.fotos[imgIndex] && (
            <>
              <img
                src={`uploads/gimnasios/${gym.fotos[imgIndex].url_foto}`}
                className="cover-image"
              />

              {/* flechas */}
              {gym.fotos.length > 1 && (
                <>
                  <button
                    className="slider-btn left"
                    onClick={() =>
                      setImgIndex(i =>
                        i === 0 ? gym.fotos.length - 1 : i - 1
                      )
                    }
                  >
                    ‹
                  </button>

                  <button
                    className="slider-btn right"
                    onClick={() =>
                      setImgIndex(i =>
                        i === gym.fotos.length - 1 ? 0 : i + 1
                      )
                    }
                  >
                    ›
                  </button>
                </>
              )}

              {/* dots */}
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

          <div className="cover-overlay"></div>

          <div className="cover-content">
            <h2>{gym.nombre}</h2>
            <p>{gym.Ubicacion?.municipio}, {gym.Ubicacion?.estado}</p>
          </div>

        </section>

          {/* INFORMACIÓN */}
        <section className="gym-info-layout">

          {/* DESCRIPCIÓN */}
          <div className="info-block full">
            <h3>Descripción del gimnasio</h3>
            <p>{gym.descripcion}</p>
          </div>

          {/* CONTACTO */}
          <div className="info-block full">
            <h3>Información de contacto</h3>

            <div className="contact-list">
              <p><strong>Dirección:</strong> {gym.Ubicacion?.direccion}</p>
              <p>{gym.Ubicacion?.municipio}, {gym.Ubicacion?.estado}</p>
              <p><strong>CP:</strong> {gym.Ubicacion?.codigo_postal}</p>
              <p><strong>Teléfono:</strong> {gym.telefono}</p>
            </div>
          </div>

          {/* HORARIOS */}
          <div className="info-block">
            <h3>Horarios</h3>

            {gym.horarios?.length === 0 && <p>No hay horarios</p>}

            <div className="list">
              {gym.horarios?.map((h,i)=>(
                <div key={i} className="row-item">
                  <strong>{h.dia_semana}</strong>
                  <span>{h.hora_apertura} - {h.hora_cierre}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MEMBRESÍAS */}
          <div className="info-block">
            <h3>Membresías</h3>

            {gym.membresias?.length === 0 && <p>No hay membresías</p>}

            <div className="list">
              {gym.membresias?.map((m,i)=>(
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
          </div>

        </section>

          {/* ACCIONES */}
          <section className="actions-bar">

            <button className="btn btn-primary" type="button">
              <FiStar size={18} /> Destacar
            </button>

            <button className="btn btn-danger" type="button">
              <FiTrash2 size={18} /> Desactivar gimnasio
            </button>
          </section>

        </article>

      </section>

      {openEdit && gym && (
        <EditGymModal
          gym={gym}
          onClose={() => setOpenEdit(false)}
          onUpdated={fetchGym}
        />
      )}

      {openHorarios && gym && (
        <EditHorariosModal
          gym={gym}
          onClose={() => setOpenHorarios(false)}
          onUpdated={fetchGym}
        />
      )}

      {openMembresias && gym && (
        <EditMembresiasModal
          gym={gym}
          onClose={()=>setOpenMembresias(false)}
          onUpdated={fetchGym}
        />
      )}

      {openFotos && gym && (
        <EditFotosModal
          gym={gym}
          onClose={()=>setOpenFotos(false)}
          onUpdated={fetchGym}
        />
      )}

    </DashboardLayout>
  );

}

export default MiGimnasio;