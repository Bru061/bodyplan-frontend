import { useState } from "react";
import api from "../../services/axios";
import ModalPortal from "../../components/ui/ModalPortal";

function CreatePersonalModal({ onClose, onCreated }) {

  const [form, setForm] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onlyLetters = (v) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  const onlyLettersNoSpace = (v) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "nombre") v = onlyLetters(value).slice(0, 40);
    if (name === "apellido_paterno") v = onlyLettersNoSpace(value).slice(0, 30);
    if (name === "apellido_materno") v = onlyLettersNoSpace(value).slice(0, 30);

    setForm(prev => ({ ...prev, [name]: v }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.apellido_paterno.trim()) newErrors.apellido_paterno = "El apellido paterno es obligatorio";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      setLoading(true);
      setError("");
      await api.post("/personal", {
        nombre: form.nombre.trim(),
        apellido_paterno: form.apellido_paterno.trim(),
        apellido_materno: form.apellido_materno.trim() || undefined
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || "Error creando instructor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="modal-overlay">
        <div className="modal-card">

          <h2 className="modal-title">Agregar instructor</h2>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-form">

            <div className="form-group">
              <label>Nombre *</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. Luis"
                maxLength={40}
              />
              {errors.nombre && <span className="field-error-msg">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label>Apellido paterno *</label>
              <input
                name="apellido_paterno"
                value={form.apellido_paterno}
                onChange={handleChange}
                placeholder="Ej. Ramírez"
                maxLength={30}
              />
              {errors.apellido_paterno && <span className="field-error-msg">{errors.apellido_paterno}</span>}
            </div>

            <div className="form-group">
              <label>Apellido materno <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>(opcional)</span></label>
              <input
                name="apellido_materno"
                value={form.apellido_materno}
                onChange={handleChange}
                placeholder="Ej. Soto"
                maxLength={30}
              />
            </div>

          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Crear instructor"}
            </button>
          </div>

        </div>
      </div>
    </ModalPortal>
  );
}

export default CreatePersonalModal;