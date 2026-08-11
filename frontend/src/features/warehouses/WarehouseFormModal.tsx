import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (warehouse: any) => Promise<void>;
}

export default function WarehouseFormModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
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
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });

      setForm({
        name: "",
        address: "",
        latitude: 0,
        longitude: 0,
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
              Add Warehouse
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

            {/* Warehouse Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Warehouse Name
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  update("name", e.target.value)
                }
                placeholder="Example: Main Warehouse"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Address
              </label>

              <input
                type="text"
                value={form.address}
                onChange={(e) =>
                  update("address", e.target.value)
                }
                placeholder="Example: Bangalore, Karnataka"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                required
              />
            </div>

            {/* Coordinates */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Location Coordinates
              </label>

              <p className="mb-3 text-xs text-zinc-500">
                Enter the warehouse's GPS coordinates.
              </p>

              <div className="grid grid-cols-2 gap-4">

                {/* Latitude */}
                <div>
                  <label className="mb-2 block text-xs text-zinc-400">
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) =>
                      update(
                        "latitude",
                        Number(e.target.value)
                      )
                    }
                    placeholder="Example: 12.9716"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label className="mb-2 block text-xs text-zinc-400">
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) =>
                      update(
                        "longitude",
                        Number(e.target.value)
                      )
                    }
                    placeholder="Example: 77.5946"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                    required
                  />
                </div>

              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating Warehouse..."
                : "Create Warehouse"}
            </button>

          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}