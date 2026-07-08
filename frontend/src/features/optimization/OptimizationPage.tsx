import { useState } from "react";
import {
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import api from "@/api/axios";

export default function OptimizationPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function runOptimization() {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/optimization/run");

console.log(response.data);

setSuccess(response.data.success);
setMessage(
  response.data.message ??
  `Routes Created: ${response.data.routes_created ?? 0}
Deliveries Assigned: ${response.data.deliveries_assigned ?? 0}`
);

      
    } catch (err: any) {
      setSuccess(false);

      setMessage(
        err.response?.data?.detail ??
          "Optimization failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 p-8">
              <div>

        <h1 className="text-5xl font-bold">
          Route Optimization
        </h1>

        <p className="mt-2 text-lg text-zinc-400">
          Generate optimized delivery routes using the
          available drivers, vehicles and pending deliveries.
        </p>

      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

        <div className="space-y-6">

          <div>

            <h2 className="text-2xl font-semibold">
              Run Optimization Engine
            </h2>

            <p className="mt-2 text-zinc-400">
              The optimization engine automatically:
            </p>

          </div>

          <ul className="space-y-3 text-zinc-300">

            <li>✓ Finds all pending deliveries</li>

            <li>✓ Finds available drivers</li>

            <li>✓ Finds available vehicles</li>

            <li>✓ Calculates the best delivery routes</li>

            <li>✓ Creates optimized routes automatically</li>

          </ul>

          <button
            onClick={runOptimization}
            disabled={loading}
            className="flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-4 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Running Optimization...
              </>
            ) : (
              <>
                <Play size={20} />
                Run Optimization
              </>
            )}
          </button>
                    {message && (
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 ${
                success
                  ? "border-green-700 bg-green-500/10 text-green-400"
                  : "border-red-700 bg-red-500/10 text-red-400"
              }`}
            >
              {success ? (
                <CheckCircle2 size={22} />
              ) : (
                <AlertCircle size={22} />
              )}

              <span>{message}</span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}