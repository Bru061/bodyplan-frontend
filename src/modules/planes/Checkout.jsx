import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import "../../styles/planes.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// ── Formulario interno (necesita estar dentro de <Elements>) ──
function CheckoutForm({ desglose, plan }) {

  const stripe   = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!stripe || !elements) return;

    setLoading(true);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pago-exitoso`
      }
    });

    // Si llegamos aquí es porque hubo error (si no, Stripe redirige automáticamente)
    if (stripeError) {
      setError(stripeError.message || "Error procesando el pago");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-stripe-form">

      {/* ── Resumen del plan ── */}
      <div className="checkout-resumen">
        <div className="checkout-resumen-row">
          <span>Plan {plan?.nombre}</span>
          <span>${desglose?.precio_plan?.toLocaleString("es-MX")} MXN</span>
        </div>
        <div className="checkout-resumen-row">
          <span>Comisión Stripe</span>
          <span>${desglose?.comision_stripe?.toLocaleString("es-MX")} MXN</span>
        </div>
        <div className="checkout-resumen-total">
          <span>Total a pagar</span>
          <span>${desglose?.total?.toLocaleString("es-MX")} MXN</span>
        </div>
      </div>

      {/* ── Stripe Payment Element ── */}
      <PaymentElement />

      {error && <div className="checkout-error">{error}</div>}

      <button
        type="submit"
        className="checkout-btn"
        disabled={!stripe || loading}
      >
        {loading ? "Procesando..." : `Pagar $${desglose?.total?.toLocaleString("es-MX")} MXN`}
      </button>

      <p className="checkout-seguro">
        🔒 Pago seguro procesado por Stripe
      </p>

    </form>
  );
}

// ── Página principal de Checkout ──
function Checkout() {

  const location = useLocation();
  const navigate = useNavigate();

  const { client_secret, desglose, plan } = location.state || {};

  // Si no hay client_secret redirigir a planes
  if (!client_secret) {
    navigate("/planes");
    return null;
  }

  const options = {
    clientSecret: client_secret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary:       "#1e3a8a",
        colorBackground:    "#f8fafc",
        colorText:          "#0f172a",
        borderRadius:       "10px",
        fontFamily:         "Inter, sans-serif"
      }
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-card">

        <div className="checkout-header">
          <button className="checkout-back" onClick={() => navigate("/planes")}>
            ← Volver a planes
          </button>
          <h2>Completa tu pago</h2>
          <p>Plan <strong>{plan?.nombre}</strong> — acceso por {plan?.duracion_dias} días</p>
        </div>

        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm desglose={desglose} plan={plan} />
        </Elements>

      </div>
    </div>
  );
}

export default Checkout;