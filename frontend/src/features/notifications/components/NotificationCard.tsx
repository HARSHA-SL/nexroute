import { Bell } from "lucide-react";
import { toast } from "sonner";

import NotificationActions from "./NotificationActions";

import {
  markAsRead,
  deleteNotification,
} from "../services/notifications.service";

import type { Notification } from "../types/notification";

interface Props {
  notification: Notification;
}

export default function NotificationCard({
  notification,
}: Props) {
  const priorityColor = {
    Low: "bg-green-500/20 text-green-400",
    Medium: "bg-yellow-500/20 text-yellow-400",
    High: "bg-red-500/20 text-red-400",
  };

  const time = new Date(
    notification.created_at
  ).toLocaleString();

  async function handleRead() {
    try {
      await markAsRead(notification.id);

      toast.success("Notification marked as read.");

      window.location.reload();
    } catch {
      toast.error("Unable to update notification.");
    }
  }

  async function handleDelete() {
    try {
      await deleteNotification(notification.id);

      toast.success("Notification deleted.");

      window.location.reload();
    } catch {
      toast.error("Unable to delete notification.");
    }
  }

  return (
    <div
      className={`rounded-xl border p-5 transition hover:border-blue-500 ${
        notification.is_read
          ? "border-[#262B34] bg-[#171B22]"
          : "border-blue-600 bg-[#1A2233]"
      }`}
    >
      <div className="flex items-start gap-4">
        <Bell
          className="mt-1 text-blue-400"
          size={22}
        />

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-white">
              {notification.title}
            </h3>

            <span className="text-sm text-gray-500">
              {time}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-400">
            {notification.message}
          </p>

          <div className="mt-4 flex gap-3">
            <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-white">
              {notification.category}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs ${
                priorityColor[notification.priority]
              }`}
            >
              {notification.priority}
            </span>

            {!notification.is_read && (
              <span className="rounded-full bg-blue-600/20 px-3 py-1 text-xs text-blue-400">
                Unread
              </span>
            )}
          </div>

          <NotificationActions
            isRead={notification.is_read}
            onRead={handleRead}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}