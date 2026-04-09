import AuthLayout from "../../layout/AuthLayout";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/axios";
import '../../styles/login.css';
import { MdAssignmentInd } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";

/**
 * Página para establecer una nueva contraseña mediante un token de reset
 * obtenido desde los parámetros de la URL (useParams).
 * Incluye toggles de visibilidad para ambos campos de contraseña.
 * Valida que la contraseña tenga al menos 8 caracteres y que ambos
 * campos coincidan antes de enviar la petición.
 * Al éxito redirige a "/login" tras 1.5 segundos.
 */
function ResetPassword(){

  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const PLATFORM = "web";

  /**
 * Valida la contraseña localmente (mínimo 8 caracteres, ambos campos iguales)
 * y envía el token y la nueva contraseña a "/password/reset/:token".
 * Muestra mensaje de éxito o error según el resultado.
 * Al éxito redirige a "/login" tras 1.5 segundos.
 */
  const handleSubmit = async(e)=>{
    e.preventDefault();
    setError("");
    setMsg("");

    if(password.length < 8){
      setError("Mínimo 8 caracteres");
      return;
    }

    if(password !== confirm){
      setError("No coinciden");
      return;
    }

    try{
      await api.post(`/password/reset/${token}`, {
        password,
        plataforma: PLATFORM
      });

      setMsg("Contraseña actualizada");
      setTimeout(()=> navigate("/login"),1500);

    }catch(err){
      setError(err?.response?.data?.error || "Error");
    }
  };

  return(
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

            <h1 style={{
            fontSize: "1.8rem",
            fontWeight: "800",
            letterSpacing: "1px",
            marginBottom: "10px",
            marginTop: "10px",
            textAlign: "center",
            color: "#071950"
            }}>
            Ingresa tu nueva contraseña
            </h1>

            {msg && <p style={{color:"green"}}>{msg}</p>}
            {error && <p style={{color:"red"}}>{error}</p>}

            <form onSubmit={handleSubmit} className="login-fields">
            <div className="float-field">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder=" "
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />
              <label htmlFor="newPassword">Nueva contraseña</label>
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="float-field">
              <input
              id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder=" "
                value={confirm}
                onChange={(e)=>setConfirm(e.target.value)}
                required
              />
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

              <button className="btn btn-primary">
                Cambiar contraseña
              </button>

            </form>

          </div>
        </section>
      </div>
    </AuthLayout>
  )
}

export default ResetPassword;