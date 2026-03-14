import { useState, useRef } from "react";
import api from "../../services/axios";
import Toast from "../../components/ui/Toast";

function EditFotosModal({ gym, onClose, onUpdated }) {

  const [loading, setLoading] = useState(false);
  const [newFotos, setNewFotos] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirmarId, setConfirmarId] = useState(null);
  const fileRef = useRef(null); 

  const showToast = (message, type = "error") => setToast({ message, type });

  const deleteFoto = async () => {
    if ((gym.fotos?.length || 0) <= 1) {
      showToast("El gimnasio debe tener al menos una foto.");
      setConfirmarId(null);
      return;
    }

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
    if (!newFotos.length) {
      showToast("Selecciona al menos una foto.");
      return;
    }

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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {confirmarId && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-box">
            <h3 className="modal-title">Eliminar foto</h3>
            <p className="modal-body">¿Seguro que deseas eliminar esta foto?</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmarId(null)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={deleteFoto}
                disabled={loading}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

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
              onChange={(e) => setNewFotos(Array.from(e.target.files))}
            />
            <button
              type="button"
              className="btn-select"
              onClick={() => fileRef.current.click()}
            >
              Seleccionar imágenes
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "Subiendo..." : "Subir fotos"}
            </button>
          </div>

          {newFotos.length > 0 && (
            <div className="selected-files">
              <p className="selected-title">Imágenes seleccionadas:</p>
              <ul>
                {newFotos.map((f, i) => (
                  <li key={i}>{f.name}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="fotos-grid">
            {gym.fotos?.map((f) => (
              <div key={f.id_foto} className="foto-card">
                <img
                  src={`/uploads/gimnasios/${f.url_foto}`}
                  alt="foto"
                />
                <div className="foto-actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      if ((gym.fotos?.length || 0) <= 1) {
                        showToast("El gimnasio debe tener al menos una foto.");
                        return;
                      }
                      setConfirmarId(f.id_foto);
                    }}
                    disabled={loading}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button className="btn-ghost" onClick={onClose}>
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default EditFotosModal;