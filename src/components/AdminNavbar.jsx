import { useLocation } from "react-router-dom";
import NotificationBell from "../components/ui/NotificationBell";
import { MdMenu } from "react-icons/md";

const PAGE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/planes": "Gestión de planes",
  "/admin/finanzas": "Movimientos y balance",
  "/admin/referencias": "Referencias bancarias (CLABE)",
  "/admin/actividad": "Reembolsos y suscripciones",
  "/admin/usuarios": "Usuarios",
  "/admin/perfil": "Mi perfil",
};

function AdminNavbar({ onMenuToggle }) {

  const { pathname } = useLocation();
  const pageTitle = PAGE_TITLES[pathname] || "Admin";

  return (
    <header className="navbar admin-topbar">
      <div className="navbar-container">

        <div className="navbar-left">
          <button
            className="navbar-menu-btn"
            onClick={onMenuToggle}
            aria-label="Abrir menú"
          >
            <MdMenu size={22} />
          </button>
          <span className="navbar-page-title">{pageTitle}</span>
        </div>

        <div className="navbar-right">
          <NotificationBell />
        </div>

      </div>
    </header>
  );
}

export default AdminNavbar;