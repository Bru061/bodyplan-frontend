import AuthLayout from "../../layout/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { MdAssignmentInd } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../../styles/login.css";
import { useAuth } from "../../core/context/AuthContext";
import { auth, provider, signInWithPopup } from "../../services/firebase";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    correo: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleChange = (e) => {
    let { name, value } = e.target;

    setError("");
    // NOMBRE → solo letras y espacios
    if (name === "nombre") {
      value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
    }

    // APELLIDOS → solo letras sin espacios
    if (name === "apellido_paterno" || name === "apellido_materno") {
      value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g, "");
    }

    // PASSWORD → sin espacios
    if (name === "password" || name === "confirmPassword") {
      value = value.replace(/\s/g, "");
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

    setLoading(true);

    try {
      const result = await signUp({
        nombre: form.nombre,
        apellido_paterno: form.apellido_paterno,
        apellido_materno: form.apellido_materno,
        correo: form.correo,
        password: form.password,
      });

      navigate(result.redirectTo);

    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Error al registrar usuario";

      setError(msg);
      console.log(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await signInWithGoogle(idToken);

      navigate(response.redirectTo);

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
            <p>Tu portal integral para conectar con los mejores gimnasios y nutricionistas.</p>
          </div>
        </section>

        <section className="login-form">
          <div className="login-form-inner">
            <h1>Bienvenido a</h1>
            <h2>BODYPLAN</h2>
            <p className="subtitle">Regístrate para continuar.</p>

            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

            <form className="login-fields" onSubmit={handleSubmit}>
              <input
                type="text"
                name="nombre"
                className="full-width"
                placeholder="Nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="apellido_paterno"
                className="full-width"
                placeholder="Apellido paterno"
                value={form.apellido_paterno}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="apellido_materno"
                className="full-width"
                placeholder="Apellido materno"
                value={form.apellido_materno}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="correo"
                className="full-width"
                placeholder="Correo electrónico"
                value={form.correo}
                onChange={handleChange}
                required
              />
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="full-width"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="full-width"
                  placeholder="Confirmar contraseña"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p style={{
                  color: "red",
                  fontSize: "0.85rem",
                  marginTop: "5px",
                  marginBottom: "5px"
                }}>
                  Las contraseñas deben coincidar
                </p>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Registrando..." : "Registrarse"}
              </button>
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
