import {
  Eye,
  Pencil,
  Trash2,
  Truck,
} from "lucide-react";

import StatusBadge from "./StatusBadge";

interface Driver {
  name: string;
}

interface Vehicle {
  vehicle_number: string;
}

interface Warehouse {
  name: string;
}

interface Route {
  route_id: number;
  status: string;
  driver: Driver;
  vehicle: Vehicle;
  warehouse: Warehouse;
  total_distance_km: number;
  estimated_duration_minutes: number;
}

interface Props {
  routes: Route[];
}

export default function RoutesTable({
  routes,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#15181B]">

      <table className="w-full">

        <thead className="border-b border-zinc-800 bg-zinc-900/40">

          <tr className="text-left text-sm text-zinc-400">

            <th className="px-6 py-4">Route</th>
            <th className="px-6 py-4">Driver</th>
            <th className="px-6 py-4">Vehicle</th>
            <th className="px-6 py-4">Warehouse</th>
            <th className="px-6 py-4">Distance</th>
            <th className="px-6 py-4">ETA</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>

          </tr>

        </thead>

        <tbody>

          {routes.map((route) => (

            <tr
              key={route.route_id}
              className="border-b border-zinc-800 transition hover:bg-zinc-900/40"
            >

              <td className="px-6 py-5 font-semibold">
                R-{route.route_id}
              </td>

              <td className="px-6 py-5">
                {route.driver.name}
              </td>

              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <Truck size={16} />
                  {route.vehicle.vehicle_number}
                </div>
              </td>

              <td className="px-6 py-5">
                {route.warehouse.name}
              </td>

              <td className="px-6 py-5">
                {route.total_distance_km} km
              </td>

              <td className="px-6 py-5">
                {route.estimated_duration_minutes} min
              </td>

              <td className="px-6 py-5">
                <StatusBadge status={route.status} />
              </td>

              <td className="px-6 py-5">

                <div className="flex justify-end gap-2">

                  <button className="rounded-lg p-2 transition hover:bg-zinc-800">
                    <Eye size={18} />
                  </button>

                  <button className="rounded-lg p-2 transition hover:bg-zinc-800">
                    <Pencil size={18} />
                  </button>

                  <button className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10">
                    <Trash2 size={18} />
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}