import DashboardLayout from "../../layout/DashboardLayout";
import { Link } from "react-router-dom";
import { FiDownload, FiSearch, FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import api from "../../services/axios";
import "../../styles/clientes.css";
import AddClienteModal from "./AddClienteModal";
import * as XLSX from "xlsx";

function Clientes() {

  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");
  const [hasGym, setHasGym] = useState(true);
  const [gymError, setGymError] = useState("");

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
      setHasGym(res.data.gimnasios?.length > 0);
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
        correo: c.correo,
        telefono: c.telefono || null,
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

  // ── Gimnasios ──
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

  // ── Membresías ──
  const fetchMembresias = async (id_gimnasio) => {
    try {
      const res = await api.get(`/gym/${id_gimnasio}`);
      setMembresias(res.data.gimnasio.membresias || []);
    } catch (error) {
      console.error("Error cargando membresías", error);
      setMembresias([]);
    }
  };

  // ── Exportar ──
  const exportClientes = () => {
    if (clientes.length === 0) return;

    const data = clientes.map(c => ({
      Nombre: c.nombre,
      Correo: c.correo,
      Telefono: c.telefono || "-",
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

  // ── Filtros ──
  const clientesFiltrados = clientes.filter((c) => {
    if (filtroEstado && c.estado !== filtroEstado) return false;
    if (filtroGym && c.id_gimnasio !== Number(filtroGym)) return false;
    return true;
  });

  // ── Abrir modal con verificación de gimnasio ──
  const handleAbrirModal = async () => {
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
          <h1>Control de clientes del gimnasio</h1>
          <p className="subtitle">
            Consulta estado, membresía y actividad para asignar rutinas y dar seguimiento rápidamente.
          </p>
        </div>

        <div className="header-actions">
          <button type="button" className="btn btn-primary" onClick={exportClientes}>
            <FiDownload />
            Exportar reporte
          </button>
          <button className="btn btn-primary" onClick={handleAbrirModal}>
            <FiPlus /> Registrar cliente
          </button>
        </div>
      </section>

      {/* ✅ FIX: Error de gimnasio inline en lugar de alert */}
      {gymError && (
        <div className="modal-error" style={{ marginBottom: "1rem" }}>
          {gymError}
          <button
            onClick={() => setGymError("")}
            style={{ marginLeft: "12px", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
          >✕</button>
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

      <section className="table-panel">

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
                {/* ✅ Nueva columna Contacto — Teléfono eliminado */}
                <th>Contacto</th>
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

                    {/* ✅ Columna Contacto: correo y WhatsApp */}
                    <td>
                      <div className="row-actions">

                        {/* Correo — siempre disponible */}
                        <a
                          href={`mailto:${cliente.correo}`}
                          className="icon-btn"
                          title={`Enviar correo a ${cliente.correo}`}
                        >
                          <FiMail size={15} />
                        </a>

                        {/* WhatsApp — deshabilitado si no tiene teléfono */}
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