import DashboardLayout from "../../layout/DashboardLayout";
import '../../styles/planes.css'
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

function Planes(){
  return(
    <DashboardLayout>
      <section className="page-header">
        <div>
          <p className="eyebrow">Oferta comercial</p>
          <h1>Planes que ofrece tu gimnasio</h1>
          <p className="subtitle">
            Crea y gestiona los planes que vendes a tus clientes (no los planes de la web).
          </p>
        </div>

        <div className="header-actions">
          <Link to="/planes/nuevo" className="btn btn-primary">
            <FiPlus /> Nuevo plan
          </Link>
        </div>
      </section>

      <section className="plans-grid">
        <article className="card plan-card">
          <h2>Básico</h2>
          <p className="price">$399 / mes</p>
          <ul>
            <li>Acceso a área de cardio</li>
            <li>1 clase grupal por semana</li>
            <li>Horario: 6:00 AM - 4:00 PM</li>
          </ul>
          <div className="card-actions">
            <a href="gym-plans.html" className="btn btn-ghost" type="button">Editar</a>
            <button className="btn btn-danger" type="button">Desactivar</button>
          </div>
        </article>

        <article className="card plan-card">
          <h2>Pro</h2>
          <p className="price">$699 / mes</p>
          <ul>
            <li>Acceso completo al gimnasio</li>
            <li>3 clases grupales por semana</li>
            <li>Asesoría mensual</li>
          </ul>
          <div className="card-actions">
            <a href="gym-plans.html" className="btn btn-ghost" type="button">Editar</a>
            <button className="btn btn-danger" type="button">Desactivar</button>
          </div>
        </article>

        <article className="card plan-card">
          <h2>Premium</h2>
          <p className="price">$1,099 / mes</p>
          <ul>
            <li>Acceso ilimitado</li>
            <li>Entrenador personalizado</li>
            <li>Plan nutricional</li>
          </ul>
          <div className="card-actions">
            <Link to="/planes/editar" className="btn btn-ghost" type="button">Editar</Link>
            <button className="btn btn-danger" type="button">Desactivar</button>
          </div>
        </article>
      </section>
    </DashboardLayout>
  )
}

export default Planes;