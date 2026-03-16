import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import "../../styles/perfil.css";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiCreditCard, FiEdit2 } from "react-icons/fi";
import { MdAccountBalance } from "react-icons/md";
import api from "../../services/axios";
import LoadingScreen from "../../components/ui/LoadingScreen";
import Toast from "../../components/ui/Toast";
import ModalPortal from "../../components/ui/ModalPortal";

function Perfil() {

  const navigate = useNavigate();

  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);

  // ── Plan ──
  const [planActivo, setPlanActivo]   = useState(null);
  const [historialPlanes, setHistorialPlanes] = useState([]);

  // ── CLABE ──
  const [clabe, setClabe]         = useState(null);
  const [editandoClabe, setEditandoClabe] = useState(false);
  const [clabeForm, setClabeForm] = useState({ clabe: "", banco: "", titular: "" });
  const [clabeErrors, setClabeErrors] = useState({});
  const [clabeLoading, setClabeLoading] = useState(false);

  // ── Modal confirmar cambio de plan ──
  const [confirmCambio, setConfirmCambio] = useState(false);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchAll = async () => {
    try {
      const [resUser, resPlan, resClabe] = await Promise.allSettled([
        api.get("/user/me"),
        api.get("/proveedor/mi-plan"),
        api.get("/referencias/mia")
      ]);

      if (resUser.status === "fulfilled") {
        setUser(resUser.value.data.usuario || resUser.value.data);
      }

      if (resPlan.status === "fulfilled") {
        const data = resPlan.value.data;
        setPlanActivo(data.plan_activo || null);
        setHistorialPlanes(data.historial || []);
      }

      if (resClabe.status === "fulfilled") {
        const ref = resClabe.value.data.referencia;
        setClabe(ref || null);
        if (ref) setClabeForm({ clabe: ref.clabe, banco: ref.banco, titular: ref.titular });
      }

    } catch (err) {
      console.error("Error cargando perfil", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Días restantes del plan ──
  const diasRestantes = () => {
    if (!planActivo?.fecha_fin) return 0;
    const hoy = new Date();
    const fin  = new Date(planActivo.fecha_fin);
    return Math.max(0, Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24)));
  };

  const diasClass = () => {
    const d = diasRestantes();
    if (d <= 0)  return "vencido";
    if (d <= 7)  return "venciendo";
    return "";
  };

  // ── Renovar plan (mismo plan) ──
  const handleRenovar = async () => {
    if (!planActivo?.plan) return;
    try {
      const res = await api.post("/pagos/premium/web/intent", {
        id_plan: planActivo.plan.id_plan
      });
      if (res.data.message) {
        showToast("Plan renovado correctamente.");
        fetchAll();
        return;
      }
      navigate("/checkout", {
        state: {
          client_secret: res.data.client_secret,
          desglose:      res.data.desglose,
          plan:          planActivo.plan
        }
      });
    } catch (err) {
      showToast(err?.response?.data?.message || "No se pudo renovar el plan.", "error");
    }
  };

  // ── Guardar / actualizar CLABE ──
  const handleGuardarClabe = async () => {
    const errors = {};
    if (!clabeForm.clabe.trim() || clabeForm.clabe.length !== 18)
      errors.clabe = "La CLABE debe tener 18 dígitos";
    if (!clabeForm.banco.trim())    errors.banco   = "El banco es obligatorio";
    if (!clabeForm.titular.trim())  errors.titular = "El titular es obligatorio";

    if (Object.keys(errors).length > 0) { setClabeErrors(errors); return; }

    try {
      setClabeLoading(true);
      if (clabe?.id_referencia) {
        await api.put(`/referencias/${clabe.id_referencia}`, clabeForm);
        showToast("CLABE actualizada. Pendiente de verificación.");
      } else {
        await api.post("/referencias", clabeForm);
        showToast("CLABE registrada. Pendiente de verificación.");
      }
      setEditandoClabe(false);
      fetchAll();
    } catch (err) {
      showToast(err?.response?.data?.message || "Error guardando CLABE.", "error");
    } finally {
      setClabeLoading(false);
    }
  };

  if (loading) return <LoadingScreen message="Cargando perfil..." />;

  if (!user) {
    return (
      <DashboardLayout>
        <div className="perfil-error"><h2>No se pudo cargar el perfil</h2></div>
      </DashboardLayout>
    );
  }

  const dias = diasRestantes();

  return (
    <DashboardLayout>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <section className="page-header">
        <div>
          <h1>Mi perfil</h1>
          <p className="subtitle">Consulta y administra tu información personal y plan.</p>
        </div>
      </section>

      <section className="content-grid">

        {/* ── Información personal ── */}
        <article className="panel">
          <h2 className="panel-icon-title">
            <FiUser size={18} /> Información personal
          </h2>
          <div className="panel-body">
            <p><strong>Nombre: </strong>{user.nombre} {user.apellido_paterno} {user.apellido_materno}</p>
            <p><strong>Teléfono: </strong>{user.telefono || "No registrado"}</p>
            <p><strong>Correo: </strong>{user.correo}</p>
          </div>
        </article>

        {/* ── Mi Plan ── */}
        <article className="panel">
          <h2 className="panel-icon-title">
            <FiCreditCard size={18} /> Mi plan
          </h2>

          {planActivo ? (
            <div className="mi-plan-card">
              <div className="mi-plan-info">
                <h3>{planActivo.plan?.nombre}</h3>
                <p>
                  Vence el {new Date(planActivo.fecha_fin).toLocaleDateString("es-MX", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              </div>

              <span className={`mi-plan-dias ${diasClass()}`}>
                {dias <= 0 ? "Vencido" : `${dias} día${dias !== 1 ? "s" : ""} restante${dias !== 1 ? "s" : ""}`}
              </span>

              <div className="mi-plan-acciones">
                <button className="btn btn-primary" onClick={handleRenovar}>
                  Renovar
                </button>
                <button className="btn btn-ghost" onClick={() => setConfirmCambio(true)}>
                  Cambiar plan
                </button>
              </div>
            </div>
          ) : (
            <div className="mi-plan-sin">
              <p>No tienes un plan activo actualmente.</p>
              <Link to="/planes" className="btn btn-primary" style={{ display: "inline-flex" }}>
                Ver planes
              </Link>
            </div>
          )}

          {/* ── Historial ── */}
          <p className="panel-description">Historial de pagos hacia la plataforma BodyPlan.</p>
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Precio</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historialPlanes.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "1rem" }}>
                      Sin historial de planes
                    </td>
                  </tr>
                ) : (
                  historialPlanes.map((h, i) => (
                    <tr key={i}>
                      <td>{h.plan?.nombre || "—"}</td>
                      <td>{h.fecha_inicio ? new Date(h.fecha_inicio).toLocaleDateString("es-MX") : "—"}</td>
                      <td>{h.fecha_fin   ? new Date(h.fecha_fin).toLocaleDateString("es-MX")   : "—"}</td>
                      <td>${h.plan?.precio?.toLocaleString("es-MX") || "—"}</td>
                      <td>
                        <span className={`badge ${h.estado === "activa" ? "badge-success" : "badge-danger"}`}>
                          {h.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        {/* ── CLABE bancaria ── */}
        <article className="panel" style={{ gridColumn: "1 / -1" }}>
          <h2 className="panel-icon-title">
            <MdAccountBalance size={18} /> Datos bancarios (CLABE)
          </h2>
          <p className="panel-description">
            Registra tu CLABE interbancaria para recibir los pagos de membresías de tus clientes.
          </p>

          {clabe && !editandoClabe ? (
            <div className="clabe-card">
              <div className="clabe-row">
                <div className="clabe-info">
                  <p><strong>{clabe.clabe}</strong></p>
                  <span>{clabe.banco} — {clabe.titular}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className={clabe.verificado ? "clabe-verificado" : "clabe-pendiente"}>
                    {clabe.verificado ? "✓ Verificada" : "⏳ Pendiente verificación"}
                  </span>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setEditandoClabe(true)}
                  >
                    <FiEdit2 size={14} /> Editar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="clabe-form modal-form">
              <div className="clabe-form-grid">
                <div className="form-group">
                  <label>CLABE interbancaria (18 dígitos) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={18}
                    value={clabeForm.clabe}
                    onChange={e => {
                      setClabeForm(prev => ({ ...prev, clabe: e.target.value.replace(/\D/g, "").slice(0, 18) }));
                      setClabeErrors(prev => ({ ...prev, clabe: "" }));
                    }}
                    placeholder="646180157000000001"
                  />
                  {clabeErrors.clabe && <span className="field-error-msg">{clabeErrors.clabe}</span>}
                </div>

                <div className="form-group">
                  <label>Banco *</label>
                  <input
                    type="text"
                    value={clabeForm.banco}
                    onChange={e => {
                      setClabeForm(prev => ({ ...prev, banco: e.target.value }));
                      setClabeErrors(prev => ({ ...prev, banco: "" }));
                    }}
                    placeholder="Ej. BBVA, STP, Banorte"
                  />
                  {clabeErrors.banco && <span className="field-error-msg">{clabeErrors.banco}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Titular de la cuenta *</label>
                <input
                  type="text"
                  value={clabeForm.titular}
                  onChange={e => {
                    setClabeForm(prev => ({ ...prev, titular: e.target.value }));
                    setClabeErrors(prev => ({ ...prev, titular: "" }));
                  }}
                  placeholder="Nombre completo del titular"
                />
                {clabeErrors.titular && <span className="field-error-msg">{clabeErrors.titular}</span>}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-primary" onClick={handleGuardarClabe} disabled={clabeLoading}>
                  {clabeLoading ? "Guardando..." : clabe ? "Actualizar CLABE" : "Registrar CLABE"}
                </button>
                {clabe && (
                  <button className="btn btn-ghost" onClick={() => { setEditandoClabe(false); setClabeErrors({}); }}>
                    Cancelar
                  </button>
                )}
              </div>

              {clabe && (
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>
                  ⚠️ Al actualizar la CLABE deberá ser verificada nuevamente por el administrador.
                </p>
              )}
            </div>
          )}
        </article>

      </section>

      {/* ── Modal confirmar cambio de plan ── */}
      {confirmCambio && (
        <ModalPortal>
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">Cambiar plan</h3>
              <p className="modal-body">
                Serás redirigido a la página de planes para elegir uno diferente.
                Tu plan actual seguirá activo hasta su fecha de vencimiento.
              </p>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setConfirmCambio(false)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={() => navigate("/planes")}>
                  Ver planes
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

    </DashboardLayout>
  );
}

export default Perfil;