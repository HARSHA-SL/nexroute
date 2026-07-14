import { useEffect, useState } from "react";
import KpiCard from "./KpiCard";
import {
  Package,
  Truck,
  Users,
  Warehouse,
  Car,
  Trophy,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";

import { analyticsService } from "@/services/analytics.service";
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);

  async function loadDashboard() {
    try {
      const data = await analyticsService.getDashboard();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (!analytics) {
    return (
      <div className="flex h-96 items-center justify-center text-xl text-zinc-400">
        Loading analytics...
      </div>
    );
  }

  const kpis = analytics.kpis;
  const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
];
    return (
    <div className="space-y-8">

      <div>
        <h1 className="text-5xl font-bold">
          Analytics Dashboard
        </h1>

        <p className="mt-2 text-lg text-zinc-400">
          Business intelligence and operational insights for NexRoute.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

  <KpiCard
    title="Total Deliveries"
    value={kpis.total_deliveries}
    icon={<Package size={28} />}
    color="bg-blue-500/20 text-blue-400"
  />

  <KpiCard
    title="Total Routes"
    value={kpis.total_routes}
    icon={<Truck size={28} />}
    color="bg-green-500/20 text-green-400"
  />

  <KpiCard
    title="Drivers"
    value={kpis.total_drivers}
    icon={<Users size={28} />}
    color="bg-yellow-500/20 text-yellow-400"
  />

  <KpiCard
    title="Warehouses"
    value={kpis.total_warehouses}
    icon={<Warehouse size={28} />}
    color="bg-purple-500/20 text-purple-400"
  />

</div>
<div className="grid gap-6 lg:grid-cols-3">

  {/* Top Performer */}
  <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-yellow-500/10 to-zinc-900 p-6 lg:col-span-2">

    <div className="flex items-center gap-3">
      <Trophy className="text-yellow-400" size={30} />

      <h2 className="text-2xl font-bold">
        Top Performer
      </h2>
    </div>

    {analytics.driver_performance.length > 0 ? (

      <div className="mt-8 flex items-center justify-between">

        <div>

          <h3 className="text-3xl font-bold">
            {analytics.driver_performance[0].driver}
          </h3>

          <p className="mt-2 text-zinc-400">
            Highest completed routes
          </p>

        </div>

        <div className="text-right">

          <p className="text-5xl font-extrabold text-yellow-400">
            {analytics.driver_performance[0].completed_routes}
          </p>

          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Routes
          </p>

        </div>

      </div>

    ) : (

      <p className="mt-8 text-zinc-500">
        No completed routes yet.
      </p>

    )}

  </div>

  {/* Fleet Health */}

  <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-green-500/10 to-zinc-900 p-6">

    <h2 className="text-2xl font-bold">
      Fleet Health
    </h2>

    <div className="mt-8">

      <p className="text-5xl font-extrabold text-green-400">
        {kpis.total_vehicles}
      </p>

      <p className="mt-2 text-zinc-400">
        Vehicles Registered
      </p>

      <div className="mt-8 h-3 overflow-hidden rounded-full bg-zinc-800">

        <div
          className="h-full rounded-full bg-green-500"
          style={{
            width: "100%",
          }}
        />

      </div>

      <p className="mt-3 text-sm text-zinc-500">
        Fleet operational
      </p>

    </div>

  </div>

</div>
      <div className="grid grid-cols-2 gap-8">

  {/* Delivery Status */}
  <div className="group rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.18)]">

    <h2 className="mb-6 text-2xl font-bold">
      Delivery Status
    </h2>

    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>

          <Pie
            data={analytics.delivery_status}
            dataKey="count"
            nameKey="status"
            outerRadius={110}
            label
          >
            {analytics.delivery_status.map(
              (_: any, index: number) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              )
            )}
          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>
      </ResponsiveContainer>
    </div>

  </div>

  {/* Route Status */}
  <div className="group rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.18)]">

    <h2 className="mb-6 text-2xl font-bold">
      Route Status
    </h2>

    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={analytics.route_status}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="status" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="count"
            fill="#3B82F6"
            radius={[8, 8, 0, 0]}
          />

        </BarChart>
      </ResponsiveContainer>
    </div>

  </div>

</div>
<div className="grid grid-cols-2 gap-8">

  {/* Vehicle Status */}
  <div className="group rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.18)]">

    <div className="mb-6 flex items-center gap-3">
      <Car className="text-green-400" />
      <h2 className="text-2xl font-bold">
        Vehicle Status
      </h2>
    </div>

    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>

          <Pie
            data={analytics.vehicle_status}
            dataKey="count"
            nameKey="status"
            outerRadius={110}
            label
          >
            {analytics.vehicle_status.map(
              (_: any, index: number) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              )
            )}
          </Pie>

          <Tooltip />
          <Legend />

        </PieChart>
      </ResponsiveContainer>
    </div>

  </div>

  {/* Driver Performance */}
  <div className="group rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.18)]">

    <div className="mb-6 flex items-center gap-3">
      <Trophy className="text-yellow-400" />
      <h2 className="text-2xl font-bold">
        Driver Performance
      </h2>
    </div>

    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={analytics.driver_performance}
          layout="vertical"
        >

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            type="number"
          />

          <YAxis
            type="category"
            dataKey="driver"
          />

          <Tooltip />

          <Bar
            dataKey="completed_routes"
            fill="#10B981"
            radius={[0, 8, 8, 0]}
          />

        </BarChart>
      </ResponsiveContainer>
    </div>

  </div>

</div>
<div className="group rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.18)]">

  <div className="mb-6 flex items-center gap-3">
    <Warehouse className="text-purple-400" />

    <h2 className="text-2xl font-bold">
      Warehouse Performance
    </h2>
  </div>

  <div className="h-96">

    <ResponsiveContainer width="100%" height="100%">

      <BarChart
        data={analytics.warehouse_performance}
      >

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="warehouse" />

        <YAxis />

        <Tooltip />

        <Bar
          dataKey="total_routes"
          fill="#8B5CF6"
          radius={[8,8,0,0]}
        >

          <LabelList
            dataKey="total_routes"
            position="top"
          />

        </Bar>

      </BarChart>

    </ResponsiveContainer>

  </div>

</div>
          </div>
  );
}