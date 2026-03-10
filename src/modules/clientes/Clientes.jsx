import DashboardLayout from "../../layout/DashboardLayout";
import { Link } from "react-router-dom";
import { FiDownload, FiMail, FiFilter, FiSearch } from "react-icons/fi";
import { MdWorkspacePremium } from "react-icons/md";
import { FiPlus} from "react-icons/fi";
import { useState, useEffect } from "react";
import api from "../../services/axios";
import "../../styles/clientes.css";
import AddClienteModal from "./AddClienteModal";
import * as XLSX from "xlsx";

function Clientes() {

  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");
  const [hasGym, setHasGym] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);

  const [gimnasios, setGimnasios] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroGym, setFiltroGym] = useState("");

  const [stats, setStats] = useState({
    activos: 0,
    inactivos: 0,
    conMembresia: 0
  });

  const checkGym = async () => {

    try {

        const res = await api.get("/gym");

        if (!res.data.gimnasios || res.data.gimnasios.length === 0) {
        setHasGym(false);
        } else {
        setHasGym(true);
        }

    } catch (err) {
        console.error(err);
    }

    };

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
        membresia: c.membresia?.nombre || "Sin membresía",
        gimnasio: c.gimnasio?.nombre || "Sin gimnasio",
        id_gimnasio: c.gimnasio?.id_gimnasio || null
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
    checkGym();
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

    const exportClientes = () => {

    if (clientes.length === 0) {
        alert("No hay clientes para exportar");
        return;
    }

    const data = clientes.map(c => ({
        Nombre: c.nombre,
        Telefono: c.telefono,
        Gimnasio: c.gimnasio,
        Estado: c.estado,
        "Fecha inicio": c.fechaInicio,
        Membresia: c.membresia
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

    XLSX.writeFile(workbook, "reporte_clientes_bodyplan.xlsx");

    };

    const clientesFiltrados = clientes.filter((c) => {

    if (filtroEstado && c.estado !== filtroEstado) {
        return false;
    }

    if (filtroGym && c.id_gimnasio !== Number(filtroGym)) {
        return false;
    }

    return true;

    });


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
                    <button type="button" className="btn btn-primary"
                        onClick={exportClientes}>
                        <FiDownload />
                        Exportar reporte
                    </button>

                    <button
                    className="btn btn-primary"
                    onClick={async () => {
                    try {
                        const res = await api.get("/gym");
                        if (!res.data.gimnasios || res.data.gimnasios.length === 0) {
                        alert("Debes registrar un gimnasio antes de agregar clientes.");
                        return;
                        }
                        setShowAddModal(true);
                    } catch (err) {
                        console.error(err);
                        alert("No se pudo verificar tus gimnasios.");
                    }
                    }}
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

                    <select
                        value={filtroEstado}
                        onChange={(e)=>setFiltroEstado(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="activa">Activos</option>
                        <option value="inactiva">Inactivos</option>
                    </select>

                    <select
                    value={filtroGym}
                    onChange={(e)=>setFiltroGym(e.target.value)}
                    >

                    <option value="">Todos los gimnasios</option>

                    {gimnasios.map(g => (
                    <option key={g.id_gimnasio} value={g.id_gimnasio}>
                        {g.nombre}
                    </option>
                    ))}

                    </select>

                    </div>

                </div>


                <div className="table-wrap">

                    <table className="clients-table">

                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Gimnasio</th>
                                <th>Estado</th>
                                <th>Suscripción</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>


                        <tbody>

                            {clientesFiltrados.length === 0 ? (

                                <tr>
                                    <td colSpan="6" className="empty-table">
                                        No hay clientes que coincidan con el filtro
                                    </td>
                                </tr>

                            ) : (

                                clientesFiltrados.map((cliente, index) => (

                                    <tr key={`${cliente.id}-${index}`}>

                                        <td>
                                            <p className="client-name">{cliente.nombre}</p>
                                            <span className="client-meta">
                                                Cliente desde {cliente.fechaInicio}
                                            </span>
                                        </td>

                                        <td>{cliente.telefono}</td>

                                        <td>
                                        <span className="badge badge-secondary">
                                        {cliente.gimnasio || "No asignado"}
                                        </span>
                                        </td>

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