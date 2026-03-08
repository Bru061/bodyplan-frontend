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
                <li><Link to="/admin/admin-dashboard" aria-label="Dashboard">Dashboard</Link></li>
                <li><Link to="/admin/admin-gimnasios" aria-label="Gimnasios">Gimnasios</Link></li>
                <li><Link to="/admin/admin-finanzas" aria-label="Finanzas">Finanzas</Link></li>
                <li><Link to="/admin/configuracion" aria-label="Configuración"><MdSettings size={24} /></Link></li>
            </ul>
            </nav>
        </div>
        </header>
    )
}

export default AdminNavbar
