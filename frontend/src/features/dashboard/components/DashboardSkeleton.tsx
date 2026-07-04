import {
  Gauge,
  Truck,
  Fuel,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import DashboardLayout from "./DashboardLayout";
import MetricCard from "./MetricCard";
import OperationsBrief from "./OperationsBrief";
import LiveOperationsMap from "./LiveOperationsMap";

import RevenueChart from "./RevenueChart";
import FleetPerformanceChart from "./FleetPerformanceChart";
import ActiveRoutesTable from "./ActiveRoutesTable";

export default function DashboardSkeleton() {
  return (
    <DashboardLayout
      operations={<OperationsBrief />}

      metrics={
        <section className="grid grid-cols-5 gap-5">
          <MetricCard
            title="Optimization Score"
            value="94%"
            change="+2.4%"
            icon={Gauge}
            color="#2563EB"
          />

          <MetricCard
            title="Active Deliveries"
            value="124"
            change="+18"
            icon={Truck}
            color="#16A34A"
          />

          <MetricCard
            title="Fuel Saved"
            value="43L"
            change="+6%"
            icon={Fuel}
            color="#EA580C"
          />

          <MetricCard
            title="Average ETA"
            value="21m"
            change="-3m"
            icon={Clock3}
            color="#9333EA"
          />

          <MetricCard
            title="Fleet Health"
            value="98%"
            change="+1.2%"
            icon={ShieldCheck}
            color="#0F766E"
          />
        </section>
      }

      map={<LiveOperationsMap />}

      bottom={
        <section className="grid grid-cols-3 gap-5">
          <RevenueChart />
          <FleetPerformanceChart />
          <ActiveRoutesTable />
        </section>
      }
    />
  );
}