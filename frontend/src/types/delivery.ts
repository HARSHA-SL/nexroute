export type DeliveryPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type DeliveryStatus =
  | "PENDING"
  | "ARRIVED"
  | "DELIVERED";

export interface Delivery {
  id: number;
  customer_name: string;
  address: string;
  latitude: number;
  longitude: number;
  priority: DeliveryPriority;
  status: DeliveryStatus;
}