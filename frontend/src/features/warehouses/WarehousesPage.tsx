import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { Warehouse } from "@/types/warehouse";
import PageHeader from "@/components/ui/PageHeader";
import {
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Warehouse as WarehouseIcon,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import { warehousesService } from "@/services/warehouses.service";

import WarehouseFormModal from "./WarehouseFormModal";
import EditWarehouseModal from "./EditWarehouseModal";

export default function WarehousesPage() {
const [warehouses, setWarehouses] = useState<Warehouse[]>([]);  const [search, setSearch] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedWarehouse, setSelectedWarehouse] =
  useState<Warehouse | null>(null);

  async function loadWarehouses() {
    try {
      const data =
        await warehousesService.getAllWarehouses();

      setWarehouses(
        Array.isArray(data)
          ? data
          : data.warehouses ?? []
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function createWarehouse(warehouse: Omit<Warehouse, "id">) {
    try {
await warehousesService.createWarehouse(warehouse);
      await loadWarehouses();
      toast.success("Warehouse created successfully.");
      setOpenCreate(false);
    } catch (err: any) {
      toast.error(
  err.response?.data?.detail ??
  "Unable to create warehouse."
);
    }
  }

  async function updateWarehouse(warehouse: Omit<Warehouse, "id">) {
    if (!selectedWarehouse) return;

    try {
      await warehousesService.updateWarehouse(
        selectedWarehouse.id,
        warehouse
      );

      await loadWarehouses();

      setOpenEdit(false);
      toast.success("Warehouse updated successfully.");
      setSelectedWarehouse(null);
    } catch (err: any) {
      toast.error(
  err.response?.data?.detail ??
  "Unable to update warehouse."
);
  }
}

 async function deleteWarehouse(id: number) {
  if (!confirm("Delete this warehouse?"))
    return;

  try {
    await warehousesService.deleteWarehouse(id);

    await loadWarehouses();
    toast.success("Warehouse deleted successfully.");
  } catch (err: any) {
    toast.error(
  err.response?.data?.detail ??
  "Unable to delete warehouse."
);
  }
}

  useEffect(() => {
    loadWarehouses();
  }, []);

  const filteredWarehouses = useMemo(() => {
    const value = search.toLowerCase();

    return warehouses.filter(
      (warehouse: Warehouse) =>
        warehouse.name
          .toLowerCase()
          .includes(value) ||
        warehouse.address
          .toLowerCase()
          .includes(value)
    );
  }, [warehouses, search]);

  return (
    <div className="space-y-8">
            <PageHeader
  title="Warehouses"
  description="Manage warehouses across your network."
  action={
    <div className="flex gap-3">
      <Button
        variant="secondary"
        onClick={loadWarehouses}
      >
        <RefreshCw size={18} />
        <span className="ml-2">Refresh</span>
      </Button>

      <Button
        onClick={() => setOpenCreate(true)}
      >
        <Plus size={18} />
        <span className="ml-2">New Warehouse</span>
      </Button>
    </div>
  }
/>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search warehouse..."
        className="w-96 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
      />

<Card className="overflow-hidden p-0">
        <table className="w-full">

          <thead className="bg-zinc-900">

            <tr className="text-left text-zinc-400">

              <th className="px-6 py-5">
                Warehouse
              </th>

              <th>Address</th>

              <th>Latitude</th>

              <th>Longitude</th>

              <th className="text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredWarehouses.length === 0 ? (

              <tr>

                <td
                  colSpan={5}
                  className="py-12 text-center text-zinc-500"
                >
                  No warehouses found.
                </td>

              </tr>

            ) : (

filteredWarehouses.map((warehouse) => (
                <tr
                  key={warehouse.id}
                  className="border-t border-zinc-800 hover:bg-zinc-900/40"
                >
                                  <td className="px-6 py-6 font-semibold">

                    <div className="flex items-center gap-2">

                      <WarehouseIcon size={16} />

                      {warehouse.name}

                    </div>

                  </td>

                  <td>

                    <div className="flex items-center gap-2">

                      <MapPin size={16} />

                      {warehouse.address}

                    </div>

                  </td>

                  <td>

                    {warehouse.latitude}

                  </td>

                  <td>

                    {warehouse.longitude}

                  </td>

                  <td>

                    <div className="flex justify-center gap-4">

                      

                      <button
                        onClick={() => {
                          setSelectedWarehouse(
                            warehouse
                          );
                          setOpenEdit(true);
                        }}
                        className="text-zinc-400 hover:text-blue-400"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() =>
                          deleteWarehouse(
                            warehouse.id
                          )
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

      </Card>
            <WarehouseFormModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={createWarehouse}
      />

      <EditWarehouseModal
        open={openEdit}
        warehouse={selectedWarehouse}
        onClose={() => {
          setOpenEdit(false);
          setSelectedWarehouse(null);
        }}
        onSubmit={updateWarehouse}
      />

    </div>
  );
}