import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">

      <Navbar />

      <main className="dashboard-container">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}

export default DashboardLayout;