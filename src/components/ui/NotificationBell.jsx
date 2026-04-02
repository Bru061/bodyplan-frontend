import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MdNotificationsNone, MdNotifications } from "react-icons/md";
import { useNotificaciones } from "../../hooks/useNotificaciones";
import { marcarLeida } from "../../services/notificationService";
import api from "../../services/axios";
import { useAuth } from "../../core/context/AuthContext";

/**
 * Ícono de campana en la barra de navegación que muestra el conteo
 * de notificaciones no leídas y despliega un panel con el listado completo.
 * Soporta marcar notificaciones individuales o todas como leídas,
 * y navega a la ruta correspondiente al hacer clic en cada una.
 */
function NotificationBell() {

  const { noLeidas, setNoLeidas } = useNotificaciones();
  const [open, setOpen]             = useState(false);
  const [notifs, setNotifs]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
 * Obtiene las notificaciones del usuario desde el API (canal web, límite 200).
 * Actualiza la lista local y el contador global de no leídas en el contexto.
 */
  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notificaciones", { params: { canal: "web", limit: 200 } });
      const lista = res.data.notificaciones || [];
      setNotifs(lista);
      setNoLeidas(lista.filter((n) => !n.leida).length);
    } catch (err) {
      console.error("Error cargando notificaciones", err);
    } finally {
      setLoading(false);
    }
  };

  /**
 * Alterna la visibilidad del panel de notificaciones.
 * Al abrirse por primera vez dispara fetchNotificaciones para cargar datos frescos.
 */
  const handleOpen = () => {
    setOpen(prev => !prev);
    if (!open) {
      fetchNotificaciones();
    }
  };

  /**
 * Determina la ruta de navegación asociada a una notificación
 * basándose en palabras clave del título y mensaje.
 * Diferencia rutas según el rol del usuario autenticado (admin vs. otros).
 */
  const resolveRoute = (n) => {
    const text = `${n?.titulo || ""} ${n?.mensaje || ""}`.toLowerCase();
    const esAdmin = user?.role === "admin";

    if (esAdmin) {
      if (text.includes("reembolso") || text.includes("suscrip")) return "/admin/actividad";
      if (text.includes("plan")) return "/admin/planes";
      if (text.includes("usuario")) return "/admin/usuarios";
      if (text.includes("referencia") || text.includes("clabe") || text.includes("banc")) return "/admin/referencias";
      if (text.includes("pago") || text.includes("finanza")) return "/admin/finanzas";
      return null;
    }

    if (text.includes("plan")) return "/planes";
    if (text.includes("cliente")) return "/clientes";
    if (text.includes("rutina")) return "/rutinas";
    if (text.includes("gimnasio")) return "/mis-gimnasios";
    if (text.includes("pago")) return "/perfil";
    return null;
  };

/**
 * Marca una notificación individual como leída llamando al servicio externo.
 * Actualiza el estado local y recalcula el contador de no leídas.
 */
  const handleMarcarLeida = async (id) => {
    await marcarLeida(id);
    setNotifs(prev => {
      const actualizadas = prev.map(n => n.id_notificacion === id ? { ...n, leida: true } : n);
      setNoLeidas(actualizadas.filter((n) => !n.leida).length);
      return actualizadas;
    });
  };

  return (
    <div className="notif-bell-wrapper" ref={ref}>

      <button className="navbar-icon-btn notif-bell-btn" onClick={handleOpen} title="Notificaciones">
        {noLeidas > 0 ? <MdNotifications size={20} /> : <MdNotificationsNone size={20} />}
        {noLeidas > 0 && (
          <span className="notif-badge">{noLeidas > 99 ? "99+" : noLeidas}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>Notificaciones</span>
            {notifs.some(n => !n.leida) && (
              <button
                className="notif-mark-all"
                onClick={async () => {
                  for (const n of notifs.filter(n => !n.leida)) {
                    await marcarLeida(n.id_notificacion);
                  }
                  setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
                  setNoLeidas(0);
                }}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="notif-list">
            {loading ? (
              <p className="notif-empty">Cargando...</p>
            ) : notifs.length === 0 ? (
              <p className="notif-empty">Sin notificaciones</p>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id_notificacion}
                  className={`notif-item ${!n.leida ? "notif-item-unread" : ""}`}
                  onClick={async () => {
                    if (!n.leida) await handleMarcarLeida(n.id_notificacion);
                    setOpen(false);
                    navigate(resolveRoute(n));
                  }}
                >
                  <p className="notif-item-title">{n.titulo}</p>
                  {n.mensaje && <p className="notif-item-msg">{n.mensaje}</p>}
                  <span className="notif-item-time">
                    {n.fecha_creacion
                      ? new Date(n.fecha_creacion).toLocaleDateString("es-MX", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })
                      : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;