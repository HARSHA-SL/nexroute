import { useEffect, useState } from "react";

import NotificationFilters from "./components/NotificationFilter";
import NotificationList from "./components/NotificationList";
import NotificationStats from "./components/NotificationStats";
import EmptyNotifications from "./components/EmptyNotifications";

import {
  getNotifications,
} from "./services/notifications.service";

import type { Notification } from "./types/notification";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const data = await getNotifications();
    setNotifications(data);
  }

  const unread = notifications.filter(
    (n) => !n.is_read
  ).length;

  const high = notifications.filter(
    (n) => n.priority === "High"
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-white">
        Notifications
      </h1>

      <NotificationStats
        total={notifications.length}
        unread={unread}
        high={high}
      />

      <NotificationFilters />

      {notifications.length ? (
        <NotificationList
          notifications={notifications}
        />
      ) : (
        <EmptyNotifications />
      )}
    </div>
  );
}