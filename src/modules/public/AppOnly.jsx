import { useAuth } from "../../core/context/AuthContext";
import { useNavigate } from "react-router-dom";

function AppOnly() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f172a",
      color: "white",
      fontFamily: "sans-serif"
    }}>
      <div style={{
        background: "#111827",
        padding: "40px",
        borderRadius: "16px",
        maxWidth: "500px",
        textAlign: "center",
        boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
      }}>
        <h1 style={{fontSize:"28px",marginBottom:"10px"}}>
          Esta cuenta pertenece a la app móvil
        </h1>

        <p style={{opacity:0.8,marginBottom:"25px"}}>
          Detectamos que esta cuenta fue creada para la aplicación móvil.
          El panel web es exclusivo para gimnasios y expertos.
        </p>

        <button
          onClick={handleLogout}
          style={{
            background:"#6366f1",
            border:"none",
            padding:"12px 20px",
            borderRadius:"8px",
            color:"white",
            cursor:"pointer",
            fontWeight:"bold"
          }}
        >
          Iniciar sesión con otra cuenta
        </button>
      </div>
    </div>
  );
}

export default AppOnly;