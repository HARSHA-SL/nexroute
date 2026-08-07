import type { Dispatch, SetStateAction } from "react";
import type { Settings } from "../types/settings";

interface Props {
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings | null>>;
}

export default function SecuritySettings(_: Props) {
  return (
    <div className="rounded-xl border border-[#262B34] bg-[#171B22] p-6">
      <h2 className="text-xl font-semibold text-white">
        Security
      </h2>
    </div>
  );
}