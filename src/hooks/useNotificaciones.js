import { useState, useEffect, useRef, useCallback } from "react";
import { mostrarToast, contarNoLeidas } from "../services/notificationService";
import { onMensajeForeground } from "../config/firebase";
import { useAuth } from "../core/context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://bodyplan-api.giize.com:3000/api";

export const useNotificaciones = () => {

  const { token } = useAuth();
  const [noLeidas, setNoLeidas] = useState(0);
  const eventSourceRef = useRef(null);

  // ── Cargar conteo inicial ──
  useEffect(() => {
    if (!token) return;
    contarNoLeidas().then(setNoLeidas);
  }, [token]);

  // ── SSE ──
  const conectarSSE = useCallback(() => {
    if (!token) return;
    if (eventSourceRef.current) eventSourceRef.current.close();

    const url = `${API_BASE}/notificaciones/stream?token=${token}`;
    const es   = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.tipo === "heartbeat") return; // ignorar pings
        mostrarToast({ titulo: data.titulo, mensaje: data.mensaje });
        setNoLeidas(prev => prev + 1);
      } catch {
        // ignorar mensajes malformados
      }
    };

    es.onerror = () => {
      es.close();
      setTimeout(conectarSSE, 5000); // reconectar en 5s
    };

    eventSourceRef.current = es;
  }, [token]);

  useEffect(() => {
    if (!token) return;
    conectarSSE();
    return () => eventSourceRef.current?.close();
  }, [conectarSSE]);

  // ── FCM foreground ──
  useEffect(() => {
    if (!token) return;
    const unsub = onMensajeForeground((payload) => {
      mostrarToast({
        titulo:  payload.notification?.title,
        mensaje: payload.notification?.body
      });
      setNoLeidas(prev => prev + 1);
    });
    return () => unsub?.();
  }, [token]);

  const resetNoLeidas = () => setNoLeidas(0);

  return { noLeidas, setNoLeidas, resetNoLeidas };
};