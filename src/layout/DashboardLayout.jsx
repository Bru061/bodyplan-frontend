import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-body">
        <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />

        <main className="dashboard-main">
          {children}
        </main>
      </div>

    </div>
  );
}

export default DashboardLayout;