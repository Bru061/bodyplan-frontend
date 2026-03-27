import { useState } from "react";
import { Link } from "react-router-dom";
import { MdMenu, MdClose } from "react-icons/md";
import logo from "../assets/logo.png";

function PublicNavbar() {

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar" aria-label="Navegación principal">
      <div className="navbar-container">

        <Link to="/" className="brand" aria-label="Inicio BodyPlan">
          <img src={logo} alt="Logo de BodyPlan" className="brand-logo" />
          <span className="brand-name">BodyPlan</span>
        </Link>

        <nav className="public-nav-desktop">
          <ul className="menu">
            <li><a href="/#planes">Planes</a></li>
            <li><Link to="/login">Iniciar sesión</Link></li>
            <li>
              <Link to="/register" className="public-nav-cta">
                Empieza gratis
              </Link>
            </li>
          </ul>
        </nav>

        <button
          className="public-nav-hamburger"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>

      </div>

      {menuOpen && (
        <div className="public-nav-mobile" onClick={() => setMenuOpen(false)}>
          <a href="/#planes" className="public-nav-mobile-item">Planes</a>
          <Link to="/login"    className="public-nav-mobile-item">Iniciar sesión</Link>
          <Link to="/register" className="public-nav-mobile-item public-nav-mobile-cta">
            Empieza gratis
          </Link>
        </div>
      )}

    </header>
  );
}

export default PublicNavbar;