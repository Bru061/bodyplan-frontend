import DashboardLayout from "../../layout/DashboardLayout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/axios";
import "../../styles/clientes.css";

function Estrellas({ calificacion, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            fontSize: size,
            color: n <= calificacion ? "#f59e0b" : "#e2e8f0"
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function Resenas() {
  
  const [gimnasios, setGimnasios] = useState([]);
  const [gimnasioSeleccionado, setGimnasioSeleccionado] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGyms, setLoadingGyms] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGimnasios = async () => {
      try {
        const res = await api.get("/gym");
        const gyms = res.data.gimnasios || [];
        setGimnasios(gyms);

        if (gyms.length === 1) {
          setGimnasioSeleccionado(gyms[0].id_gimnasio);
        }
      } catch (err) {
        console.error("Error cargando gimnasios", err);
        setError("No se pudieron cargar los gimnasios");
      } finally {
        setLoadingGyms(false);
      }
    };

    fetchGimnasios();
  }, []);

  useEffect(() => {
    if (gimnasioSeleccionado === null) {
      setResenas([]);
      return;
    }

    const fetchResenas = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/gym/${gimnasioSeleccionado}/resenas`);
        setResenas(res.data.resenas || []);
      } catch (err) {
        console.error("Error cargando reseñas", err);
        setError("No se pudieron cargar las reseñas");
      } finally {
        setLoading(false);
      }
    };

    fetchResenas();
  }, [gimnasioSeleccionado]);

  const promedio = resenas.length
    ? (resenas.reduce((acc, r) => acc + r.calificacion, 0) / resenas.length).toFixed(1)
    : null;

  const distribucion = [5, 4, 3, 2, 1].map((n) => ({
    estrellas: n,
    cantidad: resenas.filter((r) => r.calificacion === n).length,
    porcentaje: resenas.length
      ? Math.round((resenas.filter((r) => r.calificacion === n).length / resenas.length) * 100)
      : 0
  }));

  return (
    <DashboardLayout>
      <div className="dashboard-container">

        <section className="page-header">
          <div className="page-header-row">
            <div>
              <h1>Reseñas de tus gimnasios</h1>
              <p className="subtitle">
                Consulta lo que piensan tus clientes sobre tus gimnasios.
              </p>
            </div>
          </div>

          {!loadingGyms && gimnasios.length > 1 && (
            <div className="header-actions">
              <select
                value={gimnasioSeleccionado}
                onChange={(e) => setGimnasioSeleccionado(Number(e.target.value))}
                style={{
                  height: "38px",
                  padding: "0 0.75rem",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  background: "#fff",
                  cursor: "pointer"
                }}
              >
                <option value="">Seleccionar gimnasio</option>
                {gimnasios.map((g) => (
                  <option key={g.id_gimnasio} value={g.id_gimnasio}>
                    {g.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        {error && (
          <div className="modal-error" style={{ marginBottom: "1rem" }}>
            {error}
            <button
              onClick={() => setError("")}
              style={{ marginLeft: "12px", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
            >✕</button>
          </div>
        )}

        {gimnasioSeleccionado === null && !loadingGyms && (
          <div className="table-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Selecciona un gimnasio para ver sus reseñas.
          </div>
        )}

        {gimnasioSeleccionado !== null && (
          <>
            {!loading && resenas.length > 0 && (
              <section style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: "2rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "1.5rem",
                marginBottom: "1.2rem",
                alignItems: "center"
              }}>

                <div style={{ textAlign: "center" }}>
                  <p style={{
                    fontSize: "3.5rem",
                    fontWeight: 800,
                    color: "var(--primary)",
                    lineHeight: 1
                  }}>
                    {promedio}
                  </p>
                  <Estrellas calificacion={Math.round(promedio)} size={20} />
                  <p style={{ marginTop: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {resenas.length} reseña{resenas.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {distribucion.map((d) => (
                    <div key={d.estrellas} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", width: "36px" }}>
                        {d.estrellas} ★
                      </span>
                      <div style={{
                        flex: 1,
                        height: "8px",
                        background: "#e2e8f0",
                        borderRadius: "999px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          width: `${d.porcentaje}%`,
                          height: "100%",
                          background: "#f59e0b",
                          borderRadius: "999px",
                          transition: "width 0.4s ease"
                        }} />
                      </div>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", width: "28px" }}>
                        {d.cantidad}
                      </span>
                    </div>
                  ))}
                </div>

              </section>
            )}

            <section className="table-panel">

              <div style={{ padding: "1rem 1rem 0" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#334155" }}>
                  {loading
                    ? "Cargando..."
                    : `${resenas.length} reseña${resenas.length !== 1 ? "s" : ""}`
                  }
                </h2>
              </div>

              {loading ? (
                <p style={{ padding: "2rem", color: "var(--text-secondary)" }}>
                  Cargando reseñas...
                </p>
              ) : resenas.length === 0 ? (
                <p style={{ padding: "2rem", color: "var(--text-secondary)" }}>
                  Este gimnasio aún no tiene reseñas.
                </p>
              ) : (
                <div style={{ padding: "0.5rem 1rem 1rem" }}>
                  {resenas.map((r) => (
                    <div
                      key={r.id_resena}
                      style={{
                        padding: "1rem 0",
                        borderBottom: "1px solid var(--border)"
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "4px"
                      }}>
                        <div>
                          <p style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                            {r.Usuario?.nombre || "Cliente"}
                          </p>
                          <Estrellas calificacion={r.calificacion} />
                        </div>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                          {new Date(r.fecha).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </span>
                      </div>

                      {r.comentario && (
                        <p style={{
                          color: "#475569",
                          fontSize: "0.92rem",
                          marginTop: "8px",
                          lineHeight: 1.6
                        }}>
                          {r.comentario}
                        </p>
                      )}

                    </div>
                  ))}
                </div>
              )}

            </section>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Resenas;