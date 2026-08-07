import NotificationCard from "./NotificationCard";
import type { Notification } from "../types/notification";

interface Props {
  notifications: Notification[];
}

export default function NotificationList({
  notifications,
}: Props) {
  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
}