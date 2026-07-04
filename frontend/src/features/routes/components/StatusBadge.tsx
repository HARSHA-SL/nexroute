interface Props {
  status: string;
}

export default function StatusBadge({
  status,
}: Props) {
  const styles: Record<string, string> = {
    COMPLETED:
      "bg-emerald-500/20 text-emerald-400",

    RUNNING:
      "bg-blue-500/20 text-blue-400",

    PENDING:
      "bg-yellow-500/20 text-yellow-400",

    CANCELLED:
      "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ??
        "bg-zinc-700 text-zinc-300"
      }`}
    >
      {status}
    </span>
  );
}