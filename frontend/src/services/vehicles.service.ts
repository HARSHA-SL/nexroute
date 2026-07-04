import api from "@/api/axios";

export const vehiclesService = {
  async getAllVehicles() {
    const response = await api.get("/vehicles");
    return response.data;
  },

  async getVehicle(id: number) {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },
};