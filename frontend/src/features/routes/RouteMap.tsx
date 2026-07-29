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
  warehouseIcon,
  stopIcon,
  truckIcon,
} from "@/utils/mapIcons";
import L from "leaflet";
import { useEffect, useState } from "react";
import { getDrivingRoute } from "@/services/openRoute.service";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
function FitBounds({
  routePoints,
}: {
  routePoints: [number, number][];
}) {
  const map = useMap();

  if (routePoints.length > 0) {
    map.flyToBounds(routePoints, {
  padding: [60, 60],
  duration: 1.5,
});
  }

  return null;
}

type Props = {
  warehouse: any;
  stops: any[];
};

export default function RouteMap({
  warehouse,
  stops,
}: Props) {
    const [roadRoute, setRoadRoute] = useState<[number, number][]>([]);
const [truckPosition, setTruckPosition] = useState<[number, number] | null>(null);
    useEffect(() => {
  async function loadRoute() {
    try {
      console.log("Stops:", stops);
console.log("Stops count:", stops.length);
      const coordinates: [number, number][] = [
        [
          warehouse.longitude,
          warehouse.latitude,
        ],

        ...stops.map((stop): [number, number] => [
          stop.longitude,
          stop.latitude,
        ]),
      ];

      const data = await getDrivingRoute(coordinates);
      console.log("Coordinates sent:", coordinates);
console.log("ORS response:", data);
      const points =
        data.features[0].geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [
            lat,
            lng,
          ]
        );

      setRoadRoute(points);

if (points.length > 0) {
  setTruckPosition(points[0]);
}
    } catch (err) {
      console.error(err);
    }
  }

  loadRoute();
}, [warehouse, stops]);
useEffect(() => {
  if (roadRoute.length === 0) return;

  let currentIndex = 0;

  const interval = setInterval(() => {
    currentIndex++;

    if (currentIndex >= roadRoute.length) {
      currentIndex = 0;
    }

    setTruckPosition(roadRoute[currentIndex]);
  }, 100);

  return () => clearInterval(interval);
}, [roadRoute]);
    const routePoints: [number, number][] = [
  [warehouse.latitude, warehouse.longitude],
  ...stops.map((stop) => [
    stop.latitude,
    stop.longitude,
  ] as [number, number]),
];
  return (
    <MapContainer
      center={[
        warehouse.latitude,
        warehouse.longitude,
      ]}
      zoom={13}
      style={{
        height: "450px",
        width: "100%",
        borderRadius: "16px",
      }}
    >
      <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
/>

      <Marker
  icon={warehouseIcon}
  position={[
    warehouse.latitude,
    warehouse.longitude,
  ]}
>
  <Popup>
  <div className="min-w-[180px]">
    <h3 className="font-bold text-yellow-500">
      🏭 {warehouse.name}
    </h3>

    <p className="text-sm mt-2">
      Central Distribution Hub
    </p>
  </div>
</Popup>
</Marker>

{truckPosition && (
  <Marker
    icon={truckIcon}
    position={truckPosition}
  />
)}
      {stops.map((stop) => (
  <Marker
    key={stop.stop_id}
    icon={stopIcon(stop.stop_order)}
    position={[
      stop.latitude,
      stop.longitude,
    ] as [number, number]}
  >
    <Popup>
      <strong>
        Stop {stop.stop_order}
      </strong>

      <br />

      {stop.customer_name}
    </Popup>
  </Marker>
))}
<Polyline
  positions={
    roadRoute.length > 0
      ? roadRoute
      : routePoints
  }
  pathOptions={{
    color: "#2563eb",
    weight: 8,
    opacity: 0.95,
    lineCap: "round",
    lineJoin: "round",
    dashArray: "12 8",
  }}
/>
<FitBounds routePoints={routePoints} />
    </MapContainer>
  );
}

