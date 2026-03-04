import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import api from "../../services/axios";
import "../../styles/gimnasio.css";
import { FiPlus} from "react-icons/fi";

function MisGimnasios(){

  const [gimnasios,setGimnasios] = useState([]);
  const [loading,setLoading] = useState(true);
  const navigate = useNavigate();
  const [changingId,setChangingId] = useState(null);
  const gimnasiosOrdenados = [...gimnasios].sort((a,b)=>b.activo - a.activo);

  const fetchGyms = async () =>{
    try{
      const resActivos = await api.get("/gym");
      const resArchivados = await api.get("/gym/desactivados");
      
      const activos = resActivos.data.gimnasios || [];
      const archivados = resArchivados.data.gimnasios || [];

      const todos = [...activos, ...archivados];

      setGimnasios(todos);

    }catch(err){
      console.error("Error cargando gimnasios",err);
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchGyms();
  },[]);


  if(loading){
    return (
      <DashboardLayout>
        <h1 style={{padding:40}}>Cargando gimnasios...</h1>
      </DashboardLayout>
    );
  }

    const toggleActivo = async (gym) => {
    try {

        const confirm = window.confirm(
        gym.activo
            ? "¿Archivar gimnasio?"
            : "¿Activar gimnasio?"
        );
        if (!confirm) return;

        setChangingId(gym.id_gimnasio);

        if (gym.activo) {
        await api.put(`/gym/down/${gym.id_gimnasio}`);
        } else {
        await api.put(`/gym/up/${gym.id_gimnasio}`);
        }

        fetchGyms(); // recargar lista

    } catch (err) {
        console.error(err);
        alert("Error cambiando estado");
    } finally {
      setChangingId(null);
    }
    };

  return(
    <DashboardLayout>

      {/* HEADER */}
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
          onClick={()=>navigate("/crear-gimnasio")}
        >
          <FiPlus/> Agregar gimnasio
        </button>
      </section>

      {/* LISTA */}
      <section className="service-list">

        {gimnasios.length === 0 && (
          <div className="info-card">
            <h3>No tienes gimnasios aún</h3>
            <p className="subtitle">
              Crea tu primer gimnasio para comenzar.</p>
          </div>
        )}

        {gimnasiosOrdenados.map(g => (
          <div key={g.iid_gimnasio} className="service-profile-card">
          </div>
        ))}

        {gimnasios.map(g => (
          <div
            key={g.id_gimnasio}
            className="service-profile-card"
            style={{cursor:"pointer"}}
            onClick={()=>{
              if(!g.activo){
                alert("Este gimnasio está archivado. Actívalo para administrarlo.");
                return;
              }
              navigate(`/gimnasio/${g.id_gimnasio}`);
            }}
          >

            {/* portada */}
            <div className="cover-card" style={{height:180}}>
              {g.fotos?.[0] && (
                <img
                  src={`/uploads/gimnasios/${g.fotos[0].url_foto}`}
                  className="cover-image"
                />
              )}
              <div className="cover-overlay"/>
              <div className="cover-content">
                <h2 style={{fontSize:"1.4rem"}}>{g.nombre}</h2>
                <span className={g.activo ? "badge-activo" : "badge-off"}>
                  {g.activo ? "🟢 Activo" : "🔴 Archivado"}
                </span>
                <p>
                  {g.Ubicacion?.municipio}, {g.Ubicacion?.estado}
                </p>
              </div>
            </div>  

            <div style={{padding:20}}>
              <span>{g.descripcion}</span>
            </div>

            <div className="actions-bar">
              <button
                className="btn btn-primary"
                disabled={!g.activo}
                onClick={(e)=>{
                e.stopPropagation();
                if(!g.activo){
                  alert("Acriva el gimnasio para poder administrarlo");
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
                  onClick={(e)=>{
                  e.stopPropagation();
                  toggleActivo(g);
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