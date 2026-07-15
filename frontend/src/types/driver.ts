export type DriverStatus =
  | "AVAILABLE"
  | "ON_ROUTE";

export interface Driver {
  id: number;
  name: string;
  phone: string;
  license_number: string;
  rating: number;
  status: DriverStatus;
}