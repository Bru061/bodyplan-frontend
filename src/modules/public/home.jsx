import { MdFitnessCenter, MdPayments, MdStar, MdChatBubble, MdLocationOn } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import api from "../../services/axios";
import "../../styles/home.css";
import { useEffect, useState } from "react";

function Home(){

  const ACCESOS_HARDCODED = {
  1: [
    { nombre: "Hasta 3 gimnasios", incluido: true },
    { nombre: "Gestión de clientes", incluido: true },
    { nombre: "Rutinas", incluido: true },
    { nombre: "Exportar reportes", incluido: true },
    { nombre: "Módulo de personal", incluido: true },
    { nombre: "Destacar gimnasio", incluido: true },
    { nombre: "Soporte prioritario", incluido: false }
  ],
  2: [
    { nombre: "Hasta 3 gimnasios", incluido: true },
    { nombre: "Gestión de clientes", incluido: true },
    { nombre: "Rutinas", incluido: true },
    { nombre: "Exportar reportes", incluido: true },
    { nombre: "Módulo de personal", incluido: false },
    { nombre: "Destacar gimnasio", incluido: false },
    { nombre: "Soporte prioritario", incluido: false }
  ],
  3: [
    { nombre: "Gimnasios ilimitados", incluido: true },
    { nombre: "Gestión de clientes", incluido: true },
    { nombre: "Rutinas", incluido: true },
    { nombre: "Exportar reportes", incluido: true },
    { nombre: "Módulo de personal", incluido: true },
    { nombre: "Destacar gimnasio", incluido: true },
    { nombre: "Soporte prioritario", incluido: true }
  ]
};

  const navigate = useNavigate();

  const [planes, setPlanes] = useState([]);
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

const formatPrecio = (plan) => {

  const precio = parseFloat(plan.precio);

  if (precio === 0) return "$0";

  return `$${precio.toLocaleString("es-MX")}`;

};

const formatPeriodo = (plan) => {

  const precio = parseFloat(plan.precio);

  if (precio === 0) return `(${plan.duracion_dias} días gratis)`;

  if (plan.duracion_dias >= 365) return "/año";

  return "/mes";

};

  const handlePlan = async (plan) => {

    // Plan gratis → registro normal
    if(plan.precio === 0){
      navigate("/register");
      return;
    }

    try{

      const res = await api.post("/pagos/premium/web/intent",{
        id_plan: plan.id_plan
      });

      navigate("/checkout",{
        state:{
          client_secret: res.data.client_secret,
          desglose: res.data.desglose,
          plan
        }
      });

    }catch(err){

      alert(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "No se pudo iniciar el pago"
      );

    }

  };

  const planesLanding = [
    {
      id_plan: 1,
      nombre: "Prueba Gratis",
      precio: 0,
      texto: "$0",
      periodo: "(1 mes)",
      features: ["Acceso total durante 1 mes"]
    },
    {
      id_plan: 2,
      nombre: "Básico",
      precio: 299,
      texto: "$299",
      periodo: "/mes",
      features: [
        "Servicios ilimitados",
        "Gestión de clientes",
        "Rutinas",
        "Notificaciones"
      ]
    },
    {
      id_plan: 3,
      nombre: "Pro",
      precio: 399,
      texto: "$399",
      periodo: "/mes",
      features: [
        "Todo lo del plan Básico",
        "Pagos integrados",
        "Servicios destacados"
      ]
    }
  ];

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

          {loadingPlanes ? (
            <p style={{ textAlign: "center" }}>Cargando planes...</p>
          ) : (

            <div className="plans-grid">

              {planes.map((plan, index) => {

                const gratuito = parseFloat(plan.precio) === 0;
                const popular = index === 1;
                const accesos = ACCESOS_HARDCODED[plan.id_plan] || [];

                return (

                  <div
                    key={plan.id_plan}
                    className={`plan-card ${popular ? "plan-card-popular" : ""}`}
                  >

                    {popular && (
                      <span className="plan-popular-badge">
                        Más popular
                      </span>
                    )}

                    <p className="plan-nombre">
                      {plan.nombre}
                    </p>

                    <div className="plan-precio">
                      <p className="plan-precio-valor">
                        {formatPrecio(plan)}
                      </p>

                      <p className="plan-precio-periodo">
                        {formatPeriodo(plan)}
                      </p>
                    </div>

                    {plan.descripcion && (
                      <p style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        margin: 0,
                        textAlign: "center"
                      }}>
                        {plan.descripcion}
                      </p>
                    )}

                    <hr className="plan-divider" />

                    <ul className="plan-accesos">

                      {accesos.map((acceso, i) => (

                        <li
                          key={i}
                          className={`plan-acceso-item ${!acceso.incluido ? "excluido" : ""}`}
                        >

                          <span className="plan-acceso-icon">
                            {acceso.incluido ? "✅" : "❌"}
                          </span>

                          {acceso.nombre}

                        </li>

                      ))}

                    </ul>

                    <button
                      className={`plan-btn ${gratuito ? "plan-btn-ghost" : ""}`}
                      onClick={() => handlePlan(plan)}
                    >
                      {gratuito ? "Comenzar gratis" : "Empezar"}
                    </button>

                  </div>

                )

              })}

            </div>

          )}
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