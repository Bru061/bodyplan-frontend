import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-copy">
          © {new Date().getFullYear()} DevNest — Todos los derechos reservados.
        </p>

        <div className="footer-bottom-links">
          <Link to="/politicas-privacidad" target="_blank" rel="noreferrer">Privacidad</Link>
          <Link to="/terminos-y-condiciones" target="_blank" rel="noreferrer">Términos</Link>
          <Link to="/eliminar-cuenta" target="_blank" rel="noreferrer">Eliminar cuenta</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;