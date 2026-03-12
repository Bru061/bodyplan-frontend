import { useEffect, useState } from "react";
import api from "../../../services/axios";

export const useDashboardData = () => {

  const [dashboard, setDashboard] = useState({
    metrics: {
      clientesActivos: 0,
      clientesInactivos: 0,
      membresiasActivas: 0,
      rutinas: 0,
      gimnasios: 0,
      clientesNuevosMes: 0,
      membresiasPorVencer: 0,
      gimnasioTop: "—"
    },
    chartData: {
      labels: [],
      values: []
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const [clientesRes, gymRes, rutinasRes] = await Promise.all([
          api.get("/clientes", { params: { limit: 1000 } }),
          api.get("/gym"),
          api.get("/rutinas")
        ]);

        const stats      = clientesRes.data.estadisticas || {};
        const clientes   = clientesRes.data.clientes || [];
        const gimnasios  = gymRes.data.gimnasios || [];
        const rutinas    = rutinasRes.data.rutinas || [];

        // ── Clientes nuevos este mes ──
        const ahora   = new Date();
        const mesActual = ahora.getMonth();
        const anioActual = ahora.getFullYear();

        const clientesNuevosMes = clientes.filter(c => {
          const fecha = new Date(c.fecha_inicio);
          return fecha.getMonth() === mesActual &&
                 fecha.getFullYear() === anioActual;
        }).length;

        // ── Membresías por vencer en los próximos 15 días ──
        const en15Dias = new Date();
        en15Dias.setDate(en15Dias.getDate() + 15);

        const membresiasPorVencer = clientes.filter(c => {
          if (!c.fecha_fin || c.estado !== "activa") return false;
          const fechaFin = new Date(c.fecha_fin);
          return fechaFin >= ahora && fechaFin <= en15Dias;
        }).length;

        // ── Gimnasio con más clientes ──
        const conteoPorGym = {};
        clientes.forEach(c => {
          if (!c.gimnasio?.id_gimnasio) return;
          const key = c.gimnasio.id_gimnasio;
          conteoPorGym[key] = {
            nombre: c.gimnasio.nombre,
            count: (conteoPorGym[key]?.count || 0) + 1
          };
        });

        const gimnasioTop = Object.values(conteoPorGym).sort(
          (a, b) => b.count - a.count
        )[0]?.nombre || "Sin datos";

        // ── Datos para la gráfica ──
        const chartData = {
          labels: [
            "Clientes activos",
            "Clientes inactivos",
            "Membresías activas",
            "Rutinas creadas",
            "Gimnasios"
          ],
          values: [
            stats.clientes_activos || 0,
            stats.clientes_inactivos || 0,
            stats.membresias_activas || 0,
            rutinas.length,
            gimnasios.length
          ]
        };

        setDashboard({
          metrics: {
            clientesActivos:      stats.clientes_activos || 0,
            clientesInactivos:    stats.clientes_inactivos || 0,
            membresiasActivas:    stats.membresias_activas || 0,
            rutinas:              rutinas.length,
            gimnasios:            gimnasios.length,
            clientesNuevosMes,
            membresiasPorVencer,
            gimnasioTop
          },
          chartData
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