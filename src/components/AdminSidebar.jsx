import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../core/context/AuthContext";
import { MdDashboard, MdCreditCard, MdSwapHoriz, MdAssignment, MdLogout, MdVerifiedUser, MdPeople } from "react-icons/md";
import logo from "../assets/logo.png";
import "../styles/admin.css";

const NAV_GROUPS = [
  {
    label: "General",
    items: [
      { to: "/admin/dashboard", icon: <MdDashboard size={20} />, label: "Dashboard" }
    ]
  },
  {
    label: "Finanzas",
    items: [
      { to: "/admin/planes", icon: <MdCreditCard size={20} />, label: "Planes" },
      { to: "/admin/finanzas", icon: <MdSwapHoriz size={20} />, label: "Finanzas" },
      { to: "/admin/referencias", icon: <MdVerifiedUser size={20} />, label: "CLABEs" },
      { to: "/admin/actividad", icon: <MdAssignment size={20} />, label: "Actividad" },
    ]
  },
  {
    label: "Usuarios",
    items: [
      { to: "/admin/usuarios", icon: <MdPeople size={20} />, label: "Usuarios" }
    ]
  }
];

function AdminSidebar() {

  const { user, signOut } = useAuth();

  return (
    <aside className="admin-sidebar">

      <div className="admin-sidebar-brand">
        <img
          src={logo}
          alt="BodyPlan"
          style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", objectFit: "contain", flexShrink: 0 }}
        />
        <div>
          <p className="admin-sidebar-brand-name">BodyPlan</p>
          <span className="admin-sidebar-brand-badge">Admin</span>
        </div>
      </div>

      <nav className="admin-nav">
        <ul>
          {NAV_GROUPS.map(group => (
            <React.Fragment key={group.label}>
              <li className="admin-nav-label">{group.label}</li>
              {group.items.map(item => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `admin-link ${isActive ? "admin-link-active" : ""}`
                    }
                  >
                    <span className="admin-link-icon">{item.icon}</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </React.Fragment>
          ))}
        </ul>
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user"> 
          <div className="admin-sidebar-avatar">
            {user?.nombre?.[0]}{user?.apellido_paterno?.[0]}
          </div>
          <div className="admin-sidebar-user-info">
            <p className="admin-sidebar-user-name">
              {user?.nombre} {user?.apellido_paterno}
            </p>
            <span className="admin-sidebar-user-role">Administrador</span>
          </div>
        </div>

        <button className="admin-logout" onClick={signOut}>
          <MdLogout size={18} /> Cerrar sesión
        </button>
      </div>

    </aside>
  );
}

export default AdminSidebar;