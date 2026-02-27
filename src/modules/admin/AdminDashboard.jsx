import SuperAdminLayout from '../../layout/AdminLayout'
import { Link } from 'react-router-dom'
import '../../styles/dashboard.css' 
import { MdOutlineCalendarMonth, MdFileDownload } from 'react-icons/md'

function AdminDashboard() {
    return (
        <SuperAdminLayout>
            <section className="page-header">
                <div>
                <p className="eyebrow">Control global de plataforma</p>
                <h1>Dashboard superadministrador</h1>
                <p className="subtitle">Monitorea gimnasios, ingresos y eventos críticos de BodyPlan.</p>
                </div>
                <div className="header-actions">
                <button className="btn btn-primary" type="button"><span className="material-icons"><MdFileDownload /></span> Exportar reporte</button>
                <button className="btn btn-ghost" type="button"><span className="material-icons"><MdOutlineCalendarMonth /></span> Enero 2026</button>  
                </div>
            </section>

            <section className="stats-grid" aria-label="Indicadores globales">
                <article className="stat-card">
                <p className="stat-label">Total gimnasios</p>
                <p className="stat-value">40</p>
                <p className="stat-sub positive">+3 nuevos este mes</p>
                </article>
                <article className="stat-card">
                <p className="stat-label">Gimnasios activos</p>
                <p className="stat-value">35</p>
                <p className="stat-sub">87.5% del total</p>
                </article>
                <article className="stat-card">
                <p className="stat-label">Gimnasios bloqueados</p>
                <p className="stat-value">5</p>
                <p className="stat-sub warning">3 pendientes de revisión</p>
                </article>
                <article className="stat-card">
                <p className="stat-label">Ingresos globales</p>
                <p className="stat-value">$1,200</p>
                <p className="stat-sub positive">+6.8% vs periodo anterior</p>
                </article>
            </section>

            <section className="content-grid">
                <article className="panel">
                <div className="panel-header">
                    <h2>Resumen financiero</h2>
                    <a href="admin-finance.html" className="inline-link">Ver finanzas</a>
                </div>
                <div className="finance-list">
                    <p><span>Suscripciones vigentes</span><strong>40</strong></p>
                    <p><span>Total recibido</span><strong>$1,200</strong></p>
                    <p><span>Pagos vencidos</span><strong>5</strong></p>
                </div>
                </article>

                <article className="panel">
                <div className="panel-header">
                    <h2>Actividad reciente</h2>
                    <a href="admin-moderation.html" className="inline-link">Ver actividad</a>
                </div>
                <ul className="activity-list">
                    <li>
                    <span className="badge badge-warning">Bloqueado</span>
                    Gym "Power District" bloqueado por reporte de pago
                    <span className="time">Hace 1 h</span>
                    </li>
                    <li>
                    <span className="badge badge-info">Sistema</span>
                    Actualización de políticas aplicada a 40 gimnasios
                    <span className="time">Hoy 09:15 AM</span>
                    </li>
                </ul>
                </article>
            </section>

            <section className="panel table-panel" aria-label="Gimnasios con alertas">
                <div className="panel-header">
                <h2>Gimnasios con alertas críticas</h2>
                <Link to="/admin-gyms" className="inline-link">Gestionar gimnasios</Link>
                </div>
                <div className="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Gimnasio</th>
                        <th>Estado</th>
                        <th>Plan</th>
                        <th>Último pago</th>
                        <th>Alerta</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Power District</td>
                        <td><span class="badge badge-warning">Revisión</span></td>
                        <td>Pro</td>
                        <td>02 Ene 2026</td>
                        <td>Pago vencido (8 días)</td>
                    </tr>
                    <tr>
                        <td>Gym Cumbre</td>
                        <td><span class="badge badge-danger">Bloqueado</span></td>
                        <td>Básico</td>
                        <td>15 Dic 2025</td>
                        <td>Pendiente validación manual</td>
                    </tr>
                    <tr>
                        <td>Zona Funcional</td>
                        <td><span class="badge badge-warning">Revisión</span></td>
                        <td>Básico</td>
                        <td>05 Ene 2026</td>
                        <td>Mala calificación</td>
                    </tr>
                    </tbody>
                </table>
                </div>
            </section>
        </SuperAdminLayout>
    )
}

export default AdminDashboard