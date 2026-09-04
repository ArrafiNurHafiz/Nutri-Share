import { motion } from "motion/react";
import { Activity, Truck, CheckCircle, Package, Clock } from "lucide-react";
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
      style:
        "bg-brand-medium/10 text-brand-medium border border-brand-medium/20",
      label: "ACTIVE",
      icon: Activity,
    },
    claimed: {
      style: arrived
        ? "bg-accent/10 text-accent border border-accent/20"
        : "bg-brand-accent/10 text-brand-accent border border-brand-accent/20",
      label: arrived ? "COURIER ARRIVED" : "CLAIMED",
      icon: Truck,
    },
    completed: {
      style:
        "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-primary)]",
      label: "COMPLETED",
      icon: CheckCircle,
    },
    expired: {
      style: "bg-danger/10 text-danger border border-danger/20",
      label: "EXPIRED",
      icon: Activity,
    },
  };
  const s = map[status] || map.active;
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${s.style}`}
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
    ["all", "All"],
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
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-4">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              filterTab === key
                ? "bg-primary-orange text-white shadow-sm"
                : "bg-white text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-primary-orange hover:text-primary-orange"
            }`}
          >
            {label}{" "}
            {key !== "all" && (
              <span className="text-xs opacity-70">({statusCount(key)})</span>
            )}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-tertiary)]">
            <Package size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No donations found</p>
          </div>
        ) : (
          filtered.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass p-5 rounded-3xl border border-white/50 shadow-orange flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:-translate-y-1 hover:shadow-orange-lg transition-all duration-300"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="font-bold text-brand-dark truncate">
                    {d.food_name}
                  </h3>
                  {statusBadge(d.status, (d as any).arrived_at)}
                </div>
                <p className="text-sm text-[var(--text-secondary)] flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Package size={14} /> {d.portion_count} Portions
                  </span>
                  <span className="text-[var(--border-secondary)]">•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />{" "}
                    {new Date(d.valid_until).toLocaleString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {(d.status === "claimed" || (d as any).arrived_at) && (
                  <button
                    onClick={() => onTrack(d)}
                    className="text-xs border border-[var(--border-primary)] text-[var(--text-secondary)] bg-white px-3 py-1.5 rounded-lg font-bold hover:bg-[var(--bg-tertiary)] transition-all"
                  >
                    Track
                  </button>
                )}
                {d.status === "claimed" && (d as any).arrived_at && (
                  <button
                    onClick={() => onComplete(d.id)}
                    className="text-xs bg-primary-orange text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary-orange-dark transition-all"
                  >
                    Complete
                  </button>
                )}
                {d.status === "claimed" && !(d as any).arrived_at && (
                  <span className="text-xs text-[var(--text-tertiary)] italic">
                    Awaiting confirmation
                  </span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
