import axios from "axios";

const api = axios.create({
  baseURL: "https://untapped-priestly-jazlyn.ngrok-free.dev/api", // ← backend
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});


// 🔐 INTERCEPTOR → agrega token automáticamente
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// 🚨 INTERCEPTOR RESPUESTA (manejo errores global)
api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response) {

      // Token expirado
      if (error.response.status === 401) {
        console.warn("Token expirado o inválido");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      // Error servidor
      if (error.response.status === 500) {
        console.error("Error interno del servidor");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
