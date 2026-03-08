import DashboardLayout from "../../layout/DashboardLayout";
import { Link } from "react-router-dom";
import { FiDownload, FiMail, FiFilter, FiSearch } from "react-icons/fi";
import { MdWorkspacePremium } from "react-icons/md";
import { FiPlus} from "react-icons/fi";
import { useState, useEffect } from "react";
import api from "../../services/axios";
import "../../styles/clientes.css";
import AddClienteModal from "./AddClienteModal";

function Clientes() {

  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  const [gimnasios, setGimnasios] = useState([]);
  const [membresias, setMembresias] = useState([]);

  const [stats, setStats] = useState({
    activos: 0,
    inactivos: 0,
    conMembresia: 0
  });

  // ================= CLIENTES =================

  const cargarClientes = async (searchTerm = "") => {

    try {

      const res = await api.get("/clientes", {
        params: { search: searchTerm }
      });

      const data = res.data;

      const clientesFormateados = data.clientes.map(c => ({
        id: c.id_usuario,
        nombre: c.nombre,
        telefono: c.telefono || "-",
        estado: c.estado,
        fechaInicio: new Date(c.fecha_inicio).toLocaleDateString(),
        membresia: c.membresia?.nombre || "Sin membresía"
      }));

      setClientes(clientesFormateados);

      setStats({
        activos: data.estadisticas.clientes_activos,
        inactivos: data.estadisticas.clientes_inactivos,
        conMembresia: data.estadisticas.membresias_activas
      });

    } catch (error) {

      console.error("Error cargando clientes", error);

    }

  };

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {

    const delay = setTimeout(() => {
      cargarClientes(search);
    }, 400);

    return () => clearTimeout(delay);

  }, [search]);

  // ================= GIMNASIOS =================

  const fetchGimnasios = async () => {

    try {

      const res = await api.get("/gym");

      setGimnasios(res.data.gimnasios || res.data);

    } catch (error) {

      console.error("Error cargando gimnasios", error);

    }

  };

  useEffect(() => {
    fetchGimnasios();
  }, []);

  // ================= MEMBRESIAS =================

  const fetchMembresias = async (id_gimnasio) => {

    try {

      const res = await api.get(`/gym/${id_gimnasio}`);

      const gym = res.data.gimnasio;

      setMembresias(gym.membresias || []);

    } catch (error) {

      console.error("Error cargando membresías", error);

      setMembresias([]);

    }

  };


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

                    <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                    >
                    <FiPlus/> Registrar cliente
                    </button>
                </div>
            </section>


            <section className="stats-grid">

                <article className="stat-card">
                    <p className="stat-label">Clientes activos</p>
                    <p className="stat-value">{stats.activos}</p>
                </article>

                <article className="stat-card">
                    <p className="stat-label">Clientes inactivos</p>
                    <p className="stat-value">{stats.inactivos}</p>
                </article>

                <article className="stat-card">
                    <p className="stat-label">Con membresía activa</p>
                    <p className="stat-value">{stats.conMembresia}</p>
                </article>

            </section>


            <section className="table-panel">

                <div className="table-toolbar">

                    <div className="search-field">
                        <FiSearch size={15} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="toolbar-actions">

                        <button className="btn btn-filter">
                            <FiFilter size={15} />
                            Estado
                        </button>

                        <button className="btn btn-filter">
                            <MdWorkspacePremium size={15} />
                            Suscripción
                        </button>

                    </div>

                </div>


                <div className="table-wrap">

                    <table className="clients-table">

                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Estado</th>
                                <th>Suscripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>


                        <tbody>

                            {clientes.length === 0 ? (

                                <tr>
                                    <td colSpan="5" className="empty-table">
                                        No hay clientes registrados
                                    </td>
                                </tr>

                            ) : (

                                clientes.map((cliente, index) => (

                                    <tr key={`${cliente.id}-${index}`}>

                                        <td>
                                            <p className="client-name">{cliente.nombre}</p>
                                            <span className="client-meta">
                                                Cliente desde {cliente.fechaInicio}
                                            </span>
                                        </td>

                                        <td>{cliente.telefono}</td>

                                        <td>

                                            <span className={`badge ${
                                                cliente.estado === "activa"
                                                    ? "badge-success"
                                                    : "badge-danger"
                                            }`}>

                                                {cliente.estado}

                                            </span>

                                        </td>

                                        <td>

                                            <span className="badge badge-primary">
                                                {cliente.membresia}
                                            </span>

                                        </td>

                                        <td>

                                            <div className="row-actions">

                                                <Link
                                                    className="btn btn-table"
                                                    to={`/detalle-cliente/${cliente.id}`}
                                                >
                                                    Ver detalle
                                                </Link>

                                                <button
                                                    className="icon-btn"
                                                    aria-label={`Contactar a ${cliente.nombre}`}
                                                >
                                                    <FiMail size={15}/>
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </section>

        {showAddModal && (
        <AddClienteModal
            gimnasios={gimnasios}
            membresias={membresias}
            fetchMembresias={fetchMembresias}
            onClose={() => setShowAddModal(false)}
            onCreated={cargarClientes}
        />

        )}

        </DashboardLayout>
    );
}

export default Clientes;