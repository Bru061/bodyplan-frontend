import { useEffect, useState } from "react";
import api from "../../../services/axios";

export const useDashboardData = () => {

  const [dashboard, setDashboard] = useState({
    metrics: {
      clientesActivos: 0,
      clientesInactivos: 0,
      membresiasActivas: 0,
      rutinas: 0,
      gimnasios: 0
    },
    descriptions: {
      clientesActivos: "",
      clientesInactivos: "",
      membresiasActivas: "",
      rutinas: "",
      gimnasios: ""
    },
    alerts: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

  const fetchData = async () => {

    try {

      const [clientesRes, gymRes, rutinasRes] = await Promise.all([
        api.get("/clientes"),
        api.get("/gym"),
        api.get("/rutinas")
      ]);

      const stats = clientesRes.data.estadisticas || {};

      const gimnasios = gymRes.data.gimnasios || [];
      const rutinas = rutinasRes.data.rutinas || [];

      setDashboard({
        metrics: {
          clientesActivos: stats.clientes_activos || 0,
          clientesInactivos: stats.clientes_inactivos || 0,
          membresiasActivas: stats.membresias_activas || 0,
          rutinas: rutinas.length,
          gimnasios: gimnasios.length
        },
        descriptions: {
          clientesActivos: "Clientes con membresía vigente",
          clientesInactivos: "Clientes sin membresía activa",
          membresiasActivas: "Membresías activas",
          rutinas: "Rutinas creadas",
          gimnasios: "Gimnasios registrados"
        },
        alerts: []
      });

    } catch (err) {
      console.error("Error cargando dashboard", err);
    } finally {
      setLoading(false);
    }

  };

    fetchData();

  }, []);

  return { dashboard, loading };

};