import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import {
  stopIcon,
  truckIcon,
} from "@/utils/mapIcons";

import L from "leaflet";
import { useEffect, useState } from "react";

import { getDrivingRoute } from "@/services/openRoute.service";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* --------------------------------
   Leaflet default icon fix
--------------------------------- */

delete (L.Icon.Default.prototype as any)
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* --------------------------------
   Types
--------------------------------- */

type RouteStop = {
  stop_id: number;
  delivery_id: number;
  customer_name: string;
  address: string;
  latitude: number;
  longitude: number;
  priority: string;
  planned_arrival_time?: string;
  planned_departure_time?: string;
  status?: string;
};

type RouteDetails = {
  route_id: number;
  status: string;

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
  route: RouteDetails;
};

/* --------------------------------
   Fit map to route
--------------------------------- */

function FitBounds({
  points,
}: {
  points: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, {
      padding: [60, 60],
    });
  }, [map, points]);

  return null;
}

/* --------------------------------
   Route Map
--------------------------------- */

export default function RouteMap({
  route,
}: Props) {
  const stops = route.stops ?? [];

  const [roadRoute, setRoadRoute] =
    useState<[number, number][]>([]);

  const [truckPosition, setTruckPosition] =
    useState<[number, number] | null>(null);

  const [loadingRoute, setLoadingRoute] =
    useState(false);

  /* --------------------------------
     Load road route
  --------------------------------- */

  useEffect(() => {
    async function loadRoute() {
      if (stops.length < 2) {
        setRoadRoute([]);
        setTruckPosition(
          stops.length === 1
            ? [
                stops[0].latitude,
                stops[0].longitude,
              ]
            : null
        );

        return;
      }

      try {
        setLoadingRoute(true);

        const coordinates: [
          number,
          number
        ][] = stops.map((stop) => [
          stop.longitude,
          stop.latitude,
        ]);

        console.log(
          "Route coordinates:",
          coordinates
        );

        const data =
          await getDrivingRoute(
            coordinates
          );

        console.log(
          "OpenRouteService response:",
          data
        );

        const points: [
          number,
          number
        ][] =
          data.features[0].geometry.coordinates.map(
            ([lng, lat]: [
              number,
              number
            ]) => [lat, lng]
          );

        setRoadRoute(points);

        if (points.length > 0) {
          setTruckPosition(points[0]);
        }
      } catch (error) {
        console.error(
          "Unable to calculate driving route:",
          error
        );

        /*
         * Fallback:
         * Draw a straight line between
         * the real backend stops if
         * OpenRouteService fails.
         */

        const fallback: [
          number,
          number
        ][] = stops.map((stop) => [
          stop.latitude,
          stop.longitude,
        ]);

        setRoadRoute(fallback);

        if (fallback.length > 0) {
          setTruckPosition(fallback[0]);
        }
      } finally {
        setLoadingRoute(false);
      }
    }

    loadRoute();
  }, [stops]);

  /* --------------------------------
     Animate vehicle
  --------------------------------- */

  useEffect(() => {
    /*
     * Don't animate completed routes.
     */

    if (
      route.status !== "IN_PROGRESS"
    ) {
      return;
    }

    if (roadRoute.length === 0) {
      return;
    }

    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex += 1;

      if (
        currentIndex >=
        roadRoute.length
      ) {
        currentIndex = 0;
      }

      setTruckPosition(
        roadRoute[currentIndex]
      );
    }, 300);

    return () => {
      clearInterval(interval);
    };
  }, [roadRoute, route.status]);

  /* --------------------------------
     Map points
  --------------------------------- */

  const stopPoints: [
    number,
    number
  ][] = stops.map((stop) => [
    stop.latitude,
    stop.longitude,
  ]);

  const mapCenter: [
    number,
    number
  ] =
    stopPoints.length > 0
      ? stopPoints[0]
      : [12.9716, 77.5946];

  return (
    <div className="relative h-full w-full">

      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{
          height: "100%",
          width: "100%",
          minHeight: "350px",
        }}
      >

        {/* OpenStreetMap */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Automatically fit map */}

        <FitBounds points={stopPoints} />

        {/* Road route */}

        {roadRoute.length >= 2 && (
          <Polyline
            positions={roadRoute}
            pathOptions={{
              color: "#3B82F6",
              weight: 6,
              opacity: 0.9,
            }}
          />
        )}

        {/* Delivery stops */}

        {stops.map(
          (stop, index) => (
            <Marker
              key={stop.stop_id}
              icon={stopIcon(index + 1)}
              position={[
                stop.latitude,
                stop.longitude,
              ]}
            >
              <Popup>

                <div className="min-w-[190px] p-1">

                  <strong>
                    Stop {index + 1}
                  </strong>

                  <p className="mt-2 font-medium">
                    {stop.customer_name}
                  </p>

                  <p className="text-sm">
                    {stop.address}
                  </p>

                  <p className="mt-2 text-xs">
                    Priority:{" "}
                    {stop.priority}
                  </p>

                  {stop.status && (
                    <p className="mt-1 text-xs">
                      Status:{" "}
                      {stop.status}
                    </p>
                  )}

                </div>

              </Popup>
            </Marker>
          )
        )}

        {/* Vehicle */}

        {truckPosition &&
          route.status ===
            "IN_PROGRESS" && (
            <Marker
              position={truckPosition}
              icon={truckIcon}
            >
              <Popup>

                <div className="p-1">

                  <strong>
                    {route.vehicle
                      ?.vehicle_number ??
                      "Vehicle"}
                  </strong>

                  <p className="mt-1 text-sm">
                    Driver:{" "}
                    {route.driver?.name ??
                      "-"}
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    Route in progress
                  </p>

                </div>

              </Popup>
            </Marker>
          )}

      </MapContainer>

      {/* --------------------------------
          Map information
      --------------------------------- */}

      <div className="absolute left-4 top-4 z-[1000] rounded-xl border border-[#303640] bg-[#171B22]/95 px-4 py-3 shadow-xl backdrop-blur">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-lg">
            🗺️
          </div>

          <div>

            <h3 className="font-semibold text-white">
              Route Map
            </h3>

            <p className="text-xs text-zinc-400">
              {loadingRoute
                ? "Calculating road route..."
                : `${stops.length} delivery stops`}
            </p>

          </div>

        </div>

      </div>

      {/* --------------------------------
          Route status
      --------------------------------- */}

      <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-[#303640] bg-[#171B22]/95 px-4 py-3 shadow-xl backdrop-blur">

        <div className="grid grid-cols-3 gap-5">

          <div>

            <p className="text-xs text-zinc-500">
              Route
            </p>

            <p className="text-sm font-semibold text-white">
              R-{route.route_id}
            </p>

          </div>

          <div>

            <p className="text-xs text-zinc-500">
              Stops
            </p>

            <p className="text-sm font-semibold text-white">
              {stops.length}
            </p>

          </div>

          <div>

            <p className="text-xs text-zinc-500">
              Status
            </p>

            <p
              className={`text-sm font-semibold ${
                route.status ===
                "COMPLETED"
                  ? "text-blue-400"
                  : route.status ===
                      "IN_PROGRESS"
                    ? "text-green-400"
                    : "text-yellow-400"
              }`}
            >
              {route.status}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}