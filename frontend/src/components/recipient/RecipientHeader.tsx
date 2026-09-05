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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-brand-dark hover:bg-gray-100 rounded-lg"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">
            Recipient Dashboard
          </h1>
          {emergency === "active" && (
            <span className="bg-danger text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              🚨 EMERGENCY ACTIVE
            </span>
          )}
          {emergency === "pending" && (
            <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
              ⏳ AWAITING CONFIRMATION
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {profile?.institution_name || "Welcome"} &middot; Urgency:{" "}
          <span className="font-bold text-brand-medium">
            {profile?.urgency_score || "N/A"}/5
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Emergency */}
        <button
          onClick={onEmergencyToggle}
          disabled={emergency === "active"}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
            emergency === "active"
              ? "bg-danger text-white cursor-not-allowed opacity-70"
              : emergency === "pending"
                ? "bg-accent text-white hover:bg-amber-600"
                : "bg-white border border-danger text-danger hover:bg-red-50"
          }`}
        >
          <AlertTriangle size={16} />
          {emergency === "active"
            ? "Active"
            : emergency === "pending"
              ? "Cancel"
              : "Emergency"}
        </button>

        {/* Report */}
        <button
          onClick={onDownloadReport}
          className="hidden md:flex items-center gap-2 bg-white border border-[var(--border-primary)] text-[var(--text-secondary)] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--bg-tertiary)] transition-all"
        >
          <Download size={16} /> Report
        </button>

        {/* Profile */}
        <button
          onClick={onShowProfile}
          className="hidden md:flex items-center gap-2 bg-primary-orange text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-orange-dark transition-all shadow-sm"
        >
          <User size={16} /> Profile
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2.5 text-[var(--text-secondary)] bg-white rounded-xl hover:bg-[var(--bg-tertiary)] transition-all border border-[var(--border-primary)]"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
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
          className="text-sm font-medium text-[var(--text-tertiary)] hover:text-danger transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
