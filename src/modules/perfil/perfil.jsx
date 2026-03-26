import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import "../../styles/perfil.css";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiCreditCard, FiEdit2 } from "react-icons/fi";
import { MdAccountBalance, MdTrendingUp } from "react-icons/md";
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
  const [planActivo, setPlanActivo]         = useState(null);
  const [historialPlanes, setHistorialPlanes] = useState([]);

  // ── CLABE ──
  const [clabe, setClabe]               = useState(null);
  const [editandoClabe, setEditandoClabe] = useState(false);
  const [clabeForm, setClabeForm]         = useState({ clabe: "", banco: "", titular: "" });
  const [clabeErrors, setClabeErrors]     = useState({});
  const [clabeLoading, setClabeLoading]   = useState(false);

  // ── Balance del proveedor ──
  const [balance, setBalance]             = useState([]);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [perfilForm, setPerfilForm]         = useState({});
  const [perfilErrors, setPerfilErrors]     = useState({});
  const [perfilLoading, setPerfilLoading]   = useState(false);

  const abrirEditarPerfil = () => {
    setPerfilForm({
      nombre:           user.nombre           || "",
      apellido_paterno: user.apellido_paterno  || "",
      apellido_materno: user.apellido_materno  || "",
      telefono:         user.telefono          || ""
    });
    setPerfilErrors({});
    setEditandoPerfil(true);
  };

  const handleGuardarPerfil = async () => {
    const errors = {};
    const onlyLetters = (v) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v.trim());

    if (!perfilForm.nombre.trim())
      errors.nombre = "El nombre es obligatorio";
    else if (!onlyLetters(perfilForm.nombre))
      errors.nombre = "Solo se permiten letras";

    if (!perfilForm.apellido_paterno.trim())
      errors.apellido_paterno = "El apellido paterno es obligatorio";
    else if (!onlyLetters(perfilForm.apellido_paterno))
      errors.apellido_paterno = "Solo se permiten letras";

    if (!perfilForm.apellido_materno.trim())
      errors.apellido_materno = "El apellido materno es obligatorio";
    else if (!onlyLetters(perfilForm.apellido_materno))
      errors.apellido_materno = "Solo se permiten letras";

    if (perfilForm.telefono && !/^\d{10}$/.test(perfilForm.telefono))
      errors.telefono = "El teléfono debe tener 10 dígitos";

    if (Object.keys(errors).length > 0) { setPerfilErrors(errors); return; }

    try {
      setPerfilLoading(true);
      await api.put("/user/me", {
        nombre:           perfilForm.nombre.trim(),
        apellido_paterno: perfilForm.apellido_paterno.trim(),
        apellido_materno: perfilForm.apellido_materno.trim(),
        telefono:         perfilForm.telefono.trim() || null
      });
      showToast("Perfil actualizado correctamente.");
      setEditandoPerfil(false);
      fetchAll();
    } catch (err) {
      showToast(err?.response?.data?.error || "Error actualizando perfil.", "error");
    } finally {
      setPerfilLoading(false);
    }
  };

  // ── Modal confirmar cambio de plan ──
  const [confirmCambio, setConfirmCambio] = useState(false);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchAll = async () => {
    try {
      const [resUser, resPlan, resClabe, resBalance] = await Promise.allSettled([
        api.get("/user/me"),
        api.get("/proveedor/mi-plan"),
        api.get("/referencias/mia"),
        api.get("/proveedor/balance")
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
        const data = resClabe.value.data;
        // El endpoint devuelve { referencias: [...] } — tomamos la activa del usuario
        const lista = data.referencias || (data.referencia ? [data.referencia] : []);
        const ref   = lista.find(r => r.activo) || null;
        if (ref) {
          setClabe(ref);
          setClabeForm({
            clabe:   ref.numero_cuenta || "",
            banco:   ref.banco         || "",
            titular: ref.titular       || ""
          });
        } else {
          setClabe(null);
        }
      }

      if (resBalance.status === "fulfilled") {
        setBalance(resBalance.value.data.balance || []);
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
    if (!clabeForm.banco.trim())   errors.banco   = "El banco es obligatorio";
    if (!clabeForm.titular.trim()) errors.titular = "El titular es obligatorio";

    if (Object.keys(errors).length > 0) { setClabeErrors(errors); return; }

    try {
      setClabeLoading(true);
      if (clabe?.id_referencia) {
        await api.put(`/referencias/${clabe.id_referencia}`, {
          banco:         clabeForm.banco,
          numero_cuenta: clabeForm.clabe,
          titular:       clabeForm.titular
        });
        showToast("CLABE actualizada. Pendiente de verificación.");
      } else {
        await api.post("/referencias", {
          banco:         clabeForm.banco,
          numero_cuenta: clabeForm.clabe,
          titular:       clabeForm.titular
        });
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

  // ── Helpers de balance ──
  const formatMXN = (val) =>
    `$${parseFloat(val || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const clabeVerificada = (gym) =>
    gym.referencia_bancaria?.verificado ??
    gym.clabe_verificada ??
    false;

  if (loading) return <LoadingScreen message="Cargando perfil..." />;

  if (!user) {
    return (
      <DashboardLayout>
        <div className="perfil-error"><h2>No se pudo cargar el perfil</h2></div>
      </DashboardLayout>
    );
  }

  const dias = diasRestantes();

  // Número de CLABE a mostrar en la card (normaliza numero_cuenta / clabe)
  const clabeDisplay = clabe?.numero_cuenta || clabe?.clabe || "";

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="panel-icon-title" style={{ margin: 0 }}>
              <FiUser size={18} /> Información personal
            </h2>
            <button className="btn btn-ghost" onClick={abrirEditarPerfil}>
              <FiEdit2 size={14} /> Editar
            </button>
          </div>
          <div className="panel-body">
            <p><strong>Nombre: </strong>{user.nombre} {user.apellido_paterno} {user.apellido_materno}</p>
            <p><strong>Teléfono: </strong>{user.telefono || "No registrado"}</p>
            <p><strong>Correo: </strong>{user.correo}</p>
          </div>
        </article>

        {/* ── CLABE bancaria ── */}
        <article className="panel">
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
                  <p><strong>{clabeDisplay}</strong></p>
                  <span>{clabe.banco} — {clabe.titular}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
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

        {/* ── Mi Plan ── */}
        <article className="panel" style={{ gridColumn: "1 / -1" }}>
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
                      <td>{h.fecha_fin    ? new Date(h.fecha_fin).toLocaleDateString("es-MX")    : "—"}</td>
                      <td>{h.plan?.precio != null ? `$${h.plan.precio.toLocaleString("es-MX")}` : "—"}</td>
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

      </section>

      {/* ── Balance por gimnasio ── */}
      {balance.length > 0 && (
        <section style={{ marginTop: "1.5rem" }}>
          <article className="panel">
            <h2 className="panel-icon-title">
              <MdTrendingUp size={18} /> Mi balance
            </h2>
            <p className="panel-description">
              Dinero generado por membresías de tus clientes, pendiente de transferir a tu cuenta.
            </p>
            <div className="table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Gimnasio</th>
                    <th>Total generado</th>
                    <th>Transferido</th>
                    <th>Pendiente de cobrar</th>
                    <th>Transacciones</th>
                  </tr>
                </thead>
                <tbody>
                  {balance.map((g, i) => (
                    <tr key={g.id_gimnasio ?? i}>
                      <td><strong>{g.nombre_gimnasio || "—"}</strong></td>
                      <td>{formatMXN(g.total_generado)}</td>
                      <td>{formatMXN(g.total_transferido)}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: parseFloat(g.pendiente_transferir || 0) > 0 ? "#16a34a" : "var(--text-secondary)"
                        }}>
                          {formatMXN(g.pendiente_transferir)}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-secondary">
                          {g.total_transacciones ?? 0} transacción{g.total_transacciones !== 1 ? "es" : ""}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}

      {/* ── Modal editar perfil ── */}
      {editandoPerfil && (
        <ModalPortal>
          <div className="modal-overlay">
            <div className="modal-card">
              <h2 className="modal-title">Editar información personal</h2>

              <div className="modal-form">

                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    value={perfilForm.nombre}
                    onChange={e => {
                      setPerfilForm(prev => ({ ...prev, nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "") }));
                      setPerfilErrors(prev => ({ ...prev, nombre: "" }));
                    }}
                    maxLength={40}
                  />
                  {perfilErrors.nombre && <span className="field-error-msg">{perfilErrors.nombre}</span>}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Apellido paterno *</label>
                    <input
                      value={perfilForm.apellido_paterno}
                      onChange={e => {
                        setPerfilForm(prev => ({ ...prev, apellido_paterno: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "") }));
                        setPerfilErrors(prev => ({ ...prev, apellido_paterno: "" }));
                      }}
                      maxLength={30}
                    />
                    {perfilErrors.apellido_paterno && <span className="field-error-msg">{perfilErrors.apellido_paterno}</span>}
                  </div>

                  <div className="form-group">
                    <label>Apellido materno *</label>
                    <input
                      value={perfilForm.apellido_materno}
                      onChange={e => {
                        setPerfilForm(prev => ({ ...prev, apellido_materno: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "") }));
                        setPerfilErrors(prev => ({ ...prev, apellido_materno: "" }));
                      }}
                      maxLength={30}
                    />
                    {perfilErrors.apellido_materno && <span className="field-error-msg">{perfilErrors.apellido_materno}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Teléfono <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>(opcional)</span></label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={perfilForm.telefono}
                    onChange={e => {
                      setPerfilForm(prev => ({ ...prev, telefono: e.target.value.replace(/\D/g, "").slice(0, 10) }));
                      setPerfilErrors(prev => ({ ...prev, telefono: "" }));
                    }}
                    placeholder="10 dígitos"
                    maxLength={10}
                  />
                  {perfilErrors.telefono && <span className="field-error-msg">{perfilErrors.telefono}</span>}
                </div>

                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>
                  El correo electrónico no se puede modificar desde aquí.
                </p>

              </div>

              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setEditandoPerfil(false)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleGuardarPerfil} disabled={perfilLoading}>
                  {perfilLoading ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>

            </div>
          </div>
        </ModalPortal>
      )}

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