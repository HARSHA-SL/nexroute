import api from "@/api/axios";

export const routesService = {
  async getAllRoutes() {
    const response = await api.get("/routes");

    // Backend returns:
    // {
    //   success,
    //   page,
    //   total,
    //   routes: [...]
    // }

    return response.data.routes;
  },

  async getRoute(id: number) {
    const response = await api.get(`/routes/${id}`);

    return response.data;
  },
};