import { Link } from "react-router-dom";
import "../../styles/legalpage.css";

function PrivacyPolicy() {
  const sections = [
    {
      number: "01",
      title: "Responsable del tratamiento",
      content: (
        <>
          <p>El responsable del tratamiento de tus datos personales es:</p>
          <ul>
            <li><strong>Nombre:</strong> DevNest</li>
            <li><strong>Correo:</strong> <a href="mailto:devnest.contacto@gmail.com">devnest.contacto@gmail.com</a></li>
          </ul>
        </>
      ),
    },
    {
      number: "02",
      title: "Datos que recopilamos",
      content: (
        <>
          <p>Podemos recopilar los siguientes datos personales:</p>
          <ul>
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Número telefónico</li>
            <li>Información de perfil</li>
            <li>Datos de acceso (usuario y contraseña cifrada)</li>
            <li>Información de suscripciones</li>
            <li>Ubicación</li>
          </ul>
        </>
      ),
    },
    {
      number: "03",
      title: "Finalidad del uso de datos",
      content: (
        <>
          <p>Utilizamos tus datos para:</p>
          <ul>
            <li>Crear y administrar tu cuenta</li>
            <li>Brindar acceso a funcionalidades de la app</li>
            <li>Gestionar suscripciones</li>
            <li>Personalizar tu experiencia (rutinas, recomendaciones)</li>
            <li>Enviarte notificaciones importantes</li>
            <li>Mejorar nuestros servicios</li>
          </ul>
        </>
      ),
    },
    {
      number: "04",
      title: "Uso de servicios de terceros",
      content: (
        <>
          <p>
            Para el procesamiento de pagos, utilizamos los servicios de <strong>Stripe</strong>.
            BodyPlan no almacena ni procesa directamente datos bancarios o de tarjetas.
            Toda la información de pago es gestionada de forma segura por Stripe, conforme a sus propios términos y políticas de privacidad.
          </p>
          <p>
            Al utilizar la plataforma, el usuario acepta que sus datos necesarios para el procesamiento de pagos sean compartidos con Stripe para la correcta ejecución de las transacciones.
          </p>
          <p>
            BodyPlan opera bajo un esquema de procesamiento de pagos con liquidación diferida, lo que implica que los pagos pueden no reflejarse de forma inmediata.
          </p>
          <p>Además, podemos utilizar otros servicios de terceros como:</p>
          <ul>
            <li>Servicios de autenticación (Google)</li>
            <li>Servicios de hosting y bases de datos</li>
          </ul>
        </>
      ),
    },
    {
      number: "05",
      title: "Protección de datos",
      content: (
        <>
          <p>Implementamos medidas de seguridad como:</p>
          <ul>
            <li>Cifrado de contraseñas</li>
            <li>Uso de conexiones seguras (HTTPS)</li>
            <li>Control de acceso a la información</li>
          </ul>
          <p>Sin embargo, ningún sistema es completamente seguro, por lo que no podemos garantizar seguridad absoluta.</p>
        </>
      ),
    },
    {
      number: "06",
      title: "Derechos del usuario",
      content: (
        <>
          <p>Como usuario, tienes derecho a:</p>
          <ul>
            <li>Acceder a tus datos personales</li>
            <li>Rectificar información incorrecta</li>
            <li>Solicitar la eliminación de tus datos</li>
          </ul>
          <p>
            Puedes ejercer estos derechos enviando un correo a:{" "}
            <a href="mailto:devnest.contacto@gmail.com">devnest.contacto@gmail.com</a>
          </p>
        </>
      ),
    },
    {
      number: "07",
      title: "Retención de datos",
      content: (
        <p>Conservamos tus datos mientras tu cuenta esté activa o sea necesario para cumplir con obligaciones legales.</p>
      ),
    },
    {
      number: "08",
      title: "Uso de cookies",
      content: (
        <>
          <p>En la versión web, utilizamos cookies para:</p>
          <ul>
            <li>Mantener sesiones activas</li>
            <li>Analizar el uso del sitio</li>
            <li>Mejorar la experiencia del usuario</li>
          </ul>
        </>
      ),
    },
    {
      number: "09",
      title: "Cambios a esta política",
      content: (
        <p>
          Nos reservamos el derecho de modificar esta política en cualquier momento.
          Los cambios serán notificados por correo o mediante la plataforma.
        </p>
      ),
    },
    {
      number: "10",
      title: "Contacto",
      content: (
        <>
          <p>Si tienes dudas sobre esta Política de Privacidad, puedes contactarnos:</p>
          <p>
            <strong>Correo:</strong>{" "}
            <a href="mailto:devnest.contacto@gmail.com">devnest.contacto@gmail.com</a>
          </p>
          <p>Al utilizar BodyPlan, aceptas esta Política de Privacidad.</p>
        </>
      ),
    },
  ];

  return (
    <div className="legal-page">
      {/* Hero */}
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <span className="legal-eyebrow">BodyPlan</span>
          <h1 className="legal-hero-title">Políticas de Privacidad</h1>
          <p className="legal-hero-subtitle">
            Conoce cómo recopilamos, usamos y protegemos tu información personal.
          </p>
          <span className="legal-date">Última actualización: Abril 2025</span>
        </div>
      </div>

      {/* Intro */}
      <div className="legal-intro-wrap">
        <div className="legal-intro">
          En BodyPlan, valoramos tu privacidad y nos comprometemos a proteger tus datos personales.
          Esta Política describe cómo tratamos tu información cuando utilizas nuestra aplicación y sitio web.
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
          <Link to="/terminos-y-condiciones" className="legal-link-btn">
            Ver Términos y Condiciones →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;