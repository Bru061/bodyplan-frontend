import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import NotificationBell from "./ui/NotificationBell";
import { MdMenu } from "react-icons/md";

const PAGE_TITLES = {
  "/dashboard":     "Dashboard",
  "/clientes":      "Clientes",
  "/rutinas":       "Rutinas",
  "/mis-gimnasios": "Mis Gimnasios",
  "/resenas":       "Reseñas",
  "/perfil":        "Perfil",
  "/notificaciones":"Notificaciones",
};

function Navbar({ onMenuToggle }) {
  const location = useLocation();

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || "BodyPlan";

  return (
    <header className="navbar" aria-label="Barra superior">
      <div className="navbar-container">

        <div className="navbar-left">
          <button
            className="navbar-menu-btn"
            onClick={onMenuToggle}
            aria-label="Abrir menú"
          >
            <MdMenu size={22} />
          </button>

          <Link to="/dashboard" className="navbar-mobile-brand" aria-label="Inicio">
            <img src={logo} alt="BodyPlan" className="brand-logo" />
          </Link>

          <span className="navbar-page-title">{pageTitle}</span>
        </div>

        <div className="navbar-right">
          <NotificationBell />
        </div>

      </div>
    </header>
  );
}

export default Navbar;