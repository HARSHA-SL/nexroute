import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Truck,
} from "lucide-react";

import { vehiclesService } from "@/services/vehicles.service";

import VehicleFormModal from "./VehicleFormModal";
import EditVehicleModal from "./EditVehicleModal";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedVehicle, setSelectedVehicle] =
    useState<any>(null);

  async function loadVehicles() {
    try {
      const data =
        await vehiclesService.getAllVehicles();

      setVehicles(
        Array.isArray(data)
          ? data
          : data.vehicles ?? []
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function createVehicle(vehicle: any) {
    try {
      await vehiclesService.createVehicle(vehicle);

      await loadVehicles();

      setOpenCreate(false);
    } catch (err: any) {
      alert(
        err.response?.data?.detail ??
          "Unable to create vehicle."
      );
    }
  }

  async function updateVehicle(vehicle: any) {
    try {
      await vehiclesService.updateVehicle(
        selectedVehicle.id,
        vehicle
      );

      await loadVehicles();

      setOpenEdit(false);

      setSelectedVehicle(null);
    } catch (err: any) {
      alert(
        err.response?.data?.detail ??
          "Unable to update vehicle."
      );
    }
  }

  async function deleteVehicle(id: number) {
    if (!confirm("Delete this vehicle?")) return;

    try {
      await vehiclesService.deleteVehicle(id);

      await loadVehicles();
    } catch (err: any) {
      alert(
        err.response?.data?.detail ??
          "Unable to delete vehicle."
      );
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    const value = search.toLowerCase();

    return vehicles.filter(
      (vehicle: any) =>
        vehicle.vehicle_number
          .toLowerCase()
          .includes(value) ||
        vehicle.vehicle_type
          .toLowerCase()
          .includes(value) ||
        vehicle.status
          .toLowerCase()
          .includes(value)
    );
  }, [vehicles, search]);

  return (
    <div className="space-y-8">
            <div className="flex items-center justify-between">

        <div>

          <h1 className="text-5xl font-bold">
            Vehicles
          </h1>

          <p className="mt-2 text-lg text-zinc-400">
            Manage your fleet vehicles.
          </p>

        </div>

        <div className="flex gap-3">

          <button
            onClick={loadVehicles}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 hover:border-zinc-500"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 hover:bg-blue-700"
          >
            <Plus size={18} />
            New Vehicle
          </button>

        </div>

      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search vehicle..."
        className="w-96 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
      />

      <div className="overflow-hidden rounded-2xl border border-zinc-800">

        <table className="w-full">

          <thead className="bg-zinc-900">

            <tr className="text-left text-zinc-400">

              <th className="px-6 py-5">
                Vehicle No.
              </th>

              <th>Type</th>

              <th>Capacity</th>

              <th>Status</th>

              <th className="text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredVehicles.length === 0 ? (

              <tr>

                <td
                  colSpan={5}
                  className="py-12 text-center text-zinc-500"
                >
                  No vehicles found.
                </td>

              </tr>

            ) : (

              filteredVehicles.map((vehicle: any) => (

                <tr
                  key={vehicle.id}
                  className="border-t border-zinc-800 hover:bg-zinc-900/40"
                >
                  <td className="px-6 py-6 font-semibold">

                    <div className="flex items-center gap-2">

                      <Truck size={16} />

                      {vehicle.vehicle_number}

                    </div>

                  </td>

                  <td>

                    {vehicle.vehicle_type}

                  </td>

                  <td>

                    {vehicle.capacity_weight} kg

                  </td>

                  <td>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        vehicle.status === "AVAILABLE"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {vehicle.status}
                    </span>

                  </td>

                  <td>

                    <div className="flex justify-center gap-4">

                      <button
                        className="text-zinc-400 hover:text-white"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setOpenEdit(true);
                        }}
                        className="text-zinc-400 hover:text-blue-400"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() =>
                          deleteVehicle(vehicle.id)
                        }
                        className="text-zinc-400 hover:text-red-400"
                      >
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
            <VehicleFormModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={createVehicle}
      />

      <EditVehicleModal
        open={openEdit}
        vehicle={selectedVehicle}
        onClose={() => {
          setOpenEdit(false);
          setSelectedVehicle(null);
        }}
        onSubmit={updateVehicle}
      />

    </div>
  );
}