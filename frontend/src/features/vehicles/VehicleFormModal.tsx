import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (vehicle: any) => Promise<void>;
}

export default function VehicleFormModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    vehicle_number: "",
    vehicle_type: "",
    capacity_weight: 0,
    status: "AVAILABLE",
  });

  function update(field: string, value: any) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      await onSubmit({
        ...form,
        capacity_weight: Number(form.capacity_weight),
      });

      setForm({
        vehicle_number: "",
        vehicle_type: "",
        capacity_weight: 0,
        status: "AVAILABLE",
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-[#15181B] p-6 text-white shadow-2xl">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <Dialog.Title className="text-2xl font-bold">
              Add Vehicle
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X size={22} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Vehicle Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Vehicle Number
              </label>

              <input
                type="text"
                value={form.vehicle_number}
                onChange={(e) =>
                  update("vehicle_number", e.target.value.toUpperCase())
                }
                placeholder="Example: KA01AB1234"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                required
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Vehicle Type
              </label>

              <input
                type="text"
                value={form.vehicle_type}
                onChange={(e) =>
                  update("vehicle_type", e.target.value)
                }
                placeholder="Example: Van, Mini Truck, Truck"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                required
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Capacity (kg)
              </label>

              <input
                type="number"
                min="1"
                value={form.capacity_weight}
                onChange={(e) =>
                  update(
                    "capacity_weight",
                    Number(e.target.value)
                  )
                }
                placeholder="Example: 1000"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                required
              />

              <p className="mt-1 text-xs text-zinc-500">
                Maximum weight the vehicle can carry.
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Vehicle Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  update("status", e.target.value)
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-white outline-none focus:border-blue-500"
              >
                <option value="AVAILABLE">Available</option>
                <option value="ON_ROUTE">On Route</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Vehicle..." : "Create Vehicle"}
            </button>

          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}