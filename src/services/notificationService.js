import toast from "react-hot-toast";
import { solicitarTokenFCM } from "../config/firebase";
import api from "./axios";

// ── Registrar dispositivo en el backend tras login ──
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

// ── Desregistrar dispositivo antes del logout ──
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

// ── Mostrar toast de notificación ──
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

// ── Obtener notificaciones no leídas ──
export const contarNoLeidas = async () => {
  try {
    const res = await api.get("/notificaciones/no-leidas", { params: { canal: "web" } });
    return res.data.no_leidas || 0;
  } catch {
    return 0;
  }
};

// ── Marcar notificación como leída ──
export const marcarLeida = async (id) => {
  try {
    await api.patch(`/notificaciones/${id}/leer`);
  } catch (err) {
    console.error("Error marcando notificación como leída", err);
  }
};