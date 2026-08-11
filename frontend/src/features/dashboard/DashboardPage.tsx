import { useEffect, useState } from "react";
import { toast } from "sonner";

import DashboardHeader from "./components/DashboardHeader";
import EnterpriseMap from "./components/EnterpriseMap";
import AnalyticsCharts from "./components/AnalyticsCharts";

import {
  getDashboardSummary,
  getDashboardAnalytics,
} from "@/services/dashboard.service";

import type {
  DashboardSummary,
  DashboardAnalytics,
} from "@/services/dashboard.service";

export default function DashboardPage() {
  const [data, setData] =
    useState<DashboardSummary | null>(null);

  const [analytics, setAnalytics] =
    useState<DashboardAnalytics | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const [summary, analyticsData] =
        await Promise.all([
          getDashboardSummary(),
          getDashboardAnalytics(),
        ]);

      setData(summary);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

      toast.error(
        "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-zinc-400">
        Loading dashboard...
      </div>
    );
  }

  if (!data || !analytics) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-zinc-400">
        Unable to load dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <DashboardHeader />

      {/* KPI CARDS */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {/* Deliveries */}
        <div className="rounded-xl border border-[#262B34] bg-[#171B22] p-6">
          <p className="text-sm text-zinc-400">
            Total Deliveries
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {data.deliveries.total}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            {data.deliveries.pending} pending
          </p>
        </div>

        {/* Routes */}
        <div className="rounded-xl border border-[#262B34] bg-[#171B22] p-6">
          <p className="text-sm text-zinc-400">
            Total Routes
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {data.routes.total}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            {data.routes.active} active
          </p>
        </div>

        {/* Drivers */}
        <div className="rounded-xl border border-[#262B34] bg-[#171B22] p-6">
          <p className="text-sm text-zinc-400">
            Total Drivers
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {data.drivers.total}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            {data.drivers.available} available
          </p>
        </div>

        {/* Vehicles */}
        <div className="rounded-xl border border-[#262B34] bg-[#171B22] p-6">
          <p className="text-sm text-zinc-400">
            Total Vehicles
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {data.vehicles.total}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            {data.vehicles.available} available
          </p>
        </div>

      </div>

      {/* MAP + FLEET */}
      <div className="grid gap-6 xl:grid-cols-3">

        {/* LIVE MAP */}
        <div className="xl:col-span-2">
          <EnterpriseMap />
        </div>

        {/* FLEET OVERVIEW */}
        <div className="rounded-2xl border border-[#262B34] bg-[#171B22] p-6">

          <h2 className="text-lg font-semibold text-white">
            Fleet Overview
          </h2>

          <div className="mt-6 space-y-6">

            {/* Vehicles */}
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">
                  Vehicles Available
                </span>

                <span className="text-white">
                  {data.vehicles.available}/
                  {data.vehicles.total}
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{
                    width: `${
                      data.vehicles.total
                        ? (data.vehicles.available /
                            data.vehicles.total) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Drivers */}
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">
                  Drivers Available
                </span>

                <span className="text-white">
                  {data.drivers.available}/
                  {data.drivers.total}
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{
                    width: `${
                      data.drivers.total
                        ? (data.drivers.available /
                            data.drivers.total) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Routes */}
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">
                  Active Routes
                </span>

                <span className="text-white">
                  {data.routes.active}/
                  {data.routes.total}
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-purple-500"
                  style={{
                    width: `${
                      data.routes.total
                        ? (data.routes.active /
                            data.routes.total) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ANALYTICS */}
      <AnalyticsCharts data={analytics} />

    </div>
  );
}