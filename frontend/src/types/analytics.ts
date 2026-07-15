export interface KPIs {
  total_deliveries: number;
  total_routes: number;
  total_drivers: number;
  total_vehicles: number;
  total_warehouses: number;

  pending_deliveries: number;
  delivered_deliveries: number;

  in_progress_routes: number;
  completed_routes: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface DriverPerformance {
  driver: string;
  completed_routes: number;
}

export interface WarehousePerformance {
  warehouse: string;
  total_routes: number;
}

export interface AnalyticsDashboard {
  kpis: KPIs;

  delivery_status: StatusCount[];

  route_status: StatusCount[];

  vehicle_status: StatusCount[];

  driver_performance: DriverPerformance[];

  warehouse_performance: WarehousePerformance[];
}