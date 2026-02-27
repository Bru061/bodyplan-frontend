import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginAuth, registerAuth } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { googleAuth } from "../../services/authService";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  token: "token",
  user: "user",
  gymId: "gymId",
};

function mapRole(idRol){
  if(idRol === 1) return "admin";
  if(idRol === 2) return "user";
  if(idRol === 3) return "proveedor";
  return "user";
}

function getDashboardByRole(role) {
  if (role === "admin") return "/superadmin/dashboard";
  if (role === "proveedor") return "/dashboard";
  if (role === "user") return "/solo-app";
  return "/";
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [gymId, setGymId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.token);
    const savedUser = localStorage.getItem(STORAGE_KEYS.user);
    const savedGymId = localStorage.getItem(STORAGE_KEYS.gymId);

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setGymId(savedGymId ? Number(savedGymId) : null);
    }
    setLoading(false);
  }, []);

  const persistSession = ({ token, user, gymId }) => {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    if (gymId !== undefined && gymId !== null) {
      localStorage.setItem(STORAGE_KEYS.gymId, String(gymId));
    } else {
      localStorage.removeItem(STORAGE_KEYS.gymId);
    }

    setToken(token);
    setUser(user);
    setGymId(gymId ?? null);
  };

  const signIn = async ({ correo, password }) => {
    const data = await loginAuth({ correo, password });
    const role = mapRole(data.usuario.id_rol);

    const adapted = {
      token: data.token,
      user: {
        ...data.usuario,
        role
      },
      gymId: null,
    };

    persistSession(adapted);

    return {
      ...adapted,
      redirectTo: getDashboardByRole(role),
    };
  };

  const signUp = async ({ nombre,apellido_paterno,apellido_materno, correo, password, role = "proveedor" }) => {
    const data = await registerAuth({ nombre, apellido_paterno, apellido_materno, correo, password, role });
    const roleMapped = mapRole(data.usuario.id_rol)

    const adapted = {
      token: data.token,
      user: {
        ...data.usuario,
        role: roleMapped,
      },
      gymId: null,
    };

    persistSession(adapted);

    return {
      ...adapted,
      redirectTo: getDashboardByRole(role),
    };
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.gymId);

    setToken(null);
    setUser(null);
    setGymId(null);

    navigate("/");
  };

  const signInWithGoogle = async (idToken) => {
    const data = await googleAuth(idToken);

    const role = mapRole(data.usuario.id_rol);

    const adapted = {
      token: data.token,
      user: {
        ...data.usuario,
        role
      },
      gymId: null
    };

    persistSession(adapted);

    return {
      ...adapted,
      redirectTo: getDashboardByRole(role)
    };
  };

  const value = useMemo(
    () => ({
      token,
      user,
      gymId,
      loading,
      isAuthenticated,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
    }),
    [token, user, gymId, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
