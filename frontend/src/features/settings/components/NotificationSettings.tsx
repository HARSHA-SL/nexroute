import type { Dispatch, SetStateAction } from "react";
import type { Settings } from "../types/settings";

interface Props {
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings | null>>;
}

export default function NotificationSettings({
  settings,
  setSettings,
}: Props) {
  function toggle(field: keyof Settings) {
    setSettings({
      ...settings,
      [field]: !settings[field],
    });
  }

  return (
    <div className="rounded-xl border border-[#262B34] bg-[#171B22] p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Notifications
      </h2>

      <div className="space-y-5">

        <label className="flex justify-between text-white">
          Email Notifications
          <input
            type="checkbox"
            checked={settings.email_notifications}
            onChange={() => toggle("email_notifications")}
          />
        </label>

        <label className="flex justify-between text-white">
          Push Notifications
          <input
            type="checkbox"
            checked={settings.push_notifications}
            onChange={() => toggle("push_notifications")}
          />
        </label>

        <label className="flex justify-between text-white">
          SMS Notifications
          <input
            type="checkbox"
            checked={settings.sms_notifications}
            onChange={() => toggle("sms_notifications")}
          />
        </label>

        <label className="flex justify-between text-white">
          Route Alerts
          <input
            type="checkbox"
            checked={settings.route_alerts}
            onChange={() => toggle("route_alerts")}
          />
        </label>

      </div>
    </div>
  );
}