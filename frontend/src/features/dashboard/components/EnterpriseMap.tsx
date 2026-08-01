import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import L from "leaflet";
import { useEffect, useState } from "react";

const warehouse = [12.9716, 77.5946] as [number, number];

const truck = [12.983, 77.615] as [number, number];

const delivery = [12.995, 77.645] as [number, number];

const warehouseIcon = new L.DivIcon({
  className: "",
  html: `
  <div style="
      width:20px;
      height:20px;
      border-radius:999px;
      background:#2563eb;
      border:4px solid white;
      box-shadow:0 0 18px rgba(37,99,235,.8);
  "></div>
`,
});

const truckIcon = new L.DivIcon({
  className: "",
  html: `
  <div style="
      width:20px;
      height:20px;
      border-radius:999px;
      background:#22c55e;
      border:4px solid white;
      box-shadow:0 0 18px rgba(34,197,94,.8);
  "></div>
`,
});

const deliveryIcon = new L.DivIcon({
  className: "",
  html: `
  <div style="
      width:20px;
      height:20px;
      border-radius:999px;
      background:#f97316;
      border:4px solid white;
      box-shadow:0 0 18px rgba(249,115,22,.8);
  "></div>
`,
});

export default function EnterpriseMap() {

  const route = [
    warehouse,
    [12.975, 77.602],
    [12.979, 77.609],
    truck,
    [12.988, 77.623],
    delivery,
  ] as [number, number][];

  const [truckPosition, setTruckPosition] =
    useState(route[0]);

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % route.length;

      setTruckPosition(route[index]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer
      center={warehouse}
      zoom={13}
      zoomControl={false}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <Polyline
        positions={route}
        pathOptions={{
  color: "#3B82F6",
  weight: 7,
  opacity: 0.95,
  dashArray: "10 8",
}}
      />

      <Marker position={warehouse} icon={warehouseIcon}>
        <Popup>
  <strong>Main Warehouse</strong>
  <br />
  Bengaluru Hub
</Popup>
      </Marker>

      <Marker
  position={truckPosition}
  icon={truckIcon}
>
        <Popup>
  <strong>Truck 12</strong>
  <br />
  Route Active
</Popup>
      </Marker>

      <Marker position={delivery} icon={deliveryIcon}>
        <Popup>
  <strong>Delivery Stop</strong>
  <br />
  ETA 8 mins
</Popup>
      </Marker>
    </MapContainer>
  );
}