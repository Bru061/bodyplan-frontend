import logo from '../assets/logo.png'

function NavbarGym() {
  return (
    <header className="navbar" aria-label="Navegación principal">
      <div className="navbar-container">

        <div className="brand">
          <img src={logo} alt="Logo BodyPlan" className="brand-logo" />
          <span className="brand-name">BodyPlan</span>
        </div>

      </div>
    </header>
  );
}

export default NavbarGym;