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
    telefono: "",
    id_gimnasio: "",
    id_membresia: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const onlyLetters = (value) =>
    value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  const onlyNumbers = (value) =>
    value.replace(/[^0-9]/g, "");


  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: name === "id_membresia"
        ? Number(value)
        : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

  };

  const handleGymChange = async (e) => {

    const id = Number(e.target.value);

    setForm(prev => ({
      ...prev,
      id_gimnasio: id,
      id_membresia: null
    }));

    if (id) {
      await fetchMembresias(id);
    }

  };

  const handleSubmit = async () => {

    let newErrors = {};

  if (!form.nombre.trim())
    newErrors.nombre = "El nombre es obligatorio";

  if (!form.apellido_paterno.trim())
    newErrors.apellido_paterno = "El apellido paterno es obligatorio";

  if (!form.apellido_materno.trim())
    newErrors.apellido_materno = "El apellido materno es obligatorio";

  if (!form.correo.trim())
    newErrors.correo = "El correo es obligatorio";

  if (form.correo && !/^\S+@\S+\.\S+$/.test(form.correo))
    newErrors.correo = "Correo inválido";

  if (!form.telefono.trim())
    newErrors.telefono = "El teléfono es obligatorio";

  if (form.telefono && form.telefono.length !== 10)
    newErrors.telefono = "El teléfono debe tener 10 dígitos";

  if (!form.id_gimnasio)
    newErrors.id_gimnasio = "Selecciona un gimnasio";

  if (!form.id_membresia)
    newErrors.id_membresia = "Selecciona una membresía";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

    try {

      setLoading(true);

      const data = {
        nombre: form.nombre,
        apellido_paterno: form.apellido_paterno,
        apellido_materno: form.apellido_materno,
        correo: form.correo,
        telefono: form.telefono,
        id_gimnasio: Number(form.id_gimnasio),
        id_membresia: Number(form.id_membresia)
      };

      console.log(data);
      console.log(typeof data.id_gimnasio);
      console.log(typeof data.id_membresia);

      await api.post("/gym/clientes/inscribir", data);

      onCreated();
      onClose();

    } catch (err) {

      setError(
        err?.response?.data?.message ||
        "Error creando cliente"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="modal-overlay">

      <div className="modal-card modal-lg">

        <h2 className="modal-title">
          Registrar cliente
        </h2>

        {error && (
          <div className="modal-error">{error}</div>
        )}

        <div className="modal-form">

          <label>Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
          />
          {errors.nombre && (
            <p className="text-red-500 text-sm">{errors.nombre}</p>
          )}

          <label>Apellido paterno</label>
          <input
            name="apellido_paterno"
            value={form.apellido_paterno}
            onChange={handleChange}
          />
          {errors.apellido_paterno && (
            <p className="text-red-500 text-sm">{errors.apellido_paterno}</p>
          )}

          <label>Apellido materno</label>
          <input
            name="apellido_materno"
            value={form.apellido_materno}
            onChange={handleChange}
          />
          {errors.apellido_materno && (
            <p className="text-red-500 text-sm">{errors.apellido_materno}</p>
          )}

          <label>Correo</label>
          <input
            type="email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
          />
          {errors.correo && (
            <p className="text-red-500 text-sm">{errors.correo}</p>
          )}

          <label>Teléfono</label>
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
          />
          {errors.telefono && (
            <p className="text-red-500 text-sm">{errors.telefono}</p>
          )}

          <label>Gimnasio</label>
          <select
            name="id_gimnasio"
            value={form.id_gimnasio ?? ""}
            onChange={handleGymChange}
          >
          {errors.id_gimnasio && (
            <p className="text-red-500 text-sm">{errors.id_gimnasio}</p>
          )}

            <option value="">Seleccionar</option>

            {gimnasios.map(g => (
              <option
                key={g.id_gimnasio}
                value={g.id_gimnasio}
              >
                {g.nombre}
              </option>
            ))}

          </select>

          <label>Membresía</label>
          <select
            name="id_membresia"
            value={form.id_membresia ?? ""}
            onChange={handleChange}
          >
          {errors.id_membresia && (
            <p className="text-red-500 text-sm">{errors.id_membresia}</p>
          )}

            <option value="">Seleccionar</option>

            {membresias.map(m => (
              <option
                key={m.id_membresia}
                value={m.id_membresia}
              >
                {m.nombre} - ${m.precio}
              </option>
            ))}

          </select>

        </div>

        <div className="modal-actions">

          <button
            className="btn-ghost"
            onClick={onClose}
          >
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