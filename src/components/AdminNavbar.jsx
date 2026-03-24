import { useLocation } from "react-router-dom";
import { useAuth } from "../core/context/AuthContext";
import NotificationBell from "../components/ui/NotificationBell";

const PAGE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/planes": "Gestión de planes",
  "/admin/finanzas": "Movimientos y balance",
  "/admin/referencias": "Referencias bancarias (CLABE)",
  "/admin/actividad": "Reembolsos y suscripciones",
  "/admin/usuarios": "Usuarios"
  //"/admin/perfil":  "Perfil"
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
          <NotificationBell />
        </div>

      </div>
    </header>
  );
}

export default AdminNavbar;