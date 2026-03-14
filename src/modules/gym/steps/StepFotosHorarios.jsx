import { useRef } from "react";
import { FiUpload } from "react-icons/fi";

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

function StepFotosHorarios({ fotos, setFotos, horarios, setHorarios, errors, setErrors, setError }) {

  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (fotos.length + files.length > 5) {
      setError("Máximo 5 imágenes permitidas");
      e.target.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/png"];
    const maxSize = 5 * 1024 * 1024;

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setError("Solo se permiten imágenes JPG o PNG");
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
    if (errors.fotos) setErrors(prev => ({ ...prev, fotos: "" }));
    setFotos(prev => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  };

  const handleAddHorario = () => {
    if (horarios.length >= 7) return;
    setHorarios(prev => [...prev, { dia: "", apertura: "", cierre: "" }]);
  };

  const handleHorarioChange = (index, field, value) => {
    setHorarios(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
    if (errors.horarios) setErrors(prev => ({ ...prev, horarios: "" }));
  };

  const handleRemoveHorario = (index) => {
    setHorarios(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="step-form">

      {/* ── Fotos ── */}
      <h2 className="step-section-title">Fotos del gimnasio</h2>

      <div className="fotos-upload-area">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="fotos-upload-btn"
          onClick={() => fileRef.current.click()}
        >
          <FiUpload size={15} />
          Seleccionar imágenes
        </button>
        <p className="fotos-upload-hint">JPG o PNG · máx. 5 imágenes · 5MB por imagen</p>
      </div>

      {fotos.length > 0 && (
        <ul className="fotos-list">
          {fotos.map((file, i) => (
            <li key={i}>
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() => setFotos(prev => prev.filter((_, idx) => idx !== i))}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      {errors.fotos && <span className="field-error-msg">{errors.fotos}</span>}

      {/* ── Horarios ── */}
      <h2 className="step-section-title" style={{ marginTop: "1.5rem" }}>Horarios</h2>

      {errors.horarios && <span className="field-error-msg">{errors.horarios}</span>}

      <div className="horarios-list">
        {horarios.map((h, i) => (
          <div key={i} className="horario-row">

            <div className="field-group">
              {i === 0 && <label>Día *</label>}
              <select
                value={h.dia}
                onChange={e => handleHorarioChange(i, "dia", e.target.value)}
              >
                <option value="">Seleccionar día</option>
                {DIAS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="field-group">
              {i === 0 && <label>Apertura *</label>}
              <input
                type="time"
                value={h.apertura}
                onChange={e => handleHorarioChange(i, "apertura", e.target.value)}
              />
            </div>

            <div className="field-group">
              {i === 0 && <label>Cierre *</label>}
              <input
                type="time"
                value={h.cierre}
                onChange={e => handleHorarioChange(i, "cierre", e.target.value)}
              />
            </div>

            <button
              type="button"
              className="horario-remove"
              onClick={() => handleRemoveHorario(i)}
              title="Eliminar horario"
            >
              ✕
            </button>

          </div>
        ))}
      </div>

      {horarios.length < 7 && (
        <button type="button" className="btn-link-add" onClick={handleAddHorario}>
          + Agregar horario
        </button>
      )}

    </div>
  );
}

export default StepFotosHorarios;