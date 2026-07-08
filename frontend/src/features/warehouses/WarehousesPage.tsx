import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Warehouse,
  MapPin,
} from "lucide-react";

import api from "@/api/axios";
import { warehousesService } from "@/services/warehouses.service";

import WarehouseFormModal from "./WarehouseFormModal";
import EditWarehouseModal from "./EditWarehouseModal";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedWarehouse, setSelectedWarehouse] =
    useState<any>(null);

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

  async function createWarehouse(warehouse: any) {
    try {
      await api.post("/warehouses", warehouse);

      await loadWarehouses();

      setOpenCreate(false);
    } catch (err: any) {
      alert(
        err.response?.data?.detail ??
          "Unable to create warehouse."
      );
    }
  }

  async function updateWarehouse(
  warehouse: any
) {
  try {
    await warehousesService.updateWarehouse(
      selectedWarehouse.id,
      warehouse
    );

    await loadWarehouses();

    setOpenEdit(false);

    setSelectedWarehouse(null);
  } catch (err: any) {
    alert(
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
  } catch (err: any) {
    alert(
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
      (warehouse: any) =>
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
            <div className="flex items-center justify-between">

        <div>

          <h1 className="text-5xl font-bold">
            Warehouses
          </h1>

          <p className="mt-2 text-lg text-zinc-400">
            Manage warehouses across your network.
          </p>

        </div>

        <div className="flex gap-3">

          <button
            onClick={loadWarehouses}
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
            New Warehouse
          </button>

        </div>

      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search warehouse..."
        className="w-96 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
      />

      <div className="overflow-hidden rounded-2xl border border-zinc-800">

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

              filteredWarehouses.map((warehouse: any) => (

                <tr
                  key={warehouse.id}
                  className="border-t border-zinc-800 hover:bg-zinc-900/40"
                >
                                  <td className="px-6 py-6 font-semibold">

                    <div className="flex items-center gap-2">

                      <Warehouse size={16} />

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
                        className="text-zinc-400 hover:text-white"
                      >
                        <Eye size={18} />
                      </button>

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

      </div>
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