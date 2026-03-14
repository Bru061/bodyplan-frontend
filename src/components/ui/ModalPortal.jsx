import { createPortal } from "react-dom";

/**
 * ModalPortal — monta su contenido directamente en document.body
 * para evitar problemas de z-index y posicionamiento con el layout.
 *
 * Uso:
 *   <ModalPortal>
 *     <div className="modal-overlay">...</div>
 *   </ModalPortal>
 */
function ModalPortal({ children }) {
  return createPortal(children, document.body);
}

export default ModalPortal;