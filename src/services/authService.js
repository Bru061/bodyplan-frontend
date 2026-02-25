import api from "./axios";

export const registerAuth = async ({ nombre, apellido_paterno, apellido_materno, correo, password, role = "gym" }) => {
    const { data } = await api.post("/auth/registro", { nombre, apellido_paterno, apellido_materno, correo, password, role });
    return data; // { message, token, expiresIn, user, gymId }
};

export const loginAuth = async ({ correo, password }) => {
    const { data } = await api.post("/auth/login", { correo, password });
    return data; // { message, token, expiresIn, user, gymId }
};
