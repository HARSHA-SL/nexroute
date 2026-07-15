import { useEffect, useMemo, useState } from "react";
import EditDriverModal from "./components/EditDriverModal";
import type { Driver } from "@/types/driver";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import {
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Star,
} from "lucide-react";

import { driversService } from "@/services/drivers.service";
import DriverFormModal from "./components/DriverFormModal";

export default function DriversPage() {
const [drivers, setDrivers] = useState<Driver[]>([]);
const [search, setSearch] = useState("");

const [openCreate, setOpenCreate] = useState(false);

const [openEdit, setOpenEdit] = useState(false);

const [selectedDriver, setSelectedDriver] =
  useState<Driver | null>(null);
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

async function createDriver(driver: Omit<Driver, "id">) {
  try {
    await driversService.createDriver(driver);

    await loadDrivers();

    setOpenCreate(false);

    alert("Driver created successfully.");
  } catch (err: any) {
    alert(
      err.response?.data?.detail ??
      "Unable to create driver."
    );
  }
}
async function updateDriver(
  id: number,
  driver: Omit<Driver, "id">
) {
  try {
    await driversService.updateDriver(id, driver);

    await loadDrivers();

    setOpenEdit(false);

    alert("Driver updated successfully.");
  } catch (err: any) {
    alert(
      err.response?.data?.detail ??
      "Unable to update driver."
    );
  }
}

async function deleteDriver(id: number) {
  const confirmed = window.confirm(
    "Delete this driver?"
  );

  if (!confirmed) return;

  try {
    await driversService.deleteDriver(id);

    await loadDrivers();

    alert("Driver deleted successfully.");
  } catch (err: any) {
    alert(
      err?.response?.data?.detail ??
      "Unable to delete driver."
    );
  }
}

  useEffect(() => {
    loadDrivers();
  }, []);

  const filteredDrivers = useMemo(() => {
    const value = search.toLowerCase();

    return drivers.filter((driver: Driver) =>      driver.name.toLowerCase().includes(value) ||
      driver.phone.toLowerCase().includes(value) ||
      driver.license_number.toLowerCase().includes(value)
    );
  }, [drivers, search]);

  return (
    <div className="space-y-8">

      <PageHeader
  title="Drivers"
  description="Manage your delivery drivers."
  action={
    <div className="flex gap-3">

      <Button
        variant="secondary"
        onClick={loadDrivers}
      >
        <RefreshCw size={18} />
        <span className="ml-2">Refresh</span>
      </Button>

      <Button
        onClick={() => setOpenCreate(true)}
      >
        <Plus size={18} />
        <span className="ml-2">New Driver</span>
      </Button>

    </div>
  }
/>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search driver..."
        className="w-96 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
      />

<Card className="overflow-hidden p-0">
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
filteredDrivers.map((driver) => (                <tr
                  key={driver.id}
                  className="border-t border-zinc-800 hover:bg-zinc-900/40 transition-colors"
                >
                  <td className="px-6 py-6 font-semibold">
                    {driver.name}
                  </td>

                  <td>
                    {driver.phone}
                  </td>

                  <td>
                    {driver.license_number}
                  </td>

                  <td>
                    <div className="flex items-center gap-2">
                      <Star
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span>{driver.rating}</span>
                    </div>
                  </td>

                  <td>
                    <Badge status={driver.status} />
                  </td>

                  <td>
                    <div className="flex justify-center gap-4">

                      <button
  onClick={() => {
    setSelectedDriver(driver);
    setOpenEdit(true);
  }}
  className="text-zinc-400 transition hover:text-blue-400"
>
  <Pencil size={18} />
</button>

                      

                      <button
  onClick={() => deleteDriver(driver.id)}
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

      </Card>
                 <DriverFormModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={createDriver}
      />

      <EditDriverModal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedDriver(null);
        }}
        driver={selectedDriver}
        onSubmit={updateDriver}
      />

    </div>
  );
}