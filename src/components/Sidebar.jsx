import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { MdDashboard, MdPeople, MdFitnessCenter, MdStar, MdLogout, MdSupervisorAccount } from "react-icons/md";
import { FaDumbbell } from "react-icons/fa";
import { useAuth } from "../core/context/AuthContext";
import api from "../services/axios";
import logo from "../assets/logo.png";

const NAV_ITEMS = [
  { to: "/dashboard", icon: <MdDashboard size={20} />, label: "Dashboard" },
  { to: "/clientes", icon: <MdPeople size={20} />, label: "Clientes" },
  { to: "/rutinas", icon: <FaDumbbell size={18} />, label: "Rutinas" },
  { to: "/personal", icon: <MdSupervisorAccount size={20} />, label: "Personal" },
  { to: "/mis-gimnasios", icon: <MdFitnessCenter size={20} />, label: "Mis Gimnasios" },
  { to: "/resenas", icon: <MdStar size={20} />, label: "Reseñas" },
];

function Sidebar({ open, onClose }) {

  const { user, signOut } = useAuth();
  const [planNombre, setPlanNombre] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get("/proveedor/mi-plan");
        const plan = res.data.plan_activo;
        if (plan?.estado === "activa") {
          setPlanNombre(plan.plan?.nombre || null);
        }
      } catch {
      }
    };
    fetchPlan();
  }, []);

  const nombreCompleto = user
    ? `${user.nombre} ${user.apellido_paterno || ""}`.trim()
    : "Usuario";

  const iniciales = user
    ? `${user.nombre?.[0] ?? ""}${user.apellido_paterno?.[0] ?? ""}`.toUpperCase()
    : "U";

  return (
    <>
      {open && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`} aria-label="Menú lateral">

        <div className="sidebar-brand">
          <img src={logo} alt="BodyPlan" className="sidebar-logo" />
          <span className="sidebar-brand-name">BodyPlan</span>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Principal</p>
          <ul>
            {NAV_ITEMS.map(({ to, icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                  }
                  onClick={onClose}
                >
                  <span className="sidebar-icon">{icon}</span>
                  <span className="sidebar-label">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">

          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
            onClick={onClose}
          >
            <span className="sidebar-avatar">{iniciales}</span>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{nombreCompleto}</span>
              <span className="sidebar-user-role">
                {planNombre ? `Plan ${planNombre}` : "Sin plan activo"}
              </span>
            </div>
          </NavLink>

          <button className="sidebar-logout" onClick={signOut}>
            <MdLogout size={18} />
            <span>Cerrar sesión</span>
          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;