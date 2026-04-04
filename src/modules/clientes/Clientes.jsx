import DashboardLayout from "../../layout/DashboardLayout";
import { Link, useSearchParams } from "react-router-dom";
import { FiDownload, FiSearch, FiMail, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import api from "../../services/axios";
import "../../styles/clientes.css";
import AddClienteModal from "./AddClienteModal";
import * as XLSX from "xlsx";
import usePermissions from "../../hooks/usePermissions"

const LIMIT = 5;

/**
 * Elimina clientes duplicados por id_usuario del arreglo crudo del API.
 * En caso de duplicado prioriza la entrada con estado "activa" sobre cualquier otra.
 */
function deduplicarClientes(clientesRaw) {
  const mapa = new Map();
  for (const c of clientesRaw) {
    const existente = mapa.get(c.id_usuario);
    if (!existente) {
      mapa.set(c.id_usuario, c);
    } else {
      if (existente.estado !== "activa" && c.estado === "activa") {
        mapa.set(c.id_usuario, c);
      }
    }
  }
  return Array.from(mapa.values());
}

function Clientes() {

  const [searchParams] = useSearchParams();

  const [todosClientes, setTodosClientes] = useState([]);
  const [search, setSearch] = useState("");
  const [gymError, setGymError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [gimnasios, setGimnasios] = useState([]);
  const [membresias, setMembresias] = useState([]);

  const estadoParam = searchParams.get("estado") || "";
  const [filtroEstado, setFiltroEstado] = useState(
    ["activa", "inactiva"].includes(estadoParam) ? estadoParam : ""
  );
  const [filtroGym, setFiltroGym] = useState("");

  const [page, setPage] = useState(1);

  const [stats, setStats] = useState({
    activos: 0,
    inactivos: 0,
    conMembresia: 0,
  });

  const { can, FEATURES, getUpgradeMessage } = usePermissions();
  const fullClientManagementEnabled = can(FEATURES.FULL_CLIENT_MANAGEMENT);

  /**
 * Obtiene todos los clientes y calcula los contadores de activos,
 * inactivos y clientes con membresía activa para las tarjetas de estadísticas.
 */
  const cargarStats = async () => {
    try {
      const res = await api.get("/clientes", { params: { limit: 9999 } });
      const raw = res.data.clientes || [];
      const unicos = deduplicarClientes(raw);

      const activos      = unicos.filter(c => c.estado === "activa").length;
      const inactivos    = unicos.filter(c => c.estado !== "activa").length;
      const conMembresia = unicos.filter(
        c => c.estado === "activa" && c.membresia?.nombre
      ).length;

      setStats({ activos, inactivos, conMembresia });
    } catch (error) {
      console.error("Error cargando stats", error);
    }
  };

  /**
 * Obtiene todos los clientes, los deduplica y los normaliza al formato
 * que consume la tabla: id, nombre, correo, teléfono, estado,
 * fechaInicio, membresía, gimnasio e id_gimnasio.
 */
  const cargarClientes = async () => {
    try {
      const res = await api.get("/clientes", { params: { limit: 9999 } });
      const raw = res.data.clientes || [];
      const unicos = deduplicarClientes(raw);

      const formateados = unicos.map(c => ({
        id: c.id_usuario,
        nombre: c.nombre,
        correo: c.correo,
        telefono: c.telefono || null,
        estado: c.estado,
        fechaInicio: new Date(c.fecha_inicio).toLocaleDateString(),
        membresia: c.membresia?.nombre || "Sin membresía",
        gimnasio: c.gimnasio?.nombre || "Sin gimnasio",
        id_gimnasio: c.gimnasio?.id_gimnasio || null,
      }));

      setTodosClientes(formateados);
    } catch (error) {
      console.error("Error cargando clientes", error);
    }
  };

  useEffect(() => {
    cargarStats();
    cargarClientes();
    fetchGimnasios();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filtroEstado, filtroGym]);

  /**
 * Obtiene los gimnasios del proveedor para poblar el selector de filtro
 * y el modal de registro de clientes.
 */
  const fetchGimnasios = async () => {
    try {
      const res = await api.get("/gym");
      setGimnasios(res.data.gimnasios || res.data);
    } catch (error) {
      console.error("Error cargando gimnasios", error);
    }
  };

  /**
 * Obtiene las membresías disponibles de un gimnasio específico.
 * Se invoca al seleccionar un gimnasio dentro del modal de registro.
 */
  const fetchMembresias = async (id_gimnasio) => {
    try {
      const res = await api.get(`/gym/${id_gimnasio}`);
      setMembresias(res.data.gimnasio.membresias || []);
    } catch (error) {
      console.error("Error cargando membresías", error);
      setMembresias([]);
    }
  };

  /**
 * Verifica el permiso FULL_CLIENT_MANAGEMENT antes de exportar.
 * Si el permiso es válido, obtiene todos los clientes, los deduplica
 * y genera un archivo Excel descargable con los datos relevantes.
 * Muestra un mensaje de upgrade si el plan no tiene el permiso.
 */
  const exportClientes = async () => {
    if (!fullClientManagementEnabled) {
      setGymError(getUpgradeMessage(FEATURES.FULL_CLIENT_MANAGEMENT));
      return;
    }

    try {
      const res = await api.get("/clientes", { params: { limit: 9999 } });
      const raw = res.data.clientes || [];
      const unicos = deduplicarClientes(raw);
      if (unicos.length === 0) return;

      const data = unicos.map(c => ({
        Nombre: c.nombre,
        Correo: c.correo,
        Telefono: c.telefono || "-",
        Gimnasio: c.gimnasio?.nombre || "Sin gimnasio",
        Estado: c.estado,
        "Fecha inicio": new Date(c.fecha_inicio).toLocaleDateString(),
        Membresia: c.membresia?.nombre || "Sin membresía",
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook  = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
      XLSX.writeFile(workbook, "reporte_clientes_bodyplan.xlsx");
    } catch (err) {
      console.error("Error exportando", err);
    }
  };

  const clientesFiltrados = todosClientes.filter(c => {
    if (search && !c.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtroEstado === "activa"   && c.estado !== "activa")   return false;
    if (filtroEstado === "inactiva" && c.estado === "activa")   return false;
    if (filtroGym && c.id_gimnasio !== Number(filtroGym))       return false;
    return true;
  });

  const totalPages    = Math.max(1, Math.ceil(clientesFiltrados.length / LIMIT));
  const paginaSegura  = Math.min(page, totalPages);
  const clientesPagina = clientesFiltrados.slice(
    (paginaSegura - 1) * LIMIT,
    paginaSegura * LIMIT
  );

  /**
 * Verifica el permiso FULL_CLIENT_MANAGEMENT y que el proveedor tenga
 * al menos un gimnasio registrado antes de abrir el modal de registro.
 * Muestra mensajes de error descriptivos si alguna condición no se cumple.
 */
  const handleAbrirModal = async () => {
    if (!fullClientManagementEnabled) {
      setGymError(getUpgradeMessage(FEATURES.FULL_CLIENT_MANAGEMENT));
      return;
    }

    try {
      setGymError("");
      const res = await api.get("/gym");
      if (!res.data.gimnasios || res.data.gimnasios.length === 0) {
        setGymError("Debes registrar un gimnasio antes de agregar clientes.");
        return;
      }
      setShowAddModal(true);
    } catch (err) {
      console.error(err);
      setGymError("No se pudo verificar tus gimnasios.");
    }
  };

  return (
    <DashboardLayout>

      <section className="page-header">
        <div>
          <p className="eyebrow">Gestión de clientes</p>
          <h1>Control de clientes</h1>
          <p className="subtitle">
            Consulta estado, membresía y actividad para asignar rutinas y dar seguimiento rápidamente.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={exportClientes}
            >
            <FiDownload />
            Exportar reporte
          </button>
          <button className="btn btn-primary" onClick={handleAbrirModal}>
            <FiPlus /> Registrar cliente
          </button>
        </div>
      </section>

      {gymError && (
        <div className="modal-error gym-error">
          {gymError}
          <button className="gym-error-close" onClick={() => setGymError("")}>✕</button>
        </div>
      )}

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

      <article className="table-panel">

        <div className="table-toolbar">
          <div className="search-field">
            <FiSearch size={15} />
            <input
              type="text"
              placeholder="Buscar por nombre"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""))
              }
            />
          </div>

          <div className="toolbar-actions">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="activa">Activos</option>
              <option value="inactiva">Inactivos</option>
            </select>

            <select
              value={filtroGym}
              onChange={(e) => setFiltroGym(e.target.value)}
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
                <th>Gimnasio</th>
                <th>Estado</th>
                <th>Suscripción</th>
                <th>Contacto</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {clientesPagina.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No hay clientes que coincidan con el filtro
                  </td>
                </tr>
              ) : (
                clientesPagina.map((cliente) => (
                  <tr key={cliente.id}>

                    <td>
                      <Link to={`/detalle-cliente/${cliente.id}`} className="client-name client-name-link">
                        {cliente.nombre}
                      </Link>
                      <span className="client-meta">
                        Cliente desde {cliente.fechaInicio}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-secondary">
                        {cliente.gimnasio || "No asignado"}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${
                        cliente.estado === "activa" ? "badge-success" : "badge-danger"
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
                        <a
                          href={`mailto:${cliente.correo}`}
                          className="icon-btn"
                          title={`Enviar correo a ${cliente.correo}`}
                        >
                          <FiMail size={15} />
                        </a>
                        {cliente.telefono ? (
                          <a
                            href={`https://wa.me/52${cliente.telefono}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon-btn icon-btn-whatsapp"
                            title={`WhatsApp: ${cliente.telefono}`}
                          >
                            <FaWhatsapp size={15} />
                          </a>
                        ) : (
                          <span
                            className="icon-btn icon-btn-disabled"
                            title="Sin número registrado"
                          >
                            <FaWhatsapp size={15} />
                          </span>
                        )}
                      </div>
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

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={paginaSegura === 1}
            >
              <FiChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                className={`pagination-btn ${paginaSegura === n ? "pagination-active" : ""}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}

            <button
              className="pagination-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={paginaSegura === totalPages}
            >
              <FiChevronRight size={16} />
            </button>

            <span className="pagination-info">
              {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? "s" : ""} en total
            </span>
          </div>
        )}

      </article>

      {showAddModal && (
        <AddClienteModal
          gimnasios={gimnasios}
          membresias={membresias}
          fetchMembresias={fetchMembresias}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            cargarStats();
            cargarClientes();
          }}
        />
      )}

    </DashboardLayout>
  );
}

export default Clientes;