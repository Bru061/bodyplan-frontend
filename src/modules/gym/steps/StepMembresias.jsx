function StepMembresias({ membresias, setMembresias, errors, setErrors }) {

  const handleAdd = () => {
    if (membresias.length >= 10) return;
    setMembresias(prev => [...prev, { nombre: "", precio: "", duracion: "", descripcion: "" }]);
  };

  const handleRemove = (index) => {
    setMembresias(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    setMembresias(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
    if (errors.membresias) setErrors(prev => ({ ...prev, membresias: "" }));
  };

  return (
    <div className="step-form">

      <h2 className="step-section-title">Membresías</h2>

      {errors.membresias && (
        <span className="field-error-msg">{errors.membresias}</span>
      )}

      {membresias.length === 0 && (
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Agrega al menos una membresía para continuar.
        </p>
      )}

      {membresias.map((m, i) => (
        <div key={i} className="membresia-card">

          <div className="membresia-card-header">
            <span>Membresía {i + 1}</span>
            <button
              type="button"
              className="membresia-remove"
              onClick={() => handleRemove(i)}
            >
              Eliminar
            </button>
          </div>

          <div className="step-form-grid">

            <div className="field-group">
              <label>Nombre *</label>
              <input
                type="text"
                maxLength={15}
                value={m.nombre}
                placeholder="Ej. Básica"
                onChange={e => {
                  const v = e.target.value
                    .replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]/g, "")
                    .slice(0, 15);
                  handleChange(i, "nombre", v);
                }}
              />
            </div>

            <div className="field-group">
              <label>Precio *</label>
              <input
                type="number"
                min="1"
                value={m.precio}
                placeholder="Ej. 350"
                onChange={e => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  handleChange(i, "precio", v);
                }}
              />
            </div>

            <div className="field-group" style={{ gridColumn: "1 / -1" }}>
              <label>Duración (días) *</label>
              <input
                type="number"
                min="1"
                max="3650"
                value={m.duracion}
                placeholder="Ej. 30"
                onChange={e => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  handleChange(i, "duracion", v);
                }}
              />
            </div>

          </div>

          <div className="field-group" style={{ marginTop: "0.75rem" }}>
            <label>Descripción *</label>
            <div className="textarea-wrapper">
              <textarea
                maxLength={200}
                value={m.descripcion}
                placeholder="Describe qué incluye esta membresía..."
                onChange={e => handleChange(i, "descripcion", e.target.value.slice(0, 200))}
              />
              <span className="char-counter">{(m.descripcion || "").length}/200</span>
            </div>
          </div>

        </div>
      ))}

      {membresias.length < 10 && (
        <button type="button" className="btn-link-add" onClick={handleAdd}>
          + Agregar membresía
        </button>
      )}

    </div>
  );
}

export default StepMembresias;