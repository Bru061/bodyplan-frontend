import { useState, useRef } from "react";
import api from "../../services/axios";

function EditFotosModal({ gym, onClose, onUpdated }) {

  const [loading, setLoading] = useState(false);
  const [newFotos, setNewFotos] = useState([]);
  const [imagenesBlob, setImagenesBlob] = useState
  const fileRef = useRef();

  // =============================
  // ELIMINAR FOTO
  // =============================
  const deleteFoto = async (id) => {
    const confirm = window.confirm("Eliminar foto?");
    if (!confirm) return;

    try {
      await api.delete(`/gym/fotos/${id}`);
      onUpdated();
    } catch (err) {
      console.error(err);
      alert("Error eliminando foto");
    }
  };

  const makePrincipal = async (fotoSeleccionada) => {
    try {

      const confirm = window.confirm("¿Poner esta foto como portada?");
      if(!confirm) return;

      setLoading(true);

      // descargar todas las fotos como blob
      const fotosBlob = [];

      for (const f of gym.fotos) {
        const res = await fetch(
          `http://bodyplan-api.giize.com:4000/uploads/gimnasios/${f.url_foto}`
        );

        const blob = await res.blob();

        fotosBlob.push({
          blob,
          nombre: f.url_foto
        });
      }

      // eliminar todas
      for (const f of gym.fotos) {
        await api.delete(`/gym/fotos/${f.id_foto}`);
      }

      // ordenar → seleccionada primero
      const ordenadas = [
        fotosBlob.find(f => f.nombre === fotoSeleccionada.url_foto),
        ...fotosBlob.filter(f => f.nombre !== fotoSeleccionada.url_foto)
      ];

      // subir de nuevo
      const formData = new FormData();

      ordenadas.forEach(f => {
        formData.append("fotos", new File([f.blob], f.nombre));
      });

      await api.post(`/gym/${gym.id_gimnasio}/fotos`, formData);

      onUpdated();
      alert("Foto principal actualizada");

    } catch (err) {
      console.error(err);
      alert("Error cambiando portada");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
  console.log("NEWFOTOS:", newFotos);

  if (!newFotos || newFotos.length === 0) {
    alert("Selecciona al menos una foto");
    return;
  }

  try {
    const formData = new FormData();

    newFotos.forEach(f => {
      formData.append("fotos", f);
    });

    await api.post(`/gym/${gym.id_gimnasio}/fotos`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    alert("Fotos subidas");
    setNewFotos([]);
    onUpdated();

  } catch (err) {
    console.error(err);
    alert("Error subiendo fotos");
  }
};

  // =============================
  // UI
  // =============================
  return (
    <div className="modal-overlay">
      <div className="modal-card modal-lg">

        <h2 className="modal-title">Fotos del gimnasio</h2>

        <div className="upload-box">

        {/* input oculto real */}
        <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e)=>{
            const files = Array.from(e.target.files);
            console.log("FILES SELECCIONADOS:", files);
            setNewFotos(files);
            }}
        />

        {/* botón seleccionar */}
        <button
            type="button"
            className="btn-select"
            onClick={() => fileRef.current.click()}
        >
            Seleccionar imágenes
        </button>

        {/* botón subir */}
        <button
            type="button"
            className="btn-primary"
            onClick={handleUpload}
        >
            Subir fotos
        </button>

        </div>

        {/* GALERIA */}
        <div className="fotos-grid">

          {gym.fotos?.map((f,i)=>(
            <div key={i} className="foto-card">

              <img
                src={`http://bodyplan-api.giize.com:4000/uploads/gimnasios/${f.url_foto}`}
                alt="foto"
              />

              {i === 0 && (
                <span className="badge-principal">PORTADA</span>
              )}

              <div className="foto-actions">

                <button
                  className="btn-primary"
                  onClick={()=>makePrincipal(f)}
                >
                  ⭐ Principal
                </button>

                <button
                  className="btn btn-danger"
                  onClick={()=>deleteFoto(f.id_foto)}
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