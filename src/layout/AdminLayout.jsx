import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar  from "../components/AdminNavbar";
import "../styles/admin.css";
 
function AdminLayout({ children }) {
 
  const [sidebarOpen, setSidebarOpen] = useState(false);
 
  return (
    <div className="admin-layout">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-body">
        <AdminNavbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
 
export default AdminLayout;