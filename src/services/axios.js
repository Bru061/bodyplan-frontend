import axios from "axios";

const api = axios.create({
  baseURL: "http://bodyplan-api.giize.com:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
  //withCredentials: true
});


// INTERCEPTOR → agrega token automáticamente
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// INTERCEPTOR RESPUESTA (manejo errores global)
api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response) {

      const status = error.response.status;
      const url = error.config?.url || "";

      // NO aplicar lógica global en login/register/google
      if (
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/google")
      ) {
        return Promise.reject(error);
      }

      // SOLO si ya estaba logueado y token expiró
      if (status === 401) {
        console.warn("Sesión expirada. Redirigiendo login...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      if (status === 500) {
        console.error("Error interno del servidor");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
