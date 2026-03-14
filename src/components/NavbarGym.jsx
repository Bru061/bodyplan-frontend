import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function NavbarGym() {
  const navigate = useNavigate();

  return (
    <header className="navbar" aria-label="Navegación principal">
      <div className="navbar-container">

        <div className="brand">
          <img src={logo} alt="Logo BodyPlan" className="brand-logo" />
          <span className="brand-name">BodyPlan</span>
        </div>

        <button
          className="navbar-exit-btn"
          onClick={() => navigate("/mis-gimnasios")}
          aria-label="Salir del registro"
        >
          Salir ✕
        </button>

      </div>
    </header>
  );
}

export default NavbarGym;