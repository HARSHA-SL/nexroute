import axios from "@/services/axios";
import type { Notification } from "../types/notification";

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await axios.get("/notifications");
  return data;
}

export async function markAsRead(id: number) {
  const { data } = await axios.put(`/notifications/${id}/read`);
  return data;
}

export async function deleteNotification(id: number) {
  await axios.delete(`/notifications/${id}`);
}