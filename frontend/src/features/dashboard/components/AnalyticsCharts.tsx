import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

interface AnalyticsData {
  delivery_completion_rate: number;
  route_completion_rate: number;
  driver_availability_percentage: number;
  vehicle_availability_percentage: number;
  pending_deliveries: number;
  active_routes: number;
}

interface Props {
  data: AnalyticsData;
}

export default function AnalyticsCharts({ data }: Props) {
  const chartData = [
    {
      name: "Deliveries",
      value: Number(data.delivery_completion_rate),
      color: "#3B82F6",
    },
    {
      name: "Routes",
      value: Number(data.route_completion_rate),
      color: "#A855F7",
    },
    {
      name: "Vehicles",
      value: Number(data.vehicle_availability_percentage),
      color: "#22C55E",
    },
    {
      name: "Drivers",
      value: Number(data.driver_availability_percentage),
      color: "#F59E0B",
    },
  ];

  return (
    <div className="rounded-2xl border border-[#262B34] bg-[#171B22] p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">
          Operations Analytics
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Current logistics performance
        </p>
      </div>

      {/* BAR CHART */}
      <div className="h-[320px] w-full">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 10,
              bottom: 10,
            }}
          >

            <CartesianGrid
              stroke="#2A2F36"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#9CA3AF",
                fontSize: 13,
              }}
            />

            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#9CA3AF",
                fontSize: 12,
              }}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              cursor={{
                fill: "rgba(255,255,255,0.04)",
              }}
              contentStyle={{
                backgroundColor: "#11151A",
                border: "1px solid #303640",
                borderRadius: "12px",
                color: "#FFFFFF",
              }}
              formatter={(value) => [
                `${Number(value).toFixed(1)}%`,
                "Performance",
              ]}
            />

            <Bar
              dataKey="value"
              radius={[10, 10, 0, 0]}
              barSize={65}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                />
              ))}
            </Bar>

          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* PERFORMANCE CARDS */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* Delivery */}
        <div className="rounded-xl border border-[#262B34] bg-[#11151A] p-4">
          <p className="text-xs text-zinc-500">
            Delivery Completion
          </p>

          <p className="mt-2 text-xl font-bold text-blue-400">
            {data.delivery_completion_rate.toFixed(1)}%
          </p>
        </div>

        {/* Routes */}
        <div className="rounded-xl border border-[#262B34] bg-[#11151A] p-4">
          <p className="text-xs text-zinc-500">
            Route Completion
          </p>

          <p className="mt-2 text-xl font-bold text-purple-400">
            {data.route_completion_rate.toFixed(1)}%
          </p>
        </div>

        {/* Vehicles */}
        <div className="rounded-xl border border-[#262B34] bg-[#11151A] p-4">
          <p className="text-xs text-zinc-500">
            Vehicle Availability
          </p>

          <p className="mt-2 text-xl font-bold text-green-400">
            {data.vehicle_availability_percentage.toFixed(1)}%
          </p>
        </div>

        {/* Drivers */}
        <div className="rounded-xl border border-[#262B34] bg-[#11151A] p-4">
          <p className="text-xs text-zinc-500">
            Driver Availability
          </p>

          <p className="mt-2 text-xl font-bold text-yellow-400">
            {data.driver_availability_percentage.toFixed(1)}%
          </p>
        </div>

      </div>

      {/* OPERATION STATUS */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">

        <div className="rounded-xl border border-[#262B34] bg-[#11151A] p-4">
          <p className="text-xs text-zinc-500">
            Pending Deliveries
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {data.pending_deliveries}
          </p>
        </div>

        <div className="rounded-xl border border-[#262B34] bg-[#11151A] p-4">
          <p className="text-xs text-zinc-500">
            Active Routes
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {data.active_routes}
          </p>
        </div>

      </div>

    </div>
  );
}