import DashboardLayout from "../../layout/DashboardLayout";
import "../../styles/servicios.css";
import { Link } from "react-router-dom";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

function Servicios() {
    return (
        <DashboardLayout>
            <section className="page-header">
        <div>
          <p className="eyebrow">Promociones activas</p>
          <h1>Perfiles de servicio publicados</h1>
          <p className="subtitle">Cada tarjeta representa una promoción completa con información propia.</p>
        </div>
        <Link to="/add-service" className="btn btn-primary">
          <FiPlus size={18}/>
          Publicar nuevo servicio
        </Link>
      </section>

      <section className="service-list">
        <article className="service-profile-card">
          <section className="cover-card" aria-label="Portada del servicio CrossFit">
            <img src="gym1.jpg" alt="Portada servicio CrossFit" className="cover-image" />
            <div className="cover-overlay"></div>
            <div className="cover-content">
              <h2>CrossFit Elite</h2>
              <p>Tehuacán, Puebla</p>
            </div>
          </section>

          <section className="info-grid">
            <article className="info-card panel-wide"><h3>Acerca de</h3><p>Programa para atletas que buscan fuerza y resistencia con sesiones de alta intensidad.</p></article>
            <article className="info-card"><h3>Información para visitantes</h3><ul><li> Lun a Sáb: 6:00 AM - 10:00 PM</li><li> Entrada por clase: $180</li><li> Requiere evaluación inicial</li></ul></article>
            <article className="info-card"><h3>Servicios incluidos</h3><ul><li> Entrenamiento funcional</li><li> Fuerza y acondicionamiento</li><li> Hidratación post-entreno</li></ul></article>
            <article className="info-card"><h3>Promoción</h3><ul><li> 25% en primer mes</li><li> 2x1 en inscripción por pareja</li></ul></article>
            <article className="info-card"><h3>Ubicación</h3><p>📍 Av. Reforma 220, Col. Centro, Tehuacán.</p></article>
            <article className="info-card panel-wide"><h3>Fotos</h3><div className="photos"><img src="gym1.jpg" alt="CrossFit interior" /><img src="gym2.jpg" alt="CrossFit zona libre" /><img src="gym3.jpg" alt="CrossFit pesas" /></div></article>
          </section>

          <section className="actions-bar" aria-label="Acciones del servicio CrossFit">
            <button className="btn btn-primary" type= "button"><FiEdit size={18}/>Editar</button>
            <button className="btn btn-danger" type="button"><FiTrash2 size={18}/>Eliminar</button>
          </section>
        </article>

      </section>
        </DashboardLayout>
    );
}

export default Servicios;