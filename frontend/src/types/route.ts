import type { DeliveryStatus, DeliveryPriority } from "./delivery";

export type RouteStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface RouteDriver {
  id: number;
  name: string;
  phone: string;
}

export interface RouteVehicle {
  id: number;
  vehicle_number: string;
  vehicle_type: string;
}

export interface RouteWarehouse {
  id: number;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface RouteStop {
  stop_id: number;
  stop_order: number;
  delivery_id: number;

  customer_name: string;
  address: string;

  latitude: number;
  longitude: number;

  priority: DeliveryPriority;
  status: DeliveryStatus;

  planned_arrival_time: string;
  planned_departure_time: string;

  actual_arrival_time: string | null;
  actual_departure_time: string | null;
}

export interface Route {
  route_id: number;

  status: RouteStatus;

  route_date: string;

  driver: RouteDriver;

  vehicle: RouteVehicle;

  warehouse: RouteWarehouse;

  total_distance_km: number;

  estimated_duration_minutes: number;

  stops: RouteStop[];
}