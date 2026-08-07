import { Check, Trash2 } from "lucide-react";

interface Props {
  isRead: boolean;
  onRead: () => void;
  onDelete: () => void;
}

export default function NotificationActions({
  isRead,
  onRead,
  onDelete,
}: Props) {
  return (
    <div className="mt-4 flex gap-3">
      {!isRead && (
        <button
          onClick={onRead}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition hover:bg-blue-700"
        >
          <Check size={16} />
          Mark Read
        </button>
      )}

      <button
        onClick={onDelete}
        className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700"
      >
        <Trash2 size={16} />
        Delete
      </button>
    </div>
  );
}