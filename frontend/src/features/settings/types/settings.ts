export interface Settings {
  id: number;

  theme: string;
  language: string;
  timezone: string;

  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;

  route_alerts: boolean;
  maintenance_alerts: boolean;

  two_factor: boolean;
  session_timeout: number;

  maps_api_key: string;
  optimization_engine: string;
  default_warehouse: string;
}