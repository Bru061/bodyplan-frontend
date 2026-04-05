/**
 * Paso 1 del formulario de registro de gimnasio.
 * Renderiza los campos de información básica: nombre, descripción y teléfono.
 * Muestra errores de validación y un contador de caracteres en la descripción.
 * Es un componente puramente controlado; toda la lógica de estado y validación
 * reside en el componente padre.
 */
function StepBasico({ form, errors, onChange }) {
  return (
    <div className="step-form">

      <h2 className="step-section-title">Información básica</h2>

      <div className="field-group">
        <label htmlFor="nombre">Nombre del gimnasio *</label>
        <input
          id="nombre"
          name="nombre"
          maxLength={50}
          value={form.nombre}
          onChange={onChange}
          className={errors.nombre ? "field-error" : ""}
          placeholder="Ej. FitZone Tehuacán"
        />
        {errors.nombre && <span className="field-error-msg">{errors.nombre}</span>}
      </div>

      <div className="field-group">
        <label htmlFor="descripcion">Descripción *</label>
        <div className="textarea-wrapper">
          <textarea
            id="descripcion"
            name="descripcion"
            maxLength={255}
            value={form.descripcion}
            onChange={onChange}
            className={errors.descripcion ? "field-error" : ""}
            placeholder="Describe tu gimnasio brevemente..."
          />
          <span className="char-counter">{form.descripcion.length}/255</span>
        </div>
        {errors.descripcion && <span className="field-error-msg">{errors.descripcion}</span>}
      </div>

      <div className="field-group">
        <label htmlFor="telefono">Teléfono *</label>
        <input
          id="telefono"
          name="telefono"
          maxLength={10}
          value={form.telefono}
          onChange={onChange}
          className={errors.telefono ? "field-error" : ""}
          placeholder="10 dígitos"
        />
        {errors.telefono
          ? <span className="field-error-msg">{errors.telefono}</span>
          : <span className="field-hint">Sin espacios ni guiones</span>
        }
      </div>

    </div>
  );
}

export default StepBasico;