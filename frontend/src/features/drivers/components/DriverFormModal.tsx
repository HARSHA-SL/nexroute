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

      onClose();
    } catch (err: any) {
      console.error(err);
      console.log(
        JSON.stringify(err.response?.data, null, 2)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>

        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />

        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 z-50
            max-h-[90vh] w-[560px]
            -translate-x-1/2
            -translate-y-1/2
            overflow-y-auto
            rounded-2xl
            border border-zinc-700
            bg-[#15181B]
            p-7
            text-white
            shadow-2xl
          "
        >

          {/* Header */}

          <div className="mb-7 flex items-center justify-between">

            <div>
              <Dialog.Title className="text-3xl font-bold">
                Add Driver
              </Dialog.Title>

              <p className="mt-1 text-sm text-zinc-400">
                Enter the driver's details below.
              </p>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X size={24} />
              </button>
            </Dialog.Close>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Driver Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Driver Name
              </label>

              <input
                type="text"
                placeholder="e.g. name "
                value={form.name}
                onChange={(e) =>
                  update("name", e.target.value)
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none transition focus:border-blue-500"
                required
              />
            </div>

            {/* Phone */}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Phone Number
              </label>

              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={(e) =>
                  update("phone", e.target.value)
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none transition focus:border-blue-500"
                required
              />
            </div>

            {/* License */}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Driving License Number
              </label>

              <input
                type="text"
                placeholder="e.g. KA18GG3434"
                value={form.license_number}
                onChange={(e) =>
                  update(
                    "license_number",
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 uppercase outline-none transition focus:border-blue-500"
                required
              />
            </div>

            {/* Rating */}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Driver Rating
              </label>

              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) =>
                  update(
                    "rating",
                    Number(e.target.value)
                  )
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none transition focus:border-blue-500"
              />

              <p className="mt-1 text-xs text-zinc-500">
                Rating from 0 to 5.
              </p>
            </div>

            {/* Shift Start */}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Shift Start
              </label>

              <input
                type="datetime-local"
                value={form.shift_start}
                onChange={(e) =>
                  update(
                    "shift_start",
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none transition focus:border-blue-500"
                required
              />

              <p className="mt-1 text-xs text-zinc-500">
                When the driver's working shift begins.
              </p>
            </div>

            {/* Shift End */}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Shift End
              </label>

              <input
                type="datetime-local"
                value={form.shift_end}
                onChange={(e) =>
                  update(
                    "shift_end",
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none transition focus:border-blue-500"
                required
              />

              <p className="mt-1 text-xs text-zinc-500">
                When the driver's working shift ends.
              </p>
            </div>

            {/* Location */}

            <div>

              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Current Location
              </label>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="mb-1 block text-xs text-zinc-500">
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 12.9716"
                    value={form.current_latitude}
                    onChange={(e) =>
                      update(
                        "current_latitude",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-zinc-500">
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 77.5946"
                    value={form.current_longitude}
                    onChange={(e) =>
                      update(
                        "current_longitude",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

              </div>

              <p className="mt-1 text-xs text-zinc-500">
                Use the driver's current GPS coordinates.
              </p>

            </div>

            {/* Status */}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Driver Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  update("status", e.target.value)
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="AVAILABLE">
                  Available
                </option>

                <option value="ON_ROUTE">
                  On Route
                </option>

                <option value="OFF_DUTY">
                  Off Duty
                </option>
              </select>

              <p className="mt-1 text-xs text-zinc-500">
                Current operational status of the driver.
              </p>
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 p-3.5 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Driver..."
                : "Create Driver"}
            </button>

          </form>

        </Dialog.Content>

      </Dialog.Portal>
    </Dialog.Root>
  );
}