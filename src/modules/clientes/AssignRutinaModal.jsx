import { useEffect, useState } from "react";
import api from "../../services/axios";
import ModalPortal from "../../components/ui/ModalPortal";
import "../../styles/rutinas.css";

const FORM_INICIAL = {
  nombre: "",
  descripcion: "",
  objetivo: "",
  categoria: "",
  nivel: "principiante",
  tipo_rutina: "gimnasio",
  equipamiento: "",
  calorias_estimadas: "",
  duracion_min: "",
  instrucciones: ""
};

/**
 * Modal con dos pestañas para asignar una rutina a un cliente:
 *   - Existente: selecciona una rutina general ya creada y la asigna.
 *   - Personalizada: crea una rutina nueva y la asigna en un solo flujo.
 * Ambas pestañas permiten asignar opcionalmente un instructor encargado
 * (solo visible si la rutina es de tipo "gimnasio" y hay personal disponible).
 * La fecha límite está restringida a un máximo de 3 meses desde hoy.
 */
function AssignRutinaModal({ cliente, onClose, onAssigned }) {

  const [tab, setTab] = useState("existente");

  const [rutinas, setRutinas] = useState([]);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [personalExistente, setPersonalExistente] = useState([]);
  const [idPersonalExistente, setIdPersonalExistente] = useState("");
  const rutinaObj = rutinas.find(r => r.id_rutina == rutinaSeleccionada);
  const [form, setForm] = useState(FORM_INICIAL);
  const [fechaLimitePersonal, setFechaLimitePersonal] = useState("");
  const [personalPersonalizada, setPersonalPersonalizada] = useState([]);
  const [idPersonalPersonalizada, setIdPersonalPersonalizada] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hoy = new Date().toISOString().split("T")[0];
  const maxFecha = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split("T")[0];
  })();

  /**
 * Al montar, carga en paralelo:
 *   - fetchRutinas: obtiene las rutinas generales disponibles desde "/rutinas/generales".
 *   - fetchPersonal: obtiene el personal de todos los gimnasios activos del cliente,
 *     deduplica por id_personal y lo comparte entre ambas pestañas.
 */
  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        const res = await api.get("/rutinas/generales");
        setRutinas(res.data.rutinas || []);
      } catch (err) {
        console.error("Error cargando rutinas:", err);
      }
    };

    const fetchPersonal = async () => {
      const gymIds = [
        cliente?.id_gimnasio,
        ...(cliente?.gimnasiosActivosIds || []),
      ].filter(Boolean);

      const unicos = [...new Set(gymIds.map(Number))];
      if (unicos.length === 0) return;

      try {
        const responses = await Promise.all(unicos.map((idGym) => api.get(`/personal/gimnasio/${idGym}`)));
        const merged = [];
        const seen = new Set();

        responses.forEach((r) => {
          (r.data.personal || []).forEach((p) => {
            if (!seen.has(p.id_personal)) {
              seen.add(p.id_personal);
              merged.push(p);
            }
          });
        });

        setPersonalExistente(merged);
        setPersonalPersonalizada(merged);
      } catch (err) {
        console.error("Error cargando personal:", err);
      }
    };

    fetchRutinas();
    fetchPersonal();
  }, [cliente?.id_gimnasio, cliente?.gimnasiosActivosIds]);

  /**
 * Cambia la pestaña activa y limpia errores generales y de formulario.
 */
  const handleTabChange = (t) => {
    setTab(t);
    setError("");
    setFormErrors({});
  };

  /**
 * Actualiza el campo del formulario de rutina personalizada aplicando
 * restricciones de caracteres y longitud según el campo:
 *   - duracion_min / calorias_estimadas: solo dígitos con límite de caracteres.
 *   - objetivo: solo letras, números y espacios.
 *   - nombre, descripcion, instrucciones: límite de caracteres.
 * Limpia el error del campo si existía alguno previo.
 */
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "duracion_min") value = value.replace(/[^0-9]/g, "").slice(0, 3);
    if (name === "calorias_estimadas") value = value.replace(/[^0-9]/g, "").slice(0, 4);
    if (name === "objetivo") value = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");
    if (name === "nombre") value = value.slice(0, 20);
    if (name === "descripcion") value = value.slice(0, 100);
    if (name === "instrucciones") value = value.slice(0, 255);

    setForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  /**
 * Valida todos los campos del formulario de rutina personalizada.
 * Verifica obligatoriedad, límites numéricos (duración máx. 180 min,
 * calorías máx. 5000) y que la fecha no supere los 3 meses permitidos.
 * Actualiza formErrors y retorna si el formulario es válido.
 */
  const validatePersonalizada = () => {
    const e = {};

    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    else if (form.nombre.length > 20) e.nombre = "Máximo 20 caracteres";

    if (!form.descripcion.trim()) e.descripcion = "La descripción es obligatoria";
    if (!form.objetivo.trim()) e.objetivo = "El objetivo es obligatorio";
    if (!form.equipamiento.trim()) e.equipamiento = "El equipamiento es obligatorio";
    if (!form.categoria) e.categoria = "La categoría es obligatoria";
    if (!form.nivel) e.nivel = "El nivel es obligatorio";
    if (!form.tipo_rutina) e.tipo_rutina = "El tipo es obligatorio";

    if (!form.duracion_min) e.duracion_min = "La duración es obligatoria";
    else if (Number(form.duracion_min) <= 0)  e.duracion_min = "Debe ser mayor a 0";
    else if (Number(form.duracion_min) > 180) e.duracion_min = "Máximo 180 minutos";

    if (!form.calorias_estimadas) e.calorias_estimadas = "Las calorías son obligatorias";
    else if (Number(form.calorias_estimadas) <= 0)   e.calorias_estimadas = "Debe ser mayor a 0";
    else if (Number(form.calorias_estimadas) > 5000) e.calorias_estimadas = "Máximo 5000";

    if (!form.instrucciones.trim()) e.instrucciones = "Las instrucciones son obligatorias";

    if (!fechaLimitePersonal) e.fechaLimite = "La fecha límite es obligatoria";
    else if (fechaLimitePersonal > maxFecha) e.fechaLimite = "Máximo 3 meses desde hoy";

    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  /**
 * Valida que se haya seleccionado rutina, fecha límite y que el cliente
 * tenga gimnasio asociado. Envía POST a "/rutinas/asignar" con los datos
 * de la rutina existente seleccionada. Al éxito llama a onAssigned y cierra el modal.
 */
  const handleSubmitExistente = async (e) => {
    e.preventDefault();
    setError("");

    if (!rutinaSeleccionada || !fechaLimite) {
      setError("Debes seleccionar una rutina y una fecha límite");
      return;
    }
    if (fechaLimite > maxFecha) {
      setError("La fecha límite no puede ser mayor a 3 meses");
      return;
    }
    if (!cliente?.id_gimnasio) {
      setError("Este cliente no tiene un gimnasio asociado");
      return;
    }

    try {
      setLoading(true);
      await api.post("/rutinas/asignar", {
        id_rutina: parseInt(rutinaSeleccionada),
        id_usuario: cliente.id,
        id_gimnasio: cliente.id_gimnasio,
        fecha_limite: fechaLimite,
        ...(idPersonalExistente ? { id_personal: parseInt(idPersonalExistente) } : {})
      });
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo asignar la rutina");
    } finally {
      setLoading(false);
    }
  };

  /**
 * Valida el formulario y, si es correcto, ejecuta dos pasos secuenciales:
 *   1. POST a "/rutinas" para crear la rutina personalizada.
 *   2. POST a "/rutinas/asignar" usando el id_rutina obtenido en el paso anterior.
 * Si algún paso falla muestra el error correspondiente sin completar el flujo.
 * Al éxito llama a onAssigned y cierra el modal.
 */
  const handleSubmitPersonalizada = async (e) => {
    e.preventDefault();
    setError("");
    if (!validatePersonalizada()) return;

    if (!cliente?.id_gimnasio) {
      setError("Este cliente no tiene un gimnasio asociado");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        objetivo: form.objetivo.trim(),
        categoria: form.categoria,
        nivel: form.nivel,
        tipo_rutina: form.tipo_rutina,
        es_premium: 0,
        es_personalizada: true,
        equipamiento: form.equipamiento.trim(),
        calorias_estimadas: parseInt(form.calorias_estimadas, 10),
        instrucciones: form.instrucciones.trim(),
        duracion_min: parseInt(form.duracion_min, 10)
      };

      const rutinaRes = await api.post(
        "/rutinas",
        JSON.stringify(payload),
        { headers: { "Content-Type": "application/json" }, transformRequest: [(d) => d] }
      );

      const id_rutina =
        rutinaRes.data?.rutina?.id_rutina ||
        rutinaRes.data?.id_rutina;

      if (!id_rutina) throw new Error("No se obtuvo el ID de la rutina creada");

      await api.post("/rutinas/asignar", {
        id_rutina,
        id_usuario: cliente.id,
        id_gimnasio: cliente.id_gimnasio,
        fecha_limite: fechaLimitePersonal,
        ...(idPersonalPersonalizada ? { id_personal: parseInt(idPersonalPersonalizada) } : {})
      });

      onAssigned();
      onClose();

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo crear y asignar la rutina"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
 * Construye el nombre completo de un miembro del personal
 * concatenando nombre y apellido_paterno disponibles.
 */
  const nombrePersonal = (p) =>
    [p.nombre, p.apellido_paterno].filter(Boolean).join(" ");

  return (
    <ModalPortal>
      <div className="modal-overlay">
        <div className="modal-card modal-lg">

          <h2 className="modal-title">Asignar rutina</h2>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
            {cliente.nombre}
          </span>

          <div className="assign-tabs">
            <button
              type="button"
              className={`assign-tab ${tab === "existente" ? "active" : ""}`}
              onClick={() => handleTabChange("existente")}
            >
              Seleccionar existente
            </button>
            <button
              type="button"
              className={`assign-tab ${tab === "personalizada" ? "active" : ""}`}
              onClick={() => handleTabChange("personalizada")}
            >
              Crear personalizada
            </button>
          </div>

          {error && (
            <div className="modal-error" style={{ marginTop: "12px" }}>{error}</div>
          )}

          {tab === "existente" && (
            <form onSubmit={handleSubmitExistente} className="modal-form">
              <div className="modal-grid" style={{ marginTop: "16px" }}>

                <div className="form-group">
                  <label>Rutina *</label>
                  {rutinas.length === 0 ? (
                    <p className="empty-state">Aún no has creado rutinas generales.</p>
                  ) : (
                    <select
                      value={rutinaSeleccionada}
                      onChange={e => { setRutinaSeleccionada(e.target.value); setError(""); }}
                    >
                      <option value="">Seleccionar rutina</option>
                      {rutinas.map((r, i) => (
                        <option key={`${r.id_rutina}-${i}`} value={r.id_rutina}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label>Fecha límite *</label>
                  <input
                    type="date"
                    value={fechaLimite}
                    onChange={e => { setFechaLimite(e.target.value); setError(""); }}
                    min={hoy}
                    max={maxFecha}
                  />
                  <span className="field-hint">Máximo 3 meses desde hoy</span>
                </div>

              </div>

              {rutinaObj?.tipo_rutina === "gimnasio" && personalExistente.length > 0 && (
                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label>
                    Instructor encargado{" "}
                    <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>
                      (opcional)
                    </span>
                  </label>

                  <select
                    value={idPersonalExistente}
                    onChange={e => setIdPersonalExistente(e.target.value)}
                  >
                    <option value="">Sin instructor asignado</option>
                    {personalExistente.map(p => (
                      <option key={p.id_personal} value={p.id_personal}>
                        {nombrePersonal(p)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Asignando..." : "Asignar"}
                </button>
              </div>
            </form>
          )}

          {tab === "personalizada" && (
            <form onSubmit={handleSubmitPersonalizada}>
              <div className="personal-form">

                <div className="form-group">
                  <label>Nombre de la rutina *</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    maxLength={20}
                    placeholder="Ej. Rutina de fuerza personalizada"
                  />
                  {formErrors.nombre && <span className="field-error-msg">{formErrors.nombre}</span>}
                </div>

                <div className="form-group">
                  <label>Descripción *</label>
                  <div className="textarea-wrapper">
                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange} maxLength={100} />
                    <span className="char-counter">{form.descripcion.length}/100</span>
                  </div>
                  {formErrors.descripcion && <span className="field-error-msg">{formErrors.descripcion}</span>}
                </div>

                <div className="form-group">
                  <label>Objetivo *</label>
                  <input
                    name="objetivo"
                    value={form.objetivo}
                    onChange={handleChange}
                    maxLength={50}
                    placeholder="Ej. Ganar masa muscular" />
                  {formErrors.objetivo && <span className="field-error-msg">{formErrors.objetivo}</span>}
                </div>

                <div className="form-grid">

                  <div className="form-group">
                    <label>Categoría *</label>
                    <select name="categoria" value={form.categoria} onChange={handleChange}>
                      <option value="">Seleccionar</option>
                      <option value="fuerza">Fuerza</option>
                      <option value="hipertrofia">Hipertrofia</option>
                      <option value="resistencia">Resistencia</option>
                      <option value="cardio">Cardio</option>
                      <option value="funcional">Funcional</option>
                    </select>
                    {formErrors.categoria && <span className="field-error-msg">{formErrors.categoria}</span>}
                  </div>

                  <div className="form-group">
                    <label>Nivel *</label>
                    <select name="nivel" value={form.nivel} onChange={handleChange}>
                      <option value="principiante">Principiante</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                    {formErrors.nivel && <span className="field-error-msg">{formErrors.nivel}</span>}
                  </div>

                  <div className="form-group">
                    <label>Tipo *</label>
                    <select name="tipo_rutina" value={form.tipo_rutina} onChange={handleChange}>
                      <option value="gimnasio">Gimnasio</option>
                      <option value="casa">Casa</option>
                    </select>
                    {formErrors.tipo_rutina && <span className="field-error-msg">{formErrors.tipo_rutina}</span>}
                  </div>

                  <div className="form-group">
                    <label>Duración (min) *</label>
                    <input type="text" inputMode="numeric" name="duracion_min" value={form.duracion_min} onChange={handleChange} maxLength={3} />
                    {formErrors.duracion_min && <span className="field-error-msg">{formErrors.duracion_min}</span>}
                  </div>

                  <div className="form-group">
                    <label>Equipamiento *</label>
                    <input
                      name="equipamiento"
                      value={form.equipamiento}
                      maxLength={50}
                      onChange={handleChange} />
                    {formErrors.equipamiento && <span className="field-error-msg">{formErrors.equipamiento}</span>}
                  </div>

                  <div className="form-group">
                    <label>Calorías estimadas *</label>
                    <input type="text" inputMode="numeric" name="calorias_estimadas" value={form.calorias_estimadas} onChange={handleChange} maxLength={4} />
                    {formErrors.calorias_estimadas && <span className="field-error-msg">{formErrors.calorias_estimadas}</span>}
                  </div>

                </div>

                <div className="form-group">
                  <label>Instrucciones *</label>
                  <div className="textarea-wrapper">
                    <textarea name="instrucciones" value={form.instrucciones} onChange={handleChange} maxLength={255} />
                    <span className="char-counter">{form.instrucciones.length}/255</span>
                  </div>
                  {formErrors.instrucciones && <span className="field-error-msg">{formErrors.instrucciones}</span>}
                </div>

                {form.tipo_rutina === "gimnasio" && personalPersonalizada.length > 0 && (
                  <div className="form-group">
                    <label>Instructor encargado <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>(opcional)</span></label>
                    <select
                      value={idPersonalPersonalizada}
                      onChange={e => setIdPersonalPersonalizada(e.target.value)}
                    >
                      <option value="">Sin instructor asignado</option>
                      {personalPersonalizada.map(p => (
                        <option key={p.id_personal} value={p.id_personal}>
                          {nombrePersonal(p)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Fecha límite *</label>
                  <input
                    type="date"
                    value={fechaLimitePersonal}
                    onChange={e => {
                      setFechaLimitePersonal(e.target.value);
                      if (formErrors.fechaLimite) setFormErrors(prev => ({ ...prev, fechaLimite: null }));
                    }}
                    min={hoy}
                    max={maxFecha}
                  />
                  <span className="field-hint">Máximo 3 meses desde hoy</span>
                  {formErrors.fechaLimite && <span className="field-error-msg">{formErrors.fechaLimite}</span>}
                </div>

              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creando y asignando..." : "Crear y asignar"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </ModalPortal>
  );
}

export default AssignRutinaModal;