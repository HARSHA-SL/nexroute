import {
  Gauge,
  Truck,
  Fuel,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import FadeIn from "@/components/common/FadeIn";

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
      operations={
        <FadeIn delay={0.1}>
          <OperationsBrief />
        </FadeIn>
      }
      metrics={
        <FadeIn delay={0.2}>
          <section className="grid grid-cols-5 gap-5">

            <MetricCard
              title="Optimization Score"
              value={94}
              suffix="%"
              change="+2.4%"
              icon={Gauge}
              color="#2563EB"
              trend={[40, 55, 58, 67, 72, 84, 94]}
            />

            <MetricCard
              title="Active Deliveries"
              value={124}
              change="+18"
              icon={Truck}
              color="#16A34A"
              trend={[55, 62, 70, 74, 83, 101, 124]}
            />

            <MetricCard
              title="Fuel Saved"
              value={43}
              suffix="L"
              change="+6%"
              icon={Fuel}
              color="#EA580C"
              trend={[12, 16, 20, 28, 31, 37, 43]}
            />

            <MetricCard
              title="Average ETA"
              value={21}
              suffix="m"
              change="-3m"
              icon={Clock3}
              color="#9333EA"
              trend={[32, 30, 28, 27, 25, 23, 21]}
            />

            <MetricCard
              title="Fleet Health"
              value={98}
              suffix="%"
              change="+1.2%"
              icon={ShieldCheck}
              color="#0F766E"
              trend={[91, 92, 93, 94, 95, 97, 98]}
            />

          </section>
        </FadeIn>
      }
      map={
        <FadeIn delay={0.3}>
          <LiveOperationsMap />
        </FadeIn>
      }
      bottom={
        <FadeIn delay={0.4}>
          <section className="grid grid-cols-3 gap-5">
            <RevenueChart />
            <FleetPerformanceChart />
            <ActiveRoutesTable />
          </section>
        </FadeIn>
      }
    />
  );
}