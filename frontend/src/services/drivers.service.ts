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

  async createDriver(driver: any) {
    const response = await api.post("/drivers", driver);
    return response.data;
  },

  async updateDriver(id: number, driver: any) {
  const response = await api.patch(`/drivers/${id}`, driver);
  return response.data;
},

  async deleteDriver(id: number) {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  },
};