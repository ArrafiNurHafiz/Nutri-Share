import { Bell } from "lucide-react";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  notifications: any[];
  onMarkRead: (id: number) => void;
  onClose: () => void;
}

export function NotificationDropdown({
  notifications,
  onMarkRead,
  onClose,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-2xl overflow-hidden z-50 border border-[var(--border-primary)]"
      onClick={onClose}
    >
      <div className="p-4 border-b bg-gradient-to-r from-[var(--bg-tertiary)] to-white">
        <h3 className="font-bold text-sm text-brand-dark">Notifications</h3>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-[var(--text-tertiary)]">
            <Bell size={28} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map((n: any) => (
            <div
              key={n.id}
              onClick={() => onMarkRead(n.id)}
              className={`p-3 border-b text-sm cursor-pointer ${
                !n.is_read
                  ? "bg-brand-medium/5 border-l-2 border-l-brand-medium"
                  : "hover:bg-[var(--bg-tertiary)]"
              }`}
            >
              <p className="font-bold text-brand-dark">{n.title}</p>
              <p className="text-[var(--text-secondary)] mt-0.5">{n.message}</p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                {formatDistanceToNow(new Date(n.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
