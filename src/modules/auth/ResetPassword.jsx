import AuthLayout from "../../layout/AuthLayout";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/axios";
import '../../styles/login.css';
import { MdAssignmentInd } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";

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
            <p>
              Tu portal integral para conectar con los mejores gimnasios y nutricionistas.
            </p>
          </div>
        </section>
        <section className="login-form">
          <div className="login-form-inner">

            <h1>Nueva contraseña</h1>

            {msg && <p style={{color:"green"}}>{msg}</p>}
            {error && <p style={{color:"red"}}>{error}</p>}

            <form onSubmit={handleSubmit} className="login-fields">
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="password-field">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirm}
                onChange={(e)=>setConfirm(e.target.value)}
              />
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