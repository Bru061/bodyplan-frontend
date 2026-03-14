import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import api from "../../services/axios";
import "../../styles/gimnasio.css";
import { FiPlus } from "react-icons/fi";
import LoadingScreen from "../../components/ui/LoadingScreen";

function MisGimnasios() {

  const [gimnasios, setGimnasios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("activos");
  const navigate = useNavigate();
  const [changingId, setChangingId] = useState(null);
  const [modal, setModal] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const activos = gimnasios.filter(g => g.activo);
  const archivados = gimnasios.filter(g => !g.activo);
  const listaMostrar = tab === "activos" ? activos : archivados;

  const fetchGyms = async () => {
    try {
      const resActivos = await api.get("/gym");
      const resArchivados = await api.get("/gym/desactivados");

      const activos = resActivos.data.gimnasios || [];
      const archivados = resArchivados.data.gimnasios || [];

      setGimnasios([...activos, ...archivados]);

    } catch (err) {
      console.error("Error cargando gimnasios", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  if (loading) {
    return <LoadingScreen message="Cargando Gimnasios" />;
  }

  const confirmarToggle = (gym) => {
    setErrorMsg("");
    setModal({
      gym,
      accion: gym.activo ? "archivar" : "activar"
    });
  };

  const toggleActivo = async () => {
    if (!modal) return;
    const { gym } = modal;

    setModal(null);
    setChangingId(gym.id_gimnasio);
    setErrorMsg("");

    try {

      if (gym.activo) {
        await api.put(`/gym/down/${gym.id_gimnasio}`);
      } else {
        await api.put(`/gym/up/${gym.id_gimnasio}`);
      }

      fetchGyms();

    } catch (err) {
      console.error(err);

      const backendError =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        null;

      if (backendError) {
        setErrorMsg(backendError);
      } else {
        setErrorMsg(
          gym.activo
            ? "No se pudo archivar el gimnasio. Verifica que no tenga membresías activas en uso."
            : "No se pudo activar el gimnasio. Intenta de nuevo."
        );
      }

    } finally {
      setChangingId(null);
    }
  };

  return (
    <DashboardLayout>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">
              {modal.accion === "archivar" ? "Archivar gimnasio" : "Activar gimnasio"}
            </h3>
            <p className="modal-body">
              {modal.accion === "archivar"
                ? `¿Deseas archivar "${modal.gym.nombre}"? No podrá ser administrado hasta que lo actives nuevamente.`
                : `¿Deseas activar "${modal.gym.nombre}"?`
              }
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setModal(null)}
              >
                Cancelar
              </button>
              <button
                className={modal.accion === "archivar" ? "btn btn-danger" : "btn btn-success"}
                onClick={toggleActivo}
              >
                {modal.accion === "archivar" ? "Archivar" : "Activar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="page-header">
        <div>
          <p className="eyebrow">Panel principal</p>
          <h1>Mis gimnasios</h1>
          <p className="subtitle">
            Administra tus gimnasios.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/crear-gimnasio")}
        >
          <FiPlus /> Agregar gimnasio
        </button>
      </section>

      {errorMsg && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          {errorMsg}
          <button
            className="ml-3 text-red-500 font-bold hover:text-red-700"
            onClick={() => setErrorMsg("")}
          >
            ✕
          </button>
        </div>
      )}

      <div className="gym-tabs">
        <button
          className={`tab-btn ${tab === "activos" ? "active" : ""}`}
          onClick={() => setTab("activos")}
        >
          Activos ({activos.length})
        </button>

        <button
          className={`tab-btn ${tab === "archivados" ? "active" : ""}`}
          onClick={() => setTab("archivados")}
        >
          Archivados ({archivados.length})
        </button>
      </div>

      <section className="service-list">

        {gimnasios.length === 0 && (
          <div className="info-card">
            <h3>No tienes gimnasios aún</h3>
            <p className="subtitle">Crea tu primer gimnasio para comenzar.</p>
          </div>
        )}

        {gimnasios.length > 0 && listaMostrar.length === 0 && (
          <div className="info-card">
            <h3>No hay gimnasios {tab === "activos" ? "activos" : "archivados"}</h3>
            <p className="subtitle">
              {tab === "activos"
                ? "Todos tus gimnasios están archivados."
                : "No tienes gimnasios archivados."}
            </p>
          </div>
        )}

        {listaMostrar.map(g => (
          <div
            key={g.id_gimnasio}
            className="service-profile-card"
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (!g.activo) {
                setErrorMsg("Este gimnasio está archivado. Actívalo para administrarlo.");
                return;
              }
              navigate(`/gimnasio/${g.id_gimnasio}`);
            }}
          >

            <div className="cover-card" style={{ height: 250 }}>
              {g.fotos?.[0] && (
                <img
                  src={`/uploads/gimnasios/${g.fotos[0].url_foto}`}
                  className="cover-image"
                  alt={g.nombre}
                />
              )}
              <div className="cover-overlay" />
              <div className="cover-content">
                <h2 style={{ fontSize: "1.4rem" }}>{g.nombre}</h2>
                <span className={g.activo ? "badge-activo" : "badge-off"}>
                  {g.activo ? "🟢 Activo" : "🔴 Archivado"}
                </span>
                <h3>
                  {g.Ubicacion?.direccion}, {g.Ubicacion?.municipio}, {g.Ubicacion?.estado}
                </h3>
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <span>{g.descripcion}</span>
            </div>

            <div className="actions-bar">
              <button
                className="btn btn-primary"
                disabled={!g.activo}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!g.activo) {
                    setErrorMsg("Activa el gimnasio para poder administrarlo.");
                    return;
                  }
                  navigate(`/gimnasio/${g.id_gimnasio}`);
                }}
              >
                Administrar
              </button>

              <button
                disabled={changingId === g.id_gimnasio}
                className={g.activo ? "btn btn-danger" : "btn btn-success"}
                onClick={(e) => {
                  e.stopPropagation();
                  confirmarToggle(g);
                }}
              >
                {changingId === g.id_gimnasio
                  ? "Procesando..."
                  : g.activo ? "Archivar" : "Activar"}
              </button>
            </div>

          </div>
        ))}

      </section>

    </DashboardLayout>
  );
}

export default MisGimnasios;