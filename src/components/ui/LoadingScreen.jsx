import DashboardLayout from "../../layout/DashboardLayout";

function LoadingScreen({ message = "Cargando..." }) {

  return (
    <DashboardLayout>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
          flexDirection: "column",
          gap: "16px"
        }}
      >

        <div className="loading-spinner"></div>

        <h2
          style={{
            color: "#1e3a8a",
            fontSize: "26px",
            fontWeight: "600"
          }}
        >
          {message}
        </h2>

      </div>
    </DashboardLayout>
  );
}

export default LoadingScreen;