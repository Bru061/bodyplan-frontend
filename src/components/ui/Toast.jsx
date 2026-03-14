import { useEffect } from "react";
import { createPortal } from "react-dom";

function Toast({ message, type = "error", onClose, duration = 3000 }) {
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