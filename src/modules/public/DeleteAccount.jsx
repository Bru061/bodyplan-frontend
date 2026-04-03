import { Link } from "react-router-dom";
import "../../styles/legalpage.css";

function DeleteAccount() {
  const sections = [
    {
      number: "01",
      title: "¿Cómo solicitar la eliminación?",
      content: (
        <ol style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>
            Envía un correo a{" "}
            <a href="mailto:devnest.contacto@gmail.com">devnest.contacto@gmail.com</a>{" "}
            con el asunto: <strong>"Solicitud de eliminación de cuenta"</strong>.
          </li>
          <li>
            Incluye el <strong>correo registrado</strong> en tu cuenta de BodyPlan.
          </li>
          <li>
            Indica el <strong>motivo</strong> de la solicitud (opcional).
          </li>
        </ol>
      ),
    },
    {
      number: "02",
      title: "Tiempo de respuesta",
      content: (
        <p>
          Nuestro equipo validará tu identidad y procesará la solicitud en un plazo máximo de{" "}
          <strong>5 días hábiles</strong>.
        </p>
      ),
    },
    {
      number: "03",
      title: "¿Qué datos se eliminan?",
      content: (
        <p>
          Al completar el proceso, eliminaremos los <strong>datos personales</strong> vinculados a tu cuenta,
          salvo aquellos que deban conservarse temporalmente por obligaciones legales, fiscales o de seguridad.
        </p>
      ),
    },
  ];

  return (
    <div className="legal-page">
      {/* Hero */}
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <span className="legal-eyebrow">BodyPlan</span>
          <h1 className="legal-hero-title">Eliminación de cuenta</h1>
          <p className="legal-hero-subtitle">
            Si deseas eliminar tu cuenta y los datos asociados, sigue el proceso indicado a continuación.
          </p>
          <span className="legal-date">Última actualización: Abril 2025</span>
        </div>
      </div>

      {/* Intro */}
      <div className="legal-intro-wrap">
        <div className="legal-intro">
          La eliminación de tu cuenta en BodyPlan es un proceso permanente. Una vez procesada la solicitud,
          no podremos recuperar tu información. Te recomendamos leer detenidamente antes de continuar.
        </div>
      </div>

      {/* Secciones */}
      <div className="legal-content">
        {sections.map((s) => (
          <section key={s.number} className="legal-section">
            <div className="legal-section-number">{s.number}</div>
            <div className="legal-section-body">
              <h2 className="legal-section-title">{s.title}</h2>
              <div className="legal-section-content">{s.content}</div>
            </div>
          </section>
        ))}

        {/* Footer links */}
        <div className="legal-footer-link">
          <Link to="/politicas-privacidad" target="_blank" rel="noreferrer" className="legal-link-btn">
            Ver Políticas de Privacidad →
          </Link>
          <Link to="/terminos-y-condiciones" target="_blank" rel="noreferrer" className="legal-link-btn outlined">
            Ver Términos y Condiciones →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccount;