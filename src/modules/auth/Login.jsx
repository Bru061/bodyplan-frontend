import AuthLayout from "../../layout/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { MdAssignmentInd } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../../styles/login.css";
import { useState } from "react";
import { useAuth } from "../../core/context/AuthContext";
import { auth, provider, signInWithPopup } from "../../services/firebase";
import { FcGoogle } from "react-icons/fc";
import api from "../../services/axios";

function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    correo: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn({
        correo: form.correo,
        password: form.password,
      });

      navigate(result.redirectTo);

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
            <p>
              Tu portal integral para conectar con los mejores gimnasios y nutricionistas.
            </p>
          </div>
        </section>

        <section className="login-form">
          <div className="login-form-inner">
            <h1>Bienvenido de nuevo a</h1>
            <h2>BODYPLAN</h2>
            <p className="subtitle">Inicia sesión para continuar.</p>

            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

            <form
              className="login-fields"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}>
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                value={form.correo}
                onChange={handleChange}
                required
              />
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </button>
            </form>

            <div className="divider">
              <hr /> <span>o</span> <hr />
            </div>

            <button className="google-btn" onClick={handleGoogleLogin}>
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
