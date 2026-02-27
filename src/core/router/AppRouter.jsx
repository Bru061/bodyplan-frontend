import { Routes, Route} from "react-router-dom";
import Home from "../../modules/public/home";
import Login from "../../modules/auth/Login";
import Register from "../../modules/auth/Register";
import ForgotPassword from "../../modules/auth/ForgotPassword";
import ResetPassword from "../../modules/auth/ResetPassword";
import Dashboard from "../../modules/dashboard/Dashboard";
import Clientes from "../../modules/clientes/Clientes";
import Servicios from "../../modules/servicios/servicios";
import Rutinas from "../../modules/rutinas/rutinas";
import Planes from "../../modules/planes/planes";
import Notificaciones from "../../modules/notificaciones/Notificaciones";
import Perfil from "../../modules/perfil/perfil";
import AdminDashboard from "../../modules/admin/AdminDashboard";
import PublicRoute from "../guards/PublicRoute";
import PrivateRoute from "../guards/PrivateRoute";
import RoleRoute from "../guards/RoleRoute";
import AppOnly from "../../modules/public/AppOnly"

function AppRouter(){
  return(
    <Routes>

      {/* PUBLICAS */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* PRIVADAS */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleRoute allowedRoles={["proveedor"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/rutinas" element={<Rutinas />} />
          <Route path="/planes" element={<Planes />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={["user"]} />}>
          <Route path="/solo-app" element={<AppOnly />} />
        </Route>

      </Route>

    </Routes>
  )
}

export default AppRouter;