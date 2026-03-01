import logo from '../assets/logo.png'

function NavbarGym() {
  return (
    <header className="navbar" aria-label="Navegación principal">
      <div className="navbar-container">

        {/* LOGO */}
        <div className="brand">
          <img src={logo} alt="Logo BodyPlan" className="brand-logo" />
          <span className="brand-name">BodyPlan</span>
        </div>

        {/* TEXTO LADO DERECHO */}
        <div className="navbar-onboarding-text">
          Configuración inicial del gimnasio
        </div>

      </div>
    </header>
  );
}

export default NavbarGym;