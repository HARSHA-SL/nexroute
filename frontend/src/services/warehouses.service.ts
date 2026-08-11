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

  async createWarehouse(warehouse: any) {
    const response = await api.post(
      "/warehouses",
      warehouse
    );

    return response.data;
  },

  async updateWarehouse(id: number, warehouse: any) {
    const response = await api.patch(
      `/warehouses/${id}`,
      warehouse
    );

    return response.data;
  },

  async deleteWarehouse(id: number) {
    const response = await api.delete(
      `/warehouses/${id}`
    );

    return response.data;
  },
};