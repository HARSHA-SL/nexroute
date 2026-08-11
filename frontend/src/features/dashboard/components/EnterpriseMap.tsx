import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect, useState } from "react";

import { routesService } from "@/services/routes.service";

/* --------------------------------
   Types
--------------------------------- */

interface RouteStop {
  stop_id: number;
  delivery_id: number;
  customer_name: string;
  address: string;
  latitude: number;
  longitude: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  planned_arrival_time: string;
  planned_departure_time: string;
}

interface RouteData {
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
}

/* --------------------------------
   Map Icons
--------------------------------- */

const createStopIcon = (priority: string) => {
  let background = "#2563eb";
  let border = "#93c5fd";

  if (priority === "HIGH") {
    background = "#dc2626";
    border = "#fca5a5";
  }

  if (priority === "MEDIUM") {
    background = "#f59e0b";
    border = "#fcd34d";
  }

  return new L.DivIcon({
    className: "",
    html: `
      <div style="
        width:42px;
        height:42px;
        border-radius:50%;
        background:${background};
        border:3px solid ${border};
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 0 20px ${background}99;
        font-size:19px;
        color:white;
      ">
        📍
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
};

/* --------------------------------
   Fit Map To Route
--------------------------------- */

function FitRouteToMap({
  stops,
}: {
  stops: RouteStop[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!stops.length) {
      return;
    }

    const bounds = L.latLngBounds(
      stops.map((stop) => [
        stop.latitude,
        stop.longitude,
      ])
    );

    if (stops.length === 1) {
      map.setView(
        [
          stops[0].latitude,
          stops[0].longitude,
        ],
        13
      );
    } else {
      map.fitBounds(bounds, {
        padding: [50, 50],
      });
    }
  }, [map, stops]);

  return null;
}

/* --------------------------------
   Enterprise Map
--------------------------------- */

export default function EnterpriseMap() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadRoutes() {
      try {
        setLoading(true);
        setError(false);

        const data =
          await routesService.getAllRoutes();

        setRoutes(data);
      } catch (err) {
        console.error(
          "Failed to load routes:",
          err
        );

        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadRoutes();
  }, []);

  /* --------------------------------
     Loading
  --------------------------------- */

  if (loading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center rounded-xl bg-[#11151A]">
        <div className="text-center">

          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />

          <p className="text-sm text-zinc-400">
            Loading live routes...
          </p>

        </div>
      </div>
    );
  }

  /* --------------------------------
     Error
  --------------------------------- */

  if (error) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center rounded-xl bg-[#11151A]">

        <div className="text-center">

          <div className="mb-3 text-4xl">
            ⚠️
          </div>

          <h3 className="font-semibold text-white">
            Unable to load routes
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Check that the backend is running.
          </p>

        </div>

      </div>
    );
  }

  /* --------------------------------
     No Routes
  --------------------------------- */

  if (!routes.length) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center rounded-xl bg-[#11151A]">

        <div className="text-center">

          <div className="mb-3 text-4xl">
            🗺️
          </div>

          <h3 className="font-semibold text-white">
            No routes available
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Create a route to see it on the map.
          </p>

        </div>

      </div>
    );
  }

  const route = routes[0];

  const stops = route.stops || [];

  const positions: [number, number][] =
    stops.map((stop) => [
      stop.latitude,
      stop.longitude,
    ]);

  return (
    <div className="relative h-full min-h-[500px] w-full">

      <MapContainer
        center={
          positions.length
            ? positions[0]
            : [12.9716, 77.5946]
        }
        zoom={12}
        zoomControl={true}
        scrollWheelZoom={true}
        style={{
          height: "100%",
          width: "100%",
          minHeight: "500px",
        }}
      >

        {/* OpenStreetMap */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Automatically fit route */}
        <FitRouteToMap stops={stops} />

        {/* Route line */}
        {positions.length >= 2 && (
          <Polyline
            positions={positions}
            pathOptions={{
              color: "#3B82F6",
              weight: 6,
              opacity: 0.9,
            }}
          />
        )}

        {/* Route stops */}
        {stops.map((stop, index) => (
          <Marker
            key={stop.stop_id}
            position={[
              stop.latitude,
              stop.longitude,
            ]}
            icon={createStopIcon(
              stop.priority
            )}
          >
            <Popup>

              <div className="min-w-[190px] p-1">

                <div className="mb-2 flex items-center justify-between">

                  <strong className="text-base">
                    Stop {index + 1}
                  </strong>

                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs">
                    {stop.priority}
                  </span>

                </div>

                <p>
                  <strong>
                    {stop.customer_name}
                  </strong>
                </p>

                <p className="mt-1 text-sm">
                  {stop.address}
                </p>

                <hr className="my-2" />

                <p className="text-xs">
                  Delivery ID:{" "}
                  {stop.delivery_id}
                </p>

                <p className="mt-1 text-xs">
                  Planned arrival:{" "}
                  {new Date(
                    stop.planned_arrival_time
                  ).toLocaleTimeString()}
                </p>

              </div>

            </Popup>
          </Marker>
        ))}

      </MapContainer>

      {/* --------------------------------
          Map Header
      --------------------------------- */}

      <div className="absolute left-4 top-4 z-[1000] rounded-xl border border-[#303640] bg-[#171B22]/95 px-4 py-3 shadow-xl backdrop-blur">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-lg">
            🗺️
          </div>

          <div>

            <h3 className="font-semibold text-white">
              Live Fleet Map
            </h3>

            <p className="text-xs text-zinc-400">
              Backend route monitoring
            </p>

          </div>

        </div>

      </div>

      {/* --------------------------------
          Route Information
      --------------------------------- */}

      <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-[#303640] bg-[#171B22]/95 px-4 py-3 shadow-xl backdrop-blur">

        <div className="grid grid-cols-4 gap-5">

          {/* Route */}
          <div>

            <p className="text-xs text-zinc-500">
              Route
            </p>

            <p className="text-sm font-semibold text-white">
              RTE-{String(
                route.route_id
              ).padStart(3, "0")}
            </p>

          </div>

          {/* Driver */}
          <div>

            <p className="text-xs text-zinc-500">
              Driver
            </p>

            <p className="text-sm font-semibold text-white">
              {route.driver.name}
            </p>

          </div>

          {/* Vehicle */}
          <div>

            <p className="text-xs text-zinc-500">
              Vehicle
            </p>

            <p className="text-sm font-semibold text-white">
              {route.vehicle.vehicle_number}
            </p>

          </div>

          {/* Status */}
          <div>

            <p className="text-xs text-zinc-500">
              Status
            </p>

            <p
              className={`text-sm font-semibold ${
                route.status === "COMPLETED"
                  ? "text-blue-400"
                  : route.status === "IN_PROGRESS"
                    ? "text-green-400"
                    : "text-yellow-400"
              }`}
            >
              {route.status}
            </p>

          </div>

        </div>

      </div>

      {/* --------------------------------
          Legend
      --------------------------------- */}

      <div className="absolute right-4 top-4 z-[1000] rounded-xl border border-[#303640] bg-[#171B22]/95 px-4 py-3 shadow-xl backdrop-blur">

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Route Stops
        </p>

        <div className="space-y-2 text-xs text-zinc-300">

          <div className="flex items-center gap-2">
            <span>🔴</span>
            High Priority
          </div>

          <div className="flex items-center gap-2">
            <span>🟡</span>
            Medium Priority
          </div>

          <div className="flex items-center gap-2">
            <span>🔵</span>
            Low Priority
          </div>

        </div>

      </div>

    </div>
  );
}