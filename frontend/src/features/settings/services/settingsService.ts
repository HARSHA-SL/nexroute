import axios from "@/services/axios";
import type { Settings } from "../types/settings";

export async function getSettings(): Promise<Settings> {
  const { data } = await axios.get("/settings");

  console.log("GET /settings response:", data);

  return data;
}

export async function updateSettings(
  settings: Settings
): Promise<Settings> {
  const { data } = await axios.put("/settings", settings);
  return data;
}