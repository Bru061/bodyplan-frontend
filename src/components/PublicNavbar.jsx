import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function PublicNavbar(){
  return(
        <header className="navbar" aria-label="Navegación principal">
        <div className="navbar-container">
            <a className="brand" href="dashboard.html" aria-label="Inicio BodyPlan">
            <img src={logo} alt="Logo de BodyPlan" className="brand-logo" />
            <span className="brand-name">BodyPlan</span>
            </a>

            <nav>
            <ul className="menu">
                <li><Link to="/login" aria-label="Iniciar Sesión">Iniciar Sesión</Link></li>
                <li><Link to="/register" aria-label="Registrarse">Registrarse</Link></li>
            </ul>
            </nav>
        </div>
        </header>
  )
}

export default PublicNavbar;