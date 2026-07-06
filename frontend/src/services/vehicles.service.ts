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

  async createVehicle(vehicle: any) {
    const response = await api.post("/vehicles", vehicle);
    return response.data;
  },

  async updateVehicle(id: number, vehicle: any) {
    const response = await api.patch(`/vehicles/${id}`, vehicle);
    return response.data;
  },

  async deleteVehicle(id: number) {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
};