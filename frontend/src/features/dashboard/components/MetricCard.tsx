import { TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
}

export default function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: MetricCardProps) {
  return (
    <div className="group rounded-2xl border border-[#2A2F36] bg-[#15181B] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#3A414A]">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-[#8B949E]">

            {title}

          </p>

          <h2 className="mt-2 text-4xl font-bold tracking-tight">

            {value}

          </h2>

        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: color }}
        >
          <Icon
            size={22}
            className="text-white"
          />
        </div>

      </div>

      <div className="mt-6">

        <div className="h-10 rounded-lg bg-[#1E2329]" />

      </div>

      <div className="mt-5 flex items-center justify-between">

        <div className="flex items-center gap-2 text-green-400">

          <TrendingUp size={16} />

          <span className="text-sm font-medium">

            {change}

          </span>

        </div>

        <span className="text-xs text-[#8B949E]">

          Updated now

        </span>

      </div>

    </div>
  );
}