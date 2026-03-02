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

  const soloLetras = (texto) => {
    return /^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$/.test(texto);
  };

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


    setError("");

    if (!form.nombre || !form.descripcion) {
      setError("Nombre y descripción obligatorios");
      return;
    }

    if (fotos.length === 0) {
      setError("Debes subir al menos una foto");
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

    if (horarios.length === 0) {
      setError("Agrega al menos un horario");
      return;
    }

    if (membresias.length === 0) {
      setError("Agrega al menos una membresía");
      return;
    }

    for (let h of horarios) {
      if (!h.dia || !h.apertura || !h.cierre) {
        setError("Todos los horarios deben estar completos");
        return;
      }
    }

        // ===== MEMBRESÍAS =====
    for (const m of membresias) {

      if (!m.nombre || !m.precio || !m.duracion) {
        setError("Completa todas las membresías");
        return;
      }

      if (!soloLetras(m.nombre)) {
        setError("Nombre de membresía inválido");
        return;
      }

      if (Number(m.precio) < 1) {
        setError("El precio debe ser mayor a 1");
        return;
      }

      if (Number(m.duracion) < 1) {
        setError("La duración debe ser mayor a 1 día");
        return;
      }
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
};

const handleMembresiaChange = (i, field, value) => {

  // nombre membresía → solo letras y números
  if(field === "nombre"){
    value = value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]/g, "");
  }

  // precio → solo números y > 0
  if(field === "precio"){
    value = value.replace(/[^0-9]/g, "");
  }

  // duración → solo números
  if(field === "duracion"){
    value = value.replace(/[^0-9]/g, "");
  }

  const copy = [...membresias];
  copy[i][field] = value;
  setMembresias(copy);
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

              <input
                className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre del gimnasio"
              />

              <textarea
                className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción"
                value={form.descripcion}
                onChange={handleChange}
                name="descripcion"
              />

              <input
                className={`w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.telefono ? "border-red-500" : ""}`}
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Teléfono"
              />

            </div>
          </div>

          {/* ================= UBICACION ================= */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 text-blue-900">
              Ubicación
            </h3>

            <div className="grid md:grid-cols-2 gap-4">

              <input
                className="bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Dirección"
              />

              <input
                className={`bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.municipio ? "border-red-500" : ""}`}
                name="municipio"
                value={form.municipio}
                onChange={handleChange}
                placeholder="Municipio"
              />

              <input
                className={`bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.estado ? "border-red-500" : ""}`}
                name="estado"
                value={form.estado}
                onChange={handleChange}
                placeholder="Estado"
              />


              <input
                className={`bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.codigo_postal ? "border-red-500" : ""}`}
                placeholder="Código postal"
                value={form.codigo_postal}
                onChange={handleChange}
                name="codigo_postal"
              />


              <input
                className={`bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.localidad ? "border-red-500" : ""}`}
                name="localidad"
                value={form.localidad}
                onChange={handleChange}
                placeholder="Localidad / colonia"
              />

              <input
                className={`bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${errors.url_map ? "border-red-500" : ""}`}
                name="url_map"
                value={form.url_map}
                onChange={handleChange}
                placeholder="URL de Google Maps"
              />

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

                  <input
                    type="time"
                    className="bg-slate-100 rounded-xl px-3 py-2"
                    onChange={e => {
                      const copy = [...horarios];
                      copy[i].apertura = e.target.value;
                      setHorarios(copy);
                    }}
                  />

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

                      <input
                        placeholder="Nombre"
                        className="bg-slate-100 rounded-xl px-3 py-2"
                        onChange={e => {
                          const copy = [...membresias];
                          copy[i].nombre = e.target.value;
                          setMembresias(copy);
                        }}
                      />

                      <input
                        placeholder="Precio"
                        type="number"
                        className="bg-slate-100 rounded-xl px-3 py-2"
                        onChange={e => {
                          const copy = [...membresias];
                          copy[i].precio = Number(e.target.value);
                          setMembresias(copy);
                        }}
                      />

                      <input
                        placeholder="Duración días"
                        type="number"
                        className="bg-slate-100 rounded-xl px-3 py-2"
                        onChange={e => {
                          const copy = [...membresias];
                          copy[i].duracion = Number(e.target.value);
                          setMembresias(copy);
                        }}
                      />

                    </div>

                    {/* DESCRIPCIÓN OPCIONAL */}
                    <textarea
                      placeholder="Descripción (opcional)"
                      className="bg-white rounded-xl px-3 py-2 w-full"
                      onChange={e => {
                        const copy = [...membresias];
                        copy[i].descripcion = e.target.value;
                        setMembresias(copy);
                      }}
                    />

                  </div>
                ))}
              </div>
          </div>

          {/* ================= BOTON ================= */}
          <div className="flex justify-center">
            <button
              onClick={handleCreateGym}
              disabled={loading}
              className="bg-blue-800 hover:bg-blue-900 text-white px-10 py-4 rounded-xl font-semibold shadow-md transition-all"
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