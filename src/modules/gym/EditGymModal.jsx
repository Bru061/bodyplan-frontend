import { useEffect, useState } from "react";
import api from "../../services/axios";

function EditGymModal({ gym, onClose, onUpdated }) {

  if (!gym) return null; // seguridad

  const ubicacion = gym.Ubicacion || {};

  const [form, setForm] = useState({
    nombre: gym.nombre || "",
    descripcion: gym.descripcion || "",
    telefono: gym.telefono || "",
    direccion: ubicacion.direccion || "",
    municipio: ubicacion.municipio || "",
    estado: ubicacion.estado || "",
    pais: ubicacion.pais || "México",
    codigo_postal: ubicacion.codigo_postal || ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onlyNumbers = (value) => value.replace(/[^0-9]/g, "");
  const onlyLetters = (value) => value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  const lettersNumbers = (value) => value.repace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");

  const camposVacios = Object.values(form).some(v => v.trim() === "");


  // ================= GUARDAR =================
  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      if(camposVacios){
        alert("Todos los campos son obligatorios");
        return;
      }

      console.log("EDITANDO GYM:", gym.id_gimnasio);

      // 1️⃣ actualizar info básica
      await api.put(`/gym/${gym.id_gimnasio}`, {
        nombre: form.nombre,
        descripcion: form.descripcion,
        telefono: form.telefono
      });

      // 2️⃣ actualizar ubicación
      await api.put(`/gym/${gym.id_gimnasio}/ubicacion`, {
        direccion: form.direccion,
        municipio: form.municipio,
        estado: form.estado,
        pais: form.pais,
        codigo_postal: form.codigo_postal
      });

      console.log("GYM ACTUALIZADO");

      onUpdated(); // recargar gym
      onClose();   // cerrar modal

    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Error al actualizar gimnasio");
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="modal-overlay">

    <div className="modal-card">

      {/* HEADER */}
      <div className="modal-header">
        <h2>Editar gimnasio</h2>
        <p>Actualiza la información principal de tu negocio</p>
      </div>

      {error && (
        <div className="modal-error">{error}</div>
      )}

      {/* FORM */}
      <div className="modal-form">

        <label>Nombre del gimnasio</label>
        <input
          value={form.nombre}
          onChange={e=>{
            const v = e.target.value;
            setForm({...form,nombre:v});
          }}
        />

        <label>Descripción</label>
        <textarea
          value={form.descripcion}
          onChange={e=>setForm({...form,descripcion:e.target.value})}
        />

        <label>Teléfono</label>
        <input
          value={form.telefono}
          onChange={e=>{
            const limpio = onlyNumbers(e.target.value);
            setForm({...form,telefono:limpio});
          }}
        />

        <h3 className="section-title">Ubicación</h3>

        <div className="grid-2">
          <div>
            <label>Dirección</label>
            <input
              value={form.direccion}
              onChange={e=>{
                const limpio = lettersNumbers(e.target.value)
                setForm({...form,direccion:limpio});
              }}
            />
          </div>

          <div>
            <label>Municipio</label>
            <input
              value={form.municipio}
              onChange={e=>{
              const limpio = onlyLetters(e.target.value);
              setForm({...form,municipio:limpio});
            }}
            />
          </div>

          <div>
            <input
              value={form.estado}
              onChange={e=>{
              const limpio = onlyLetters(e.target.value);
              setForm({...form,estado:limpio});
            }}
            />
          </div>

          <div>
            <label>Código postal</label>
            <input
              value={form.codigo_postal}
              onChange={e=>{
                const limpio = onlyNumbers(e.target.value);
                setForm({...form,codigo_postal:limpio});
              }}
            />
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="modal-actions">
        <button className="btn-ghost" onClick={onClose}>
          Cancelar
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

    </div>
  </div>
);
}

export default EditGymModal;