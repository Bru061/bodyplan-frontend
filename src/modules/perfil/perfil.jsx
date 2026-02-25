import DashboardLayout from "../../layout/DashboardLayout";
import '../../styles/perfil.css'
import { Link } from "react-router-dom";
import { FiEdit, FiLogOut } from 'react-icons/fi';
import { useAuth } from "../../core/context/AuthContext";


function Perfil(){
    const { signOut } = useAuth();

    const handleLogout = () => {
        signOut();
    };

  return(
    <DashboardLayout>
      <section className="page-header">
            <div>
            <p className="eyebrow">Perfil del gimnasio</p>
            <h1>Mi gimnasio</h1>
            <p className="subtitle">Consulta y administra la información principal de tu gimnasio.</p>
            </div>
            <Link to="/perfil/editar" className="btn btn-primary">
            <span className="material-icons"><FiEdit /></span>
            Editar información
            </Link>
        </section>

        <section className="content-grid" aria-label="Secciones del perfil">
            <article className="panel">
            <div className="panel-header">
                <h2>Información del gimnasio</h2>
                <span className="tag tag-editable">Editable</span>
            </div>
            <div className="panel-body">
                <p><strong>Nombre:</strong> BodyPlan Fitness Center</p>
                <p><strong>Descripción:</strong> Gimnasio enfocado en entrenamiento funcional, fuerza y acondicionamiento físico.</p>
                <p><strong>Teléfono:</strong> (+52) 245 114 0474</p>
                <p><strong>Correo:</strong> contacto@bodyplan.com</p>
                <p><strong>Ubicación:</strong> Av. Central #123, Apizaco, Tlaxcala.</p>
                <p><strong>Estado:</strong> Activo</p>
            </div>
            </article>

            <article className="panel">
            <div className="panel-header">
                <h2>Historial de planes y pagos</h2>
                <span className="tag tag-reference">Solo referencia</span>
            </div>
            <p className="panel-description">Historial del pago del gimnasio hacia la plataforma BodyPlan Web.</p>
            <div className="table-wrap">
                <table className="history-table">
                <thead>
                    <tr>
                    <th>Plan</th>
                    <th>Periodo</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Fecha de pago</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>Plan Pro</td>
                    <td>Ene 2026</td>
                    <td>$499</td>
                    <td><span class="badge badge-success">Pagado</span></td>
                    <td>05 Ene 2026</td>
                    </tr>
                    <tr>
                    <td>Plan Pro</td>
                    <td>Dic 2025</td>
                    <td>$499</td>
                    <td><span class="badge badge-success">Pagado</span></td>
                    <td>05 Dic 2025</td>
                    </tr>
                    <tr>
                    <td>Plan Pro</td>
                    <td>Nov 2025</td>
                    <td>$499</td>
                    <td><span class="badge badge-pending">Pendiente</span></td>
                    <td>-</td>
                    </tr>
                </tbody>
                </table>
            </div>
            <Link to="/planes" className="inline-link">Ir a gestión de planes</Link>
            </article>
        </section>

        <section className="logout-section" aria-label="Acción de sesión">
            <button className="btn btn-logout" onClick={handleLogout}>
            <FiLogOut />
            Cerrar sesión
            </button>
        </section>
    </DashboardLayout>
  )
}

export default Perfil;