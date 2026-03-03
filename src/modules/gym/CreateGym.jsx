import { useState } from "react";
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

  const urlValida = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // ===== CREAR GIMNASIO =====
  const handleCreateGym = async () => {

    let newErrors = {};
    setError("");

      // ===== INFO BÁSICA =====
  if (!form.nombre.trim()) newErrors.nombre = true;
  if (!form.descripcion.trim()) newErrors.descripcion = true;
  if (!form.telefono.trim()) newErrors.telefono = true;
  if (!form.telefono || form.telefono.length !== 10) {
    newErrors.telefono = true;
  }

  // ===== UBICACIÓN =====
  if (!form.direccion.trim()) newErrors.direccion = true;
  if (!form.municipio.trim()) newErrors.municipio = true;
  if (!form.estado.trim()) newErrors.estado = true;
  if (!form.codigo_postal.trim()) newErrors.codigo_postal = true;
  if (!form.codigo_postal || form.codigo_postal.length !== 5) {
    newErrors.codigo_postal = true;
  }
  if (!form.url_map.trim()) newErrors.url_map = true;

  // ===== FOTOS =====
  if (fotos.length === 0) {
    setError("Debes subir al menos una foto");
    scrollToFirstError();
    return;
  }

  // ===== HORARIOS =====
  if (horarios.length === 0) {
    setError("Agrega al menos un horario");
    scrollToFirstError();
    return;
  }

  for (let h of horarios) {
    if (!h.dia || !h.apertura || !h.cierre) {
      setError("Todos los horarios deben estar completos");
      scrollToFirstError();
      return;
    }

    if (!horaEsValida(h.apertura, h.cierre)) {
      setError("La hora de cierre debe ser mayor que la de apertura");
      scrollToFirstError();
      return;
    }
  }

  // ===== MEMBRESÍAS =====
  if (membresias.length === 0) {
    setError("Agrega al menos una membresía");
    scrollToFirstError();
    return;
  }

  for (const m of membresias) {
    if (!m.nombre || !m.precio || !m.duracion) {
      setError("Completa todas las membresías");
      scrollToFirstError();
      return;
    }

    if (Number(m.precio) < 1) {
      setError("El precio debe ser mayor a 0");
      scrollToFirstError();
      return;
    }

    if (Number(m.duracion) < 1) {
      setError("La duración debe ser mayor a 0");
      scrollToFirstError();
      return;
    }
  }

  // ===== SI HAY ERRORES DE CAMPOS =====
  if (Object.keys(newErrors).length > 0) {

    if (newErrors.telefono) {
      setError("El teléfono debe tener exactamente 10 dígitos");
    } 
    else if (newErrors.codigo_postal) {
      setError("El código postal debe tener exactamente 5 dígitos");
    }
    else {
      setError("Por favor completa los campos obligatorios correctamente");
    }

    setErrors(newErrors);
    setTimeout(scrollToFirstError, 100);
    return;
  }

  setErrors({});

    if (!form.nombre || !form.descripcion) {
      setError("Nombre y descripción obligatorios");
      return;
    }

    if (!urlValida(form.url_map)) {
      setError("URL de Google Maps inválida");
      return;
    }

    if (!form.direccion || !form.municipio || !form.estado || !form.codigo_postal) {
      setError("Debes agregar la dirección, municipio, estado y código postal");
      return;
    }

    if (!form.url_map) {
      setError("Debes agregar el enlace de Google Maps");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // campos normales
      formData.append("nombre", form.nombre);
      formData.append("descripcion", form.descripcion);
      formData.append("telefono", form.telefono);

      // ubicación JSON
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

      // fotos
      fotos.forEach((f) => formData.append("fotos", f));

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      await api.post("/gym", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/mis-gimnasios");

    } catch (err) {
      console.log("ERROR COMPLETO:");
      console.log(err);
      console.log(err.response);
      console.log(err.response?.data);
      console.log(err.response?.status);
      setError(err?.response?.data?.error || "Error al crear gimnasio");
    } finally {
      setLoading(false);
    }
  };

  // ===== VALIDACIONES =====
const handleChange = (e) => {
  let { name, value } = e.target;

  // ===== TELEFONO → solo números =====
  if (name === "telefono") {
    value = value.replace(/[^0-9]/g, "");
  }

  // ===== DIRECCIÓN → letras, números y espacios (sin símbolos raros) =====
  if (name === "direccion") {
    value = value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s#.,]/g, "");
  }

  // ===== MUNICIPIO / ESTADO / LOCALIDAD → solo letras y espacios =====
  if (name === "municipio" || name === "estado" || name === "localidad") {
    value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
  }

  // ===== CÓDIGO POSTAL → solo números =====
  if (name === "codigo_postal") {
    value = value.replace(/[^0-9]/g, "");
  }

  // ===== URL MAPA → formato url básico =====
  if (name === "url_map") {
    value = value.replace(/\s/g, "");
  }

  // ===== NOMBRE GIMNASIO → solo letras y números =====
  if (name === "nombre") {
    value = value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]/g, "");
  }

  setForm(prev => ({
    ...prev,
    [name]: value
  }));

  if (errors[name]) {
    setErrors(prev => ({
      ...prev,
      [name]: false
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

const scrollToFirstError = () => {
  const firstErrorField = document.querySelector(".input-error");
  if (firstErrorField) {
    firstErrorField.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const horaEsValida = (apertura, cierre) => {
  if (!apertura || !cierre) return false;

  const [h1, m1] = apertura.split(":").map(Number);
  const [h2, m2] = cierre.split(":").map(Number);

  const minutosApertura = h1 * 60 + m1;
  const minutosCierre = h2 * 60 + m2;

  return minutosCierre > minutosApertura;
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
            <h3 className="font-semibold text-lg mb-4 text-blue-900">
              Información básica
            </h3>

            <div className="space-y-4">

              <div>
              <label htmlFor="nombre">Nombre del gimnasio *</label>
              <input
                className={`w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500
                            ${errors.nombre ? "border-2 border-red-500 input-error" : ""}`}
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
              />
              </div>

              <div>
              <label htmlFor="descripcion">Descripción *</label>
              <textarea
                className={`w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500
                            ${errors.descripcion ? "border-2 border-red-500 input-error" : ""}`}
                value={form.descripcion}
                onChange={handleChange}
                name="descripcion"
              />
              </div>

              <div>
              <label htmlFor="telefono">Teléfono *</label>
              <input
                className={`w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500
                            ${errors.telefono ? "border-2 border-red-500 input-error" : ""}`}
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
              />
              </div>

            </div>
          </div>

          {/* ================= UBICACION ================= */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 text-blue-900">
              Ubicación
            </h3>

            <div className="grid md:grid-cols-2 gap-4">

              <div>
              <label htmlFor="direccion">Dirección *</label>
              <input
                className={`bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500
                            ${errors.direccion ? "border-2 border-red-500 input-error" : ""}`}
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
              />
              </div>

              <div>
              <label htmlFor="municipio">Municipio *</label>
              <input
                className={`bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500
                            ${errors.municipio ? "border-2 border-red-500 input-error" : ""}`}
                name="municipio"
                value={form.municipio}
                onChange={handleChange}
              />
              </div>

              <div>
              <label htmlFor="estado">Estado *</label>
              <input
                className={`bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500
                            ${errors.estado ? "border-2 border-red-500 input-error" : ""}`}
                name="estado"
                value={form.estado}
                onChange={handleChange}
              />
              </div>

              <div>
              <label htmlFor="codigo_postal">Código postal *</label>
              <input
                className={`bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500
                            ${errors.codigo_postal ? "border-2 border-red-500 input-error" : ""}`}
                value={form.codigo_postal}
                onChange={handleChange}
                name="codigo_postal"
              />
              </div>

              <div>
              <label htmlFor="localidad">Localidad / colonia (opcional)</label>
              <input
                className={`bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.localidad ? "border-red-500" : ""}`}
                name="localidad"
                value={form.localidad}
                onChange={handleChange}
              />
              </div>

              <div>
              <label htmlFor="url_map">URL de Google Maps *</label>
              <input
                className={`bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500
                            ${errors.url_map ? "border-2 border-red-500 input-error" : ""}`}
                name="url_map"
                value={form.url_map}
                onChange={handleChange}
              />
              </div>

            </div>
          </div>

          {/* ================= FOTOS ================= */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-3 text-blue-900">
              Fotos del gimnasio
            </h3>

            <input
              type="file"
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
              className="block w-full text-sm text-slate-600
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:bg-blue-800 file:text-white
              hover:file:bg-blue-900"
            />
          </div>

          {/* ================= HORARIOS ================= */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg text-blue-900">
                Horarios
              </h3>

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
          <div className="mb-10">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg text-blue-900">
                Membresías
              </h3>

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
                        className="bg-slate-100 rounded-xl px-3 py-2"
                        onChange={e => {
                          const copy = [...membresias];
                          copy[i].nombre = e.target.value;
                          setMembresias(copy);
                        }}
                      />
                      </div>

                      <div>
                      <label htmlFor="precio">Precio *</label>
                      <input
                        type="number"
                        className="bg-slate-100 rounded-xl px-3 py-2"
                        onChange={e => {
                          const copy = [...membresias];
                          copy[i].precio = Number(e.target.value);
                          setMembresias(copy);
                        }}
                      />
                      </div>

                      <div>
                      <label htmlFor="duracion">Duración días *</label>
                      <input
                        type="number"
                        className="bg-slate-100 rounded-xl px-3 py-2"
                        onChange={e => {
                          const copy = [...membresias];
                          copy[i].duracion = Number(e.target.value);
                          setMembresias(copy);
                        }}
                      />
                      </div>

                    </div>

                    {/* DESCRIPCIÓN OPCIONAL */}
                    <div>
                    <label htmlFor="descripcion">Descripción (opcional)</label>
                    <textarea
                      className="bg-white rounded-xl px-3 py-2 w-full"
                      onChange={e => {
                        const copy = [...membresias];
                        copy[i].descripcion = e.target.value;
                        setMembresias(copy);
                      }}
                    />
                    </div>

                  </div>
                ))}
              </div>
          </div>

          {/* ================= BOTON ================= */}
          <div className="flex justify-center gap-6">

            <button
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