import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (driver: any) => Promise<void>;
}

export default function DriverFormModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    license_number: "",
    rating: 5,
    shift_start: "",
    shift_end: "",
    current_latitude: 0,
    current_longitude: 0,
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
      const payload = {
  ...form,
  shift_start: form.shift_start
    ? new Date(form.shift_start).toISOString()
    : null,

  shift_end: form.shift_end
    ? new Date(form.shift_end).toISOString()
    : null,
};

console.log("Sending Payload:", payload);

await onSubmit(payload);

      onClose();

      setForm({
        name: "",
        phone: "",
        license_number: "",
        rating: 5,
        shift_start: "",
        shift_end: "",
        current_latitude: 0,
        current_longitude: 0,
        status: "AVAILABLE",
      });
   } catch (err: any) {
   console.log(JSON.stringify(err.response?.data, null, 2));
    console.error(err);
} finally {
    setLoading(false);
}
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>

        <Dialog.Overlay className="fixed inset-0 bg-black/60" />

        <Dialog.Content className="fixed left-1/2 top-1/2 w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-[#15181B] p-6">

          <div className="mb-6 flex items-center justify-between">

            <Dialog.Title className="text-2xl font-bold">
              Add Driver
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
              placeholder="Driver Name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full rounded-lg bg-zinc-900 p-3"
              required
            />

            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full rounded-lg bg-zinc-900 p-3"
              required
            />

            <input
              placeholder="License Number"
              value={form.license_number}
              onChange={(e) => update("license_number", e.target.value)}
              className="w-full rounded-lg bg-zinc-900 p-3"
              required
            />

            <input
              type="number"
              placeholder="Rating"
              value={form.rating}
              onChange={(e) => update("rating", Number(e.target.value))}
              className="w-full rounded-lg bg-zinc-900 p-3"
            />

            <label className="text-sm text-zinc-400">
              Shift Start
            </label>

            <input
  type="datetime-local"
  value={form.shift_start}
  onChange={(e) => update("shift_start", e.target.value)}
  className="w-full rounded-lg bg-zinc-900 p-3"
  required
/>

            <label className="text-sm text-zinc-400">
              Shift End
            </label>

            <input
  type="datetime-local"
  value={form.shift_end}
  onChange={(e) => update("shift_end", e.target.value)}
  className="w-full rounded-lg bg-zinc-900 p-3"
  required
/>

            <div className="grid grid-cols-2 gap-4">

              <input
                type="number"
                placeholder="Latitude"
                className="rounded-lg bg-zinc-900 p-3"
                value={form.current_latitude}
                onChange={(e) =>
                  update("current_latitude", Number(e.target.value))
                }
              />

              <input
                type="number"
                placeholder="Longitude"
                className="rounded-lg bg-zinc-900 p-3"
                value={form.current_longitude}
                onChange={(e) =>
                  update("current_longitude", Number(e.target.value))
                }
              />

            </div>

            <select
              className="w-full rounded-lg bg-zinc-900 p-3"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option>AVAILABLE</option>
              <option>ON_ROUTE</option>
              <option>OFF_DUTY</option>
            </select>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 p-3 font-semibold hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create Driver"}
            </button>

          </form>

        </Dialog.Content>

      </Dialog.Portal>
    </Dialog.Root>
  );
}