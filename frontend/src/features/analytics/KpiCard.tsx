import type { ReactNode } from "react";
type Props = {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
};

export default function KpiCard({
  title,
  value,
  icon,
  color,
}: Props) {
  return (
    <div
      className="
      group
      rounded-2xl
      border
      border-zinc-800
      bg-gradient-to-br
      from-zinc-900
      to-zinc-950
      p-6
      transition-all
      duration-300
      hover:-translate-y-2
      hover:shadow-2xl
      hover:border-zinc-600
    "
    >
      <div className="flex items-center justify-between">

        <div
          className={`
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            ${color}
            transition-transform
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          `}
        >
          {icon}
        </div>

        <h2 className="text-5xl font-bold">
          {value}
        </h2>
      </div>

      <p className="mt-5 text-sm uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>
    </div>
  );
}