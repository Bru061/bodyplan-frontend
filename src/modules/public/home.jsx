import { MdFitnessCenter, MdPayments, MdStar, MdChatBubble, MdLocationOn } from "react-icons/md";
import { Link } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import "../../styles/home.css";

function Home(){
  return(
    <MainLayout>

      <section className="hero">
        <div className="container hero-content">

          <div className="hero-text fade-up">
            <h1>BODYPLAN</h1>
            <p className="hero-sub fade-up fade-delay">Digitaliza tu gimnasio</p>

            <p className="hero-desc fade-up fade-delay2">
              Reservas, pagos, clientes y reseñas en un solo lugar.
              La plataforma que transforma tu negocio deportivo.
            </p>

            <Link to="/register" className="btn btn-primary fade-up fade-delay2">
              Empieza Gratis
            </Link>
          </div>

          <div className="hero-img fade-up fade-delay3">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80"
              alt="Gimnasio moderno"
            />
          </div>

        </div>
      </section>

      <section className="benefits">
        <div className="container">
          <h2 className="section-title">Todo lo que necesitas en un solo lugar</h2>

          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="material-icons icon"><MdFitnessCenter /></span>
              <h3>Publica tus servicios</h3>
              <p>Agenda, muestra y vende tus servicios fácilmente.</p>
            </div>

            <div className="benefit-card">
              <span className="material-icons icon"><MdPayments /></span>
              <h3>Pagos integrados</h3>
              <p>Acepta pagos sin complicaciones.</p>
            </div>

            <div className="benefit-card">
              <span className="material-icons icon"><MdStar /></span>
              <h3>Reseñas</h3>
              <p>Construye reputación con tus clientes.</p>
            </div>
          </div>

          <div className="benefits-bottom">
            <div className="benefit-card small">
              <span className="material-icons icon"><MdChatBubble /></span>
              <h3>Comunicación directa</h3>
              <p>Habla con tus clientes en tiempo real.</p>
            </div>

            <div className="benefit-card small">
              <span className="material-icons icon"><MdLocationOn /></span>
              <h3>Ubicación</h3>
              <p>Muestra tu gimnasio en el mapa.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="plans">
        <div className="container">
          <h2 className="section-title">Planes flexibles para tu negocio</h2>

          <div className="plans-grid">

            <div className="plan-card">
              <h3>Prueba Gratis</h3>
              <p className="price">$0 <span>(1 mes)</span></p>
              <ul>
                <li>Acceso total durante 1 mes</li>
              </ul>
              <Link to="/register" className="btn btn-primary fade-up fade-delay2">Comenzar</Link>
            </div>

            <div className="plan-card">
              <h3>Básico</h3>
              <p className="price">$299 <span>/mes</span></p>
              <ul>
                <li>Servicios ilimitados</li>
                <li>Gestión de clientes</li>
                <li>Rutinas</li>
                <li>Notificaciones</li>
              </ul>
              <Link to="/register" className="btn btn-primary fade-up fade-delay2">Comenzar</Link>
            </div>

            <div className="plan-card">
              <h3>Pro</h3>
              <p className="price">$399 <span>/mes</span></p>
              <ul>
                <li>Todo lo del plan Básico</li>
                <li>Pagos integrados</li>
                <li>Servicios destacados</li>
              </ul>
              <Link to="/register" className="btn btn-primary fade-up fade-delay2">Empezar</Link>
            </div>

          </div>
        </div>
      </section>

      <section className="demo">
        <div className="container">
          <h2 className="section-title">Mira cómo funciona</h2>

          <Link to="/register" className="btn btn-primary fade-up fade-delay2">
            Empieza Gratis
          </Link>
        </div>
      </section>

    </MainLayout>
  )
}

export default Home;