import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, RefreshCw, Trash2, Truck } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import type { Route } from "@/types/route";
import { routesService } from "@/services/routes.service";
import RouteDetailsModal from "./RouteDetailsModal";
export default function RoutesPage() {
const [routes, setRoutes] = useState<Route[]>([]);  
const [search, setSearch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
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
      <PageHeader
  title="Routes"
  description="Manage delivery routes across your fleet."
  action={
    <Button
      variant="secondary"
      onClick={loadRoutes}
    >
      <RefreshCw size={18} />
      <span className="ml-2">Refresh</span>
    </Button>
  }
/>

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
<Card className="overflow-hidden p-0">        <table className="w-full">
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
              filteredRoutes.map((route) => (
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
                    <Badge status={route.status} />
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
      </Card>
            

      <RouteDetailsModal
  open={openDetails}
  route={selectedRoute}
  onClose={() => setOpenDetails(false)}
  onRefresh={async () => {
    if (!selectedRoute) return;

    const data = await routesService.getRoute(
      selectedRoute.route_id
    );

    setSelectedRoute(data.route);

    await loadRoutes();
  }}
/>

    
    </div>
  );
}

