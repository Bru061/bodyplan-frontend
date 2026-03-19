function Footer() {
  return (
    <footer style={{
      background: "#0f172a",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      padding: "1.5rem 20px",
      textAlign: "center"
    }}>
      <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
        © {new Date().getFullYear()} DevNest — Todos los derechos reservados.
      </p>
    </footer>
  );
}

export default Footer;