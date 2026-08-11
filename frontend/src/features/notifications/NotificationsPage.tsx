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
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const data = await getNotifications();

      setNotifications(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load notifications."
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const unread = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const high = notifications.filter(
    (notification) =>
      notification.priority === "High"
  ).length;

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-4xl font-bold text-white">
          Notifications
        </h1>

        <p className="mt-2 text-zinc-400">
          Monitor important events across your
          logistics operations.
        </p>
      </div>

      {/* Statistics */}

      <NotificationStats
        total={notifications.length}
        unread={unread}
        high={high}
      />

      {/* Filters */}

      <NotificationFilters />

      {/* Content */}

      {loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-400">
            Loading notifications...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-800 bg-red-500/10 p-8 text-center">
          <p className="text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={loadNotifications}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : notifications.length > 0 ? (
        <NotificationList
          notifications={notifications}
        />
      ) : (
        <EmptyNotifications />
      )}

    </div>
  );
}