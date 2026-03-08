import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import { Link } from "react-router-dom";
import "../../styles/admin.css";
import { MdFileDownload, MdOutlineCalendarMonth } from "react-icons/md";

function AdminFinanzas(){

  const [stats,setStats] = useState({
    ingresosMes:0,
    mrr:0,
    pagosVencidos:0,
    cobranza:0
  });

  const [planes,setPlanes] = useState([]);

  const [estadoPagos,setEstadoPagos] = useState([]);

  const [movimientos,setMovimientos] = useState([]);

  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    // futura llamada backend
    // api.get("/admin/finanzas")

    setLoading(false);

  },[]);


  if(loading){
    return(
      <AdminLayout>
        <h2 style={{padding:40}}>Cargando finanzas...</h2>
      </AdminLayout>
    )
  }


  return(
    <AdminLayout>

      <main className="finance-container">

      {/* HEADER */}

      <section className="page-header">
        <div>
          <p className="eyebrow">Módulo financiero SaaS</p>
          <h1>Finanzas</h1>
          <p className="subtitle">
            Monitorea ingresos, estado de cobros y suscripciones de gimnasios.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary">
            <MdFileDownload/>
            Exportar corte
          </button>

          <button className="btn btn-ghost">
            <MdOutlineCalendarMonth/>
            Periodo
          </button>
        </div>
      </section>


      {/* STATS */}

      <section className="stats-grid">

        <article className="stat-card">
          <p className="stat-label">Ingresos del mes</p>
          <p className="stat-value">${stats.ingresosMes}</p>
        </article>

        <article className="stat-card">
          <p className="stat-label">MRR estimado</p>
          <p className="stat-value">${stats.mrr}</p>
        </article>

        <article className="stat-card">
          <p className="stat-label">Pagos vencidos</p>
          <p className="stat-value">{stats.pagosVencidos}</p>
        </article>

        <article className="stat-card">
          <p className="stat-label">Cobranza exitosa</p>
          <p className="stat-value">{stats.cobranza}%</p>
        </article>

      </section>


      {/* CONTENT */}

      <section className="content-grid">

        <article className="panel">

          <div className="panel-header">
            <h2>Resumen por plan</h2>
            <Link to="/admin/planes" className="inline-link">
              Ver catálogo
            </Link>
          </div>

          {planes.length === 0 ? (
            <p className="empty-state">No hay datos de planes</p>
          ) : (
            <div className="plan-list">

              {planes.map((p)=>(
                <p key={p.id}>
                  <span>{p.nombre}</span>
                  <strong>{p.gimnasios} gimnasios</strong>
                  <em>${p.ingresos} MXN</em>
                </p>
              ))}

            </div>
          )}

        </article>


        <article className="panel">

          <div className="panel-header">
            <h2>Estado de pagos</h2>

            <Link to="/admin/gimnasios" className="inline-link">
              Ir a gimnasios
            </Link>
          </div>

          <ul className="status-list">

            {estadoPagos.map((e,index)=>(
              <li key={index}>
                <span className={`badge badge-${e.tipo}`}>
                  {e.estado}
                </span>
                {e.total} gimnasios
              </li>
            ))}

          </ul>

        </article>

      </section>


      {/* TABLA */}

      <section className="panel table-panel">

        <div className="panel-header">
          <h2>Últimos movimientos financieros</h2>
        </div>

        <div className="table-wrap">

          <table>

            <thead>
              <tr>
                <th>Fecha</th>
                <th>Gimnasio</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>

              {movimientos.length === 0 ? (

                <tr>
                  <td colSpan="7" className="empty-table">
                    No hay movimientos registrados
                  </td>
                </tr>

              ) : (

                movimientos.map((m)=>(
                  <tr key={m.id}>
                    <td>{m.fecha}</td>
                    <td>{m.gimnasio}</td>
                    <td>{m.concepto}</td>
                    <td>${m.monto}</td>
                    <td>{m.metodo}</td>
                    <td>
                      <span className={`badge badge-${m.estado}`}>
                        {m.estado}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-table">
                        Ver
                      </button>
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

export default AdminFinanzas