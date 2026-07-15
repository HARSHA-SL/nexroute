import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

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
    map.fitBounds(routePoints, {
      padding: [50, 50],
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
    } catch (err) {
      console.error(err);
    }
  }

  loadRoute();
}, [warehouse, stops]);
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
        height: "350px",
        width: "100%",
        borderRadius: "16px",
      }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker
        position={[
          warehouse.latitude,
          warehouse.longitude,
        ]}
      >
        <Popup>
          {warehouse.name}
        </Popup>
      </Marker>
      {stops.map((stop) => (
  <Marker
    key={stop.stop_id}
    position={[
      stop.latitude,
      stop.longitude,
    ]}
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
    weight: 5,
  }}
/>
<FitBounds routePoints={routePoints} />
    </MapContainer>
  );
}