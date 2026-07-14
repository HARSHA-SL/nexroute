import axios from "axios";

const API_KEY = import.meta.env.VITE_ORS_API_KEY;

const orsApi = axios.create({
  baseURL: "https://api.openrouteservice.org",
  headers: {
    Authorization: API_KEY,
    "Content-Type": "application/json",
  },
});

export default orsApi;
export async function getDrivingRoute(
  coordinates: [number, number][]
) {
  const response = await orsApi.post(
    "/v2/directions/driving-car/geojson",
    {
      coordinates,
    }
  );

  return response.data;
}