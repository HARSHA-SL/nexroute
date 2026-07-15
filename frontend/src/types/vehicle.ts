export type VehicleStatus =
  | "AVAILABLE"
  | "ON_ROUTE"
  | "MAINTENANCE";

export interface Vehicle {
  id: number;
  vehicle_number: string;
  vehicle_type: string;
  capacity_weight: number;
  status: VehicleStatus;
}