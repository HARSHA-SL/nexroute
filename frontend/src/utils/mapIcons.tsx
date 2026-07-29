import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { FaWarehouse, FaTruck, FaBox } from "react-icons/fa";

function createIcon(
  icon: React.ReactElement,
  color: string
) {
  return L.divIcon({
    html: renderToStaticMarkup(
      <div
        style={{
          background: color,
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "18px",
          boxShadow:
            "0 4px 12px rgba(0,0,0,.35)",
        }}
      >
        {icon}
      </div>
    ),
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export const warehouseIcon = createIcon(
  <FaWarehouse />,
  "#f59e0b"
);

export const truckIcon = createIcon(
  <FaTruck />,
  "#2563eb"
);

export function stopIcon(number: number) {
  return L.divIcon({
    html: `
      <div
        style="
          width:34px;
          height:34px;
          border-radius:50%;
          background:#22c55e;
          color:white;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:bold;
          border:3px solid white;
          box-shadow:0 4px 10px rgba(0,0,0,.35);
        "
      >
        ${number}
      </div>
    `,
    className: "",
    iconSize: [34,34],
    iconAnchor: [17,17],
  });
}