import api from "@/api/axios";

export const driversService = {
  async getAllDrivers() {
    const response = await api.get("/drivers");
    return response.data;
  },

  async getDriver(id: number) {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },
};