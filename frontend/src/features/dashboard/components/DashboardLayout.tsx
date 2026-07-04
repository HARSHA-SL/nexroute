import type { ReactNode } from "react";

interface DashboardLayoutProps {
  operations: ReactNode;
  metrics: ReactNode;
  map: ReactNode;
  bottom: ReactNode;
}

export default function DashboardLayout({
  operations,
  metrics,
  map,
  bottom,
}: DashboardLayoutProps) {
  return (
    <div className="mt-8 flex flex-col gap-6">

      {operations}

      {metrics}

      {map}

      {bottom}

    </div>
  );
}