import { useEffect, useState } from "react";
// import axios from "../../../services/axios"; // 🔵 Activar cuando backend esté listo

export const useDashboardData = () => {

  const [dashboard, setDashboard] = useState({
    metrics: {
      clientesActivos: 0,
      clientesInactivos: 0,
      membresiasActivas: 0,
      rutinas: 0,
      servicios: 0
    },
    descriptions: {
      clientesActivos: "",
      clientesInactivos: "",
      membresiasActivas: "",
      rutinas: "",
      servicios: ""
    },
    alerts: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {

        // 🟢 CUANDO EL BACKEND ESTÉ LISTO (DESCOMENTAR)
        /*
        const { data } = await axios.get("/dashboard/metrics");
        setDashboard(data);
        */

        // 🟡 MOCK PROFESIONAL TEMPORAL
        await new Promise(resolve => setTimeout(resolve, 600));

        setDashboard({
          metrics: {
            clientesActivos: 0,
            clientesInactivos: 0,
            membresiasActivas: 0,
            rutinas: 0,
            servicios: 0
          },
          descriptions: {
            clientesActivos: "No se han registrado clientes",
            clientesInactivos: "No se han registrado clientes",
            membresiasActivas: "No se han registrado membresías",
            rutinas: "No se han registrado rutinas",
            servicios: "No se han registrado servicios"
          },
          alerts: [
            {
              type: "warning",
              message: ""
            },
            {
              type: "info",
              message: ""
            },
            {
              type: "danger",
              message: ""
            }
          ]
        });

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { dashboard, loading };
};