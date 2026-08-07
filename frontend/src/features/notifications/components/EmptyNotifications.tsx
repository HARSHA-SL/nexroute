import { BellOff } from "lucide-react";

export default function EmptyNotifications() {
  return (
    <div className="rounded-xl border border-dashed border-[#30363d] p-12 text-center">
      <BellOff
        className="mx-auto mb-4 text-gray-500"
        size={50}
      />

      <h2 className="text-xl font-semibold text-white">
        No Notifications
      </h2>

      <p className="mt-2 text-gray-400">
        Everything looks good. No new alerts.
      </p>
    </div>
  );
}