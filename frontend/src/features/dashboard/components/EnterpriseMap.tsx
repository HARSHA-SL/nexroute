import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import L from "leaflet";

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
  return (
    <MapContainer
      center={warehouse}
      zoom={12}
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
        positions={[warehouse, truck, delivery]}
        pathOptions={{
          color: "#3B82F6",
          weight: 5,
        }}
      />

      <Marker position={warehouse} icon={warehouseIcon}>
        <Popup>Main Warehouse</Popup>
      </Marker>

      <Marker position={truck} icon={truckIcon}>
        <Popup>Truck 12</Popup>
      </Marker>

      <Marker position={delivery} icon={deliveryIcon}>
        <Popup>Customer Delivery</Popup>
      </Marker>
    </MapContainer>
  );
}