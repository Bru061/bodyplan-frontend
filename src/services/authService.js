import api from "./axios";

const PLATFORM = "web";

/**
 * Servicio de autenticación. Encapsula las llamadas al API para
 * registro, login y autenticación con Google, añadiendo siempre
 * la plataforma "web" como metadato en cada petición.
 */

/**
 * Registra un nuevo usuario con rol "proveedor" en la plataforma web.
 */
export const registerAuth = async ({
  nombre,
  apellido_paterno,
  apellido_materno,
  correo,
  password,
}) => {

  const { data } = await api.post("/auth/registro", {
    nombre,
    apellido_paterno,
    apellido_materno,
    correo,
    password,
    plataforma: PLATFORM,
    rol: "proveedor"
  });

  return data;
};

/**
 * Autentica a un usuario existente con correo y contraseña.
 */
export const loginAuth = async ({ correo, password }) => {

  const { data } = await api.post("/auth/login", {
    correo,
    password,
    plataforma: PLATFORM
  });

  return data;
};

/**
 * Autentica o registra al usuario mediante un idToken de Google.
 * Asigna rol "proveedor" si es un registro nuevo.
 */
export const googleAuth = async (idToken) => {
  const { data } = await api.post("/auth/google", {
    idToken,
    plataforma: PLATFORM,
    rol: "proveedor"
  });
  return data;
};
