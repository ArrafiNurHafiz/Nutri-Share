import { motion } from "motion/react";
import {
  Activity,
  Truck,
  CheckCircle,
  Package,
  Clock,
  Navigation,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  donations: any[];
  filterTab: string;
  onFilterChange: (tab: string) => void;
  onTrack: (d: any) => void;
  onComplete: (id: number) => void;
}

const statusBadge = (status: string, arrived?: boolean) => {
  const map: Record<string, { style: string; label: string; icon: any }> = {
    active: {
      style: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      label: "AVAILABLE",
      icon: Activity,
    },
    claimed: {
      style: arrived
        ? "bg-amber-50 text-amber-700 border border-amber-200"
        : "bg-sky-50 text-sky-700 border border-sky-200",
      label: arrived ? "COURIER ARRIVED" : "IN TRANSIT",
      icon: arrived ? CheckCircle : Truck,
    },
    completed: {
      style: "bg-slate-50 text-slate-700 border border-slate-200",
      label: "COMPLETED",
      icon: CheckCircle,
    },
    expired: {
      style: "bg-rose-50 text-rose-700 border border-rose-200",
      label: "EXPIRED",
      icon: Activity,
    },
  };
  const s = map[status] || map.active;
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${s.style}`}
    >
      <s.icon size={11} /> {s.label}
    </span>
  );
};

export function DonationList({
  donations,
  filterTab,
  onFilterChange,
  onTrack,
  onComplete,
}: Props) {
  const tabs = [
    ["all", "All Donations"],
    ["active", "Active"],
    ["claimed", "In Transit"],
    ["completed", "Completed"],
  ] as const;

  const filtered = donations.filter((d) =>
    filterTab === "all" ? true : d.status === filterTab,
  );
  const statusCount = (status: string) =>
    donations.filter((d) => d.status === status).length;

  return (
    <div className="bg-white rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden flex flex-col">
      {/* Header & Filter Tabs */}
      <div className="p-4 border-b border-[var(--border-primary)] bg-gradient-to-r from-surface-container-low to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
            <Package size={16} className="text-primary-orange" /> My Published
            Donations
          </h3>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            Manage food rescue packages & logistics
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => onFilterChange(key)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === key
                  ? "bg-brand-dark text-white shadow-sm"
                  : "bg-slate-50 text-[var(--text-secondary)] hover:bg-slate-100"
              }`}
            >
              <span>{label}</span>
              {key !== "all" && (
                <span className="text-[10px] opacity-70">
                  ({statusCount(key)})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="p-4 max-h-[520px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-tertiary)] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-2">
              <Package size={22} className="opacity-40" />
            </div>
            <p className="text-sm font-bold text-brand-dark">
              No donations in this view
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Select another filter or publish a new donation.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filtered.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="p-4 rounded-xl border border-[var(--border-primary)] bg-white hover:border-brand-medium/40 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm text-brand-dark truncate">
                      {d.food_name}
                    </h4>
                    {statusBadge(d.status, (d as any).arrived_at)}
                  </div>

                  <div className="text-xs text-[var(--text-secondary)] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-brand-dark">
                        {d.portion_count} Portions
                      </span>
                      <span>•</span>
                      <span>
                        {d.protein_per_portion || d.protein || 0}g protein
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                      <Clock size={11} />
                      <span>Valid until:</span>
                      <span className="font-medium text-slate-700">
                        {new Date(d.valid_until).toLocaleString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    ID: #{d.id}
                  </span>

                  <div className="flex items-center gap-2">
                    {(d.status === "claimed" || (d as any).arrived_at) && (
                      <button
                        onClick={() => onTrack(d)}
                        className="text-xs border border-[var(--border-primary)] text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1"
                      >
                        <Navigation size={12} /> Track
                      </button>
                    )}

                    {d.status === "claimed" && (d as any).arrived_at && (
                      <button
                        onClick={() => onComplete(d.id)}
                        className="text-xs bg-primary-orange hover:bg-primary-orange-dark text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm active:scale-95"
                      >
                        Complete Handover
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
