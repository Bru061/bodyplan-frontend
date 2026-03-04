import { useState } from "react";
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
  const [errors,setErrors] = useState({});

  const onlyNumbers = (value) => value.replace(/[^0-9]/g, "");
  const onlyLetters = (value) => value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  const lettersNumbers = (value) => value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");

const handleSave = async () => {

  let newErrors = {};
  setError("");

  // Obligatorios
  if (!form.nombre.trim()) newErrors.nombre = true;
  if (!form.descripcion.trim()) newErrors.descripcion = true;
  if (!form.telefono.trim()) newErrors.telefono = true;
  if (!form.direccion.trim()) newErrors.direccion = true;
  if (!form.municipio.trim()) newErrors.municipio = true;
  if (!form.estado.trim()) newErrors.estado = true;
  if (!form.codigo_postal.trim()) newErrors.codigo_postal = true;

  // Teléfono 10 dígitos
  if (form.telefono.length !== 10) newErrors.telefono = true;

  // Código postal 5 dígitos
  if (form.codigo_postal.length !== 5) newErrors.codigo_postal = true;

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    setError("Verifica los campos marcados en rojo");
    return;
  }

  try {
    setLoading(true);

    await api.put(`/gym/${gym.id_gimnasio}`, {
      nombre: form.nombre,
      descripcion: form.descripcion,
      telefono: form.telefono
    });

    await api.put(`/gym/${gym.id_gimnasio}/ubicacion`, {
      direccion: form.direccion,
      municipio: form.municipio,
      estado: form.estado,
      pais: form.pais,
      codigo_postal: form.codigo_postal
    });

    onUpdated();
    onClose();

  } catch (err) {
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

        <label>Nombre del gimnasio *</label>
        <input
          value={form.nombre}
          onChange={e=>{
            const v = e.target.value;
            setForm({...form,nombre:v});
          }}
            style={{
              border: errors.nombre ? "2px solid red" : "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px 10px"
            }}
        />

        <label>Descripción *</label>
        <textarea
          value={form.descripcion}
          onChange={e=>setForm({...form,descripcion:e.target.value})}
          style={{
            width: "100%",
            border: errors.descripcion ? "2px solid #dc2626" : "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "8px 10px",
            backgroundColor: errors.descripcion ? "#fef2f2" : "white"
          }}
        />

        <label>Teléfono *</label>
        <input
          value={form.telefono}
          onChange={e=>{
            const limpio = onlyNumbers(e.target.value);
            setForm({...form,telefono:limpio});
          }}
            style={{
            border: errors.telefono ? "2px solid red" : "1px solid #ccc",
            borderRadius: "8px",
            padding: "8px 10px"
          }}
        />

        <h3 className="section-title">Ubicación</h3>

        <div className="grid-2">
          <div>
            <label>Dirección *</label>
            <input
              value={form.direccion}
              onChange={e=>{
                const limpio = lettersNumbers(e.target.value)
                setForm({...form,direccion:limpio});
              }}
                style={{
                border: errors.direccion ? "2px solid red" : "1px solid #ccc",
                borderRadius: "8px",
                padding: "8px 10px"
              }}
            />
          </div>

          <div>
            <label>Municipio *</label>
            <input
              value={form.municipio}
              onChange={e=>{
              const limpio = onlyLetters(e.target.value);
              setForm({...form,municipio:limpio});
            }}
              style={{
              border: errors.municipio ? "2px solid red" : "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px 10px"
            }}
            />
          </div>

          <div>
            <label>Estado *</label>
            <input
              value={form.estado}
              onChange={e=>{
              const limpio = onlyLetters(e.target.value);
              setForm({...form,estado:limpio});
            }}
              style={{
              border: errors.estado ? "2px solid red" : "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px 10px"
            }}
            />
          </div>

          <div>
            <label>Código postal *</label>
            <input
              value={form.codigo_postal}
              onChange={e=>{
                const limpio = onlyNumbers(e.target.value);
                setForm({...form,codigo_postal:limpio});
              }}
              style={{
                border: errors.codigo_postal ? "2px solid red" : "1px solid #ccc",
                borderRadius: "8px",
                padding: "8px 10px"
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