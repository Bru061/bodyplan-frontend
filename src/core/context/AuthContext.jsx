import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginAuth, registerAuth } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { googleAuth } from "../../services/authService";

/**
 * Contexto global de autenticación. Gestiona el ciclo de vida de la sesión del usuario:
 * persistencia en localStorage, inicio/cierre de sesión con correo o Google,
 * y registro. Expone el estado y las funciones a través del hook useAuth.
 */
const AuthContext = createContext(null);

const STORAGE_KEYS = {
  token: "token",
  user: "user",
  gymId: "gymId",
};

/**
 * Convierte el id_rol numérico del backend a una cadena de rol legible.
 */
function mapRole(idRol){
  if(idRol === 1) return "admin";
  if(idRol === 2) return "user";
  if(idRol === 3) return "proveedor";
  return "user";
}

/**
 * Proveedor del contexto de autenticación. Al montar, restaura la sesión guardada
 * en localStorage (token, usuario y gymId). Construye y memoiza el valor del
 * contexto para evitar renders innecesarios en los consumidores.
 */
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

  /**
 * Guarda el token, el usuario y el gymId en localStorage y actualiza el estado local.
 * Si gymId es null o undefined, elimina la clave del storage.
 */
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

  /**
 * Autentica al usuario con correo y contraseña mediante el servicio loginAuth.
 * Mapea el rol numérico a string, persiste la sesión y retorna los datos adaptados.
 */
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

    return adapted;
  };

  /**
 * Registra un nuevo usuario a través del servicio registerAuth.
 * No persiste sesión de forma automática; delega esa responsabilidad al llamador.
 */
  const signUp = async ({ nombre,apellido_paterno,apellido_materno, correo, password, role = "proveedor" }) => {

    const data = await registerAuth({
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      password,
      role
    });

    return data;

  };

  /**
 * Elimina todos los datos de sesión del localStorage, limpia el estado local
 * y redirige al usuario a la ruta raíz "/".
 */
  const signOut = () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.gymId);

    setToken(null);
    setUser(null);
    setGymId(null);

    navigate("/");
  };

  /**
 * Autentica al usuario usando un idToken de Google obtenido previamente con Firebase.
 * Llama al servicio googleAuth, mapea el rol y persiste la sesión.
 */
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

    return adapted;
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

/**
 * Hook para consumir el AuthContext dentro de cualquier componente.
 * Lanza un error si se usa fuera del árbol de AuthProvider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
