import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import "../../styles/perfil.css";
import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import api from "../../services/axios";
import LoadingScreen from "../../components/ui/LoadingScreen";

function Perfil() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get("/user/me");
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

  if (loading) {
    return <LoadingScreen message="Cargando perfil..." />;
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="perfil-error">
          <h2>No se pudo cargar el perfil</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <section className="page-header">
        <div>
          <h1>Mi perfil</h1>
          <p className="subtitle">
            Consulta y administra tu información personal.
          </p>
        </div>
      </section>

      <section className="content-grid">

        {/* ── Información personal ── */}
        <article className="panel">
          <h2 className="panel-icon-title">
            <FiUser size={18} /> Información personal
          </h2>

          <div className="panel-body">
            <p>
              <strong>Nombre: </strong>
              {user.nombre} {user.apellido_paterno} {user.apellido_materno}
            </p>
            <p>
              <strong>Teléfono: </strong>
              {user.telefono || "No registrado"}
            </p>
            <p>
              <strong>Correo: </strong>
              {user.correo}
            </p>
          </div>
        </article>

        {/* ── Historial de planes y pagos ── */}
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
                {/* ⚠️ Datos de prueba — reemplazar con backend */}
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
            Ir a gestión de planes →
          </Link>
        </article>

      </section>

    </DashboardLayout>
  );
}

export default Perfil;