import { MdNotifications, MdPerson } from 'react-icons/md'
import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <header className="navbar" aria-label="Navegación principal">
        <div className="navbar-container">
            <Link to="/dashboard" className="brand" aria-label="Inicio BodyPlan">
            <img src={logo} alt="Logo de BodyPlan" className="brand-logo" />
            <span className="brand-name">BodyPlan</span>
            </Link>

            <nav>
            <ul className="menu">
                <li><Link to="/dashboard" aria-label="Dashboard">Dashboard</Link></li>
                <li><Link to="/clientes" aria-label="Clientes">Clientes</Link></li>
                <li><Link to="/servicios" aria-label="Mis Servicios">Mis Servicios</Link></li>
                <li><Link to="/rutinas" aria-label="Rutinas">Rutinas</Link></li>
                <li><Link to="/planes" aria-label="Planes">Planes</Link></li>
                <li><Link to="/notificaciones" aria-label="Notificaciones size={24}"><MdNotifications /></Link></li>
                <li><Link to="/perfil" aria-label="Perfil"><MdPerson size={24} /></Link></li>
            </ul>
            </nav>
        </div>
        </header>
    )
}

export default Navbar