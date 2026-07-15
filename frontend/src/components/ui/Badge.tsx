type Props = {
  status: string;
};

export default function Badge({ status }: Props) {
  const styles: Record<string, string> = {
    COMPLETED: "bg-green-500/20 text-green-400",
    DELIVERED: "bg-green-500/20 text-green-400",

    IN_PROGRESS: "bg-blue-500/20 text-blue-400",
    ON_ROUTE: "bg-blue-500/20 text-blue-400",

    PLANNED: "bg-yellow-500/20 text-yellow-400",
    PENDING: "bg-yellow-500/20 text-yellow-400",

    AVAILABLE: "bg-emerald-500/20 text-emerald-400",

    CANCELLED: "bg-red-500/20 text-red-400",
    FAILED: "bg-red-500/20 text-red-400",

    MAINTENANCE: "bg-orange-500/20 text-orange-400",

    ARRIVED: "bg-cyan-500/20 text-cyan-400",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        tracking-wide
        ${styles[status] ?? "bg-zinc-700 text-zinc-300"}
      `}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}