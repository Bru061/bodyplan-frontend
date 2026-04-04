import { useEffect, useState } from "react";
import api from "../../../services/axios";

const labelMes = (date) =>
  date.toLocaleDateString("es-MX", { month: "short", year: "numeric" });

/**
 * Hook que obtiene y prepara todos los datos necesarios para el dashboard.
 * Implementa una estrategia de doble fuente con fallback automático:
 *   1. Intenta obtener datos del endpoint optimizado "/proveedor/estadisticas".
 *   2. Si falla, reconstruye las métricas y series temporales consultando
 *      "/clientes", "/gym" y "/rutinas" por separado y calculando los
 *      valores localmente.
 */
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
      membresiasActivas: [],
      clientesActivos: [],
      clientesInactivos: [],
      gimnasiosRankingLabels: [],
      gimnasiosRankingValores: []
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    /**
 * Orquesta la carga de datos intentando primero el endpoint principal.
 * Si este falla, ejecuta el fallback con tres peticiones paralelas y
 * calcula localmente:
 *   - clientesNuevosMes: inscritos en el mes y año actuales.
 *   - membresiasPorVencer: membresías activas que vencen en los próximos 15 días.
 *   - gimnasioTop: gimnasio con mayor cantidad de clientes.
 *   - Series temporales por periodo (membresiasIniciadas, membresiasActivas,
 *     clientesActivos, clientesInactivos) para los últimos N meses.
 *   - Ranking de los 5 gimnasios con más clientes activos.
 * Actualiza el estado dashboard con métricas y datos de gráficas.
 * Se re-ejecuta si cambia el parámetro meses.
 */
    const fetchData = async () => {

      try {
        const proveedorStatsRes = await api.get("/proveedor/estadisticas", { params: { meses } });
        const payload = proveedorStatsRes.data || {};
        const resumen = payload.resumen || {};
        const gimnasiosDetalle = payload.gimnasios || [];
        const mesesDetalle = payload.meses || [];

        if (!Array.isArray(mesesDetalle) || mesesDetalle.length === 0) {
          throw new Error("Respuesta sin serie mensual en /proveedor/estadisticas");
        }

        const labels = mesesDetalle.map((item) => {
          const anio = item.anio ?? item.year;
          const mes = (item.mes ?? item.month ?? 1) - 1;
          const fecha = new Date(anio, mes, 1);
          return labelMes(fecha);
        });
        setDashboard({
          metrics: {
            clientesActivos: resumen.clientes_activos ?? 0,
            clientesInactivos: resumen.clientes_inactivos ?? 0,
            membresiasActivas: resumen.membresias_activas ?? resumen.clientes_activos ?? 0,
            rutinas: resumen.total_rutinas ?? 0,
            gimnasios: resumen.total_gimnasios ?? gimnasiosDetalle.length ?? 0,
            clientesNuevosMes: resumen.clientes_nuevos_mes ?? 0,
            membresiasPorVencer: resumen.membresias_por_vencer ?? 0,
            gimnasioTop: resumen.gimnasio_top || "Sin datos",
          },
          chartData: {
            labels,
            membresiasIniciadas: mesesDetalle.map((item) => item.membresias_iniciadas ?? item.clientes_nuevos ?? 0),
            membresiasActivas: mesesDetalle.map((item) => item.membresias_activas ?? item.clientes_activos ?? 0),
            clientesActivos: mesesDetalle.map((item) => item.clientes_activos ?? 0),
            clientesInactivos: mesesDetalle.map((item) => item.clientes_inactivos ?? 0),
            gimnasiosRankingLabels: gimnasiosDetalle
              .slice()
              .sort((a, b) => (b.clientes_activos ?? 0) - (a.clientes_activos ?? 0))
              .slice(0, 5)
              .map((g) => g.nombre_gimnasio || g.nombre || "Gimnasio"),
            gimnasiosRankingValores: gimnasiosDetalle
              .slice()
              .sort((a, b) => (b.clientes_activos ?? 0) - (a.clientes_activos ?? 0))
              .slice(0, 5)
              .map((g) => g.clientes_activos ?? 0),
          },
        });
        return;
      } catch (endpointErr) {
        console.warn("No se pudo usar /proveedor/estadisticas, aplicando fallback", endpointErr);
      }

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

        const clientesActivosSerie = periodos.map(({ anio, mes }) =>
          clientes.filter(c => {
            const f = new Date(c.fecha_inicio);
            return f.getFullYear() === anio && f.getMonth() === mes && c.estado === "activa";
          }).length
        );

        const clientesInactivosSerie = periodos.map(({ anio, mes }) =>
          clientes.filter(c => {
            const f = new Date(c.fecha_inicio);
            return f.getFullYear() === anio && f.getMonth() === mes && c.estado !== "activa";
          }).length
        );

        const rankingGimnasios = Object.values(conteoPorGym)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

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
            membresiasActivas: membresiasActivasSerie,
            clientesActivos: clientesActivosSerie,
            clientesInactivos: clientesInactivosSerie,
            gimnasiosRankingLabels: rankingGimnasios.map(g => g.nombre),
            gimnasiosRankingValores: rankingGimnasios.map(g => g.count)
          }
        });

      } catch (err) {
        console.error("Error cargando dashboard (fallback)", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [meses]);

  return { dashboard, loading };
};