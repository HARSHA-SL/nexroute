import { Plus, RefreshCw } from "lucide-react";

interface RouteHeaderProps {
  onRefresh: () => void;
}

export default function RouteHeader({
  onRefresh,
}: RouteHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Routes
        </h1>

        <p className="mt-2 text-zinc-400">
          Manage delivery routes across your fleet.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 transition hover:bg-zinc-800"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-medium transition hover:bg-blue-500">
          <Plus size={18} />
          New Route
        </button>
      </div>
    </div>
  );
}