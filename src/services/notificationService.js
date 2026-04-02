import toast from "react-hot-toast";
import { solicitarTokenFCM } from "../config/firebase";
import api from "./axios";

/**
 * Servicio de notificaciones. Gestiona el registro/desregistro de dispositivos
 * FCM, la visualización de toasts y las operaciones de lectura contra el API.
 */

/**
 * Solicita el token FCM del dispositivo y lo registra en el backend
 * para habilitar notificaciones push por canal web.
 * Si no se obtiene token (permiso denegado), aborta silenciosamente.
 */
export const registrarDispositivo = async () => {
  try {
    const fcmToken = await solicitarTokenFCM();
    if (!fcmToken) return;
    await api.post("/notificaciones/registrar-dispositivo", {
      fcm_token: fcmToken,
      canal:     "web"
    });
  } catch (err) {
    console.error("Error registrando dispositivo FCM", err);
  }
};

/**
 * Obtiene el token FCM actual y lo elimina del backend,
 * deshabilitando las notificaciones push antes del logout.
 * Si no hay token disponible, aborta silenciosamente.
 */
export const desregistrarDispositivo = async () => {
  try {
    const fcmToken = await solicitarTokenFCM();
    if (!fcmToken) return;
    await api.post("/notificaciones/desregistrar-dispositivo", {
      fcm_token: fcmToken
    });
  } catch (err) {
    console.error("Error desregistrando dispositivo FCM", err);
  }
};

/**
 * Muestra una notificación emergente con react-hot-toast usando
 * el estilo visual personalizado del sistema de diseño.
 * Si hay mensaje, lo concatena al título en una segunda línea.
 */
export const mostrarToast = ({ titulo, mensaje }) => {
  const contenido = mensaje ? `${titulo}\n${mensaje}` : titulo;
  toast(contenido, {
    duration: 5000,
    style: {
      background:   "#fff",
      border:       "1px solid #e2e8f0",
      boxShadow:    "0 10px 30px rgba(0,0,0,0.1)",
      borderRadius: "12px",
      padding:      "0.75rem 1rem",
      fontSize:     "0.88rem",
      fontWeight:   600
    },
    iconTheme: { primary: "#4f46e5", secondary: "#fff" }
  });
};

/**
 * Consulta el total de notificaciones no leídas del canal web.
 * Retorna 0 si la petición falla, sin propagar el error.
 */
export const contarNoLeidas = async () => {
  try {
    const res = await api.get("/notificaciones/no-leidas", { params: { canal: "web" } });
    return res.data.no_leidas || 0;
  } catch {
    return 0;
  }
};

/**
 * Marca una notificación específica como leída en el backend.
 */
export const marcarLeida = async (id) => {
  try {
    await api.patch(`/notificaciones/${id}/leer`);
  } catch (err) {
    console.error("Error marcando notificación como leída", err);
  }
};