import { Link } from "react-router-dom";
import "../../styles/legalpage.css";

function TermsAndConditions() {
  const sections = [
    {
      number: "01",
      title: "Introducción",
      content: (
        <p>
          BodyPlan es una plataforma digital que permite a gimnasios y proveedores gestionar clientes,
          rutinas y membresías, así como a los usuarios acceder a servicios mediante suscripción.
        </p>
      ),
    },
    {
      number: "02",
      title: "Aceptación de los términos",
      content: (
        <p>Al registrarte y utilizar la plataforma, aceptas estos Términos y Condiciones en su totalidad.</p>
      ),
    },
    {
      number: "03",
      title: "Registro de usuario",
      content: (
        <p>El usuario se compromete a proporcionar información veraz y mantener la confidencialidad de su cuenta.</p>
      ),
    },
    {
      number: "04",
      title: "Servicios",
      content: (
        <p>
          BodyPlan ofrece herramientas digitales para la gestión de gimnasios y acceso a funcionalidades
          mediante planes de suscripción.
        </p>
      ),
    },
    {
      number: "05",
      title: "Planes y suscripciones",
      content: (
        <p>Los planes pueden incluir diferentes funcionalidades y se renuevan automáticamente salvo cancelación previa.</p>
      ),
    },
    {
      number: "06",
      title: "Pagos",
      content: (
        <p>Los pagos se procesan a través de <strong>Stripe</strong>. BodyPlan no almacena información financiera sensible.</p>
      ),
    },
    {
      number: "07",
      title: "Procesamiento de pagos y transferencias",
      content: (
        <>
          <p>Los pagos realizados dentro de la plataforma no se transfieren de forma inmediata.</p>
          <p>
            BodyPlan utiliza un esquema de <strong>liquidación semanal</strong>, lo que implica que los ingresos
            generados serán procesados y transferidos dentro de ciclos semanales.
          </p>
          <p>Puede existir un desfase entre el pago del usuario y la recepción de los fondos por parte del proveedor.</p>
          <p>BodyPlan no será responsable por retrasos derivados de procesos bancarios o de terceros.</p>
        </>
      ),
    },
    {
      number: "08",
      title: "Cancelaciones y reembolsos",
      content: (
        <p>
          Las suscripciones pueden cancelarse en cualquier momento, pero no se realizarán reembolsos
          por periodos ya pagados.
        </p>
      ),
    },
    {
      number: "09",
      title: "Uso prohibido",
      content: (
        <p>Queda prohibido el uso indebido de la plataforma, incluyendo actividades fraudulentas o ilegales.</p>
      ),
    },
    {
      number: "10",
      title: "Propiedad intelectual",
      content: (
        <p>Todo el contenido de BodyPlan es propiedad exclusiva de la plataforma y está protegido por las leyes aplicables.</p>
      ),
    },
    {
      number: "11",
      title: "Limitación de responsabilidad",
      content: (
        <p>BodyPlan no garantiza disponibilidad continua ni ausencia de errores en la plataforma.</p>
      ),
    },
    {
      number: "12",
      title: "Proveedores",
      content: (
        <p>Los gimnasios son responsables de los servicios que ofrecen dentro de la plataforma.</p>
      ),
    },
    {
      number: "13",
      title: "Modificaciones",
      content: (
        <p>BodyPlan puede modificar estos términos en cualquier momento, notificando a los usuarios según corresponda.</p>
      ),
    },
    {
      number: "14",
      title: "Legislación aplicable",
      content: (
        <p>Estos términos se rigen por las leyes de los <strong>Estados Unidos Mexicanos</strong>.</p>
      ),
    },
  ];

  return (
    <div className="legal-page">
      {/* Hero */}
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <span className="legal-eyebrow">BodyPlan</span>
          <h1 className="legal-hero-title">Términos y Condiciones</h1>
          <p className="legal-hero-subtitle">
            Lee con atención las condiciones que rigen el uso de nuestra plataforma.
          </p>
          <span className="legal-date">Última actualización: Abril 2025</span>
        </div>
      </div>

      {/* Intro */}
      <div className="legal-intro-wrap">
        <div className="legal-intro">
          Al acceder y utilizar BodyPlan, aceptas quedar vinculado por los presentes Términos y Condiciones.
          Si no estás de acuerdo con alguno de estos términos, te pedimos que no utilices la plataforma.
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

        {/* Footer link */}
        <div className="legal-footer-link">
          <Link to="/politicas-privacidad" target="_blank" rel="noreferrer" className="legal-link-btn">
            Ver Políticas de Privacidad →
          </Link>
          <Link to="/eliminar-cuenta" target="_blank" rel="noreferrer" className="legal-link-btn outlined">
            Eliminar cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;