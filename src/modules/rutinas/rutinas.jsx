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
  const [showEditModal,setShowEditModal] = useState(false);
  const [rutinaSeleccionada,setRutinaSeleccionada] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    asignadas: 0,
    sinAsignar: 0
  });

  const fetchRutinas = async () => {

    try {

      const res = await api.get("/rutinas");

      const data = res.data.rutinas;

      setRutinas(data);

      setStats({
        total: data.length,
        asignadas: 0,
        sinAsignar: data.length
      });

    } catch(err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchRutinas();

  }, []);

  const handleEdit = (rutina) => {
    setRutinaSeleccionada(rutina);
    setShowEditModal(true);
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
          onClick={() => setShowCreateModal(true)}
        >
          Crear rutina
        </button>

      </section>

      {/* STATS */}

      <section className="stats-grid">

        <article className="stat-card">
          <p className="stat-label">Rutinas creadas</p>
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

      {/* LISTA */}

      <section className="panel">

        {loading ? (

          <h2 className="loading">Cargando rutinas...</h2>

        ) : rutinas.length === 0 ? (

          <h2 className="empty-state">
            No hay rutinas registradas
          </h2>

        ) : (

          rutinas.map(rutina => (
            <RutinaCard
              key={rutina.id_rutina}
              rutina={rutina}
              refresh={fetchRutinas}
              onEdit={handleEdit}
            />
          ))

        )}

      </section>

      {showCreateModal && (
        <CreateRutinaModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchRutinas}
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