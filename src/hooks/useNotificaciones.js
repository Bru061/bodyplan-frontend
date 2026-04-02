import { useState, useEffect, useRef, useCallback } from "react";
import { mostrarToast, contarNoLeidas } from "../services/notificationService";
import { onMensajeForeground } from "../config/firebase";
import { useAuth } from "../core/context/AuthContext";

const API_BASE = "/api";

/**
 * Hook que centraliza la gestión de notificaciones en tiempo real.
 * Combina tres fuentes: conteo inicial desde la API, stream SSE para
 * notificaciones en vivo y mensajes push de Firebase en primer plano (FCM).
 * Expone el conteo de no leídas y utilidades para actualizarlo.
 */
export const useNotificaciones = () => {

  const { token } = useAuth();
  const [noLeidas, setNoLeidas] = useState(0);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    contarNoLeidas().then(setNoLeidas);
  }, [token]);

  /**
 * Consulta el servicio contarNoLeidas y actualiza el estado local.
 * Memoizada con useCallback para uso seguro como dependencia de efectos.
 */
  const refrescarNoLeidas = useCallback(async () => {
    const total = await contarNoLeidas();
    setNoLeidas(total);
    return total;
  }, []);


  /**
 * Abre una conexión EventSource al endpoint de stream de notificaciones
 * autenticada mediante el token en la URL.
 * Ignora eventos de tipo "heartbeat". Al recibir un mensaje válido
 * muestra un toast y suma 1 al contador de no leídas.
 * Si la conexión falla, la cierra y reintenta automáticamente tras 5 segundos.
 * Memoizada con useCallback; se reconecta si cambia el token.
 */
  const conectarSSE = useCallback(() => {
    if (!token) return;
    if (eventSourceRef.current) eventSourceRef.current.close();

    const url = `${API_BASE}/notificaciones/stream?token=${token}`;
    const es   = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.tipo === "heartbeat") return;
        mostrarToast({ titulo: data.titulo, mensaje: data.mensaje });
        setNoLeidas(prev => prev + 1);
      } catch {
      }
    };

    es.onerror = () => {
      es.close();
      setTimeout(conectarSSE, 5000);
    };

    eventSourceRef.current = es;
  }, [token]);

  useEffect(() => {
    if (!token) return;
    conectarSSE();
    return () => eventSourceRef.current?.close();
  }, [conectarSSE]);

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

  return { noLeidas, setNoLeidas, resetNoLeidas, refrescarNoLeidas };
};