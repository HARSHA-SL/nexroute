import api from "@/api/axios";

export const warehousesService = {
  async getAllWarehouses() {
    const response = await api.get("/warehouses");
    return response.data;
  },

  async getWarehouse(id: number) {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  },
};