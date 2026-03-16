import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar  from "../components/AdminNavbar";
import "../styles/admin.css";

function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-body">
        <AdminNavbar />
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;