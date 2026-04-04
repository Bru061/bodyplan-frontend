import AuthLayout from "../../layout/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { MdAssignmentInd } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../../styles/login.css";
import { useState } from "react";
import { useAuth } from "../../core/context/AuthContext";
import { auth, provider, signInWithPopup } from "../../config/firebase";
import { FcGoogle } from "react-icons/fc";
import api from "../../services/axios";

function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    correo: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
 * Actualiza el campo correspondiente en el formulario y limpia
 * el mensaje de error al detectar cualquier cambio.
 */
  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
 * Autentica al usuario con correo y contraseña mediante signIn.
 * Tras el éxito consulta en paralelo el plan activo y los gimnasios
 * para determinar la ruta de redirección:
 *   - Sin plan activo → "/planes"
 *   - Con plan, sin gimnasios → "/mis-gimnasios"
 *   - Con plan y gimnasios → "/dashboard"
 * Muestra el error devuelto por el servidor si la autenticación falla.
 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn({
        correo: form.correo,
        password: form.password,
      });

      const [resPlan, resGyms] = await Promise.allSettled([
        api.get("/proveedor/mi-plan"),
        api.get("/gym"),
      ]);

      const planActivo = resPlan.status === "fulfilled" ? resPlan.value.data?.plan_activo : null;
      const tienePlanActivo = planActivo?.estado === "activa";

      if (!tienePlanActivo) {
        navigate("/planes");
        return;
      }

      const gimnasios = resGyms.status === "fulfilled" ? (resGyms.value.data.gimnasios || []) : [];
      navigate(gimnasios.length === 0 ? "/mis-gimnasios" : "/dashboard");

    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Error al iniciar sesión";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
 * Abre el popup de Google con Firebase, obtiene el idToken y lo
 * envía al backend mediante signInWithGoogle. Redirige a "/dashboard"
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
      navigate(tienePlanActivo ? "/dashboard" : "/planes");
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
            <h3>
              Conecta tu gimnasio con clientes y gestiona rutinas de manera inteligente.
            </h3>
          </div>
        </section>

        <section className="login-form">
          <div className="login-form-inner">
            <h1>Bienvenido de nuevo a</h1>
            <h2>BODYPLAN</h2>
            <p className="subtitle">Inicia sesión para continuar.</p>

            {error && (
              <p style={{ color: "red", textAlign: "center" }}>{error}</p>
            )}

            <form className="login-fields" onSubmit={handleSubmit}>

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
                <label htmlFor="correo">Correo electrónico</label>
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
                <label htmlFor="password">Contraseña</label>
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </button>

            </form>

            <div className="divider">
              <hr /> <span>o</span> <hr />
            </div>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
            >
              <FcGoogle size={20} />
              Continuar con Google
            </button>

            <div className="login-links">
              <span>
                ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
              </span>
              <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
            </div>

          </div>
        </section>

      </div>
    </AuthLayout>
  );
}

export default Login;
