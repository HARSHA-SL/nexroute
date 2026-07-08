import { useState } from "react";
import { routesService } from "@/services/routes.service";
import {
  X,
  MapPin,
  Truck,
  User,
  Calendar,
  Clock,
} from "lucide-react";

type Props = {
  open: boolean;
  route: any;
  onClose: () => void;
};

export default function RouteDetailsModal({
  open,
  route,
  onClose,
}: Props) {
  if (!open || !route) return null;
  const [starting, setStarting] = useState(false);

async function handleStartRoute() {
  try {
    setStarting(true);

    await routesService.startRoute(route.route_id);

    route.status = "IN_PROGRESS";
  } catch (err) {
    console.error(err);
    alert("Unable to start route.");
  } finally {
    setStarting(false);
  }
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">

        <div className="flex items-center justify-between border-b border-zinc-800 px-8 py-6">

          <div>
            <h2 className="text-3xl font-bold">
              Route #{route.route_id}
            </h2>

            <p className="mt-1 text-zinc-400">
              Route Details
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-700 p-2 hover:border-zinc-500"
          >
            <X size={22} />
          </button>

        </div>

        <div className="space-y-8 p-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="mb-3 flex items-center gap-2 text-blue-400">
                <User size={18} />
                <h3 className="font-semibold">Driver</h3>
              </div>

              <p className="font-semibold">
                {route.driver.name}
              </p>

              <p className="text-sm text-zinc-400">
                {route.driver.phone}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="mb-3 flex items-center gap-2 text-green-400">
                <Truck size={18} />
                <h3 className="font-semibold">Vehicle</h3>
              </div>

              <p className="font-semibold">
                {route.vehicle.vehicle_number}
              </p>

              <p className="text-sm text-zinc-400">
                {route.vehicle.vehicle_type}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="mb-3 flex items-center gap-2 text-yellow-400">
                <MapPin size={18} />
                <h3 className="font-semibold">Warehouse</h3>
              </div>

              <p className="font-semibold">
                {route.warehouse.name}
              </p>

              <p className="text-sm text-zinc-400">
                {route.warehouse.address}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="mb-3 flex items-center gap-2 text-purple-400">
                <Calendar size={18} />
                <h3 className="font-semibold">Route Status</h3>
              </div>

              <p className="font-semibold">
                {route.status}
              </p>
              {route.status === "PLANNED" && (
  <button
    onClick={handleStartRoute}
    disabled={starting}
    className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
  >
    {starting ? "Starting..." : "Start Route"}
  </button>
)}

              <div className="mt-2 flex gap-8 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  {route.total_distance_km} km
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  {route.estimated_duration_minutes} mins
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-2xl font-semibold">
              Delivery Stops
            </h3>

            <div className="space-y-4">
              {route.stops.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-500">
                  No delivery stops available.
                </div>
              ) : (
                route.stops.map((stop: any) => (
                  <div
                    key={stop.stop_order}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold">
                          Stop {stop.stop_order}
                        </h4>

                        <p className="mt-2 font-medium">
                          {stop.customer_name}
                        </p>

                        <p className="text-sm text-zinc-400">
                          {stop.address}
                        </p>
                      </div>

                      <div className="text-right text-sm text-zinc-400">
                        <p>
                          Planned Arrival
                        </p>

                        <p className="font-medium text-white">
                          {stop.planned_arrival_time
                            ? new Date(
                                stop.planned_arrival_time
                              ).toLocaleString()
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end border-t border-zinc-800 px-8 py-6">
            <button
              onClick={onClose}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}