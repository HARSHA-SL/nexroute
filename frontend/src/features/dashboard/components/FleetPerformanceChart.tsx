import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", fleet: 92, target: 90 },
  { day: "Tue", fleet: 94, target: 90 },
  { day: "Wed", fleet: 91, target: 90 },
  { day: "Thu", fleet: 96, target: 90 },
  { day: "Fri", fleet: 98, target: 90 },
  { day: "Sat", fleet: 97, target: 90 },
  { day: "Sun", fleet: 99, target: 90 },
];

export default function FleetPerformanceChart() {
  return (
    <div className="rounded-2xl border border-[#2A2F36] bg-[#15181B] p-6">

      <div className="mb-6">
        <p className="text-sm text-gray-400">
          Fleet Performance
        </p>

        <h2 className="mt-2 text-4xl font-bold">
          98%
        </h2>

        <p className="mt-1 text-sm text-emerald-400">
          Above weekly target
        </p>
      </div>

      <div className="h-[220px]">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid
              stroke="#23272F"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#7E8795", fontSize: 12 }}
            />

            <Tooltip />

            <Line
              dataKey="target"
              stroke="#5B6472"
              strokeDasharray="6 6"
              dot={false}
              strokeWidth={2}
            />

            <Line
              dataKey="fleet"
              stroke="#10B981"
              strokeWidth={3}
              dot={{
                fill: "#10B981",
                r: 4,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}