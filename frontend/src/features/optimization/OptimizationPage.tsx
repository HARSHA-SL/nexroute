import { useState } from "react";
import {
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Route as RouteIcon,
  PackageCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "@/api/axios";

export default function OptimizationPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const [routesCreated, setRoutesCreated] = useState(0);
  const [deliveriesAssigned, setDeliveriesAssigned] =
    useState(0);

  async function runOptimization() {
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await api.post(
        "/optimization/run"
      );

      console.log("Optimization response:", response.data);

      const data = response.data;

      setSuccess(Boolean(data.success));

      setRoutesCreated(
        data.routes_created ?? 0
      );

      setDeliveriesAssigned(
        data.deliveries_assigned ?? 0
      );

      setMessage(
        data.message ??
          "Optimization completed successfully."
      );
    } catch (err: any) {
      console.error(err);

      setSuccess(false);

      setMessage(
        err.response?.data?.detail ??
          "Optimization failed."
      );

      setRoutesCreated(0);
      setDeliveriesAssigned(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-4xl font-bold text-white">
          Route Optimization
        </h1>

        <p className="mt-2 text-zinc-400">
          Generate optimized delivery routes using
          available drivers, vehicles and pending
          deliveries.
        </p>
      </div>

      {/* Main Card */}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

        <div className="space-y-7">

          <div>
            <h2 className="text-2xl font-semibold text-white">
              Run Optimization Engine
            </h2>

            <p className="mt-2 text-zinc-400">
              NexRoute will analyze the current delivery
              workload and automatically generate optimized
              routes.
            </p>
          </div>

          {/* Process */}

          <div className="grid gap-4 md:grid-cols-2">

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="font-semibold text-white">
                01. Pending Deliveries
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Finds deliveries waiting to be assigned.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="font-semibold text-white">
                02. Available Resources
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Finds available drivers and vehicles.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="font-semibold text-white">
                03. Route Calculation
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Calculates optimized delivery sequences.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="font-semibold text-white">
                04. Route Creation
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Creates routes ready for operations.
              </p>
            </div>

          </div>

          {/* Button */}

          <button
            type="button"
            onClick={runOptimization}
            disabled={loading}
            className="flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

          {/* Result */}

          {message && (
            <div
              className={`rounded-xl border p-5 ${
                success
                  ? "border-green-700 bg-green-500/10"
                  : "border-red-700 bg-red-500/10"
              }`}
            >

              <div className="flex items-start gap-3">

                {success ? (
                  <CheckCircle2
                    size={24}
                    className="mt-0.5 text-green-400"
                  />
                ) : (
                  <AlertCircle
                    size={24}
                    className="mt-0.5 text-red-400"
                  />
                )}

                <div>

                  <p
                    className={`font-semibold ${
                      success
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {success
                      ? "Optimization Completed"
                      : "Optimization Failed"}
                  </p>

                  <p className="mt-1 text-sm text-zinc-300">
                    {message}
                  </p>

                </div>

              </div>

              {success && (
                <div className="mt-5 grid grid-cols-2 gap-4">

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

                    <div className="flex items-center gap-2 text-blue-400">
                      <RouteIcon size={18} />

                      <span className="text-sm">
                        Routes Created
                      </span>
                    </div>

                    <p className="mt-2 text-3xl font-bold text-white">
                      {routesCreated}
                    </p>

                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

                    <div className="flex items-center gap-2 text-green-400">
                      <PackageCheck size={18} />

                      <span className="text-sm">
                        Deliveries Assigned
                      </span>
                    </div>

                    <p className="mt-2 text-3xl font-bold text-white">
                      {deliveriesAssigned}
                    </p>

                  </div>

                </div>
              )}

              {success && (
                <button
                  type="button"
                  onClick={() => navigate("/routes")}
                  className="mt-5 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  View Generated Routes →
                </button>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}