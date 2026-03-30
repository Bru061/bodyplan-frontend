import { useState, useRef } from "react";
import api from "../../services/axios";
import Toast from "../../components/ui/Toast";
import ModalPortal from "../../components/ui/ModalPortal";

function EditFotosModal({ gym, onClose, onUpdated }) {

  const [loading, setLoading] = useState(false);
  const [newFotos, setNewFotos] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirmarId, setConfirmarId] = useState(null);
  const fileRef = useRef(null);

  const showToast = (message, type = "error") => setToast({ message, type });

  const validTypes = ["image/jpeg", "image/png"];
  const maxSize = 5 * 1024 * 1024;
  const maxFotos = 5;

  const deleteFoto = async () => {
    try {
      setLoading(true);
      await api.delete(`/gym/fotos/${confirmarId}`);
      setConfirmarId(null);
      await onUpdated();
    } catch (err) {
      console.error(err);
      showToast("Error eliminando la foto.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!newFotos.length) { showToast("Selecciona al menos una foto."); return; }
    try {
      setLoading(true);
      const formData = new FormData();
      newFotos.forEach(f => formData.append("fotos", f));
      await api.post(`/gym/${gym.id_gimnasio}/fotos`, formData);
      showToast("Fotos subidas correctamente.", "success");
      setNewFotos([]);
      onUpdated();
    } catch (err) {
      console.error(err);
      showToast("Error subiendo las fotos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {confirmarId && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-box">
            <h3 className="modal-title">Eliminar foto</h3>
            <p className="modal-body">¿Seguro que deseas eliminar esta foto?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmarId(null)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={deleteFoto} disabled={loading}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalPortal>
      <div className="modal-overlay">
        <div className="modal-card modal-lg">

          <h2 className="modal-title">Fotos del gimnasio</h2>

          <div className="upload-box">
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              onChange={e => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;

                if ((gym.fotos?.length || 0) + newFotos.length + files.length > maxFotos) {
                  showToast(`Máximo ${maxFotos} imágenes permitidas entre actuales y nuevas.`);
                  e.target.value = "";
                  return;
                }

                for (const file of files) {
                  if (!validTypes.includes(file.type)) {
                    showToast("Solo se permiten imágenes JPG o PNG");
                    e.target.value = "";
                    return;
                  }
                  if (file.size > maxSize) {
                    showToast("Cada imagen debe pesar menos de 5MB");
                    e.target.value = "";
                    return;
                  }
                }

                setNewFotos(prev => [...prev, ...files].slice(0, maxFotos));
                e.target.value = "";
              }}
            />
            <button type="button" className="btn-select" onClick={() => fileRef.current.click()}>
              Seleccionar imágenes
            </button>
            <button type="button" className="btn btn-primary" onClick={handleUpload} disabled={loading}>
              {loading ? "Subiendo..." : "Subir fotos"}
            </button>
          </div>

          {newFotos.length > 0 && (
            <div className="selected-files">
              <p className="selected-title">Imágenes seleccionadas:</p>
              <ul>
                {newFotos.map((f, i) => (
                  <li key={i} style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                    <span>{f.name}</span>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ padding: "0.1rem 0.4rem", fontSize: "0.72rem" }}
                      onClick={() => setNewFotos(prev => prev.filter((_, idx) => idx !== i))}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="fotos-grid">
            {gym.fotos?.map(f => (
              <div key={f.id_foto} className="foto-card">
                <img src={`/uploads/gimnasios/${f.url_foto}`} alt={f.url_foto} />
                <p style={{ margin: "0.5rem 0", fontSize: "0.78rem", color: "var(--text-secondary)", wordBreak: "break-all" }}>
                  {f.url_foto}
                </p>
                <div className="foto-actions">
                  <button
                    className="btn btn-danger"
                    disabled={loading}
                    onClick={() => {
                      if ((gym.fotos?.length || 0) <= 1) {
                        showToast("El gimnasio debe tener al menos una foto.");
                        return;
                      }
                      setConfirmarId(f.id_foto);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          </div>

        </div>
      </div>
      </ModalPortal>
    </>
  );
}

export default EditFotosModal;