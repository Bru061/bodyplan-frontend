import {
  MdFitnessCenter, MdPayments, MdStar,
  MdPeople, MdBarChart, MdCalendarToday,
  MdArrowForward
} from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import api from "../../services/axios";
import "../../styles/home.css";
import { useEffect, useState } from "react";

const ACCESOS_HARDCODED = {
  1: [
    { nombre: "Hasta 3 gimnasios",    incluido: true  },
    { nombre: "Gestión de clientes",  incluido: true  },
    { nombre: "Rutinas",              incluido: true  },
    { nombre: "Notificaciones",       incluido: false },
    { nombre: "Exportar reportes",    incluido: false },
    { nombre: "Destacar gimnasio",    incluido: false },
    { nombre: "Soporte prioritario",  incluido: false }
  ],
  2: [
    { nombre: "Hasta 3 gimnasios",    incluido: true  },
    { nombre: "Gestión de clientes",  incluido: true  },
    { nombre: "Rutinas",              incluido: true  },
    { nombre: "Notificaciones",       incluido: true  },
    { nombre: "Exportar reportes",    incluido: false },
    { nombre: "Destacar gimnasio",    incluido: false },
    { nombre: "Soporte prioritario",  incluido: false }
  ],
  3: [
    { nombre: "Gimnasios ilimitados", incluido: true  },
    { nombre: "Gestión de clientes",  incluido: true  },
    { nombre: "Rutinas",              incluido: true  },
    { nombre: "Notificaciones",       incluido: true  },
    { nombre: "Exportar reportes",    incluido: true  },
    { nombre: "Destacar gimnasio",    incluido: true  },
    { nombre: "Soporte prioritario",  incluido: true  }
  ]
};

const BENEFICIOS = [
  { icon: <MdFitnessCenter />, title: "Publica tus servicios",      desc: "Crea y gestiona todos tus servicios, horarios y rutinas desde un solo panel."          },
  { icon: <MdPayments />,      title: "Pagos integrados",           desc: "Acepta pagos de membresías con tarjeta de forma segura a través de Stripe."            },
  { icon: <MdPeople />,        title: "Gestión de clientes",        desc: "Registra, segmenta y da seguimiento a todos tus clientes en tiempo real."              },
  { icon: <MdStar />,          title: "Reseñas y reputación",       desc: "Construye confianza con reseñas verificadas de tus clientes activos."                  },
  { icon: <MdBarChart />,      title: "Reportes y análisis",        desc: "Visualiza el crecimiento de tu negocio con estadísticas claras y exportables."         },
  { icon: <MdCalendarToday />, title: "Personal e instructores",    desc: "Asigna instructores a rutinas y controla sus horarios por gimnasio."                   }
];

function Home() {

  const navigate = useNavigate();
  const [planes, setPlanes]               = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const res = await api.get("/planes/web");
        setPlanes(res.data.planes || []);
      } catch (err) {
        console.error("Error cargando planes", err);
      } finally {
        setLoadingPlanes(false);
      }
    };
    fetchPlanes();
  }, []);

  const formatPrecio  = (plan) => {
    const p = parseFloat(plan.precio);
    return p === 0 ? "$0" : `$${p.toLocaleString("es-MX")}`;
  };

  const formatPeriodo = (plan) => {
    const p = parseFloat(plan.precio);
    if (p === 0) return `(${plan.duracion_dias} días gratis)`;
    if (plan.duracion_dias >= 365) return "/año";
    return "/mes";
  };

  const handlePlan = (plan) => {
    const gratuito = parseFloat(plan.precio) === 0;
    if (gratuito) {
      navigate("/register");
    } else {
      navigate("/register", { state: { planSeleccionado: plan } });
    }
  };

  return (
    <MainLayout>

      {/* ══════════════ HERO ══════════════ */}
      <section className="hero">
        <div className="container hero-content">

          <div className="hero-text">

            <h1 className="fade-up fade-delay">
              Body<span>Plan</span>
            </h1>

            <p className="hero-sub fade-up fade-delay">
              La plataforma todo en uno para gestionar clientes,
              pagos y rutinas sin complicaciones.
            </p>

            <p className="hero-desc fade-up fade-delay2">
              Olvídate de las hojas de cálculo y los grupos de WhatsApp.
              BodyPlan centraliza todo tu negocio en un panel moderno e intuitivo.
            </p>

            <div className="hero-actions fade-up fade-delay2">
              <Link to="/register" className="hero-btn-primary">
                Empieza gratis <MdArrowForward />
              </Link>
              <Link to="/login" className="hero-btn-secondary">
                Ya tengo cuenta →
              </Link>
            </div>

            <div className="fade-up fade-delay2" style={{ marginTop: "1rem" }}>
              <a
                href="https://bodyplan-api.giize.com/api/downloads/BodyPlan.apk"
                download
                className="hero-download-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 17V3M12 17l-5-5M12 17l5-5M2 21h20" />
                </svg>
                Descargar App Android
                <span className="hero-download-badge">APK</span>
              </a>
            </div>

            <div className="hero-stats fade-up fade-delay3">
              <div className="hero-stat-item">
                <span className="hero-stat-value">100%</span>
                <span className="hero-stat-label">Digital y en la nube</span>
              </div>
              <div className="hero-stat-item">
                <span className="hero-stat-value">30 días</span>
                <span className="hero-stat-label">Prueba gratuita</span>
              </div>
              <div className="hero-stat-item">
                <span className="hero-stat-value">Stripe</span>
                <span className="hero-stat-label">Pagos seguros</span>
              </div>
            </div>

          </div>

          <div className="hero-img fade-up fade-delay3">
            <div className="hero-img-wrapper">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80"
                alt="Gimnasio moderno"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════ BENEFICIOS ══════════════ */}
      <section className="benefits">
        <div className="container">
          <h2 className="home-section-title">Todo lo que necesitas en un solo lugar</h2>
          <div className="benefits-grid">
            {BENEFICIOS.map((b, i) => (
              <div key={i} className="benefit-card">
                <div className="benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PLANES ══════════════ */}
      <section className="plans" id="planes">
        <div className="container">
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, textAlign: "center", marginBottom: "1rem", color: "var(--primary-hover)", letterSpacing: "-0.5px" }}>
            Planes flexibles para tu negocio
          </h2>
          <p className="plans-subtitle">
            Empieza gratis y escala cuando lo necesites. Sin contratos, sin sorpresas.
          </p>

          {loadingPlanes ? (
            <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>Cargando planes...</p>
          ) : (
            <div className="plans-grid">
              {planes.map((plan, index) => {
                const gratuito = parseFloat(plan.precio) === 0;
                const popular  = index === 1;
                const accesos  = ACCESOS_HARDCODED[plan.id_plan] || [];

                return (
                  <div key={plan.id_plan} className={`plan-card ${popular ? "plan-card-popular" : ""}`}>
                    {popular && <span className="plan-popular-badge">Más popular</span>}

                    <p className="plan-nombre">{plan.nombre}</p>

                    <div className="plan-precio">
                      <p className="plan-precio-valor">{formatPrecio(plan)}</p>
                      <p className="plan-precio-periodo">{formatPeriodo(plan)}</p>
                    </div>

                    {plan.descripcion && (
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, textAlign: "center" }}>
                        {plan.descripcion}
                      </p>
                    )}

                    <hr className="plan-divider" />

                    <ul className="plan-accesos">
                      {accesos.map((acceso, i) => (
                        <li key={i} className={`plan-acceso-item ${!acceso.incluido ? "excluido" : ""}`}>
                          <span className="plan-acceso-icon">{acceso.incluido ? "✅" : "❌"}</span>
                          {acceso.nombre}
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`plan-btn ${gratuito ? "plan-btn-ghost" : ""}`}
                      onClick={() => handlePlan(plan)}
                    >
                      {gratuito ? "Comenzar gratis" : index === planes.length - 1 ? "Empezar" : "Comenzar"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ DEMO ══════════════ */}
      <section className="demo">
        <div className="container">
          <h2 className="home-section-title">Mira cómo funciona</h2>
          <div className="demo-video-placeholder">
            <div className="demo-play-btn">▶</div>
            <p>Video próximamente</p>
          </div>
          <Link to="/register" className="btn btn-primary" style={{ marginTop: "2rem" }}>
            Empieza Gratis
          </Link>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <p>BodyPlan</p>
            <span>La plataforma que transforma la gestión<br />de tu negocio deportivo.</span>
          </div>
          <div className="footer-col">
            <h4>Producto</h4>
            <ul>
              <li><Link to="/register">Empezar gratis</Link></li>
              <li><Link to="/login">Iniciar sesión</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Planes</h4>
            <ul>
              <li><a href="#planes">Prueba gratis</a></li>
              <li><a href="#planes">Estándar</a></li>
              <li><a href="#planes">Pro</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li><a href="tel:+522451140474">(+52) 245 114 0474</a></li>
              <li><a href="mailto:devnest.contacto@gmail.com">devnest.contacto@gmail.com</a></li>
            </ul>
          </div>
        </div>
      </footer>

    </MainLayout>
  );
}

export default Home;