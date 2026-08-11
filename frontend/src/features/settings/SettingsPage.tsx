import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings as SettingsIcon } from "lucide-react";

import ProfileCard from "./components/ProfileCard";
import AppearanceSettings from "./components/AppearanceSettings";
import NotificationSettings from "./components/NotificationSettings";
import SecuritySettings from "./components/SecuritySettings";
import SystemSettings from "./components/SystemSettings";
import SaveSettingsButton from "./components/SaveSettingsButton";

import {
  getSettings,
  updateSettings,
} from "./services/settingsService";

import type { Settings } from "./types/settings";

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<Settings | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);

      const data = await getSettings();

      setSettings(data);
    } catch (err) {
      console.error(err);

      toast.error("Unable to load settings.");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!settings) return;

    try {
      setSaving(true);

      const updated =
        await updateSettings(settings);

      setSettings(updated);

      toast.success(
        "Settings saved successfully."
      );
    } catch (err) {
      console.error(err);

      toast.error(
        "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
            <SettingsIcon
              size={24}
              className="animate-pulse text-blue-400"
            />
          </div>

          <p className="text-zinc-400">
            Loading settings...
          </p>

        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">

        <SettingsIcon
          size={32}
          className="mx-auto mb-3 text-zinc-500"
        />

        <p className="text-zinc-400">
          Settings could not be loaded.
        </p>

        <button
          type="button"
          onClick={loadSettings}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Try Again
        </button>

      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-4xl font-bold text-white">
          Settings
        </h1>

        <p className="mt-2 text-zinc-400">
          Manage your account, application preferences,
          notifications and security.
        </p>
      </div>

      {/* Profile */}

      <ProfileCard settings={settings} />

      {/* Settings Sections */}

      <div className="grid gap-6 lg:grid-cols-2">

        <AppearanceSettings
          settings={settings}
          setSettings={setSettings}
        />

        <NotificationSettings
          settings={settings}
          setSettings={setSettings}
        />

        <SecuritySettings
          settings={settings}
          setSettings={setSettings}
        />

        <SystemSettings
          settings={settings}
          setSettings={setSettings}
        />

      </div>

      {/* Save */}

      <div className="flex justify-end border-t border-zinc-800 pt-6">

        <SaveSettingsButton
          loading={saving}
          onSave={save}
        />

      </div>

    </div>
  );
}