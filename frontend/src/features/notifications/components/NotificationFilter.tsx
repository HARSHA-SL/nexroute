const filters = [
  "All",
  "Unread",
  "Driver",
  "Vehicle",
  "Route",
  "Warehouse",
  "System",
];

export default function NotificationFilters() {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => (
        <button
          key={filter}
          className="rounded-lg border border-[#2A2F38] bg-[#171B22] px-4 py-2 text-sm text-gray-300 transition hover:border-blue-500 hover:text-white"
        >
          {filter}
        </button>
      ))}
    </div>
  );
}