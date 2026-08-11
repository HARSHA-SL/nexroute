import api from "./axios";

export interface DashboardSummary {
  success: boolean;

  deliveries: {
    total: number;
    pending: number;
    delivered: number;
  };

  routes: {
    total: number;
    active: number;
    completed: number;
  };

  drivers: {
    total: number;
    available: number;
    on_route: number;
  };

  vehicles: {
    total: number;
    available: number;
    on_route: number;
  };
}

export interface DashboardAnalytics {
  delivery_completion_rate: number;
  route_completion_rate: number;
  driver_availability_percentage: number;
  vehicle_availability_percentage: number;
  pending_deliveries: number;
  active_routes: number;
}

interface DashboardAnalyticsResponse {
  success: boolean;
  analytics: DashboardAnalytics;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get("/dashboard/summary");

  return response.data;
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const response =
    await api.get<DashboardAnalyticsResponse>(
      "/dashboard/analytics"
    );

  return response.data.analytics;
}