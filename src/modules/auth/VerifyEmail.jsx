import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/axios";
import AuthLayout from "../../layout/AuthLayout";
import "../../styles/login.css";
import { MdAssignmentInd } from "react-icons/md";
import { FiArrowLeft } from "react-icons/fi";

function VerifyEmail() {

  const navigate = useNavigate();
  const location = useLocation();

  const correo = location.state?.correo;
  // ✅ MEJORA: Recibe el form de Register para poder restaurarlo al regresar
  const formAnterior = location.state?.form;

  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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

      // ✅ FIX: Mensaje inline en lugar de alert()
      setSuccess("¡Correo verificado correctamente! Redirigiendo...");

      setTimeout(() => {
        navigate("/mis-gimnasios");
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

  const handleRegresar = () => {
    // ✅ MEJORA: Devuelve el form a Register para restaurar los datos
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

            {/* ✅ MEJORA: Flecha discreta para regresar al registro */}
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

            {/* ✅ MEJORA: Mensaje de éxito inline */}
            {success && (
              <p style={{ color: "green", textAlign: "center", marginBottom: "10px" }}>
                {success}
              </p>
            )}

            <form onSubmit={handleVerify} className="login-fields">

              <input
                type="text"
                placeholder="Código de verificación"
                maxLength={6}
                value={codigo}
                onChange={(e) => {
                  setError("");
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setCodigo(value);
                }}
                required
              />

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