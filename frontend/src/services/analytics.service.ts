import api from "@/api/axios";

export const analyticsService = {
  async getDashboard() {
    const response = await api.get("/analytics/dashboard");
    return response.data;
  },
};