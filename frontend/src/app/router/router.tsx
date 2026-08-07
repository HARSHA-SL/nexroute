import { createBrowserRouter } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import ProtectedRoute from "@/router/ProtectedRoute";

import LoginPage from "@/features/auth/LoginPage";

import DashboardPage from "@/features/dashboard/DashboardPage";
import DriversPage from "@/features/drivers/DriversPage";
import VehiclesPage from "@/features/vehicles/VehiclesPage";
import WarehousesPage from "@/features/warehouses/WarehousesPage";
import RoutesPage from "@/features/routes/RoutesPage";
import OptimizationPage from "@/features/optimization/OptimizationPage";
import AnalyticsPage from "@/features/analytics/AnalyticsPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import SettingsPage from "@/features/settings/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),

    children: [
      {
        index: true,
        element: <DashboardPage />,
      },

      {
        path: "drivers",
        element: <DriversPage />,
      },

      {
        path: "vehicles",
        element: <VehiclesPage />,
      },

      {
        path: "warehouses",
        element: <WarehousesPage />,
      },

      {
        path: "routes",
        element: <RoutesPage />,
      },

      {
        path: "optimization",
        element: <OptimizationPage />,
      },

      {
        path: "analytics",
        element: <AnalyticsPage />,
      },

      {
        path: "notifications",
        element: <NotificationsPage />,
      },

      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);