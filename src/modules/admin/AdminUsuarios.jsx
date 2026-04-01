import { useEffect, useState } from "react";
import AdminLayout from "../../layout/AdminLayout";
import api from "../../services/axios";
import Toast from "../../components/ui/Toast";

const ROL_LABEL = { 1: "Admin", 2: "Cliente", 3: "Proveedor" };
const ROL_BADGE = { 1: "badge-danger", 2: "badge-secondary", 3: "badge-primary" };

function AdminUsuarios() {

  const [todos, setTodos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filtroRol, setFiltroRol] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 10;

  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const acumulados = [];
        let page = 1;
        let totalPages = 1;

        do {
          const res = await api.get("/admin/usuarios", { params: { page, limit: 200 } });
          const payload = res.data || {};
          const dataPage = payload.usuarios || payload.data?.usuarios || [];
          acumulados.push(...dataPage);

          const fromPayload = Number(payload.total_paginas || payload.pages || payload.data?.total_paginas || payload.data?.pages);
          totalPages = Number.isFinite(fromPayload) && fromPayload > 0
            ? fromPayload
            : (dataPage.length > 0 ? page + 1 : page);

          page += 1;
        } while (page <= totalPages);

        const dedup = Array.from(new Map(acumulados.map((u) => [u.id_usuario, u])).values());
        const data = dedup;
        setTodos(data);
        setUsuarios(data);
      } catch {
        showToast("Error cargando usuarios.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, []);

  useEffect(() => {
    let resultado = [...todos];

    if (filtroRol) {
      resultado = resultado.filter(u => u.id_rol === parseInt(filtroRol));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      resultado = resultado.filter(u =>
        u.nombre?.toLowerCase().includes(q) ||
        u.correo?.toLowerCase().includes(q) ||
        u.apellido_paterno?.toLowerCase().includes(q)
      );
    }

    setUsuarios(resultado);
    setPagina(1);
  }, [filtroRol, search, todos]);

  useEffect(() => {
    const delay = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(delay);
  }, [searchInput]);

  const contarPorRol = (idRol) => todos.filter(u => u.id_rol === idRol).length;

  const STATS = [
    { label: "Proveedores", value: "3", count: contarPorRol(3) },
    { label: "Clientes", value: "2", count: contarPorRol(2) },
    { label: "Admin", value: "1", count: contarPorRol(1) }
  ];

  const tituloTabla = () => {
    if (!filtroRol) return `Todos los usuarios (${usuarios.length})`;
    return `${ROL_LABEL[filtroRol]}s (${usuarios.length})`;
  };

  return (
    <AdminLayout>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <section className="page-header">
        <div>
          <p className="eyebrow">Administración</p>
          <h1>Usuarios</h1>
          <p className="subtitle">Consulta y filtra todos los usuarios registrados en la plataforma.</p>
        </div>
      </section>

      <div className="admin-stats">
        {STATS.map(s => (
          <div
            key={s.value}
            className="admin-stat-card"
            style={{
              cursor: "pointer",
              borderLeft: filtroRol === s.value ? "4px solid var(--primary)" : "4px solid transparent",
              transition: "border-color 0.2s"
            }}
            onClick={() => setFiltroRol(prev => prev === s.value ? "" : s.value)}
          >
            <p className="admin-stat-label">{s.label}</p>
            <p className="admin-stat-value">{s.count}</p>
          </div>
        ))}
      </div>

      <div className="admin-table-panel">
        <div className="admin-table-header">
          <h2>{tituloTabla()}</h2>
          <div className="admin-filters">
            <input
              type="text"
              placeholder="Buscar por nombre o correo"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ minWidth: 220 }}
            />
            <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
              <option value="">Todos</option>
              <option value="3">Proveedores</option>
              <option value="2">Clientes</option>
              <option value="1">Admin</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Verificado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="admin-empty">Cargando...</td></tr>
              ) : usuarios.length === 0 ? (
                <tr><td colSpan="6" className="admin-empty">No hay usuarios con esos filtros.</td></tr>
              ) : (
                usuarios.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(u => (
                  <tr key={u.id_usuario}>
                    <td>#{u.id_usuario}</td>
                    <td><p style={{ margin: 0, fontWeight: 600 }}>{u.nombre}</p></td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{u.correo}</td>
                    <td>
                      <span className={`badge ${ROL_BADGE[u.id_rol] || "badge-secondary"}`}>
                        {ROL_LABEL[u.id_rol] || `Rol ${u.id_rol}`}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.verificado ? "badge-success" : "badge-secondary"}`}>
                        {u.verificado ? "✓ Verificado" : "Pendiente"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.estado ? "badge-success" : "badge-danger"}`}>
                        {u.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {Math.ceil(usuarios.length / POR_PAGINA) > 1 && (
          <div className="admin-paginador">
            <button className="admin-pag-btn" onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}>←</button>
            {Array.from({ length: Math.ceil(usuarios.length / POR_PAGINA) }, (_, i) => i + 1).map(n => (
              <button key={n} className={`admin-pag-btn ${pagina === n ? "admin-pag-active" : ""}`} onClick={() => setPagina(n)}>{n}</button>
            ))}
            <button className="admin-pag-btn" onClick={() => setPagina(p => Math.min(Math.ceil(usuarios.length / POR_PAGINA), p + 1))} disabled={pagina === Math.ceil(usuarios.length / POR_PAGINA)}>→</button>
            <span className="admin-pag-info">{usuarios.length} usuarios</span>
          </div>
        )}
      </div>

    </AdminLayout>
  );
}

export default AdminUsuarios;