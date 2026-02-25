import DashboardLayout from "../../layout/DashboardLayout";
import '../../styles/notificaciones.css'
import { Link } from "react-router-dom";
import { FiBell, FiUserPlus, FiCreditCard, FiAlertTriangle, FiCheckCircle, FiSearch, FiFilter, FiEye } from 'react-icons/fi';

function Notificaciones() {
    return (
        <DashboardLayout>
            <section className="page-header">
                <div>
                <p className="eyebrow">Eventos del sistema</p>
                <h1>Notificaciones</h1>
                <p>Revisa nuevas suscripciones, pagos y alertas importantes del gimnasio.</p>
                </div>
                <button className="btn btn-primary" type="button"><span className="material-icons"><FiCheckCircle /></span> Marcar todo como leído</button>
            </section>

            <section className="toolbar">
                <div className="search-box">
                <span className="material-icons"><FiSearch /></span>
                <input type="text" placeholder="Buscar notificaciones" />
                </div>
                <div className="filter-group">
                <button className="btn btn-filter is-active" type="button">Todas</button>
                <button className="btn btn-filter" type="button">Pagos</button>
                <button className="btn btn-filter" type="button">Suscripciones</button>
                <button className="btn btn-filter" type="button">Sistema</button>
                </div>
            </section>

            <section className="notifications-list" aria-label="Listado de notificaciones">
                <article className="notification-card unread">
                <div className="notif-icon subscription"><span className="material-icons"><FiUserPlus /></span></div>
                <div className="notif-content">
                    <div className="notif-title-row"><h2>Nueva suscripción</h2><span className="badge success">Suscripción</span></div>
                    <p>Nuevo cliente inscrito: <strong>Juan Pérez</strong>.</p>
                    <span className="notif-time">Hace 5 minutos</span>
                </div>
                <a className="btn btn-primary" href="view-clients.html"><span className="material-icons"><FiEye /></span> Ver cliente</a>
                </article>

                <article className="notification-card unread">
                <div className="notif-icon payment"><span className="material-icons"><FiCreditCard /></span></div>
                <div className="notif-content">
                    <div className="notif-title-row"><h2>Pago recibido</h2><span className="badge info">Pago</span></div>
                    <p>Se recibió un pago de <strong>$299</strong> correspondiente al plan Básico.</p>
                    <span className="notif-time">Hace 30 minutos</span>
                </div>
                </article>

                <article className="notification-card unread">
                <div className="notif-icon warning"><span className="material-icons"><FiAlertTriangle /></span></div>
                <div className="notif-content">
                    <div className="notif-title-row"><h2>Alerta de sistema</h2><span className="badge danger">Sistema</span></div>
                    <p>Tu plan web vence en <strong>3 días</strong>. Renueva para mantener funciones activas.</p>
                    <span className="notif-time">Ayer, 10:42 AM</span>
                </div>
                <Link className="btn btn-ghost" to="/suscripciones">Renovar</Link>
                </article>
            </section>
        </DashboardLayout>
    );
}

export default Notificaciones;