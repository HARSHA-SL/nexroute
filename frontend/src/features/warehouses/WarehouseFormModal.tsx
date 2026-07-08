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

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      await onSubmit(form);

      onClose();

      setForm({
        name: "",
        address: "",
        latitude: 0,
        longitude: 0,
      });
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
              Add Warehouse
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
              placeholder="Warehouse Name"
              value={form.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
              className="w-full rounded-lg bg-zinc-900 p-3"
              required
            />

            <input
              placeholder="Address"
              value={form.address}
              onChange={(e) =>
                update("address", e.target.value)
              }
              className="w-full rounded-lg bg-zinc-900 p-3"
              required
            />

            <div className="grid grid-cols-2 gap-4">

              <input
                type="number"
                placeholder="Latitude"
                value={form.latitude}
                onChange={(e) =>
                  update(
                    "latitude",
                    Number(e.target.value)
                  )
                }
                className="rounded-lg bg-zinc-900 p-3"
                required
              />

              <input
                type="number"
                placeholder="Longitude"
                value={form.longitude}
                onChange={(e) =>
                  update(
                    "longitude",
                    Number(e.target.value)
                  )
                }
                className="rounded-lg bg-zinc-900 p-3"
                required
              />

            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 p-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Warehouse"}
            </button>

          </form>

        </Dialog.Content>

      </Dialog.Portal>

    </Dialog.Root>
  );
}