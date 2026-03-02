import { useState, useRef } from "react";
import api from "../../services/axios";

function EditFotosModal({ gym, onClose, onUpdated }) {

  const [loading, setLoading] = useState(false);
  const [newFotos, setNewFotos] = useState([]);
  const fileRef = useRef(null);

  // =============================
  // ELIMINAR FOTO
  // =============================
  const deleteFoto = async (id) => {

    if (!window.confirm("¿Eliminar foto?")) return;

    try {
      setLoading(true);

      await api.delete(`/gym/fotos/${id}`);

      // refresca gym padre
      await onUpdated();

    } catch (err) {
      console.error(err);
      alert("Error eliminando foto");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // SUBIR FOTOS
  // =============================
  const handleUpload = async () => {

    if (!newFotos.length) {
      alert("Selecciona al menos una foto");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      newFotos.forEach(f => formData.append("fotos", f));

      await api.post(`/gym/${gym.id_gimnasio}/fotos`, formData);

      alert("Fotos subidas correctamente");
      setNewFotos([]);
      onUpdated();

    } catch (err) {
      console.error(err);
      alert("Error subiendo fotos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card modal-lg">

        <h2 className="modal-title">Fotos del gimnasio</h2>

        {/* ================= SUBIDA ================= */}
        <div className="upload-box">

          {/* input oculto */}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const files = Array.from(e.target.files);
              setNewFotos(files);
            }}
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

        {/* ================= NOMBRES ARCHIVOS ================= */}
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

        {/* ================= GALERIA ================= */}
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
                  onClick={() => deleteFoto(f.id_foto)}
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
  );
}

export default EditFotosModal;