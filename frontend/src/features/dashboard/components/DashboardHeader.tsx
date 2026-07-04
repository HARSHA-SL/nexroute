import useCurrentTime from "@/hooks/useCurrentTime";

export default function DashboardHeader() {
  const now = useCurrentTime();
  
  const hour = now.getHours();



const greeting =
  hour < 12
    ? "Good Morning"
    : hour < 17
    ? "Good Afternoon"
    : "Good Evening";

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const date = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold">
            {greeting}, Harsha 👋
          </h1>

          <p className="mt-2 text-lg text-zinc-400">
            Here's today's logistics overview.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-4 text-right">
          <p className="text-3xl font-bold">{time}</p>

          <p className="text-zinc-400">
            {date}
          </p>
        </div>
      </div>
    </div>
  );
}