import AuthLayout from "../../layout/AuthLayout";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MdAssignmentInd } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../../styles/login.css";
import { useAuth } from "../../core/context/AuthContext";
import { auth, provider, signInWithPopup } from "../../config/firebase";
import { useState } from "react";
import api from "../../services/axios";
import { FcGoogle } from "react-icons/fc";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, signInWithGoogle } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  const [form, setForm] = useState(
    location.state?.form || {
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      correo: "",
      password: "",
      confirmPassword: "",
    }
  );

  /**
 * Actualiza el campo del formulario aplicando filtros de caracteres
 * según el tipo de campo:
 *   - nombre: solo letras y espacios.
 *   - apellido_paterno / apellido_materno: solo letras sin espacios.
 *   - password / confirmPassword: sin espacios.
 * Limpia el error activo al detectar cualquier cambio.
 */
  const handleChange = (e) => {
    let { name, value } = e.target;
    setError("");

    if (name === "nombre") {
      value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
    }
    if (name === "apellido_paterno" || name === "apellido_materno") {
      value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g, "");
    }
    if (name === "password" || name === "confirmPassword") {
      value = value.replace(/\s/g, "");
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
 * Valida el formulario antes de registrar:
 *   - Contraseña mínimo 8 caracteres.
 *   - Ambas contraseñas deben coincidir.
 *   - Sin espacios en la contraseña.
 *   - Políticas de privacidad aceptadas.
 *
 * Si es válido llama a signUp y redirige a "/verify-email" pasando
 * el correo y los datos del formulario en el estado de navegación
 * para que VerifyEmail pueda completar el flujo automáticamente.
 * Muestra el error del servidor si el registro falla.
 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas deben ser iguales");
      return;
    }
    if (/\s/.test(form.password)) {
      setError("La contraseña no debe contener espacios");
      return;
    }
    if (!acceptedPolicies) {
      setError("Debes aceptar las Políticas de Privacidad y los Términos y Condiciones.");
      return;
    }

    setLoading(true);

    try {
      await signUp({
        nombre: form.nombre,
        apellido_paterno: form.apellido_paterno,
        apellido_materno: form.apellido_materno,
        correo: form.correo,
        password: form.password,
      });

      navigate("/verify-email", {
        state: { correo: form.correo, form }
      });

    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Error al registrar usuario";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
 * Abre el popup de Google con Firebase, obtiene el idToken y lo
 * envía al backend mediante signInWithGoogle. Redirige a "/mis-gimnasios"
 * si el proveedor tiene plan activo, o a "/planes" en caso contrario.
 */
  const handleGoogleLogin = async () => {
    try {
      setError("");
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await signInWithGoogle(idToken);
      const resPlan = await api.get("/proveedor/mi-plan");
      const tienePlanActivo = resPlan.data?.plan_activo?.estado === "activa";
      navigate(tienePlanActivo ? "/mis-gimnasios" : "/planes");
    } catch (error) {
      console.error(error);
      setError("Error al iniciar sesión con Google");
    }
  };

  return (
    <AuthLayout>
      <div className="login-container">

        <section className="login-side">
          <div className="login-side-content">
            <div className="login-avatar">
              <MdAssignmentInd size={70} color="white" />
            </div>
            <h2>BodyPlan</h2>
            <h3>Conecta tu gimnasio con clientes y gestiona rutinas de manera inteligente.</h3>
          </div>
        </section>

        <section className="login-form">
          <div className="login-form-inner">
            <h1>Bienvenido a</h1>
            <h2>BODYPLAN</h2>
            <p className="subtitle">Regístrate para continuar.</p>

            {error && (
              <p style={{ color: "red", textAlign: "center" }}>{error}</p>
            )}

            <form className="login-fields" onSubmit={handleSubmit}>

              <div className="float-field">
                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  placeholder=" "
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="nombre">Nombre *</label>
              </div>

              <div className="float-field">
                <input
                  id="apellido_paterno"
                  type="text"
                  name="apellido_paterno"
                  placeholder=" "
                  value={form.apellido_paterno}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="apellido_paterno">Apellido paterno *</label>
              </div>

              <div className="float-field">
                <input
                  id="apellido_materno"
                  type="text"
                  name="apellido_materno"
                  placeholder=" "
                  value={form.apellido_materno}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="apellido_materno">Apellido materno *</label>
              </div>

              <div className="float-field">
                <input
                  id="correo"
                  type="email"
                  name="correo"
                  placeholder=" "
                  value={form.correo}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="correo">Correo electrónico *</label>
              </div>

              <div className="float-field">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder=" "
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="password">Contraseña *</label>
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <div className="float-field">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder=" "
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="confirmPassword">Confirmar contraseña *</label>
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p style={{
                  color: "red",
                  fontSize: "0.85rem",
                  marginTop: "-8px",
                  marginBottom: "0"
                }}>
                  Las contraseñas deben coincidir
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrarse"}
              </button>

              <label style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={acceptedPolicies}
                  onChange={(e) => setAcceptedPolicies(e.target.checked)}
                  style={{ marginTop: "0.2rem" }}
                />
                <span>
                  He leído y acepto las{" "}
                  <Link to="/politicas-privacidad" target="_blank" rel="noreferrer">Políticas de Privacidad</Link>{" "}
                  y los{" "}
                  <Link to="/terminos-y-condiciones" target="_blank" rel="noreferrer">Términos y Condiciones</Link>.
                </span>
              </label>

            </form>

            <div className="divider">
              <hr /> <span>o</span> <hr />
            </div>

            <button className="google-btn" type="button" onClick={handleGoogleLogin}>
              <FcGoogle size={20} />
              Continuar con Google
            </button>

            <div className="login-links">
              <span>
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
              </span>
            </div>

          </div>
        </section>

      </div>
    </AuthLayout>
  );
}

export default Register;