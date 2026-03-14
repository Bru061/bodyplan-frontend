import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/axios";
import OnboardingLayout from "../../layout/OnboardingLayout";
import "../../styles/gym-wizard.css";
import StepBasico from "./steps/StepBasico";
import StepUbicacion from "./steps/StepUbicacion";
import StepFotosHorarios from "./steps/StepFotosHorarios";
import StepMembresias from "./steps/StepMembresias";

const STEPS = [
  { label: "Básico"     },
  { label: "Ubicación"  },
  { label: "Fotos"      },
  { label: "Membresías" },
];

function CreateGym() {

  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);

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
    url_map: ""
  });

  const [fotos, setFotos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [membresias, setMembresias] = useState([]);

  // ── Sanitización de campos ──
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "telefono")
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    if (name === "direccion")
      value = value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s#.,]/g, "");
    if (["municipio", "estado", "localidad"].includes(name))
      value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "").slice(0, 20);
    if (name === "codigo_postal")
      value = value.replace(/[^0-9]/g, "").slice(0, 5);
    if (name === "url_map")
      value = value.replace(/\s/g, "");
    if (name === "nombre")
      value = value.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]/g, "").slice(0, 50);
    if (name === "descripcion")
      value = value.slice(0, 255);

    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // ── Validación por paso ──
  const validateStep = (index) => {
    const e = {};

    if (index === 0) {
      if (!form.nombre.trim())       e.nombre = "El nombre es obligatorio";
      if (!form.descripcion.trim())  e.descripcion = "La descripción es obligatoria";
      if (!form.telefono.trim())     e.telefono = "El teléfono es obligatorio";
      else if (form.telefono.length !== 10) e.telefono = "Debe tener 10 dígitos";
    }

    if (index === 1) {
      if (!form.direccion.trim())     e.direccion = "La dirección es obligatoria";
      if (!form.municipio.trim())     e.municipio = "El municipio es obligatorio";
      if (!form.estado.trim())        e.estado = "El estado es obligatorio";
      if (!form.codigo_postal.trim()) e.codigo_postal = "El código postal es obligatorio";
      else if (form.codigo_postal.length !== 5) e.codigo_postal = "Debe tener 5 dígitos";
      if (!form.url_map.trim()) {
        e.url_map = "Agrega el link de Google Maps";
      } else {
        try { new URL(form.url_map); }
        catch { e.url_map = "URL de Google Maps inválida"; }
      }
    }

    if (index === 2) {
      if (fotos.length === 0)
        e.fotos = "Debes subir al menos una foto";

      if (horarios.length === 0) {
        e.horarios = "Debes agregar al menos un horario";
      } else {
        const dias = horarios.map(h => h.dia);
        if (dias.filter((d, i) => dias.indexOf(d) !== i).length)
          e.horarios = "No puede haber días repetidos";
        else {
          for (const h of horarios) {
            if (!h.dia || !h.apertura || !h.cierre) {
              e.horarios = "Completa todos los horarios"; break;
            }
            const [h1, m1] = h.apertura.split(":").map(Number);
            const [h2, m2] = h.cierre.split(":").map(Number);
            if ((h2 * 60 + m2) <= (h1 * 60 + m1)) {
              e.horarios = "La hora de cierre debe ser mayor a la apertura"; break;
            }
          }
        }
      }
    }

    if (index === 3) {
      if (membresias.length === 0) {
        e.membresias = "Debes agregar al menos una membresía";
      } else {
        for (const m of membresias) {
          if (!m.nombre.trim())                { e.membresias = "Todas las membresías deben tener nombre"; break; }
          if (!m.precio || Number(m.precio) <= 0) { e.membresias = "El precio debe ser mayor a 0"; break; }
          if (!m.duracion || Number(m.duracion) <= 0) { e.membresias = "La duración debe ser mayor a 0"; break; }
          if (Number(m.duracion) > 3650)       { e.membresias = "Duración demasiado grande"; break; }
          if (!m.descripcion?.trim())           { e.membresias = "La descripción de cada membresía es obligatoria"; break; }
          if (m.descripcion.length > 200)       { e.membresias = "Máximo 200 caracteres en descripción"; break; }
        }
      }
    }

    return e;
  };

  const handleNext = () => {
    const newErrors = validateStep(step);
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setError("");
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    setError("");
    setStep(prev => prev - 1);
  };

  const handleCancel = () => {
    const hayCambios =
      form.nombre || form.descripcion || form.telefono ||
      fotos.length > 0 || horarios.length > 0 || membresias.length > 0;
    if (!hayCambios) { navigate("/mis-gimnasios"); return; }
    setShowCancelModal(true);
  };

  const handleSubmit = async () => {
    const newErrors = validateStep(3);
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("nombre",      form.nombre);
      formData.append("descripcion", form.descripcion);
      formData.append("telefono",    form.telefono);
      formData.append("ubicacion", JSON.stringify({
        direccion:     form.direccion,
        municipio:     form.municipio,
        estado:        form.estado,
        pais:          form.pais,
        codigo_postal: form.codigo_postal,
        localidad:     form.localidad || "",
        latitud:       null,
        longitud:      null,
        url_map:       form.url_map
      }));
      formData.append("horarios",   JSON.stringify(horarios));
      formData.append("membresias", JSON.stringify(membresias));
      fotos.forEach(f => formData.append("fotos", f));

      await api.post("/gym", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/mis-gimnasios");

    } catch (err) {
      console.error(err);
      const backendError = err?.response?.data?.error;
      if (backendError?.toLowerCase().includes("url")) {
        setErrors({ url_map: backendError });
        setStep(1);
      } else {
        setError(backendError || "Error al crear el gimnasio");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <div className="gym-wizard">
        <div className="gym-wizard-card">

          {/* ── Título ── */}
          <div className="gym-wizard-title">
            <h1>Registrar gimnasio</h1>
            <p>Completa la información para activar tu panel en BodyPlan.</p>
          </div>

          {/* ── Stepper ── */}
          <div className="stepper">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`stepper-step ${
                  i === step ? "active" : i < step ? "completed" : ""
                }`}
              >
                <div className="stepper-circle">
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="stepper-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── Error global ── */}
          {error && (
            <div className="modal-error" style={{ marginBottom: "1rem" }}>
              {error}
              <button
                onClick={() => setError("")}
                style={{ marginLeft: 12, background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
              >✕</button>
            </div>
          )}

          {/* ── Paso activo ── */}
          {step === 0 && (
            <StepBasico form={form} errors={errors} onChange={handleChange} />
          )}
          {step === 1 && (
            <StepUbicacion form={form} errors={errors} onChange={handleChange} />
          )}
          {step === 2 && (
            <StepFotosHorarios
              fotos={fotos} setFotos={setFotos}
              horarios={horarios} setHorarios={setHorarios}
              errors={errors} setErrors={setErrors}
              setError={setError}
            />
          )}
          {step === 3 && (
            <StepMembresias
              membresias={membresias} setMembresias={setMembresias}
              errors={errors} setErrors={setErrors}
            />
          )}

          {/* ── Acciones ── */}
          <div className="wizard-actions">
            <button type="button" className="btn btn-ghost" onClick={handleCancel}>
              Cancelar
            </button>
            <div className="wizard-actions-right">
              {step > 0 && (
                <button type="button" className="btn btn-ghost" onClick={handleBack} disabled={loading}>
                  ← Atrás
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Siguiente →
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Creando gimnasio..." : "Crear gimnasio"}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Modal cancelar ── */}
      {showCancelModal && (
        <div className="cancel-confirm-overlay">
          <div className="cancel-confirm-box">
            <h3>¿Deseas salir?</h3>
            <p>Tienes cambios sin guardar. Si sales ahora perderás la información ingresada.</p>
            <div className="cancel-confirm-actions">
              <button className="btn btn-ghost" onClick={() => setShowCancelModal(false)}>
                Seguir editando
              </button>
              <button className="btn btn-danger" onClick={() => navigate("/mis-gimnasios")}>
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}

    </OnboardingLayout>
  );
}

export default CreateGym;