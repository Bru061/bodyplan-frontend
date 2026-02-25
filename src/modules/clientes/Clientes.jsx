import DashboardLayout from "../../layout/DashboardLayout";
import { Link } from "react-router-dom";
import { FiDownload, FiMail, FiFilter, FiSearch} from "react-icons/fi";
import { MdWorkspacePremium } from "react-icons/md";
import '../../styles/clientes.css'

function Clientes() {

    return (
        <DashboardLayout>
            <section className="page-header">
                <div>
                <p className="eyebrow">Gestión de clientes</p>
                <h1>Control de clientes del gimnasio</h1>
                <p className="subtitle">
                    Consulta estado, membresía y actividad para asignar rutinas y dar seguimiento rápidamente.
                </p>
                </div>
                <div className="header-actions">
                <button type="button" className="btn btn-primary">
                    <FiDownload />
                    Exportar
                </button>
                </div>
            </section>

            <section className="stats-grid" aria-label="Resumen de clientes">
            <article className="stat-card">
                <p className="stat-label">Clientes activos</p>
                <p className="stat-value">48</p>
                <p className="stat-sub positive">+4 este mes</p>
            </article>
            <article className="stat-card">
                <p className="stat-label">Clientes inactivos</p>
                <p className="stat-value">8</p>
                <p className="stat-sub">Sin cambios esta semana</p>
            </article>
            <article className="stat-card">
                <p className="stat-label">Con membresía activa</p>
                <p className="stat-value">41</p>
                <p className="stat-sub">73% del total</p>
            </article>
            </section>

            <section className="table-panel" aria-label="Listado de clientes">
                <div className="table-toolbar">
                <div className="search-field">
                    <FiSearch size={15}/>
                    <input type="text" placeholder="Buscar por nombre" aria-label="Buscar cliente por nombre" />
                </div>

                <div className="toolbar-actions">
                    <button type="button" className="btn btn-filter">
                    <FiFilter size={15}/>
                    Estado
                    </button>
                    <button type="button" className="btn btn-filter">
                    <MdWorkspacePremium size={15}/>
                    Membresía
                    </button>
                </div>
                </div>

                <div className="table-wrap">
                <table className="clients-table">
                    <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Suscripción</th>
                        <th>Historial</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>
                        <p className="client-name">Juan Pérez</p>
                        <span className="client-meta">Cliente desde ene 2025</span>
                        </td>
                        <td><span className="badge badge-success">Activo</span></td>
                        <td><span className="badge badge-primary">Premium (1 año)</span></td>
                        <td>12 clases</td>
                        <td>
                        <div className="row-actions">
                            <a className="btn btn-table" href="view-clients.html">Ver detalle</a>
                            <button className="icon-btn" aria-label="Contactar a Juan Pérez">
                            <FiMail size={15}/>
                            </button>
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                        <p className="client-name">Ana López</p>
                        <span className="client-meta">Cliente desde ago 2024</span>
                        </td>
                        <td><span className="badge badge-danger">Inactivo</span></td>
                        <td><span className="badge badge-neutral">Sin suscripción</span></td>
                        <td>5 clases</td>
                        <td>
                        <div className="row-actions">
                            <Link className="btn btn-table" to="/clientes/1">Ver detalle</Link>
                            <button className="icon-btn" aria-label="Contactar a Ana López">
                            <FiMail size={15}/>
                            </button>
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                        <p className="client-name">Carlos Sánchez</p>
                        <span className="client-meta">Cliente desde mar 2025</span>
                        </td>
                        <td><span className="badge badge-success">Activo</span></td>
                        <td><span className="badge badge-info">Pro (6 meses)</span></td>
                        <td>10 clases</td>
                        <td>
                        <div className="row-actions">
                            <Link className="btn btn-table" to="/clientes/1">Ver detalle</Link>
                            <button className="icon-btn" aria-label="Contactar a Carlos Sánchez">
                            <FiMail size={15}/>
                            </button>
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                        <p className="client-name">María García</p>
                        <span className="client-meta">Cliente desde nov 2024</span>
                        </td>
                        <td><span className="badge badge-success">Activo</span></td>
                        <td><span className="badge badge-info">Pro (3 meses)</span></td>
                        <td>8 clases</td>
                        <td>
                        <div className="row-actions">
                            <Link className="btn btn-table" to="/clientes/1">Ver detalle</Link>
                            <button className="icon-btn" aria-label="Contactar a María García">
                            <FiMail size={15}/>
                            </button>
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                        <p className="client-name">Laura Martínez</p>
                        <span className="client-meta">Cliente desde dic 2023</span>
                        </td>
                        <td><span className="badge badge-success">Activo</span></td>
                        <td><span className="badge badge-primary">Premium (1 año)</span></td>
                        <td>15 clases</td>
                        <td>
                        <div className="row-actions">
                            <Link className="btn btn-table" to="/clientes/1">Ver detalle</Link>
                            <button className="icon-btn" aria-label="Contactar a Laura Martínez">
                            <FiMail size={15}/>
                            </button>
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                        <p className="client-name">Miguel Hernández</p>
                        <span className="client-meta">Cliente desde may 2024</span>
                        </td>
                        <td><span className="badge badge-danger">Inactivo</span></td>
                        <td><span className="badge badge-neutral">Sin suscripción</span></td>
                        <td>7 clases</td>
                        <td>
                        <div className="row-actions">
                            <Link className="btn btn-table" to="/clientes/1">Ver detalle</Link>
                            <button className="icon-btn" aria-label="Contactar a Miguel Hernández">
                            <FiMail size={15}/>
                            </button>
                        </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
                </div>
            </section>
        </DashboardLayout>
    );
}

export default Clientes;