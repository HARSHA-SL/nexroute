import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", revenue: 120 },
  { month: "Feb", revenue: 180 },
  { month: "Mar", revenue: 210 },
  { month: "Apr", revenue: 260 },
  { month: "May", revenue: 240 },
  { month: "Jun", revenue: 310 },
  { month: "Jul", revenue: 370 },
  { month: "Aug", revenue: 425 },
];

export default function RevenueChart() {
  return (
    <div className="rounded-2xl border border-[#2A2F36] bg-[#15181B] p-6">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-400">
            Revenue Analytics
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            $425K
          </h2>

          <p className="mt-1 text-sm text-emerald-400">
            ↑ 12.4% this month
          </p>

        </div>

      </div>

      <div className="h-[220px]">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid
              stroke="#23272F"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="month"
              tick={{ fill: "#7E8795", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#7E8795", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{
                fill: "#3B82F6",
                strokeWidth: 0,
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}