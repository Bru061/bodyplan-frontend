import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/axios";
import AuthLayout from "../../layout/AuthLayout";
import "../../styles/login.css";
import { MdAssignmentInd } from "react-icons/md";
import { FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../../core/context/AuthContext";

/**
 * Página de verificación de correo electrónico post-registro.
 * Recibe el correo y los datos del formulario anterior mediante
 * el estado de navegación (location.state).
 * Si la verificación es exitosa y hay credenciales previas, inicia
 * sesión automáticamente y redirige a "/planes". De lo contrario
 * redirige a "/login" con el correo y estado de verificación.
 */
function VerifyEmail() {

  const navigate = useNavigate();
  const location = useLocation();

  const correo = location.state?.correo;
  const formAnterior = location.state?.form;
  const { signIn } = useAuth();

  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  /**
 * Valida que el campo de código no esté vacío y lo envía junto
 * con el correo a "/auth/verify-email". Si la verificación es exitosa
 * intenta iniciar sesión automáticamente con las credenciales almacenadas
 * en el estado de navegación. Muestra error si el código es incorrecto o expirado.
 */
  const handleVerify = async (e) => {

    e.preventDefault();

    if (!codigo.trim()) {
      setError("Debes ingresar el código");
      return;
    }

    try {

      setLoading(true);
      setError("");

      const PLATFORM = "web";

      await api.post("/auth/verify-email", {
        correo,
        codigo,
        plataforma: PLATFORM
      });

      setSuccess("¡Correo verificado correctamente! Redirigiendo...");

      if (formAnterior?.correo && formAnterior?.password) {
        await signIn({
          correo: formAnterior.correo,
          password: formAnterior.password
        });
        setTimeout(() => {
          navigate("/planes", { replace: true });
        }, 1500);
        return;
      }

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { correo, verified: true }
        });
      }, 1500);

    } catch (err) {

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Código incorrecto o expirado"
      );

    } finally {
      setLoading(false);
    }

  };

  /**
 * Navega de regreso a "/register" preservando los datos del formulario
 * anterior en el estado de navegación para no perder lo que el usuario ya escribió.
 */
  const handleRegresar = () => {
    navigate("/register", {
      state: { form: formAnterior }
    });
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
            <h3>Verifica tu correo electrónico.</h3>
          </div>
        </section>

        <section className="login-form">
          <div className="login-form-inner">

            <button
              type="button"
              className="back-button"
              onClick={handleRegresar}
              title="Volver al registro"
              style={{ alignSelf: "flex-start", marginBottom: "8px" }}
            >
              <FiArrowLeft size={22} />
            </button>

            <h1 className="verify-title">Verificar correo</h1>

            <p className="verify-subtitle">
              Hemos enviado un código de verificación a:
              <br />
              <strong>{correo}</strong>
            </p>

            {error && (
              <p style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>
                {error}
              </p>
            )}

            {success && (
              <p style={{ color: "green", textAlign: "center", marginBottom: "10px" }}>
                {success}
              </p>
            )}

            <form onSubmit={handleVerify} className="login-fields">
              <div className="float-field">
              <input
                id="codigo"
                type="text"
                name="codigo"
                placeholder=" "
                maxLength={6}
                value={codigo}
                onChange={(e) => {
                  setError("");
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setCodigo(value);
                }}
                required
              />
              <label htmlFor="correo">Código de Verificación</label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !!success}
              >
                {loading ? "Verificando..." : "Verificar código"}
              </button>

            </form>

          </div>
        </section>

      </div>
    </AuthLayout>
  );

}

export default VerifyEmail;