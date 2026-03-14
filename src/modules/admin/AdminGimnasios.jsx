import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import "../../styles/admin.css";
import { Link } from "react-router-dom";

function AdminGimnasios(){

  const [gimnasios,setGimnasios] = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("todos");

  useEffect(()=>{

    setLoading(false);

  },[]);


  const gimnasiosFiltrados = gimnasios.filter(g => {

    if(filter === "activos") return g.estado === "activo";
    if(filter === "revision") return g.estado === "revision";
    if(filter === "bloqueados") return g.estado === "bloqueado";

    return true;

  });


  if(loading){
    return(
      <AdminLayout>
        <h2 style={{padding:40}}>Cargando gimnasios...</h2>
      </AdminLayout>
    )
  }


  return(
    <AdminLayout>

      <main className="gyms-container">

      <section className="page-header">

        <div>
          <p className="eyebrow">Gestión global</p>
          <h1>Gimnasios registrados</h1>
          <p className="subtitle">
            Aprueba, bloquea y monitorea estado de pago por gimnasio.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary">
            Aprobar seleccionados
          </button>

          <button className="btn btn-ghost">
            Bloquear seleccionados
          </button>
        </div>

      </section>

      <section className="toolbar">

        <label className="search-box">
          <input
            type="search"
            placeholder="Buscar gimnasio"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />
        </label>

        <div className="filter-group">

          <button
            className={`btn btn-filter ${filter==="todos" ? "is-active":""}`}
            onClick={()=>setFilter("todos")}
          >
            Todos
          </button>

          <button
            className={`btn btn-filter ${filter==="activos" ? "is-active":""}`}
            onClick={()=>setFilter("activos")}
          >
            Activos
          </button>

          <button
            className={`btn btn-filter ${filter==="revision" ? "is-active":""}`}
            onClick={()=>setFilter("revision")}
          >
            Revisión
          </button>

          <button
            className={`btn btn-filter ${filter==="bloqueados" ? "is-active":""}`}
            onClick={()=>setFilter("bloqueados")}
          >
            Bloqueados
          </button>

        </div>

      </section>

      <section className="panel table-panel">

        <div className="panel-header">
          <h2>Listado de gimnasios</h2>
        </div>

        <div className="table-wrap">

          <table>

            <thead>
              <tr>
                <th></th>
                <th>Gimnasio</th>
                <th>Estado</th>
                <th>Plan</th>
                <th>Pago</th>
                <th>Última actividad</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {gimnasiosFiltrados.length === 0 ? (

                <tr>
                  <td colSpan="7" className="empty-table">
                    No hay gimnasios registrados
                  </td>
                </tr>

              ) : (

                gimnasiosFiltrados.map((g)=>(
                  <tr key={g.id}>

                    <td>
                      <input type="checkbox"/>
                    </td>

                    <td>
                      <p className="gym-name">{g.nombre}</p>
                      <p className="gym-meta">{g.ciudad} · {g.email}</p>
                    </td>

                    <td>
                      <span className={`badge badge-${g.estado}`}>
                        {g.estado}
                      </span>
                    </td>

                    <td>{g.plan}</td>

                    <td>
                      <span className={`badge badge-${g.pago}`}>
                        {g.pago}
                      </span>
                    </td>

                    <td>{g.ultimaActividad}</td>

                    <td>
                      <div className="row-actions">

                        <Link
                          to={`/admin/gimnasios/${g.id}`}
                          className="btn btn-table"
                        >
                          Ver detalle
                        </Link>

                        <button className="icon-btn">
                          Bloquear
                        </button>

                      </div>
                    </td>

                  </tr>
                ))

              )}

            </tbody>

          </table>

        </div>

      </section>

      </main>

    </AdminLayout>
  )
}

export default AdminGimnasios