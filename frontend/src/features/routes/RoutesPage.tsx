import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, RefreshCw, Trash2, Truck } from "lucide-react";

import { routesService } from "@/services/routes.service";
import RouteDetailsModal from "./RouteDetailsModal";
export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [openDetails, setOpenDetails] = useState(false);

  async function loadRoutes() {
    try {
      const data = await routesService.getAllRoutes();

      // Handles both:
      // API returns [...]
      // API returns { routes: [...] }
      setRoutes(Array.isArray(data) ? data : data.routes ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadRoutes();
  }, []);

  const filteredRoutes = useMemo(() => {
    const value = search.toLowerCase();

    return routes.filter((route: any) => {
      return (
        route.route_id.toString().includes(value) ||
        route.driver?.name?.toLowerCase().includes(value) ||
        route.vehicle?.vehicle_number?.toLowerCase().includes(value) ||
        route.warehouse?.name?.toLowerCase().includes(value)
      );
    });
  }, [routes, search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold">Routes</h1>

          <p className="mt-2 text-lg text-zinc-400">
            Manage delivery routes across your fleet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRoutes}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 transition hover:border-zinc-500"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by route, driver, vehicle or warehouse..."
          className="w-96 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none transition focus:border-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <table className="w-full">
          <thead className="bg-zinc-900">
            <tr className="text-left text-zinc-400">
              <th className="px-6 py-5">Route</th>
              <th>Driver</th>
              <th>Vehicle</th>
              <th>Warehouse</th>
              <th>Distance</th>
              <th>ETA</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRoutes.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-zinc-500"
                >
                  No routes found.
                </td>
              </tr>
            ) : (
              filteredRoutes.map((route: any) => (
                <tr
                  key={route.route_id}
                  className="border-t border-zinc-800 hover:bg-zinc-900/40"
                >
                  <td className="px-6 py-6 font-semibold">
                    R-{route.route_id}
                  </td>

                  <td>{route.driver?.name}</td>

                  <td>
                    <div className="flex items-center gap-2">
                      <Truck size={16} />
                      {route.vehicle?.vehicle_number}
                    </div>
                  </td>

                  <td>{route.warehouse?.name}</td>

                  <td>{route.total_distance_km} km</td>

                  <td>{route.estimated_duration_minutes} min</td>

                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        route.status === "COMPLETED"
                          ? "bg-green-500/20 text-green-400"
                          : route.status === "IN_PROGRESS"
                          ? "bg-blue-500/20 text-blue-400"
                          : route.status === "PLANNED"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {route.status}
                    </span>
                  </td>

                  <td>
                    <div className="flex justify-center gap-4">
                      <button
  onClick={async () => {
    try {
      const data = await routesService.getRoute(route.route_id);

      setSelectedRoute(data.route);
      setOpenDetails(true);
    } catch (err) {
      console.error(err);
    }
  }}
  className="text-zinc-400 hover:text-white"
>
  <Eye size={18} />
</button>

                      <button className="text-zinc-400 transition hover:text-blue-400">
                        <Pencil size={18} />
                      </button>

                      <button className="text-zinc-400 transition hover:text-red-400">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
            

      <RouteDetailsModal
        open={openDetails}
        route={selectedRoute}
        onClose={() => {
          setOpenDetails(false);
          setSelectedRoute(null);
        }}
      />

    
    </div>
  );
}