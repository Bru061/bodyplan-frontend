import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import "../../styles/perfil.css";
import { Link } from "react-router-dom";
import { FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "../../core/context/AuthContext";
import api from "../../services/axios";

function Perfil(){

  const { signOut } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => signOut();

  // ===============================
  // CARGAR PERFIL
  // ===============================
  const fetchUser = async () => {
    try {
      const res = await api.get("/user/me");
      console.log("RESPUESTA PERFIL:", res.data);
      setUser(res.data.usuario || res.data);
    } catch (err) {
      console.error("Error cargando perfil", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading){
    return (
      <DashboardLayout>
        <p style={{padding:40}}>Cargando perfil...</p>
      </DashboardLayout>
    );
  }

  if (!user){
    return (
      <DashboardLayout>
        <p style={{padding:40}}>No se pudo cargar el perfil</p>
      </DashboardLayout>
    );
  }

  return(
    <DashboardLayout>

      {/* HEADER */}
      <section className="page-header">
        <div>
          <p className="eyebrow">Cuenta</p>
          <h1>Mi perfil</h1>
          <p className="subtitle">
            Consulta y administra tu información personal.
          </p>
        </div>

        <button className="btn btn-logout" onClick={handleLogout}>
          <FiLogOut/>
          Cerrar sesión
        </button>
        
        </section>

      {/* GRID */}
      <section className="content-grid">

        {/* INFO USUARIO */}
        <article className="panel">
          <div className="panel-header">
            <h2><FiUser style={{marginRight:8}}/> Información personal</h2>
          </div>

          <div className="panel-body">

            <p>
              <strong>Nombre:</strong>{" "}
              {user.nombre} {user.apellido_paterno} {user.apellido_materno}
            </p>

            <p>
              <strong>Teléfono:</strong>{" "}
              {user.telefono || "No registrado"}
            </p>

            <p>
              <strong>Correo:</strong>{" "}
              {user.correo}
            </p>

          </div>
        </article>

        {/* HISTORIAL PAGOS */}
        <article className="panel">
          <div className="panel-header">
            <h2>Historial de planes y pagos</h2>
          </div>

          <p className="panel-description">
            Historial de pagos hacia la plataforma BodyPlan.
          </p>

          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Periodo</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>

              <tbody>

                {/* ⚠️ Esto luego vendrá de backend */}
                <tr>
                  <td>Plan Pro</td>
                  <td>Ene 2026</td>
                  <td>$499</td>
                  <td><span className="badge badge-success">Pagado</span></td>
                  <td>05 Ene 2026</td>
                </tr>

                <tr>
                  <td>Plan Pro</td>
                  <td>Dic 2025</td>
                  <td>$499</td>
                  <td><span className="badge badge-success">Pagado</span></td>
                  <td>05 Dic 2025</td>
                </tr>

                <tr>
                  <td>Plan Pro</td>
                  <td>Nov 2025</td>
                  <td>$499</td>
                  <td><span className="badge badge-pending">Pendiente</span></td>
                  <td>-</td>
                </tr>

              </tbody>
            </table>
          </div>

          <Link to="/planes" className="inline-link">
            Ir a gestión de planes
          </Link>

        </article>

      </section>

    </DashboardLayout>
  )
}

export default Perfil;