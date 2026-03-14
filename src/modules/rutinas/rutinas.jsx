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
    total: 0,
    asignadas: 0,
    sinAsignar: 0
  });

  const [vista, setVista] = useState("activas");
  const [clientesPorRutina, setClientesPorRutina] = useState({});

  const contarAsignacionesActivas = (asignaciones) =>
    asignaciones.filter(
      a => a.estado === "pendiente" || a.estado === "iniciada"
    ).length;

  const fetchClientesPorRutina = async (rutinas) => {
    try {
      const conteo = {};
      for (const r of rutinas) {
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
      const res = await api.get("/rutinas");
      const activas = res.data.rutinas || [];

      const conteo = {};
      for (const r of activas) {
        const clientesRes = await api.get(`/rutinas/${r.id_rutina}/clientes`);
        const asignaciones = clientesRes.data?.clientes || [];
        conteo[r.id_rutina] = contarAsignacionesActivas(asignaciones);
      }

      const asignadas = activas.filter(r => (conteo[r.id_rutina] || 0) > 0).length;

      setStats({
        total: activas.length,
        asignadas,
        sinAsignar: activas.length - asignadas
      });

    } catch (err) {
      console.error("Error obteniendo stats", err);
    }
  };

  const fetchRutinas = async () => {
    try {
      setLoading(true);
      const endpoint = vista === "activas" ? "/rutinas" : "/rutinas/desactivadas";
      const res = await api.get(endpoint);
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

  return (

    <DashboardLayout>

      <section className="page-header">
        <div>
          <p className="eyebrow">Gestión de rutinas</p>
          <h1>Rutinas de gimnasio</h1>
          <p className="subtitle">
            Crea y administra rutinas para asignarlas a clientes.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleCrearRutina}
        >
          Crear rutina
        </button>
      </section>

      {gymError && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          {gymError}
          <button
            className="ml-3 text-red-500 font-bold hover:text-red-700"
            onClick={() => setGymError("")}
          >
            ✕
          </button>
        </div>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Rutinas activas</p>
          <p className="stat-value">{stats.total}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Asignadas</p>
          <p className="stat-value">{stats.asignadas}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Sin asignar</p>
          <p className="stat-value">{stats.sinAsignar}</p>
        </article>
      </section>

      <div className="tabs">
        <button
          className={vista === "activas" ? "tab active" : "tab"}
          onClick={() => setVista("activas")}
        >
          Rutinas activas
        </button>
        <button
          className={vista === "desactivadas" ? "tab active" : "tab"}
          onClick={() => setVista("desactivadas")}
        >
          Rutinas desactivadas
        </button>
      </div>

      <section className="panel">
        {loading ? (
          <h2 className="loading">Cargando rutinas...</h2>
        ) : rutinas.length === 0 ? (
          <h2 className="empty-state">
            {vista === "activas"
              ? "No hay rutinas activas"
              : "No hay rutinas desactivadas"}
          </h2>
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
      </section>

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