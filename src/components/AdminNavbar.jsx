import { useLocation } from "react-router-dom";
import { MdNotificationsNone } from "react-icons/md";
import { useAuth } from "../core/context/AuthContext";

const PAGE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/planes": "Gestión de planes",
  "/admin/finanzas": "Movimientos y balance",
  "/admin/referencias": "Referencias bancarias (CLABE)",
  "/admin/actividad": "Reembolsos y suscripciones",
  "/admin/usuarios": "Usuarios"
};

function AdminNavbar() {

  const { pathname } = useLocation();
  const { user } = useAuth();
  const pageTitle = PAGE_TITLES[pathname] || "Admin";

  return (
    <header className="navbar admin-topbar">
      <div className="navbar-container">

        <div className="navbar-left">
          <span className="navbar-page-title">{pageTitle}</span>
        </div>

        <div className="navbar-right">
          <button className="navbar-icon-btn" title="Notificaciones">
            <MdNotificationsNone size={20} />
          </button>
          <div className="navbar-icon-btn navbar-avatar admin-topbar-avatar">
            {user?.nombre?.[0]}{user?.apellido_paterno?.[0]}
          </div>
        </div>

      </div>
    </header>
  );
}

export default AdminNavbar;