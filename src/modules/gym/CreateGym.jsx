import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/axios";
import OnboardingLayout from "../../layout/OnboardingLayout";

function CreateGym() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    telefono: "",
    direccion: "",
    municipio: "",
    estado: "",
    pais: "México",
    codigo_postal: "",
    localidad: "",
    latitud: "",
    longitud: "",
    url_map: ""
  });

  const [fotos, setFotos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {

    const keys = Object.keys(errors);
    if (keys.length === 0) return;

    let firstField = document.querySelector(`[name="${keys[0]}"]`);

    if (!firstField) {
      firstField = document.querySelector(`#${keys[0]}`);
    }

    if (!firstField) return;

    const rect = firstField.getBoundingClientRect();
    const offset = window.scrollY + rect.top - 120;

    window.scrollTo({
      top: offset,
      behavior: "smooth"
    });

    firstField.focus?.();

  }, [errors]);

  const urlValida = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const horaEsValida = (apertura, cierre) => {
    if (!apertura || !cierre) return false;

    const [h1, m1] = apertura.split(":").map(Number);
    const [h2, m2] = cierre.split(":").map(Number);

    const minApertura = h1 * 60 + m1;
    const minCierre = h2 * 60 + m2;

    return minCierre > minApertura;
  };

  // ===== CREAR GIMNASIO =====
const handleCreateGym = async () => {

  const newErrors = {};
  setError("");

  // ===== INFO BASICA =====
  if (!form.nombre.trim()) {
    newErrors.nombre = "El nombre del gimnasio es obligatorio";
  }

  if (!form.descripcion.trim()) {
    newErrors.descripcion = "La descripción es obligatoria";
  }

  if (!form.telefono.trim()) {
    newErrors.telefono = "El teléfono es obligatorio";
  } else if (form.telefono.length !== 10) {
    newErrors.telefono = "El teléfono debe tener 10 dígitos";
  }

  // ===== UBICACION =====
  if (!form.direccion.trim()) {
    newErrors.direccion = "La dirección es obligatoria";
  }

  if (!form.municipio.trim()) {
    newErrors.municipio = "El municipio es obligatorio";
  }

  if (!form.estado.trim()) {
    newErrors.estado = "El estado es obligatorio";
  }

  if (!form.codigo_postal.trim()) {
    newErrors.codigo_postal = "El código postal es obligatorio";
  } else if (form.codigo_postal.length !== 5) {
    newErrors.codigo_postal = "Debe tener 5 dígitos";
  }

  if (!form.url_map.trim()) {
    newErrors.url_map = "Agrega el link de Google Maps";
  } else if (!urlValida(form.url_map)) {
    newErrors.url_map = "URL de Google Maps inválida";
  }

  // ===== FOTOS =====
  if (fotos.length === 0) {
    newErrors.fotos = "Debes subir al menos una foto";
  }

  // ===== HORARIOS =====
  if (horarios.length === 0) {
    newErrors.horarios = "Debes agregar al menos un horario";
  } else {

    const dias = horarios.map(h => h.dia);
    const diasDuplicados = dias.filter((d, i) => dias.indexOf(d) !== i);

    if (diasDuplicados.length) {
      newErrors.horarios = "No puede haber días repetidos";
    }

    if (horarios.length > 7) {
      newErrors.horarios = "Máximo 7 horarios";
    }

    for (const h of horarios) {
      if (!h.dia || !h.apertura || !h.cierre) {
        newErrors.horarios = "Completa todos los horarios";
        break;
      }

      if (!horaEsValida(h.apertura, h.cierre)) {
        newErrors.horarios = "La hora de cierre debe ser mayor";
        break;
      }
    }

  }

  // ===== MEMBRESIAS =====
  if (membresias.length === 0) {
    newErrors.membresias = "Debes agregar al menos una membresía";
  } else {

    if (membresias.length > 10) {
      newErrors.membresias = "Máximo 10 membresías";
    }

    for (const m of membresias) {

      if (!m.nombre.trim()) {
        newErrors.membresias = "Las membresías deben tener nombre";
        break;
      }

      if (!m.precio || Number(m.precio) <= 0) {
        newErrors.membresias = "El precio debe ser mayor a 0";
        break;
      }

      if (!m.duracion || Number(m.duracion) <= 0) {
        newErrors.membresias = "La duración debe ser mayor a 0";
        break;
      }

      if (Number(m.duracion) > 3650) {
        newErrors.membresias = "Duración demasiado grande";
        break;
      }

      if (!m.descripcion || !m.descripcion.trim()) {
        newErrors.membresias = "La descripción es obligatoria";
        break;
      }

      if (m.descripcion && m.descripcion.length > 100) {
        newErrors.membresias = "Máximo 100 caracteres";
        break;
      }

    }

  }

  // ===== DETENER SI HAY ERRORES =====
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setErrors({});

  try {

    setLoading(true);

    const formData = new FormData();

    formData.append("nombre", form.nombre);
    formData.append("descripcion", form.descripcion);
    formData.append("telefono", form.telefono);

    const ubicacion = {
      direccion: form.direccion,
      municipio: form.municipio,
      estado: form.estado,
      pais: form.pais,
      codigo_postal: form.codigo_postal,
      localidad: form.localidad || "",
      latitud: form.latitud || null,
      longitud: form.longitud || null,
      url_map: form.url_map
    };

    formData.append("ubicacion", JSON.stringify(ubicacion));
    formData.append("horarios", JSON.stringify(horarios));
    formData.append("membresias", JSON.stringify(membresias));

    fotos.forEach((f) => formData.append("fotos", f));

    await api.post("/gym", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    navigate("/mis-gimnasios");

  } catch (err) {

    console.log(err);

    const backendError = err?.response?.data?.error;

    if (backendError?.toLowerCase().includes("url")) {
      setErrors(prev => ({
        ...prev,
        url_map: backendError
      }));
    } else {
      setError(backendError || "Error al crear gimnasio");
    }

  } finally {

    setLoading(false);

  }

};

  // ===== VALIDACIONES =====
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "telefono") {
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    }
    if (name === "direccion") {
      value = value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s#.,]/g, "");
    }
    if (name === "municipio" || name === "estado" || name === "localidad") {
      value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "")
      .slice(0, 20);
    }
    if (name === "codigo_postal") {
      value = value.replace(/[^0-9]/g, "").slice(0, 5);
    }

    if (name === "url_map") {
      value = value.replace(/\s/g, "");
    }

    if (name === "nombre") {
      value = value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]/g, "")
      .slice(0, 50);
    }

    if (name === "descripcion") {
      value = value.slice(0, 255);
    }

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleCancel = () => {

    const hayCambios =
      form.nombre ||
      form.descripcion ||
      form.telefono ||
      fotos.length > 0 ||
      horarios.length > 0 ||
      membresias.length > 0;

    if (!hayCambios) {
      navigate("/mis-gimnasios");
      return;
    }

    const confirm = window.confirm(
      "Tienes cambios sin guardar. ¿Seguro que deseas salir?"
    );

    if (confirm) {
      navigate("/mis-gimnasios");
    }
  };

  return (
    <OnboardingLayout>

      <div className="min-h-screen bg-slate-50 py-12 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10">

          {/* ===== HEADER ===== */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-blue-900">
              Registrar gimnasio
            </h1>
            <h3 className="text-slate-500 mt-2">
              Completa la información para activar tu panel en BodyPlan.
            </h3>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* ================= INFO BASICA ================= */}
          <div className="mb-8">
            <h2 className="font-semibold text-lg mb-4 text-blue-900">
              Información básica
            </h2>

            <div className="space-y-4">

              <div>
              <label htmlFor="nombre">Nombre del gimnasio *</label>
              <input
                maxLength={50}
                className={`w-full bg-slate-100 rounded-xl px-4 py-3 outline-none border
                            ${errors.nombre
                              ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 input-error"
                              : "border-slate-300 focus:ring-2 focus:ring-blue-500"}`}
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
              )}
              </div>

              <div>
              <label htmlFor="descripcion">Descripción *</label>
              <div className="textarea-wrapper">
              <textarea
                maxLength={255}
                className={`w-full bg-slate-100 rounded-xl px-4 py-3 outline-none border
                ${errors.descripcion 
                  ? "border-red-500 focus:ring-2 focus:ring-red-500 input-error" 
                  : "border-slate-300 focus:ring-2 focus:ring-blue-500"}`}
                value={form.descripcion}
                onChange={handleChange}
                name="descripcion"
              />
              <span className="char-counter">
                {form.descripcion.length}/255
              </span>
              </div>
              {errors.descripcion && (
                <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
              )}
              </div>

              <div>
              <label htmlFor="telefono">Teléfono *</label>
              <input
                maxLength={10}
                className={`w-full bg-slate-100 rounded-xl px-4 py-3 outline-none border
                ${errors.telefono
                  ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 input-error"
                  : "border-slate-300 focus:ring-2 focus:ring-blue-500"}`}
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
              />
              {errors.telefono && (
                <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
              )}
              </div>

            </div>
          </div>

          {/* ================= UBICACION ================= */}
          <div className="mb-8">
            <h2 className="font-semibold text-lg mb-4 text-blue-900">
              Ubicación
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <div>
              <label htmlFor="direccion">Dirección *</label>
              <input
                maxLength={20}
                className={`w-full bg-slate-100 rounded-xl px-4 py-3 outline-none border
                ${errors.direccion
                  ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 input-error"
                  : "border-slate-300 focus:ring-2 focus:ring-blue-500"}`}
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
              />
              {errors.direccion && (
                <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>
              )}
              </div>

              <div>
              <label htmlFor="municipio">Municipio *</label>
              <input
                maxLength={20}
                className={`w-full bg-slate-100 rounded-xl px-4 py-3 outline-none border
                ${errors.municipio
                  ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 input-error"
                  : "border-slate-300 focus:ring-2 focus:ring-blue-500"}`}
                name="municipio"
                value={form.municipio}
                onChange={handleChange}
              />
              {errors.municipio && (
                <p className="text-red-500 text-sm mt-1">{errors.municipio}</p>
              )}
              </div>

              <div>
              <label htmlFor="estado">Estado *</label>
              <input
                maxLength={20}
                className={`w-full bg-slate-100 rounded-xl px-4 py-3 outline-none border
                ${errors.estado
                  ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 input-error"
                  : "border-slate-300 focus:ring-2 focus:ring-blue-500"}`}
                name="estado"
                value={form.estado}
                onChange={handleChange}
              />
              {errors.estado && (
                <p className="text-red-500 text-sm mt-1">{errors.estado}</p>
              )}
              </div>

              <div>
              <label htmlFor="codigo_postal">Código postal *</label>
              <input
                maxLength={5}
                className={`w-full bg-slate-100 rounded-xl px-4 py-3 outline-none border
                ${errors.codigo_postal
                  ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 input-error"
                  : "border-slate-300 focus:ring-2 focus:ring-blue-500"}`}
                value={form.codigo_postal}
                onChange={handleChange}
                name="codigo_postal"
              />
              {errors.codigo_postal && (
                <p className="text-red-500 text-sm mt-1">{errors.codigo_postal}</p>
              )}
              </div>

              <div>
              <label htmlFor="localidad">Localidad / colonia (opcional)</label>
              <input
                maxLength={20}
                className={`w-full bg-slate-100 rounded-xl px-4 py-3 outline-none border
                ${errors.localidad
                  ? "border-red-500 focus:ring-2 focus:ring-red-500"
                  : "border-slate-300 focus:ring-2 focus:ring-blue-500"}
                `}
                name="localidad"
                value={form.localidad}
                onChange={handleChange}
              />
              </div>

              <div>
              <label htmlFor="url_map">URL de Google Maps *</label>
              <input
                className={`w-full bg-slate-100 rounded-xl px-4 py-3 outline-none border
                ${errors.url_map
                  ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 input-error"
                  : "border-slate-300 focus:ring-2 focus:ring-blue-500"}`}
                name="url_map"
                value={form.url_map}
                onChange={handleChange}
              />
              {errors.url_map && (
                <p className="text-red-500 text-sm mt-1">{errors.url_map}</p>
              )}
              </div>

            </div>
          </div>

          {/* ================= FOTOS ================= */}
          <div id="fotos" className="mb-8">
            <h2 className="font-semibold text-lg mb-3 text-blue-900">
              Fotos del gimnasio
            </h2>

            <input
              type="file"
              name="fotos"
              multiple
              accept="image/*"
              onChange={(e) => {
                  
                const files = Array.from(e.target.files);

                if (files.length === 0) return;

                // máximo 5
                if (files.length > 5) {
                  setError("Máximo 5 imágenes permitidas");
                  e.target.value = "";
                  return;
                }

                const validTypes = ["image/jpeg", "image/png"];
                const maxSize = 5 * 1024 * 1024; // 5MB

                for (let file of files) {

                  if (!validTypes.includes(file.type)) {
                    setError("Solo JPG o PNG");
                    e.target.value = "";
                    return;
                  }

                  if (file.size > maxSize) {
                    setError("Cada imagen debe pesar menos de 5MB");
                    e.target.value = "";
                    return;
                  }
                }

                setError("");
                setFotos(files);
              }}
              className={`block w-full text-sm text-slate-600
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:bg-blue-800 file:text-white
                hover:file:bg-blue-900
                ${errors.fotos ? "input-error" : ""}`}
            />
            {errors.fotos && (
              <p className="text-red-500 text-sm mt-1">{errors.fotos}</p>
            )}
          </div>

          {/* ================= HORARIOS ================= */}
          <div id="horarios" className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg text-blue-900">
                Horarios
              </h2>

              {errors.horarios && (
                <p className="text-red-500 text-sm mt-1">{errors.horarios}</p>
              )}

              <button
                type="button"
                onClick={() => {
                  setHorarios([...horarios, { dia: "", apertura: "", cierre: "" }]);
                }}
                className="text-blue-800 font-semibold hover:underline"
              >
                + Agregar horario
              </button>
            </div>

            <div className="space-y-3">
              {horarios.map((h, i) => (
                <div key={i} className="grid md:grid-cols-3 gap-3">

                  <div>
                  <label htmlFor="dia">Día *</label>
                  <select
                    className="bg-slate-100 rounded-xl px-3 py-2"
                    value={h.dia}
                    onChange={e => {
                      const copy = [...horarios];
                      copy[i].dia = e.target.value;
                      setHorarios(copy);
                    }}
                  >
                    <option value="">Seleccionar día</option>
                    <option>Lunes</option>
                    <option>Martes</option>
                    <option>Miercoles</option>
                    <option>Jueves</option>
                    <option>Viernes</option>
                    <option>Sabado</option>
                    <option>Domingo</option>
                  </select>
                  </div>

                  <div>
                  <label htmlFor="apertura">Apertura *</label>
                  <input
                    type="time"
                    className="bg-slate-100 rounded-xl px-3 py-2"
                    onChange={e => {
                      const copy = [...horarios];
                      copy[i].apertura = e.target.value;
                      setHorarios(copy);
                    }}
                  />
                  </div>

                  <div>
                  <label htmlFor="cierre">Cierre *</label>
                  <input
                    type="time"
                    className="bg-slate-100 rounded-xl px-3 py-2"
                    onChange={e => {
                      const copy = [...horarios];
                      copy[i].cierre = e.target.value;
                      setHorarios(copy);
                    }}
                  />
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* ================= MEMBRESIAS ================= */}
          <div id="membresias" className="mb-10">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg text-blue-900">
                Membresías
              </h2>

              {errors.membresias && (
                <p className="text-red-500 text-sm mt-1">{errors.membresias}</p>
              )}

              <button
                type="button"
                onClick={() => {
                  setMembresias([...membresias, {
                    nombre: "",
                    precio: "",
                    duracion: "",
                    descripcion: ""
                  }]);
                }}
                className="text-blue-800 font-semibold hover:underline"
              >
                + Agregar membresía
              </button>
            </div>

            <div className="space-y-4">
                {membresias.map((m, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl space-y-3">

                    <div className="grid md:grid-cols-3 gap-3">

                      <div>
                      <label htmlFor="nombre">Nombre *</label>
                      <input
                        type="text"
                        maxLength={15}
                        className="bg-slate-100 rounded-xl px-3 py-2"
                        onChange={e => {
                          const copy = [...membresias];
                          let v=e.target.value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]/g, "").slice(0, 15);
                          copy[i].nombre = v;
                          setMembresias(copy);
                        }}
                      />
                      </div>

                      <div>
                      <label htmlFor="precio">Precio *</label>
                      <input
                        type="number"
                        min="1"
                        className="bg-slate-100 rounded-xl px-3 py-2"
                        onChange={e => {
                          const copy = [...membresias];
                          let v=e.target.value.replace(/[^0-9.]/g, "");
                          copy[i].precio = v;
                          setMembresias(copy);
                        }}
                      />
                      </div>

                      <div>
                      <label htmlFor="duracion">Duración días *</label>
                      <input
                        type="number"
                        min="1"
                        className="bg-slate-100 rounded-xl px-3 py-2"
                        onChange={e => {
                          const copy = [...membresias];
                          let v=e.target.value.replace(/[^0-9.]/g, "");
                          copy[i].duracion = v;
                          setMembresias(copy);
                        }}
                      />
                      </div>

                    </div>

                    <div>
                    <label htmlFor="descripcion">Descripción *</label>
                    <div className="textarea-wrapper">
                    <textarea
                      maxLength={100}
                      className="bg-white rounded-xl px-3 py-2 w-full"
                      onChange={e => {
                        const copy = [...membresias];
                        let v=e.target.value.slice(0, 100);
                        copy[i].descripcion = v;
                        setMembresias(copy);
                      }}
                    />
                    <span className="char-counter">
                      {(membresias[i]?.descripcion || "").length}/100
                    </span>
                    </div>
                    {errors[`descripcion-${i}`] && (
                      <p className="text-red-500 text-sm">{errors[`descripcion-${i}`]}</p>
                    )}
                    </div>

                  </div>
                ))}
              </div>
          </div>

          {/* ================= BOTON ================= */}
          <div className="flex justify-center gap-6">

            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-900 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all"
            >
              Cancelar
            </button>

            <button
              onClick={handleCreateGym}
              disabled={loading}
              className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all"
            >
              {loading ? "Creando gimnasio..." : "Crear gimnasio"}
            </button>
          </div>

        </div>
      </div>

    </OnboardingLayout>
  );
}

export default CreateGym;