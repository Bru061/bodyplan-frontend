import axios from "axios";

const api = axios.create({
  baseURL: "/api"
});

/**
 * Instancia centralizada de Axios con baseURL "/api" y dos interceptores globales:
 * uno para inyectar el token JWT en cada petición y otro para manejar
 * errores de sesión expirada y errores de servidor de forma unificada.
 */

/**
 * Lee el token JWT del localStorage y lo agrega al header Authorization
 * en formato "Bearer <token>" antes de enviar cualquier petición.
 * Si no existe token, deja la petición sin modificar.
 */
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Maneja errores HTTP de forma global con las siguientes reglas:
 *
 * - Rutas de auth (/auth/login, /auth/register, /auth/google):
 *   Los errores se propagan directamente sin procesamiento adicional,
 *   para que cada formulario los gestione de forma independiente.
 *
 * - 401 Unauthorized (fuera de auth):
 *   Limpia token y usuario del localStorage y redirige a "/login",
 *   interpretándolo como sesión expirada.
 *
 * - 500 Internal Server Error:
 *   Registra el error en consola sin interrumpir el flujo del llamador.
 *
 * Todos los errores se re-lanzan con Promise.reject para que los
 * llamadores puedan manejarlos individualmente si es necesario.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response) {

      const status = error.response.status;
      const url = error.config?.url || "";

      if (
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/google")
      ) {
        return Promise.reject(error);
      }

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
