import AdminNavbar from '../components/AdminNavbar'
import Footer from '../components/Footer'

function AdminLayout({ children }) {
    return (
        <>
            <AdminNavbar />
            <div className="main-content">
                {children}
            </div>
            <Footer />
        </>
    )
}

export default AdminLayout
