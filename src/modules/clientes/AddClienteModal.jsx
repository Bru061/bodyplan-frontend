import { useState } from "react";
import api from "../../services/axios";

function AddClienteModal({
  gimnasios,
  membresias,
  fetchMembresias,
  onClose,
  onCreated
}) {

  const [form, setForm] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    correo: "",
    id_gimnasio: "",
    id_membresia: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Filtros de input ──
  const onlyLetters = (value) =>
    value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  const onlyLettersNoSpace = (value) =>
    value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: name === "id_membresia" ? Number(value) : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCorreoBlur = () => {
    if (form.correo && !/^\S+@\S+\.\S+$/.test(form.correo)) {
      setErrors(prev => ({ ...prev, correo: "Correo inválido" }));
    }
  };

  const handleGymChange = async (e) => {
    const id = Number(e.target.value);

    setForm(prev => ({
      ...prev,
      id_gimnasio: id,
      id_membresia: ""
    }));

    if (errors.id_gimnasio) {
      setErrors(prev => ({ ...prev, id_gimnasio: "" }));
    }

    if (id) {
      await fetchMembresias(id);
    }
  };

  const handleSubmit = async () => {

    const newErrors = {};

    if (!form.nombre.trim())
      newErrors.nombre = "El nombre es obligatorio";

    if (!form.apellido_paterno.trim())
      newErrors.apellido_paterno = "El apellido paterno es obligatorio";

    if (!form.apellido_materno.trim())
      newErrors.apellido_materno = "El apellido materno es obligatorio";

    if (!form.correo.trim()) {
      newErrors.correo = "El correo es obligatorio";
    } else if (!/^\S+@\S+\.\S+$/.test(form.correo)) {
      newErrors.correo = "Correo inválido";
    }

    if (!form.id_gimnasio)
      newErrors.id_gimnasio = "Debes seleccionar un gimnasio";

    if (!form.id_membresia)
      newErrors.id_membresia = "Debes seleccionar una membresía";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {

      setLoading(true);
      setError("");

      const data = {
        nombre: form.nombre.trim(),
        apellido_paterno: form.apellido_paterno.trim(),
        apellido_materno: form.apellido_materno.trim(),
        correo: form.correo.trim(),
        id_gimnasio: Number(form.id_gimnasio),
        id_membresia: Number(form.id_membresia)
      };

      await api.post("/gym/clientes/inscribir", data);

      onCreated();
      onClose();

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error creando cliente"
      );
    } finally {
      setLoading(false);
    }

  };

  return (

    <div className="modal-overlay">
      <div className="modal-card modal-lg">

        <h2 className="modal-title">Registrar cliente</h2>

        {error && (
          <div className="modal-error">{error}</div>
        )}

        <div className="modal-form">

          <div className="modal-grid">

            <div>
              <label>Nombre *</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "nombre",
                      value: onlyLetters(e.target.value)
                    }
                  })
                }
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label>Apellido paterno *</label>
              <input
                name="apellido_paterno"
                value={form.apellido_paterno}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "apellido_paterno",
                      value: onlyLettersNoSpace(e.target.value)
                    }
                  })
                }
              />
              {errors.apellido_paterno && (
                <p className="text-red-500 text-sm">{errors.apellido_paterno}</p>
              )}
            </div>

            <div>
              <label>Apellido materno *</label>
              <input
                name="apellido_materno"
                value={form.apellido_materno}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "apellido_materno",
                      value: onlyLettersNoSpace(e.target.value)
                    }
                  })
                }
              />
              {errors.apellido_materno && (
                <p className="text-red-500 text-sm">{errors.apellido_materno}</p>
              )}
            </div>

            <div>
              <label>Correo *</label>
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                onBlur={handleCorreoBlur}
              />
              {errors.correo && (
                <p className="text-red-500 text-sm">{errors.correo}</p>
              )}
            </div>

          </div>

          <div>
            <label>Gimnasio *</label>
            <select
              name="id_gimnasio"
              value={form.id_gimnasio ?? ""}
              onChange={handleGymChange}
            >
              <option value="">Seleccionar</option>
              {gimnasios.map(g => (
                <option key={g.id_gimnasio} value={g.id_gimnasio}>
                  {g.nombre}
                </option>
              ))}
            </select>
            {errors.id_gimnasio && (
              <p className="text-red-500 text-sm">{errors.id_gimnasio}</p>
            )}
          </div>

          <div>
            <label>Membresía *</label>
            <select
              name="id_membresia"
              value={form.id_membresia ?? ""}
              onChange={handleChange}
              disabled={!form.id_gimnasio}
            >
              <option value="">
                {form.id_gimnasio
                  ? "Seleccionar membresía"
                  : "Primero selecciona un gimnasio"}
              </option>
              {membresias.map(m => (
                <option key={m.id_membresia} value={m.id_membresia}>
                  {m.nombre} — ${m.precio}
                </option>
              ))}
            </select>
            {errors.id_membresia && (
              <p className="text-red-500 text-sm">{errors.id_membresia}</p>
            )}
          </div>

        </div>

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Crear cliente"}
          </button>
        </div>

      </div>
    </div>

  );

}

export default AddClienteModal;