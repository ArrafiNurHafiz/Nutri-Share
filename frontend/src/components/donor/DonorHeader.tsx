import { Bell, User, LogOut, Plus, Menu } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface Props {
  user: any;
  profile: any;
  notifications: any[];
  unreadCount: number;
  onShowProfile: () => void;
  onLogout: () => void;
  onAddDonation: () => void;
  onMenuClick?: () => void;
}

export function DonorHeader({
  user,
  profile,
  notifications,
  unreadCount,
  onShowProfile,
  onLogout,
  onAddDonation,
  onMenuClick,
}: Props) {
  const [showNotif, setShowNotif] = useState(false);
  const avgRating = "4.9";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-[var(--border-primary)] shadow-sm">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-brand-dark hover:bg-gray-100 rounded-lg"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl md:text-2xl font-black text-brand-dark tracking-tight">
            Good Morning, {profile?.business_name || user?.name || "Donor"} 👋
          </h1>
          <span className="bg-primary-orange/10 text-primary-orange text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-primary-orange/20">
            {profile?.business_type || "Pro Donor"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
          <span>&middot;</span>
          <span>Real-time logistics synchronization active</span>
          <span>&middot;</span>
          <span className="text-amber-600 font-bold">★ {avgRating}</span>
        </div>
      </div>
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          onClick={onAddDonation}
          className="bg-primary-orange text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 hover:bg-primary-orange-dark transition-all shadow-sm text-xs active:scale-95"
        >
          <Plus size={16} /> Add Donation
        </button>
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 text-[var(--text-secondary)] bg-white rounded-xl hover:bg-slate-50 transition-all border border-[var(--border-primary)]"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-md">
                {unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-2xl overflow-hidden z-50 border border-[var(--border-primary)]"
                onClick={() => setShowNotif(false)}
              >
                <div className="p-4 border-b bg-gradient-to-r from-[var(--bg-tertiary)] to-white">
                  <h3 className="font-bold text-sm text-brand-dark">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[var(--text-tertiary)]">
                      <Bell size={28} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 border-b text-sm ${!n.is_read ? "bg-brand-medium/5 border-l-2 border-l-brand-medium" : "hover:bg-[var(--bg-tertiary)]"}`}
                      >
                        <p className="font-bold text-brand-dark">{n.title}</p>
                        <p className="text-[var(--text-secondary)] mt-0.5">
                          {n.message}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">
                          {formatDistanceToNow(new Date(n.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onShowProfile}
          className="text-xs font-bold text-[var(--text-secondary)] bg-white px-3.5 py-2 rounded-xl border border-[var(--border-primary)] hover:border-primary-orange hover:text-primary-orange transition-all flex items-center gap-1.5"
        >
          <User size={15} /> Profile
        </button>
        <button
          onClick={onLogout}
          className="p-2 text-[var(--text-tertiary)] hover:text-danger hover:bg-red-50 rounded-xl transition-all"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
