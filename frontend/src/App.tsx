import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import DashboardPage from "@/features/dashboard/DashboardPage";
import DriversPage from "@/features/drivers/DriversPage";
import VehiclesPage from "@/features/vehicles/VehiclesPage";
import WarehousesPage from "@/features/warehouses/WarehousesPage";
import RoutesPage from "@/features/routes/RoutesPage";
import OptimizationPage from "@/features/optimization/OptimizationPage";
import AnalyticsPage from "@/features/analytics/AnalyticsPage";

import NotificationsPage from "@/features/notifications/NotificationsPage";
import SettingsPage from "@/features/settings/SettingsPage";

import { Toaster } from "sonner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/warehouses" element={<WarehousesPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/optimization" element={<OptimizationPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          <Route
            path="/notifications"
            element={<NotificationsPage />}
          />

          <Route
            path="/settings"
            element={<SettingsPage />}
          />
        </Route>
      </Routes>

      <Toaster
        richColors
        position="top-right"
        closeButton
      />
    </BrowserRouter>
  );
}