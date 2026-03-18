import { useEffect, useState } from "react";
import api from "../../../services/axios";

const labelMes = (date) =>
  date.toLocaleDateString("es-MX", { month: "short", year: "numeric" });

export const useDashboardData = (meses = 6) => {

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
      membresiasIniciadas: [],
      membresiasActivas: []
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

        const stats = clientesRes.data.estadisticas || {};
        const clientes = clientesRes.data.clientes || [];
        const gimnasios = gymRes.data.gimnasios || [];
        const rutinas = rutinasRes.data.rutinas || [];

        const ahora = new Date();
        const mesActual = ahora.getMonth();
        const anioActual = ahora.getFullYear();

        const clientesNuevosMes = clientes.filter(c => {
          const f = new Date(c.fecha_inicio);
          return f.getMonth() === mesActual && f.getFullYear() === anioActual;
        }).length;

        const en15Dias = new Date();
        en15Dias.setDate(en15Dias.getDate() + 15);

        const membresiasPorVencer = clientes.filter(c => {
          if (!c.fecha_fin || c.estado !== "activa") return false;
          const fechaFin = new Date(c.fecha_fin);
          return fechaFin >= ahora && fechaFin <= en15Dias;
        }).length;

        const conteoPorGym = {};
        clientes.forEach(c => {
          if (!c.gimnasio?.id_gimnasio) return;
          const key = c.gimnasio.id_gimnasio;
          conteoPorGym[key] = {
            nombre: c.gimnasio.nombre,
            count: (conteoPorGym[key]?.count || 0) + 1
          };
        });

        const gimnasioTop = Object.values(conteoPorGym)
          .sort((a, b) => b.count - a.count)[0]?.nombre || "Sin datos";

        const periodos = Array.from({ length: meses }, (_, i) => {
          const d = new Date(anioActual, mesActual - (meses - 1 - i), 1);
          return { anio: d.getFullYear(), mes: d.getMonth(), label: labelMes(d) };
        });

        const membresiasIniciadas = periodos.map(({ anio, mes }) =>
          clientes.filter(c => {
            const f = new Date(c.fecha_inicio);
            return f.getFullYear() === anio && f.getMonth() === mes;
          }).length
        );

        const membresiasActivasSerie = periodos.map(({ anio, mes }) => {
          const inicioMes = new Date(anio, mes, 1);
          const finMes = new Date(anio, mes + 1, 0, 23, 59, 59);

          return clientes.filter(c => {
            const inicio = new Date(c.fecha_inicio);
            if (inicio > finMes) return false;
            if (!c.fecha_fin) return true;
            const fin = new Date(c.fecha_fin);
            return fin >= inicioMes;
          }).length;
        });

        setDashboard({
          metrics: {
            clientesActivos: stats.clientes_activos   || 0,
            clientesInactivos: stats.clientes_inactivos || 0,
            membresiasActivas: stats.membresias_activas || 0,
            rutinas: rutinas.length,
            gimnasios: gimnasios.length,
            clientesNuevosMes,
            membresiasPorVencer,
            gimnasioTop
          },
          chartData: {
            labels: periodos.map(p => p.label),
            membresiasIniciadas,
            membresiasActivas: membresiasActivasSerie
          }
        });

      } catch (err) {
        console.error("Error cargando dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [meses]);

  return { dashboard, loading };
};