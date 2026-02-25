import AuthLayout from "../../layout/AuthLayout";
import { useState } from "react";
import api from "../../services/axios";
import { useNavigate } from "react-router-dom";
import '../../styles/login.css';
import { MdAssignmentInd } from "react-icons/md";

function ForgotPassword() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // PASO 1 → pedir código
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);

    try {
      await api.post("/password/request", { correo });
      setMsg("Código enviado al correo.");
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.error || "Error enviando código");
    } finally {
      setLoading(false);
    }
  };

  // PASO 2 → verificar código
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);

    try {
      await api.post("/password/verify", { correo, codigo });
      setMsg("Código válido.");
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.error || "Código incorrecto");
    } finally {
      setLoading(false);
    }
  };

  // PASO 3 → cambiar contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (password.length < 6) {
      setError("Mínimo 6 caracteres");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await api.post("/password/change", { correo, password });
      setMsg("Contraseña actualizada correctamente");

      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      setError(err?.response?.data?.error || "Error cambiando contraseña");
    } finally {
      setLoading(false);
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

            <h1>Recuperar contraseña</h1>

            {msg && <p style={{color:"green"}}>{msg}</p>}
            {error && <p style={{color:"red"}}>{error}</p>}

            {step === 1 && (
              <form onSubmit={handleRequestCode} className="login-fields">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={correo}
                  onChange={(e)=>setCorreo(e.target.value)}
                  required
                />
                <button className="btn btn-primary" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar código"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="login-fields">
                <input
                  type="text"
                  placeholder="Código de 6 dígitos"
                  value={codigo}
                  onChange={(e)=>setCodigo(e.target.value)}
                  required
                />
                <button className="btn btn-primary" disabled={loading}>
                  {loading ? "Verificando..." : "Verificar código"}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleChangePassword} className="login-fields">
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirm}
                  onChange={(e)=>setConfirm(e.target.value)}
                  required
                />
                <button className="btn btn-primary" disabled={loading}>
                  {loading ? "Actualizando..." : "Cambiar contraseña"}
                </button>
              </form>
            )}

          </div>
        </section>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;