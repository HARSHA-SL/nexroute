import { useState } from "react";
import { toast } from "sonner";

import { routesService } from "@/services/routes.service";
import RouteMap from "./RouteMap";

import {
  X,
  MapPin,
  Truck,
  User,
  Calendar,
  Clock,
  PackageCheck,
  Play,
  CheckCircle2,
} from "lucide-react";

type RouteStop = {
  stop_id: number;
  delivery_id: number;
  customer_name: string;
  address: string;
  latitude: number;
  longitude: number;
  priority: string;

  status?: string;

  planned_arrival_time?: string;
  planned_departure_time?: string;
};

type RouteDetails = {
  route_id: number;
  status: string;
  route_date: string;

  driver: {
    id: number;
    name: string;
    phone: string;
  };

  vehicle: {
    id: number;
    vehicle_number: string;
    vehicle_type: string;
  };

  warehouse: {
    id: number;
    name: string;
    address: string;
  };

  total_distance_km: number;
  estimated_duration_minutes: number;

  stops: RouteStop[];
};

type Props = {
  open: boolean;
  route: RouteDetails | null;
  onClose: () => void;
  onRefresh: () => Promise<void>;
};

export default function RouteDetailsModal({
  open,
  route,
  onClose,
  onRefresh,
}: Props) {
  const [starting, setStarting] = useState(false);
  const [arrivingStopId, setArrivingStopId] =
    useState<number | null>(null);
  const [deliveringStopId, setDeliveringStopId] =
    useState<number | null>(null);
  const [completing, setCompleting] = useState(false);

  if (!open || !route) {
    return null;
  }

  const routeId = route.route_id;

  /* --------------------------------
     Start Route
  --------------------------------- */

  async function handleStartRoute() {
    try {
      setStarting(true);

      await routesService.startRoute(
        routeId
      );

      toast.success(
        "Route started successfully."
      );

      await onRefresh();
    } catch (error) {
      console.error(
        "Unable to start route:",
        error
      );

      toast.error(
        "Unable to start route."
      );
    } finally {
      setStarting(false);
    }
  }

  /* --------------------------------
     Arrive At Stop
  --------------------------------- */

  async function handleArrive(stopId: number) {
    try {
      setArrivingStopId(stopId);

      await routesService.arriveAtStop(
        stopId
      );

      toast.success(
        "Arrived at delivery stop."
      );

      await onRefresh();
    } catch (error) {
      console.error(
        "Unable to arrive at stop:",
        error
      );

      toast.error(
        "Unable to arrive at stop."
      );
    } finally {
      setArrivingStopId(null);
    }
  }

  /* --------------------------------
     Deliver Package
  --------------------------------- */

  async function handleDeliver(
    stopId: number
  ) {
    try {
      setDeliveringStopId(stopId);

      await routesService.deliverPackage(
        stopId
      );

      toast.success(
        "Package delivered successfully."
      );

      await onRefresh();
    } catch (error) {
      console.error(
        "Unable to deliver package:",
        error
      );

      toast.error(
        "Unable to deliver package."
      );
    } finally {
      setDeliveringStopId(null);
    }
  }

  /* --------------------------------
     Complete Route
  --------------------------------- */

  async function handleCompleteRoute() {
    try {
      setCompleting(true);

      await routesService.completeRoute(
        routeId
      );

      toast.success(
        "Route completed successfully."
      );

      await onRefresh();

      onClose();
    } catch (error) {
      console.error(
        "Unable to complete route:",
        error
      );

      toast.error(
        "Unable to complete route."
      );
    } finally {
      setCompleting(false);
    }
  }

  /* --------------------------------
     Route State
  --------------------------------- */

  const isPlanned =
    route.status === "PLANNED";

  const isInProgress =
    route.status === "IN_PROGRESS";

  const isCompleted =
    route.status === "COMPLETED";

  const allStopsDelivered =
    route.stops.length > 0 &&
    route.stops.every(
      (stop) =>
        stop.status === "DELIVERED"
    );

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#11151A] shadow-2xl">

        {/* --------------------------------
            HEADER
        --------------------------------- */}

        <div className="flex items-center justify-between border-b border-zinc-800 px-8 py-6">

          <div>

            <div className="flex items-center gap-3">

              <h2 className="text-2xl font-bold text-white">
                Route R-{route.route_id}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isCompleted
                    ? "bg-blue-500/15 text-blue-400"
                    : isInProgress
                      ? "bg-green-500/15 text-green-400"
                      : "bg-yellow-500/15 text-yellow-400"
                }`}
              >
                {route.status}
              </span>

            </div>

            <p className="mt-1 text-sm text-zinc-400">
              Route Details & Operations
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-700 p-2 text-zinc-400 transition hover:border-red-500 hover:bg-red-600 hover:text-white"
          >
            <X size={20} />
          </button>

        </div>

        {/* --------------------------------
            CONTENT
        --------------------------------- */}

        <div className="overflow-y-auto p-8">

          {/* ROUTE INFORMATION */}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            {/* DRIVER */}

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

              <div className="mb-3 flex items-center gap-2 text-blue-400">
                <User size={18} />

                <h3 className="font-semibold">
                  Driver
                </h3>
              </div>

              <p className="font-semibold text-white">
                {route.driver?.name ?? "-"}
              </p>

              <p className="text-sm text-zinc-400">
                {route.driver?.phone ?? "-"}
              </p>

            </div>

            {/* VEHICLE */}

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

              <div className="mb-3 flex items-center gap-2 text-green-400">
                <Truck size={18} />

                <h3 className="font-semibold">
                  Vehicle
                </h3>
              </div>

              <p className="font-semibold text-white">
                {route.vehicle?.vehicle_number ?? "-"}
              </p>

              <p className="text-sm text-zinc-400">
                {route.vehicle?.vehicle_type ?? "-"}
              </p>

            </div>

            {/* WAREHOUSE */}

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

              <div className="mb-3 flex items-center gap-2 text-yellow-400">
                <MapPin size={18} />

                <h3 className="font-semibold">
                  Warehouse
                </h3>
              </div>

              <p className="font-semibold text-white">
                {route.warehouse?.name ?? "-"}
              </p>

              <p className="text-sm text-zinc-400">
                {route.warehouse?.address ?? "-"}
              </p>

            </div>

            {/* DATE */}

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

              <div className="mb-3 flex items-center gap-2 text-purple-400">
                <Calendar size={18} />

                <h3 className="font-semibold">
                  Route Date
                </h3>
              </div>

              <p className="font-semibold text-white">
                {route.route_date
                  ? new Date(
                      route.route_date
                    ).toLocaleDateString()
                  : "-"}
              </p>

              <p className="text-sm text-zinc-400">
                {route.route_date
                  ? new Date(
                      route.route_date
                    ).toLocaleTimeString()
                  : "-"}
              </p>

            </div>

          </div>

          {/* --------------------------------
              ROUTE METRICS
          --------------------------------- */}

          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

              <p className="text-sm text-zinc-500">
                Distance
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {route.total_distance_km} km
              </p>

            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

              <p className="text-sm text-zinc-500">
                Estimated Duration
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {route.estimated_duration_minutes} min
              </p>

            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

              <p className="text-sm text-zinc-500">
                Delivery Stops
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {route.stops?.length ?? 0}
              </p>

            </div>

          </div>

          {/* --------------------------------
              ROUTE MAP
          --------------------------------- */}

          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">

            <div className="border-b border-zinc-800 bg-zinc-950 px-5 py-4">

              <h3 className="font-semibold text-white">
                Route Map
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Delivery stops for this route
              </p>

            </div>

            <div className="h-[350px]">
              <RouteMap route={route} />
            </div>

          </div>

          {/* --------------------------------
              DELIVERY STOPS
          --------------------------------- */}

          <div className="mt-6">

            <div className="mb-4">

              <h3 className="text-lg font-semibold text-white">
                Delivery Stops
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Manage the progress of each delivery.
              </p>

            </div>

            <div className="space-y-4">

              {!route.stops ||
              route.stops.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-500">
                  No delivery stops available.
                </div>
              ) : (
                route.stops.map(
                  (stop, index) => {

                    const isPending =
                      !stop.status ||
                      stop.status ===
                        "PENDING";

                    const isArrived =
                      stop.status ===
                      "ARRIVED";

                    const isDelivered =
                      stop.status ===
                      "DELIVERED";

                    return (
                      <div
                        key={stop.stop_id}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                      >

                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                          {/* STOP INFO */}

                          <div className="flex items-start gap-4">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/15 font-semibold text-blue-400">
                              {index + 1}
                            </div>

                            <div>

                              <div className="flex flex-wrap items-center gap-3">

                                <h4 className="font-semibold text-white">
                                  {stop.customer_name}
                                </h4>

                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                                    stop.priority ===
                                    "HIGH"
                                      ? "bg-red-500/15 text-red-400"
                                      : stop.priority ===
                                          "MEDIUM"
                                        ? "bg-yellow-500/15 text-yellow-400"
                                        : "bg-blue-500/15 text-blue-400"
                                  }`}
                                >
                                  {stop.priority}
                                </span>

                                {stop.status && (
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                      isDelivered
                                        ? "bg-green-500/15 text-green-400"
                                        : isArrived
                                          ? "bg-orange-500/15 text-orange-400"
                                          : "bg-zinc-800 text-zinc-400"
                                    }`}
                                  >
                                    {stop.status}
                                  </span>
                                )}

                              </div>

                              <p className="mt-1 text-sm text-zinc-400">
                                {stop.address}
                              </p>

                              <p className="mt-2 text-xs text-zinc-500">
                                Delivery ID:{" "}
                                {stop.delivery_id}
                              </p>

                            </div>

                          </div>

                          {/* ACTION */}

                          <div className="shrink-0">

                            {isInProgress &&
                              isPending && (
                                <button
                                  onClick={() =>
                                    handleArrive(
                                      stop.stop_id
                                    )
                                  }
                                  disabled={
                                    arrivingStopId ===
                                    stop.stop_id
                                  }
                                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <MapPin size={16} />

                                  {arrivingStopId ===
                                  stop.stop_id
                                    ? "Arriving..."
                                    : "Arrive at Stop"}
                                </button>
                              )}

                            {isInProgress &&
                              isArrived && (
                                <button
                                  onClick={() =>
                                    handleDeliver(
                                      stop.stop_id
                                    )
                                  }
                                  disabled={
                                    deliveringStopId ===
                                    stop.stop_id
                                  }
                                  className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <PackageCheck
                                    size={16}
                                  />

                                  {deliveringStopId ===
                                  stop.stop_id
                                    ? "Delivering..."
                                    : "Deliver Package"}
                                </button>
                              )}

                            {isDelivered && (
                              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400">
                                <CheckCircle2
                                  size={17}
                                />

                                Delivered
                              </div>
                            )}

                          </div>

                        </div>

                        {/* PLANNED TIME */}

                        <div className="mt-4 flex flex-wrap gap-6 border-t border-zinc-800 pt-4 text-xs text-zinc-500">

                          <div className="flex items-center gap-2">
                            <Clock size={14} />

                            <span>
                              Arrival:{" "}
                              {stop.planned_arrival_time
                                ? new Date(
                                    stop.planned_arrival_time
                                  ).toLocaleString()
                                : "-"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock size={14} />

                            <span>
                              Departure:{" "}
                              {stop.planned_departure_time
                                ? new Date(
                                    stop.planned_departure_time
                                  ).toLocaleString()
                                : "-"}
                            </span>
                          </div>

                        </div>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </div>

        </div>

        {/* --------------------------------
            FOOTER ACTIONS
        --------------------------------- */}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 bg-[#0D1117] px-8 py-5">

          <div className="text-sm text-zinc-500">

            {isCompleted ? (
              <span className="text-blue-400">
                Route completed.
              </span>
            ) : isInProgress ? (
              <span className="text-green-400">
                Route is currently in progress.
              </span>
            ) : (
              <span>
                Route is ready to start.
              </span>
            )}

          </div>

          <div className="flex gap-3">

            {/* START */}

            {isPlanned && (
              <button
                onClick={handleStartRoute}
                disabled={starting}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play size={17} />

                {starting
                  ? "Starting..."
                  : "Start Route"}
              </button>
            )}

            {/* COMPLETE */}

            {isInProgress &&
              allStopsDelivered && (
                <button
                  onClick={
                    handleCompleteRoute
                  }
                  disabled={completing}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2
                    size={17}
                  />

                  {completing
                    ? "Completing..."
                    : "Complete Route"}
                </button>
              )}

            {/* CLOSE */}

            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800"
            >
              Close
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}