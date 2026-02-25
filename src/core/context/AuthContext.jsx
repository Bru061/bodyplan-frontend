import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginAuth, registerAuth } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  token: "token",
  user: "user",
  gymId: "gymId",
};

function getDashboardByRole(role) {
  if (role === "superadmin") return "/superadmin/dashboard";
  if (role === "gym") return "/dashboard";
  return "/"; // user normal
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

    const adapted = {
      token: data.token,
      user: {
        ...data.usuario,
        role: data.usuario.id_rol === 1 ? "superadmin" : "gym",
      },
      gymId: null,
    };

    persistSession(adapted);

    return {
      ...adapted,
      redirectTo: "/dashboard",
    };
  };

  const signUp = async ({ nombre,apellido_paterno,apellido_materno, correo, password, role = "gym" }) => {
    const data = await registerAuth({ nombre, apellido_paterno, apellido_materno, correo, password, role });

    const adapted = {
      token: data.token,
      user: {
        ...data.usuario,
        role: role,
      },
      gymId: null,
    };

    persistSession(adapted);

    return {
      ...adapted,
      redirectTo: "/dashboard",
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
