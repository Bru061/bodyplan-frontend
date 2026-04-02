import api from "./axios";

/**
 * Servicio de acceso a datos del gimnasio del proveedor autenticado.
 */

/**
 * Obtiene el primer gimnasio registrado del proveedor autenticado.
 * Retorna null si el proveedor no tiene gimnasios (404) o si el arreglo está vacío.
 * Propaga cualquier otro error HTTP para que el llamador lo gestione.
 */
export const getMyGym = async () => {
  try {
    const { data } = await api.get("/gym");
    return data.gimnasios?.[0] || null;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};