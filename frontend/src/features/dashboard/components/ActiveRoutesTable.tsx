const routes = [
  {
    route: "R-104",
    driver: "Rahul Kumar",
    vehicle: "Tata Ace",
    eta: "12:30 PM",
    status: "On Route",
  },
  {
    route: "R-105",
    driver: "Priya Sharma",
    vehicle: "Ashok Leyland",
    eta: "01:05 PM",
    status: "Delayed",
  },
  {
    route: "R-106",
    driver: "Arjun Reddy",
    vehicle: "Eicher Pro",
    eta: "01:40 PM",
    status: "Completed",
  },
  {
    route: "R-107",
    driver: "Kiran Das",
    vehicle: "Mahindra Furio",
    eta: "02:10 PM",
    status: "Loading",
  },
];

function statusColor(status: string) {
  switch (status) {
    case "Completed":
      return "bg-emerald-500/15 text-emerald-400";

    case "Delayed":
      return "bg-red-500/15 text-red-400";

    case "Loading":
      return "bg-amber-500/15 text-amber-400";

    default:
      return "bg-blue-500/15 text-blue-400";
  }
}

export default function ActiveRoutesTable() {
  return (
    <div className="rounded-2xl border border-[#2A2F36] bg-[#15181B] p-6">

      <div className="mb-6">
        <p className="text-sm text-gray-400">
          Active Routes
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Live Operations
        </h2>
      </div>

      <table className="w-full">

        <thead>

          <tr className="border-b border-[#262B33] text-left text-xs uppercase text-gray-500">

            <th className="pb-3">Route</th>
            <th className="pb-3">Driver</th>
            <th className="pb-3">ETA</th>
            <th className="pb-3">Status</th>

          </tr>

        </thead>

        <tbody>

          {routes.map((route) => (

            <tr
              key={route.route}
              className="border-b border-[#20242A] transition hover:bg-[#1A1E23]"
            >

              <td className="py-4 font-medium">
                {route.route}
              </td>

              <td>{route.driver}</td>

              <td>{route.eta}</td>

              <td>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(route.status)}`}
                >
                  {route.status}
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}