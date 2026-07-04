import {
  Brain,
  Route,
  Truck,
  TriangleAlert,
} from "lucide-react";

export default function OperationsBrief() {
  return (
    <section className="rounded-2xl border border-[#2A2F36] bg-[#15181B] p-6">

      <div className="flex items-center justify-between">

        <div>

          <div className="flex items-center gap-2">

            <Brain
              size={18}
              className="text-[#3B82F6]"
            />

            <span className="text-sm font-medium text-[#3B82F6]">

              AI OPERATIONS BRIEF

            </span>

          </div>

          <h2 className="mt-3 text-2xl font-semibold">

            Today's Operations Summary

          </h2>

        </div>

        <button className="rounded-xl border border-[#2A2F36] bg-[#1B1F23] px-4 py-2 text-sm transition hover:border-[#3B82F6]">

          View Details

        </button>

      </div>

      <div className="mt-6 grid grid-cols-2 gap-5">

        <div className="flex items-start gap-3">

          <Route
            className="mt-1 text-green-500"
            size={18}
          />

          <p className="text-[#C9D1D9]">

            AI optimized today's delivery routes,
            reducing total travel distance by
            <span className="font-semibold text-white">
              {" "}14%.
            </span>

          </p>

        </div>

        <div className="flex items-start gap-3">

          <Truck
            className="mt-1 text-blue-500"
            size={18}
          />

          <p className="text-[#C9D1D9]">

            Two additional deliveries can be
            assigned without increasing fleet size.

          </p>

        </div>

        <div className="flex items-start gap-3">

          <TriangleAlert
            className="mt-1 text-yellow-500"
            size={18}
          />

          <p className="text-[#C9D1D9]">

            Rain is expected near Electronic City.
            ETA may increase by approximately
            12 minutes.

          </p>

        </div>

        <div className="flex items-start gap-3">

          <Brain
            className="mt-1 text-violet-500"
            size={18}
          />

          <p className="text-[#C9D1D9]">

            Fleet health remains excellent.
            No driver or vehicle conflicts detected.

          </p>

        </div>

      </div>

    </section>
  );
}