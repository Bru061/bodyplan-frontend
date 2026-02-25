import { Link } from "react-router-dom"
import logo from '../assets/logo.png'
import { MdSettings } from 'react-icons/md'

function AdminNavbar() {
    return (
        <header className="navbar" aria-label="Navegación principal">
        <div className="navbar-container">
            <Link to="/dashboard" className="brand" aria-label="Inicio BodyPlan">
            <img src={logo} alt="Logo de BodyPlan" className="brand-logo" />
            <span className="brand-name">BodyPlan Admin</span>
            </Link>

            <nav>
            <ul className="menu">
                <li><Link to="/AdminDashboard" aria-label="Dashboard">Dashboard</Link></li>
                <li><Link to="/AdminGimnasios" aria-label="Gimnasios">Gimnasios</Link></li>
                <li><Link to="/AdminFinanzas" aria-label="Finanzas">Finanzas</Link></li>
                <li><Link to="/AdminIncidentes" aria-label="Incidentes y auditoría">Incidentes y auditoría</Link></li>
                <li><Link to="/AdminConfiguración" aria-label="Configuración"><MdSettings size={24} /></Link></li>
            </ul>
            </nav>
        </div>
        </header>
    )
}

export default AdminNavbar
