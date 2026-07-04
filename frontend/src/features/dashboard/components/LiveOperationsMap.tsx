import EnterpriseMap from "./EnterpriseMap";

export default function LiveOperationsMap() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#2A2F36] bg-[#15181B]">

      <div className="flex items-center justify-between border-b border-[#2A2F36] p-6">

        <div>
          <h2 className="text-3xl font-semibold text-white">
            Live Operations Map
          </h2>

          <p className="mt-2 text-gray-400">
            Fleet movement across Bengaluru
          </p>
        </div>

        <span className="rounded-full bg-green-500/15 px-4 py-2 text-sm text-green-400">
          ● LIVE
        </span>

      </div>

      <div className="h-[520px]">
        <EnterpriseMap />
      </div>

    </section>
  );
}