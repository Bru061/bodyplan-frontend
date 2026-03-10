import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/axios";
import AuthLayout from "../../layout/AuthLayout";
import "../../styles/login.css";
import { MdAssignmentInd } from "react-icons/md";

function VerifyEmail() {

  const navigate = useNavigate();
  const location = useLocation();

  const correo = location.state?.correo;

  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {

    e.preventDefault();

    if (!codigo.trim()) {
      setError("Debes ingresar el código");
      return;
    }

    try {

      setLoading(true);

      const PLATFORM = "web";

      await api.post("/auth/verify-email", {
        correo,
        codigo,
        plataforma: PLATFORM
      });

      alert("Correo verificado correctamente");

      navigate("/mis-gimnasios");

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

  return (
    <AuthLayout>
      <div className="login-container">

        {/* PANEL IZQUIERDO */}
        <section className="login-side">
          <div className="login-side-content">
            <div className="login-avatar">
              <MdAssignmentInd size={70} color="white" />
            </div>
            <h2>BodyPlan</h2>
            <h3>
              Verifica tu correo electrónico.
            </h3>
          </div>
        </section>

        {/* FORMULARIO */}
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
              Verificar correo
            </h1>

            <p style={{
              textAlign: "center",
              marginBottom: "35px",
              color: "#64748b",
              fontSize: "0.95rem"
            }}>
              Hemos enviado un código de verificación a:
              <br />
              <strong>{correo}</strong>
            </p>

            {error && <p style={{color:"red"}}>{error}</p>}

            <form onSubmit={handleVerify} className="login-fields">

              <input
                type="text"
                placeholder="Código de verificación"
                maxLength={6}
                value={codigo}
                onChange={(e)=>{

                  const value = e.target.value.replace(/[^0-9]/g,"");
                  setCodigo(value);

                }}
                required
              />

              <button className="btn btn-primary" disabled={loading}>
                {loading ? "Verificando..." : "Verificar código"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={()=>navigate("/register")}
              >
                Cambiar correo
              </button>

            </form>

          </div>

        </section>

      </div>
    </AuthLayout>
  );

}

export default VerifyEmail;