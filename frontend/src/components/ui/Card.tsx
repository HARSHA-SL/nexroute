import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`
        rounded-2xl
        border
        border-zinc-800
        bg-gradient-to-br
        from-zinc-900
        to-zinc-950
        p-6
        shadow-lg
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-zinc-700
        hover:shadow-2xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}