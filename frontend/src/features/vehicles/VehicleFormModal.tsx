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
    fuel_type: "",
    capacity_weight: 0,
    capacity_volume: 0,
    status: "AVAILABLE",
  });

  function update(field: string, value: any) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      await onSubmit(form);

      onClose();

      setForm({
        vehicle_number: "",
        vehicle_type: "",
        fuel_type: "",
        capacity_weight: 0,
        capacity_volume: 0,
        status: "AVAILABLE",
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onClose}
    >
      <Dialog.Portal>

        <Dialog.Overlay className="fixed inset-0 bg-black/60" />

        <Dialog.Content className="fixed left-1/2 top-1/2 w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-[#15181B] p-6">

          <div className="mb-6 flex items-center justify-between">

            <Dialog.Title className="text-2xl font-bold">
              Add Vehicle
            </Dialog.Title>

            <Dialog.Close>
              <X />
            </Dialog.Close>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              placeholder="Vehicle Number"
              value={form.vehicle_number}
              onChange={(e) =>
                update("vehicle_number", e.target.value)
              }
              className="w-full rounded-lg bg-zinc-900 p-3"
              required
            />

            <input
              placeholder="Vehicle Type"
              value={form.vehicle_type}
              onChange={(e) =>
                update("vehicle_type", e.target.value)
              }
              className="w-full rounded-lg bg-zinc-900 p-3"
              required
            />

            <input
              placeholder="Fuel Type"
              value={form.fuel_type}
              onChange={(e) =>
                update("fuel_type", e.target.value)
              }
              className="w-full rounded-lg bg-zinc-900 p-3"
              required
            />

            <div className="grid grid-cols-2 gap-4">

              <input
                type="number"
                placeholder="Capacity Weight (kg)"
                value={form.capacity_weight}
                onChange={(e) =>
                  update(
                    "capacity_weight",
                    Number(e.target.value)
                  )
                }
                className="rounded-lg bg-zinc-900 p-3"
                required
              />

              <input
                type="number"
                placeholder="Capacity Volume"
                value={form.capacity_volume}
                onChange={(e) =>
                  update(
                    "capacity_volume",
                    Number(e.target.value)
                  )
                }
                className="rounded-lg bg-zinc-900 p-3"
                required
              />

            </div>

            <select
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value)
              }
              className="w-full rounded-lg bg-zinc-900 p-3"
            >
              <option value="AVAILABLE">
                AVAILABLE
              </option>

              <option value="IN_TRANSIT">
                IN_TRANSIT
              </option>

              <option value="MAINTENANCE">
                MAINTENANCE
              </option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 p-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Vehicle"}
            </button>

          </form>

        </Dialog.Content>

      </Dialog.Portal>

    </Dialog.Root>
  );
}