import DashboardHeader from "./components/DashboardHeader";
import DashboardSkeleton from "./components/DashboardSkeleton";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader />

      <DashboardSkeleton />
    </div>
  );
}