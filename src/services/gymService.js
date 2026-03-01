import api from "./axios";

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