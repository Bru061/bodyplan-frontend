import DashboardLayout from "../../layout/DashboardLayout";
import "../../styles/rutinas.css";
import { useState, useEffect } from "react";
import api from "../../services/axios";
import RutinaCard from "../../components/rutinas/RutinaCard";
import CreateRutinaModal from "./CreateRutinaModal";
import EditRutinaModal from "./EditRutinaModal";

function Rutinas() {

  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [gymError, setGymError] = useState("");

  const [stats, setStats] = useState({
    generales: 0,
    personalizadas: 0,
    asignadas: 0
  });

  const [vista, setVista] = useState("generales");
  const [clientesPorRutina, setClientesPorRutina] = useState({});

  const contarAsignacionesActivas = (asignaciones) =>
    asignaciones.filter(a => a.estado === "pendiente" || a.estado === "iniciada").length;

  const fetchClientesPorRutina = async (lista) => {
    try {
      const conteo = {};
      for (const r of lista) {
        const res = await api.get(`/rutinas/${r.id_rutina}/clientes`);
        const asignaciones = res.data?.clientes || [];
        conteo[r.id_rutina] = contarAsignacionesActivas(asignaciones);
      }
      setClientesPorRutina(conteo);
    } catch (err) {
      console.error("Error obteniendo clientes por rutina", err);
    }
  };

  const fetchStats = async () => {
    try {
      const [resGenerales, resPersonalizadas] = await Promise.all([
        api.get("/rutinas/generales"),
        api.get("/rutinas/personalizadas")
      ]);

      const generales = resGenerales.data.rutinas     || [];
      const personalizadas = resPersonalizadas.data.rutinas || [];
      const todas = [...generales, ...personalizadas];

      const conteo = {};
      for (const r of todas) {
        const clientesRes = await api.get(`/rutinas/${r.id_rutina}/clientes`);
        conteo[r.id_rutina] = contarAsignacionesActivas(clientesRes.data?.clientes || []);
      }

      const asignadas = todas.filter(r => (conteo[r.id_rutina] || 0) > 0).length;

      setStats({
        generales: generales.length,
        personalizadas: personalizadas.length,
        asignadas
      });
    } catch (err) {
      console.error("Error obteniendo stats", err);
    }
  };

  const fetchRutinas = async () => {
    try {
      setLoading(true);
      const endpoints = {
        generales: "/rutinas/generales",
        personalizadas: "/rutinas/personalizadas",
        desactivadas: "/rutinas/desactivadas"
      };
      const res = await api.get(endpoints[vista]);
      const data = res.data.rutinas || [];
      setRutinas(data);
      fetchClientesPorRutina(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRutinas();
    fetchStats();
  }, [vista]);

  const handleEdit = (rutina) => {
    setRutinaSeleccionada(rutina);
    setShowEditModal(true);
  };

  const handleCrearRutina = async () => {
    setGymError("");
    try {
      const res = await api.get("/gym");
      if (!res.data.gimnasios || res.data.gimnasios.length === 0) {
        setGymError("Debes registrar al menos un gimnasio antes de crear rutinas.");
        return;
      }
      setShowCreateModal(true);
    } catch (err) {
      console.error(err);
      setGymError("No se pudo verificar tus gimnasios. Intenta de nuevo.");
    }
  };

  const emptyMsg = {
    generales: "No hay rutinas generales activas.",
    personalizadas: "No hay rutinas personalizadas.",
    desactivadas: "No hay rutinas desactivadas."
  };

  return (
    <DashboardLayout>

      <section className="page-header">
        <div>
          <h1>Rutinas</h1>
          <p className="subtitle">Crea y administra rutinas para asignarlas a clientes.</p>
        </div>
        <button className="btn btn-primary" onClick={handleCrearRutina}>
          Crear rutina
        </button>
      </section>

      {gymError && (
        <div className="modal-error gym-error">
          {gymError}
          <button className="gym-error-close" onClick={() => setGymError("")}>✕</button>
        </div>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Rutinas generales</p>
          <p className="stat-value">{stats.generales}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Personalizadas</p>
          <p className="stat-value">{stats.personalizadas}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Asignadas activamente</p>
          <p className="stat-value">{stats.asignadas}</p>
        </article>
      </section>

      <div className="tabs">
        <button
          className={`tab ${vista === "generales" ? "active" : ""}`}
          onClick={() => setVista("generales")}
        >
          Generales
        </button>
        <button
          className={`tab ${vista === "personalizadas" ? "active" : ""}`}
          onClick={() => setVista("personalizadas")}
        >
          Personalizadas
        </button>
        <button
          className={`tab ${vista === "desactivadas" ? "active" : ""}`}
          onClick={() => setVista("desactivadas")}
        >
          Desactivadas
        </button>
      </div>

      <article className="panel">
        {loading ? (
          <p className="empty-state">Cargando rutinas...</p>
        ) : rutinas.length === 0 ? (
          <p className="empty-state">{emptyMsg[vista]}</p>
        ) : (
          rutinas.map(rutina => (
            <RutinaCard
              key={rutina.id_rutina}
              rutina={rutina}
              refresh={fetchRutinas}
              refreshStats={fetchStats}
              onEdit={handleEdit}
              clientesCount={clientesPorRutina[rutina.id_rutina] || 0}
            />
          ))
        )}
      </article>

      {showCreateModal && (
        <CreateRutinaModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { fetchRutinas(); fetchStats(); }}
        />
      )}

      {showEditModal && (
        <EditRutinaModal
          rutina={rutinaSeleccionada}
          onClose={() => setShowEditModal(false)}
          onUpdated={fetchRutinas}
        />
      )}

    </DashboardLayout>
  );
}

export default Rutinas;