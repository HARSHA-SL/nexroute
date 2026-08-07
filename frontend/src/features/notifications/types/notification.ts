export type NotificationPriority =
  | "Low"
  | "Medium"
  | "High";

export type NotificationCategory =
  | "Driver"
  | "Vehicle"
  | "Route"
  | "Warehouse"
  | "System";

export interface Notification {
  id: number;

  title: string;

  message: string;

  category: NotificationCategory;

  priority: NotificationPriority;

  is_read: boolean;

  created_at: string;
}