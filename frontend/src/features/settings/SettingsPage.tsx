import { useEffect, useState } from "react";
import { toast } from "sonner";

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

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
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

  if (loading)
    return (
      <div className="text-white">
        Loading...
      </div>
    );

  if (!settings) return null;

  return (
  <div className="space-y-8">

    <h1 className="text-4xl font-bold text-white">
      Settings
    </h1>

    <ProfileCard settings={settings} />

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

    <SaveSettingsButton
      loading={saving}
      onSave={save}
    />

  </div>
);
}