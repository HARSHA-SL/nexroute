import api from "@/api/axios";

export const routesService = {
  async getAllRoutes() {
    const response = await api.get("/routes");

    return response.data.routes;
  },

  async getRoute(id: number) {
    const response = await api.get(`/routes/${id}`);

    return response.data;
  },

  async startRoute(routeId: number) {
    const response = await api.patch(
      `/route-actions/routes/${routeId}/start`
    );

    return response.data;
  },
  async arriveAtStop(stopId: number) {
  const response = await api.patch(
    `/route-actions/route-stops/${stopId}/arrive`
  );

  return response.data;
},
async deliverPackage(stopId: number) {
  const response = await api.patch(
    `/route-actions/route-stops/${stopId}/deliver`
  );

  return response.data;
},
async completeRoute(routeId: number) {
  const response = await api.patch(
    `/route-actions/routes/${routeId}/complete`
  );

  return response.data;
},
};