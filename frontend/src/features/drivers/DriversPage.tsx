import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Star,
} from "lucide-react";

import { driversService } from "@/services/drivers.service";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  async function loadDrivers() {
    try {
      const data = await driversService.getAllDrivers();

      setDrivers(
        Array.isArray(data)
          ? data
          : data.drivers ?? []
      );
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  const filteredDrivers = useMemo(() => {
    const value = search.toLowerCase();

    return drivers.filter((driver: any) =>
      driver.name.toLowerCase().includes(value) ||
      driver.phone.toLowerCase().includes(value) ||
      driver.license_number.toLowerCase().includes(value)
    );
  }, [drivers, search]);

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold">
            Drivers
          </h1>

          <p className="mt-2 text-lg text-zinc-400">
            Manage your delivery drivers.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadDrivers}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 hover:border-zinc-500"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 hover:bg-blue-700">
            <Plus size={18} />
            New Driver
          </button>
        </div>
      </div>

      {/* Search */}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search driver..."
        className="w-96 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
      />

      {/* Table */}

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <table className="w-full">
          <thead className="bg-zinc-900">
            <tr className="text-left text-zinc-400">
              <th className="px-6 py-5">Driver</th>
              <th>Phone</th>
              <th>License</th>
              <th>Rating</th>
              <th>Status</th>
              <th className="text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-zinc-500"
                >
                  No drivers found.
                </td>
              </tr>
            ) : (
              filteredDrivers.map((driver: any) => (
                <tr
                  key={driver.id}
                  className="border-t border-zinc-800 hover:bg-zinc-900/40"
                >
                  <td className="px-6 py-6 font-semibold">
                    {driver.name}
                  </td>

                  <td>{driver.phone}</td>

                  <td>
                    {driver.license_number}
                  </td>

                  <td>
                    <div className="flex items-center gap-2">
                      <Star
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      {driver.rating}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        driver.status ===
                        "AVAILABLE"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {driver.status}
                    </span>
                  </td>

                  <td>
                    <div className="flex justify-center gap-4">
                      <button className="text-zinc-400 hover:text-white">
                        <Eye size={18} />
                      </button>

                      <button className="text-zinc-400 hover:text-blue-400">
                        <Pencil size={18} />
                      </button>

                      <button className="text-zinc-400 hover:text-red-400">
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
    </div>
  );
}