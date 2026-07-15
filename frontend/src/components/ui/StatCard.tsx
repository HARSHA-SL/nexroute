import type { ReactNode } from "react";
import Card from "./Card";

type Props = {
  title: string;
  value: number | string;
  icon: ReactNode;
  iconClassName?: string;
  subtitle?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  iconClassName = "",
  subtitle,
}: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            {title}
          </p>

          <h2 className="mt-3 text-5xl font-extrabold tracking-tight">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-3 text-sm text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            ${iconClassName}
          `}
        >
          {icon}
        </div>

      </div>
    </Card>
  );
}