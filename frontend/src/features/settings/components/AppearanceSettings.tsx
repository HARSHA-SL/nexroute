import type { Dispatch, SetStateAction } from "react";
import type { Settings } from "../types/settings";

interface Props {
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings | null>>;
}

export default function AppearanceSettings({
  settings,
  setSettings,
}: Props) {
  return (
    <div className="rounded-xl border border-[#262B34] bg-[#171B22] p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Appearance
      </h2>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Theme
          </label>

          <select
            value={settings.theme}
            onChange={(e) =>
              setSettings({
                ...settings,
                theme: e.target.value,
              })
            }
            className="w-full rounded-lg bg-[#20252D] p-3 text-white"
          >
            <option>Dark</option>
            <option>Light</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Language
          </label>

          <input
            value={settings.language}
            onChange={(e) =>
              setSettings({
                ...settings,
                language: e.target.value,
              })
            }
            className="w-full rounded-lg bg-[#20252D] p-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Timezone
          </label>

          <input
            value={settings.timezone}
            onChange={(e) =>
              setSettings({
                ...settings,
                timezone: e.target.value,
              })
            }
            className="w-full rounded-lg bg-[#20252D] p-3 text-white"
          />
        </div>
      </div>
    </div>
  );
}