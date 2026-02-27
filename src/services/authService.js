import api from "./axios";

const PLATFORM = "web";

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

export const loginAuth = async ({ correo, password }) => {

  const { data } = await api.post("/auth/login", {
    correo,
    password,
    plataforma: PLATFORM
  });

  return data;
};

export const googleAuth = async (idToken) => {
  const { data } = await api.post("/auth/google", {
    idToken,
    plataforma: PLATFORM,
    rol: "proveedor"
  });
  return data;
};
