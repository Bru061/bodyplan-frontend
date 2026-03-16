import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import "../../styles/planes.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function PagoExitoso() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [estado, setEstado] = useState("verificando"); // verificando | exitoso | error

  useEffect(() => {
    const verificarPago = async () => {
      const clientSecret = searchParams.get("payment_intent_client_secret");

      if (!clientSecret) {
        // Llegó aquí sin parámetros (plan gratis activado directo)
        setEstado("exitoso");
        return;
      }

      try {
        const stripe = await stripePromise;
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

        if (paymentIntent?.status === "succeeded") {
          setEstado("exitoso");
        } else {
          setEstado("error");
        }
      } catch (err) {
        console.error("Error verificando pago", err);
        setEstado("error");
      }
    };

    verificarPago();
  }, []);

  if (estado === "verificando") {
    return (
      <div className="pago-exitoso-page">
        <div className="pago-exitoso-card">
          <div className="pago-exitoso-icon">⏳</div>
          <h2>Verificando pago...</h2>
          <p>Por favor espera un momento.</p>
        </div>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div className="pago-exitoso-page">
        <div className="pago-exitoso-card">
          <div className="pago-exitoso-icon" style={{ background: "#fee2e2" }}>❌</div>
          <h2>Algo salió mal</h2>
          <p>No pudimos confirmar tu pago. Si el cargo fue realizado, contáctanos.</p>
          <button
            className="plan-btn"
            style={{ marginTop: "1rem" }}
            onClick={() => navigate("/planes")}
          >
            Volver a planes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pago-exitoso-page">
      <div className="pago-exitoso-card">

        <div className="pago-exitoso-icon">✅</div>

        <h2>¡Pago exitoso!</h2>
        <p>
          Tu plan ha sido activado correctamente. Ya puedes comenzar a
          gestionar tu gimnasio con todas las funciones disponibles.
        </p>

        <button
          className="plan-btn"
          onClick={() => navigate("/dashboard")}
        >
          Ir al dashboard
        </button>

      </div>
    </div>
  );
}

export default PagoExitoso;