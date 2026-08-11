import { useEffect, useState } from "react";
import EnterpriseMap from "./EnterpriseMap";
import {
  getDashboardSummary,
  type DashboardSummary,
} from "@/services/dashboard.service";

export default function LiveOperations() {
  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await getDashboardSummary();
        setSummary(data);
      } catch (error) {
        console.error(
          "Failed to load dashboard summary:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#262B34] bg-[#171B22]">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#2A2F36] p-6">

        <div>
          <div className="flex items-center gap-3">

            <h2 className="text-xl font-semibold text-white">
              Live Operations
            </h2>

            <span className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              LIVE
            </span>

          </div>

          <p className="mt-1 text-sm text-zinc-400">
            Real-time fleet movement across Bengaluru
          </p>
        </div>

        {/* ROUTE STATUS */}
        <div className="hidden items-center gap-6 sm:flex">

          <div className="text-right">
            <p className="text-xs text-zinc-500">
              Total Routes
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {loading
                ? "..."
                : summary?.routes.total ?? 0}
            </p>
          </div>

          <div className="h-8 w-px bg-[#2A2F36]" />

          <div className="text-right">
            <p className="text-xs text-zinc-500">
              Active Routes
            </p>

            <p className="mt-1 text-sm font-semibold text-green-400">
              {loading
                ? "..."
                : summary?.routes.active ?? 0}
            </p>
          </div>

        </div>

      </div>

      {/* MAP */}
      <div className="h-[520px] w-full">
        <EnterpriseMap />
      </div>

      {/* LIVE STATUS */}
      <div className="grid grid-cols-2 border-t border-[#2A2F36] sm:grid-cols-4">

        {/* VEHICLES */}
        <div className="border-r border-[#2A2F36] p-4">

          <p className="text-xs text-zinc-500">
            Vehicles
          </p>

          <p className="mt-1 text-lg font-semibold text-white">
            {loading
              ? "..."
              : summary?.vehicles.total ?? 0}
          </p>

          <p className="text-xs text-green-400">
            {loading
              ? "Loading..."
              : `${summary?.vehicles.available ?? 0} available`}
          </p>

        </div>

        {/* DRIVERS */}
        <div className="border-r border-[#2A2F36] p-4">

          <p className="text-xs text-zinc-500">
            Drivers
          </p>

          <p className="mt-1 text-lg font-semibold text-white">
            {loading
              ? "..."
              : summary?.drivers.total ?? 0}
          </p>

          <p className="text-xs text-green-400">
            {loading
              ? "Loading..."
              : `${summary?.drivers.available ?? 0} available`}
          </p>

        </div>

        {/* ROUTES */}
        <div className="border-r border-[#2A2F36] p-4">

          <p className="text-xs text-zinc-500">
            Routes
          </p>

          <p className="mt-1 text-lg font-semibold text-white">
            {loading
              ? "..."
              : summary?.routes.total ?? 0}
          </p>

          <p className="text-xs text-blue-400">
            {loading
              ? "Loading..."
              : `${summary?.routes.completed ?? 0} completed`}
          </p>

        </div>

        {/* DELIVERIES */}
        <div className="p-4">

          <p className="text-xs text-zinc-500">
            Deliveries
          </p>

          <p className="mt-1 text-lg font-semibold text-white">
            {loading
              ? "..."
              : summary?.deliveries.total ?? 0}
          </p>

          <p className="text-xs text-zinc-400">
            {loading
              ? "Loading..."
              : `${summary?.deliveries.delivered ?? 0} delivered`}
          </p>

        </div>

      </div>

    </section>
  );
}