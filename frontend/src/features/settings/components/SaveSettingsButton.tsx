import React from "react";

interface Props {
  loading: boolean;
  onSave: () => void;
}

export default function SaveSettingsButton({
  loading,
  onSave,
}: Props): React.ReactElement {
  return (
    <button
      onClick={onSave}
      disabled={loading}
      className="rounded-lg bg-blue-600 px-6 py-3 text-white"
    >
      {loading ? "Saving..." : "Save Settings"}
    </button>
  );
}