import { useState, useEffect } from "react";
import api from "../../services/axios";

function EditGymModal({ gym, onClose, onUpdated }) {

  if (!gym) return null;

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

  useEffect(() => {

    const keys = Object.keys(errors);
    if (keys.length === 0) return;

    const field = document.querySelector(`[name="${keys[0]}"]`);
    if (!field) return;

    const rect = field.getBoundingClientRect();
    const offset = window.scrollY + rect.top - 120;

    window.scrollTo({
      top: offset,
      behavior: "smooth"
    });

    field.focus?.();

  }, [errors]);

  const onlyNumbers = (value, max) => value.replace(/[^0-9]/g, "").slice(0, max);
  const onlyLetters = (value, max) => value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, max);
  const lettersNumbers = (value, max) => value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, max);

const handleSave = async () => {

  let newErrors = {};
  setError("");

  if (!form.nombre.trim())
    newErrors.nombre = "El nombre del gimnasio es obligatorio";

  if (!form.descripcion.trim())
    newErrors.descripcion = "La descripción es obligatoria";

  if (!form.telefono.trim())
    newErrors.telefono = "El teléfono es obligatorio";
  else if (form.telefono.length !== 10)
    newErrors.telefono = "El teléfono debe tener 10 dígitos";

  if (!form.direccion.trim())
    newErrors.direccion = "La dirección es obligatoria";

  if (!form.municipio.trim())
    newErrors.municipio = "El municipio es obligatorio";

  if (!form.estado.trim())
    newErrors.estado = "El estado es obligatorio";

  if (!form.codigo_postal.trim())
    newErrors.codigo_postal = "El código postal es obligatorio";
  else if (form.codigo_postal.length !== 5)
    newErrors.codigo_postal = "Debe tener 5 dígitos";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
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

      <div className="modal-header">
        <h2>Editar gimnasio</h2>
        <p>Actualiza la información principal de tu negocio</p>
      </div>

      {error && (
        <div className="modal-error">{error}</div>
      )}

      <div className="modal-form">

        <label>Nombre del gimnasio *</label>
        <input
          nombre="nombre"
          type="text"
          maxLength={50}
          value={form.nombre}
          onChange={e=>{
            const v = lettersNumbers(e.target.value, 50);
            setForm({...form,nombre:v});
            if(errors.nombre){
              setErrors(prev=>({...prev,nombre:""}));
            }
          }}
            style={{
              border: errors.nombre ? "2px solid red" : "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px 10px"
            }}
        />
        {errors.nombre && (
          <p style={{color:"#dc2626",fontSize:"13px",marginTop:"4px"}}>
            {errors.nombre}
          </p>
        )}

        <label>Descripción *</label>
        <div className="textarea-wrapper">
        <textarea
          name="descripcion"
          maxLength={255}
          value={form.descripcion}
          onChange={e=>{
            const v = e.target.value.slice(0,255);
            setForm({...form,descripcion:v});
            if(errors.descripcion){
              setErrors(prev=>({...prev,descripcion:""}));
            }
          }}
          style={{
            width: "100%",
            border: errors.descripcion ? "2px solid #dc2626" : "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "8px 10px",
            backgroundColor: errors.descripcion ? "#fef2f2" : "white"
          }}
        />
        <span className="char-counter">
          {form.descripcion.length}/255
        </span>
        </div>
        {errors.descripcion && (
          <p style={{color:"#dc2626",fontSize:"13px",marginTop:"4px"}}>
            {errors.descripcion}
          </p>
        )}

        <label>Teléfono *</label>
        <input
          nombre="telefono"
          maxLength={10}  
          value={form.telefono}
          onChange={e=>{
            const limpio = onlyNumbers(e.target.value, 10);
            setForm({...form,telefono:limpio});
            if(errors.telefono){
              setErrors(prev=>({...prev,telefono:""}));
            }
          }}
            style={{
            border: errors.telefono ? "2px solid red" : "1px solid #ccc",
            borderRadius: "8px",
            padding: "8px 10px"
          }}
        />
        {errors.telefono && (
          <p style={{color:"#dc2626",fontSize:"13px",marginTop:"4px"}}>
            {errors.telefono}
          </p>
        )}

        <h3 className="section-title">Ubicación</h3>

        <div className="grid-2">
          <div>
            <label>Dirección *</label>
            <input
              nombre="direccion"
              maxLength={50}
              value={form.direccion}
              onChange={e=>{
                const limpio = lettersNumbers(e.target.value, 50);
                setForm({...form,direccion:limpio});
                if(errors.direccion){
                  setErrors(prev=>({...prev,direccion:""}));
                }
              }}
                style={{
                border: errors.direccion ? "2px solid red" : "1px solid #ccc",
                borderRadius: "8px",
                padding: "8px 10px"
              }}
            />
            {errors.direccion && (
              <p style={{color:"#dc2626",fontSize:"13px",marginTop:"4px"}}>
                {errors.direccion}
              </p>
            )}
          </div>

          <div>
            <label>Municipio *</label>
            <input
              nombre="municipio"
              maxLength={20}
              value={form.municipio}
              onChange={e=>{
              const limpio = onlyLetters(e.target.value, 20);
              setForm({...form,municipio:limpio});
              if(errors.municipio){
                setErrors(prev=>({...prev,municipio:""}));
              }
            }}
              style={{
              border: errors.municipio ? "2px solid red" : "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px 10px"
            }}
            />
            {errors.municipio && (
              <p style={{color:"#dc2626",fontSize:"13px",marginTop:"4px"}}>
                {errors.municipio}
              </p>
            )}
          </div>

          <div>
            <label>Estado *</label>
            <input
              nombre="estado"
              maxLength={20}
              value={form.estado}
              onChange={e=>{
              const limpio = onlyLetters(e.target.value, 20);
              setForm({...form,estado:limpio});
              if(errors.estado){
                setErrors(prev=>({...prev,municipio:""}));
              }
            }}
              style={{
              border: errors.estado ? "2px solid red" : "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px 10px"
            }}
            />
            {errors.estado && (
              <p style={{color:"#dc2626",fontSize:"13px",marginTop:"4px"}}>
                {errors.estado}
              </p>
            )}
          </div>

          <div>
            <label>Código postal *</label>
            <input
              nombre="codigo_postal"
              maxLength={5}
              value={form.codigo_postal}
              onChange={e=>{
                const limpio = onlyNumbers(e.target.value, 5);
                setForm({...form,codigo_postal:limpio});
                if(errors.codigo_postal){
                  setErrors(prev=>({...prev,codigo_postal:""}));
                }
              }}
              style={{
                border: errors.codigo_postal ? "2px solid red" : "1px solid #ccc",
                borderRadius: "8px",
                padding: "8px 10px"
              }}
            />
            {errors.codigo_postal && (
              <p style={{color:"#dc2626",fontSize:"13px",marginTop:"4px"}}>
                {errors.codigo_postal}
              </p>
            )}
          </div>
        </div>

      </div>

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