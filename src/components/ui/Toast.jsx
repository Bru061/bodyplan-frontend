import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Notificación emergente temporal que se muestra al usuario.
 * Se renderiza directamente en el <body> mediante un portal de React.
 */
function Toast({ message, type = "error", onClose, duration = 3000 }) {

    /**
   * Cierra automáticamente el Toast transcurrido el tiempo indicado en `duration`.
   * Limpia el timeout si el componente se desmonta antes.
   */
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, []);

  return createPortal(
    <div className={`toast toast-${type}`} style={{ zIndex: 10100 }}>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>,
    document.body
  );
}

export default Toast;