import { useState } from "react";
import api from "../../services/axios";
import { FiArrowLeft } from "react-icons/fi";

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

  // ✅ NUEVO: Paso 1 = formulario, Paso 2 = verificación de correo
  const [paso, setPaso] = useState(1);
  const [codigo, setCodigo] = useState("");
  const [codigoError, setCodigoError] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [success, setSuccess] = useState("");

  // ── Filtros de input ──
  const onlyLetters = (value) =>
    value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  const onlyLettersNoSpace = (value) =>
    value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "");
  const onlyNumbers = (value) =>
    value.replace(/[^0-9]/g, "").slice(0, 10);

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

  // ── Paso 1: Crear cliente → backend envía código automáticamente ──
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

    if (!form.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    } else if (form.telefono.length !== 10) {
      newErrors.telefono = "El teléfono debe tener 10 dígitos";
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
        telefono: form.telefono,
        id_gimnasio: Number(form.id_gimnasio),
        id_membresia: Number(form.id_membresia)
      };

      await api.post("/gym/clientes/inscribir", data);

      // ✅ Cliente creado — backend envió el código, avanzamos al paso 2
      setPaso(2);

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

  // ── Paso 2: Verificar código ──
  const handleVerificar = async () => {

    if (!codigo.trim()) {
      setCodigoError("Debes ingresar el código");
      return;
    }

    try {

      setVerificando(true);
      setCodigoError("");

      await api.post("/auth/verify-email", {
        correo: form.correo.trim(),
        codigo,
        plataforma: "web"
      });

      setSuccess("¡Correo verificado correctamente!");

      setTimeout(() => {
        onCreated();
        onClose();
      }, 1200);

    } catch (err) {
      setCodigoError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Código incorrecto o expirado"
      );
    } finally {
      setVerificando(false);
    }
  };

  return (

    <div className="modal-overlay">
      <div className="modal-card modal-lg">

        {/* ── Paso 1: Formulario ── */}
        {paso === 1 && (
          <>
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
                  <label>Teléfono *</label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    maxLength={10}
                    inputMode="numeric"
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "telefono",
                          value: onlyNumbers(e.target.value)
                        }
                      })
                    }
                  />
                  {errors.telefono && (
                    <p className="text-red-500 text-sm">{errors.telefono}</p>
                  )}
                </div>

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
          </>
        )}

        {/* ── Paso 2: Verificación de correo ── */}
        {paso === 2 && (
          <>
            {/* ✅ Flecha para regresar al formulario */}
            <button
              type="button"
              className="back-button"
              onClick={() => {
                setPaso(1);
                setCodigo("");
                setCodigoError("");
                setSuccess("");
              }}
              title="Volver al formulario"
              style={{ marginBottom: "8px" }}
            >
              <FiArrowLeft size={20} />
            </button>

            <h2 className="modal-title">Verificar correo</h2>

            <p style={{
              color: "#64748b",
              fontSize: "0.95rem",
              marginBottom: "20px"
            }}>
              Hemos enviado un código de verificación a:
              <br />
              <strong>{form.correo}</strong>
            </p>

            {codigoError && (
              <div className="modal-error">{codigoError}</div>
            )}

            {success && (
              <p style={{ color: "green", marginBottom: "12px", fontWeight: 600 }}>
                {success}
              </p>
            )}

            <div className="modal-form">
              <label>Código de verificación *</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={codigo}
                placeholder="000000"
                onChange={(e) => {
                  setCodigoError("");
                  setCodigo(e.target.value.replace(/[^0-9]/g, ""));
                }}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-ghost"
                onClick={() => {
                  setPaso(1);
                  setCodigo("");
                  setCodigoError("");
                  setSuccess("");
                }}
              >
                Regresar
              </button>
              <button
                className="btn-primary"
                onClick={handleVerificar}
                disabled={verificando || !!success}
              >
                {verificando ? "Verificando..." : "Confirmar código"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>

  );

}

export default AddClienteModal;