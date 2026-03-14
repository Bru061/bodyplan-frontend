function StepUbicacion({ form, errors, onChange }) {
  return (
    <div className="step-form">

      <h2 className="step-section-title">Ubicación</h2>

      <div className="step-form-grid">

        <div className="field-group">
          <label htmlFor="direccion">Dirección *</label>
          <input
            id="direccion"
            name="direccion"
            maxLength={50}
            value={form.direccion}
            onChange={onChange}
            className={errors.direccion ? "field-error" : ""}
            placeholder="Calle, número"
          />
          {errors.direccion && <span className="field-error-msg">{errors.direccion}</span>}
        </div>

        <div className="field-group">
          <label htmlFor="municipio">Municipio *</label>
          <input
            id="municipio"
            name="municipio"
            maxLength={20}
            value={form.municipio}
            onChange={onChange}
            className={errors.municipio ? "field-error" : ""}
            placeholder="Ej. Tehuacán"
          />
          {errors.municipio && <span className="field-error-msg">{errors.municipio}</span>}
        </div>

        <div className="field-group">
          <label htmlFor="estado">Estado *</label>
          <input
            id="estado"
            name="estado"
            maxLength={20}
            value={form.estado}
            onChange={onChange}
            className={errors.estado ? "field-error" : ""}
            placeholder="Ej. Puebla"
          />
          {errors.estado && <span className="field-error-msg">{errors.estado}</span>}
        </div>

        <div className="field-group">
          <label htmlFor="codigo_postal">Código postal *</label>
          <input
            id="codigo_postal"
            name="codigo_postal"
            maxLength={5}
            value={form.codigo_postal}
            onChange={onChange}
            className={errors.codigo_postal ? "field-error" : ""}
            placeholder="5 dígitos"
          />
          {errors.codigo_postal && <span className="field-error-msg">{errors.codigo_postal}</span>}
        </div>

        <div className="field-group">
          <label htmlFor="localidad">Colonia / localidad <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>(opcional)</span></label>
          <input
            id="localidad"
            name="localidad"
            maxLength={20}
            value={form.localidad}
            onChange={onChange}
            placeholder="Ej. Centro"
          />
        </div>

        <div className="field-group">
          <label htmlFor="pais">País</label>
          <input
            id="pais"
            name="pais"
            value={form.pais}
            readOnly
            style={{ background: "#f1f5f9", color: "var(--text-secondary)", cursor: "default" }}
          />
        </div>

      </div>

      <div className="field-group">
        <label htmlFor="url_map">URL de Google Maps *</label>
        <input
          id="url_map"
          name="url_map"
          value={form.url_map}
          onChange={onChange}
          className={errors.url_map ? "field-error" : ""}
          placeholder="https://maps.google.com/..."
        />
        {errors.url_map
          ? <span className="field-error-msg">{errors.url_map}</span>
          : <span className="field-hint">Pega el enlace de compartir de Google Maps</span>
        }
      </div>

    </div>
  );
}

export default StepUbicacion;