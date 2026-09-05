import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  Download,
  User,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NotificationDropdown } from "./NotificationDropdown";

interface Props {
  user: any;
  profile: any;
  emergency: string;
  onEmergencyToggle: () => void;
  onDownloadReport: () => void;
  onShowProfile: () => void;
  onLogout: () => void;
  notifications: any[];
  unreadCount: number;
  onMarkRead: (id: number) => void;
  onMenuClick?: () => void;
}

export function RecipientHeader({
  user,
  profile,
  emergency,
  onEmergencyToggle,
  onDownloadReport,
  onShowProfile,
  onLogout,
  notifications,
  unreadCount,
  onMarkRead,
  onMenuClick,
}: Props) {
  const [showNotif, setShowNotif] = useState(false);

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
            Good Morning, {profile?.institution_name || user?.name || "Partner"}{" "}
            👋
          </h1>
          {emergency === "active" && (
            <span className="bg-danger text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
              🚨 EMERGENCY ACTIVE
            </span>
          )}
          {emergency === "pending" && (
            <span className="bg-accent text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
              ⏳ PENDING VERIFICATION
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
          <span>&middot;</span>
          <span>Real-time logistics synchronization active</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Emergency */}
        <button
          onClick={onEmergencyToggle}
          disabled={emergency === "active"}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            emergency === "active"
              ? "bg-danger text-white cursor-not-allowed opacity-70"
              : emergency === "pending"
                ? "bg-accent text-white hover:bg-amber-600"
                : "bg-white border border-danger/40 text-danger hover:bg-red-50"
          }`}
        >
          <AlertTriangle size={15} />
          {emergency === "active"
            ? "Active"
            : emergency === "pending"
              ? "Cancel"
              : "Emergency"}
        </button>

        {/* Report */}
        <button
          onClick={onDownloadReport}
          className="hidden md:flex items-center gap-1.5 bg-white border border-[var(--border-primary)] text-[var(--text-secondary)] px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
        >
          <Download size={15} /> Export
        </button>

        {/* Profile */}
        <button
          onClick={onShowProfile}
          className="hidden md:flex items-center gap-1.5 bg-primary-orange text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-primary-orange-dark transition-all shadow-sm"
        >
          <User size={15} /> Profile
        </button>

        {/* Notifications */}
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
              <NotificationDropdown
                notifications={notifications}
                onMarkRead={onMarkRead}
                onClose={() => setShowNotif(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
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
