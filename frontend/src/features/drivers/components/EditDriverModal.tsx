import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  driver: any;
  onSubmit: (id: number, driver: any) => Promise<void>;
}

export default function EditDriverModal({
  open,
  onClose,
  driver,
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

  useEffect(() => {
    if (!driver) return;

    setForm({
      name: driver.name ?? "",
      phone: driver.phone ?? "",
      license_number: driver.license_number ?? "",
      rating: driver.rating ?? 5,
      shift_start: driver.shift_start
        ? driver.shift_start.slice(0, 16)
        : "",
      shift_end: driver.shift_end
        ? driver.shift_end.slice(0, 16)
        : "",
      current_latitude: driver.current_latitude ?? 0,
      current_longitude: driver.current_longitude ?? 0,
      status: driver.status ?? "AVAILABLE",
    });
  }, [driver]);

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
      await onSubmit(driver.id, {
        ...form,
        shift_start: new Date(
          form.shift_start
        ).toISOString(),

        shift_end: new Date(
          form.shift_end
        ).toISOString(),
      });

      onClose();
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
              Edit Driver
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
              onChange={(e) =>
                update("rating", Number(e.target.value))
              }
              className="w-full rounded-lg bg-zinc-900 p-3"
            />

            <label className="text-sm text-zinc-400">
              Shift Start
            </label>

            <input
              type="datetime-local"
              value={form.shift_start}
              onChange={(e) =>
                update("shift_start", e.target.value)
              }
              className="w-full rounded-lg bg-zinc-900 p-3"
              required
            />

            <label className="text-sm text-zinc-400">
              Shift End
            </label>

            <input
              type="datetime-local"
              value={form.shift_end}
              onChange={(e) =>
                update("shift_end", e.target.value)
              }
              className="w-full rounded-lg bg-zinc-900 p-3"
              required
            />

            <div className="grid grid-cols-2 gap-4">

              <input
                type="number"
                placeholder="Latitude"
                value={form.current_latitude}
                onChange={(e) =>
                  update(
                    "current_latitude",
                    Number(e.target.value)
                  )
                }
                className="rounded-lg bg-zinc-900 p-3"
              />

              <input
                type="number"
                placeholder="Longitude"
                value={form.current_longitude}
                onChange={(e) =>
                  update(
                    "current_longitude",
                    Number(e.target.value)
                  )
                }
                className="rounded-lg bg-zinc-900 p-3"
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

              <option value="ON_ROUTE">
                ON_ROUTE
              </option>

              <option value="OFF_DUTY">
                OFF_DUTY
              </option>
            </select>
                        <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 p-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

          </form>

        </Dialog.Content>

      </Dialog.Portal>

    </Dialog.Root>
  );
}